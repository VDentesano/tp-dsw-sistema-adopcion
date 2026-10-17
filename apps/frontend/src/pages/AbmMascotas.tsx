import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { MascotaDTO, MascotaInputDTO, RazaDTO } from "@proyecto/types";
import { crearMascota, eliminarMascota, listarMascotasDeRefugio, modificarMascota } from "../api/mascotas";
import { listarRazas } from "../api/razas";
import { useAbm } from "../api/useAbm";
import { useSesion } from "../sesion/useSesion";
import { edadDesde } from "../utils/edad";
import { tonoDeEstado } from "../utils/tonos";
import { AdminNav } from "../components/AdminNav";
import { BotonesFila, BotonesFormulario } from "../components/AbmControles";
import { Chapita } from "../components/Chapita";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

// los mismos que usa el seed y que ofrece el filtro del catalogo
const TAMANOS = ["Chico", "Mediano", "Grande"];

async function cargar(refugioId: number) {
  const [mascotas, razas] = await Promise.all([listarMascotasDeRefugio(refugioId), listarRazas()]);
  mascotas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  // las razas agrupadas por especie para el select
  const razasPorEspecie = new Map<string, RazaDTO[]>();
  for (const raza of [...razas].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
    const grupo = razasPorEspecie.get(raza.especie.nombre) ?? [];
    grupo.push(raza);
    razasPorEspecie.set(raza.especie.nombre, grupo);
  }
  return { mascotas, razasPorEspecie };
}

/** Hoy en YYYY-MM-DD local, para que el date picker no deje elegir una fecha de nacimiento futura. */
function hoy(): string {
  const ahora = new Date();
  return [ahora.getFullYear(), String(ahora.getMonth() + 1).padStart(2, "0"), String(ahora.getDate()).padStart(2, "0")].join("-");
}

// raza es el id como string; los campos opcionales vacios no se mandan
const VACIO = { nombre: "", raza: "", fechaDeNac: "", tamano: "", estilo: "", fotoURL: "" };

/**
 * ABM de mascotas del refugio del voluntario: solo lista las de su refugio y las que carga quedan en el.
 * El estado no se edita aca: una mascota nueva nace Disponible y despues solo lo cambia la
 * resolucion de una solicitud, que deja la auditoria.
 */
export function AbmMascotas() {
  const { usuario } = useSesion();
  const refugioId = usuario.refugioId;
  const { data, cargando, error, guardando, errorAccion, aviso, ejecutar, limpiarAvisos } = useAbm(
    () => (refugioId === null ? Promise.resolve(null) : cargar(refugioId)),
    [refugioId],
  );

  const [editando, setEditando] = useState<MascotaDTO | null>(null);
  const [form, setForm] = useState(VACIO);

  // si se cambia de voluntario en el selector de sesion, se descarta lo que se estaba cargando
  const [refugioDelForm, setRefugioDelForm] = useState(refugioId);
  if (refugioDelForm !== refugioId) {
    setRefugioDelForm(refugioId);
    setEditando(null);
    setForm(VACIO);
  }

  if (usuario.rol !== "Voluntario" || refugioId === null) {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }
  // las funciones de abajo no ven el chequeo de null de arriba, asi que se lo fija aca
  const miRefugio: number = refugioId;

  function cambiar(campo: keyof typeof VACIO, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function empezarEdicion(mascota: MascotaDTO) {
    setEditando(mascota);
    setForm({
      nombre: mascota.nombre,
      raza: String(mascota.raza.id),
      fechaDeNac: mascota.fechaDeNac ?? "",
      tamano: mascota.tamano ?? "",
      estilo: mascota.estilo ?? "",
      fotoURL: mascota.fotoURL ?? "",
    });
    limpiarAvisos();
  }

  function limpiarFormulario() {
    setEditando(null);
    setForm(VACIO);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    // los opcionales vacios van como null: en el alta quedan sin dato y al modificar borran el que habia.
    // Si no se mandaran, el PUT los dejaria como estaban aunque se hayan borrado en el formulario.
    const dto: MascotaInputDTO = {
      nombre: form.nombre.trim(),
      raza: Number(form.raza),
      refugio: miRefugio,
      fechaDeNac: form.fechaDeNac || null,
      tamano: form.tamano || null,
      estilo: form.estilo.trim() || null,
      fotoURL: form.fotoURL.trim() || null,
    };
    const ok = editando
      ? await ejecutar(
          () => modificarMascota(editando.id, dto),
          `Se modificó la mascota ${dto.nombre}.`,
          "No se pudo guardar la mascota.",
        )
      : await ejecutar(
          () => crearMascota(dto),
          `Se agregó a ${dto.nombre}. Ya aparece en el catálogo como disponible.`,
          "No se pudo guardar la mascota.",
        );
    if (ok) limpiarFormulario();
  }

  async function eliminar(mascota: MascotaDTO) {
    if (!window.confirm(`¿Eliminar a ${mascota.nombre}?`)) return;
    const ok = await ejecutar(
      () => eliminarMascota(mascota.id),
      `Se eliminó a ${mascota.nombre}.`,
      "No se pudo eliminar la mascota.",
    );
    if (ok && editando?.id === mascota.id) limpiarFormulario();
  }

  const razasPorEspecie = data?.razasPorEspecie ?? new Map<string, RazaDTO[]>();
  const mascotas = data?.mascotas;

  return (
    <>
      <h1 className={s.titulo}>Mascotas</h1>
      <p className={s.bajada}>
        Las mascotas de tu refugio. El estado no se cambia acá: las nuevas quedan disponibles y después cambia al
        resolver una solicitud.
      </p>
      <AdminNav />

      {data && razasPorEspecie.size === 0 ? (
        <Aviso>
          Para cargar mascotas primero tiene que haber alguna raza. <Link to="/admin/razas">Cargar razas</Link>
        </Aviso>
      ) : (
        <form className={s.formulario} onSubmit={guardar}>
          <h2>{editando ? `Modificar a ${editando.nombre}` : "Nueva mascota"}</h2>
          <label className={s.campo}>
            Nombre
            <input value={form.nombre} onChange={(e) => cambiar("nombre", e.target.value)} required disabled={guardando} />
          </label>
          <label className={s.campo}>
            Raza
            <select
              value={form.raza}
              onChange={(e) => cambiar("raza", e.target.value)}
              required
              disabled={guardando || !data}
            >
              <option value="">Elegí una raza</option>
              {[...razasPorEspecie].map(([especie, razas]) => (
                <optgroup key={especie} label={especie}>
                  {razas.map((raza) => (
                    <option key={raza.id} value={raza.id}>
                      {raza.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className={s.campo}>
            Fecha de nacimiento <span className={s.opcional}>(opcional)</span>
            <input
              type="date"
              max={hoy()}
              value={form.fechaDeNac}
              onChange={(e) => cambiar("fechaDeNac", e.target.value)}
              disabled={guardando}
            />
          </label>
          <label className={s.campo}>
            Tamaño <span className={s.opcional}>(opcional)</span>
            <select value={form.tamano} onChange={(e) => cambiar("tamano", e.target.value)} disabled={guardando}>
              <option value="">Sin indicar</option>
              {TAMANOS.map((tamano) => (
                <option key={tamano} value={tamano}>
                  {tamano}
                </option>
              ))}
            </select>
          </label>
          <label className={s.campo}>
            Estilo <span className={s.opcional}>(opcional)</span>
            <input
              value={form.estilo}
              onChange={(e) => cambiar("estilo", e.target.value)}
              placeholder="Ej: tranquilo, juguetón"
              disabled={guardando}
            />
          </label>
          <label className={s.campoAncho}>
            Link de la foto <span className={s.opcional}>(opcional)</span>
            <input
              type="url"
              value={form.fotoURL}
              onChange={(e) => cambiar("fotoURL", e.target.value)}
              placeholder="https://…"
              disabled={guardando}
            />
          </label>
          <BotonesFormulario
            editando={!!editando}
            guardando={guardando}
            completo={!!form.nombre.trim() && !!form.raza}
            onCancelar={limpiarFormulario}
          />
        </form>
      )}

      {errorAccion && <Aviso tipo="error">{errorAccion}</Aviso>}
      {aviso && <Aviso>{aviso}</Aviso>}

      {cargando && <Cargando que="las mascotas" />}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {mascotas && mascotas.length === 0 && <Aviso>Tu refugio todavía no tiene mascotas cargadas.</Aviso>}

      {mascotas && mascotas.length > 0 && (
        <ul className={s.lista}>
          {mascotas.map((mascota) => {
            const edad = edadDesde(mascota.fechaDeNac);
            return (
              <li key={mascota.id} className={editando?.id === mascota.id ? s.filaEditando : s.fila}>
                <span className={s.nombre}>
                  <Link to={`/mascotas/${mascota.id}`}>{mascota.nombre}</Link>
                  <span className={s.subdetalle}>
                    {mascota.raza.nombre} ({mascota.raza.especie.nombre})
                    {mascota.tamano && ` · ${mascota.tamano}`}
                    {edad && ` · ${edad}`}
                  </span>
                </span>
                <Chapita tono={tonoDeEstado(mascota.estado)}>{mascota.estado ?? "Sin estado"}</Chapita>
                <BotonesFila
                  guardando={guardando}
                  onModificar={() => empezarEdicion(mascota)}
                  onEliminar={() => eliminar(mascota)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
