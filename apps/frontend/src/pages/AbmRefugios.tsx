import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { RefugioDTO } from "@proyecto/types";
import { crearRefugio, eliminarRefugio, listarRefugios, modificarRefugio } from "../api/refugios";
import { listarLocalidades } from "../api/localidades";
import { useAbm } from "../api/useAbm";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { BotonesFila, BotonesFormulario } from "../components/AbmControles";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

async function cargar() {
  const [refugios, localidades] = await Promise.all([listarRefugios(), listarLocalidades()]);
  refugios.sort((a, b) => a.nombre.localeCompare(b.nombre));
  localidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
  return { refugios, localidades };
}

// los campos como los manejan los inputs; la localidad es el id como string, "" es sin elegir
const VACIO = { nombre: "", direccion: "", telefono: "", email: "", localidad: "" };

/** ABM de refugios. Todos los campos son obligatorios y la localidad se elige de un select. */
export function AbmRefugios() {
  const { usuario } = useSesion();
  const { data, cargando, error, guardando, errorAccion, aviso, ejecutar, limpiarAvisos } = useAbm(cargar);

  const [editando, setEditando] = useState<RefugioDTO | null>(null);
  const [form, setForm] = useState(VACIO);

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  function cambiar(campo: keyof typeof VACIO, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function empezarEdicion(refugio: RefugioDTO) {
    setEditando(refugio);
    setForm({
      nombre: refugio.nombre,
      direccion: refugio.direccion,
      telefono: refugio.telefono,
      email: refugio.email,
      localidad: String(refugio.localidad.id),
    });
    limpiarAvisos();
  }

  function limpiarFormulario() {
    setEditando(null);
    setForm(VACIO);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const dto = {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      localidad: Number(form.localidad),
    };
    const ok = editando
      ? await ejecutar(
          () => modificarRefugio(editando.id, dto),
          `Se modificó el refugio ${dto.nombre}.`,
          "No se pudo guardar el refugio.",
        )
      : await ejecutar(() => crearRefugio(dto), `Se agregó el refugio ${dto.nombre}.`, "No se pudo guardar el refugio.");
    if (ok) limpiarFormulario();
  }

  async function eliminar(refugio: RefugioDTO) {
    if (!window.confirm(`¿Eliminar el refugio ${refugio.nombre}?`)) return;
    const ok = await ejecutar(
      () => eliminarRefugio(refugio.id),
      `Se eliminó el refugio ${refugio.nombre}.`,
      "No se pudo eliminar el refugio.",
    );
    if (ok && editando?.id === refugio.id) limpiarFormulario();
  }

  const localidades = data?.localidades ?? [];
  const refugios = data?.refugios;
  const completo = Object.values(form).every((valor) => valor.trim() !== "");

  return (
    <>
      <h1 className={s.titulo}>Refugios</h1>
      <p className={s.bajada}>Los refugios que usan la plataforma. Cada uno tiene sus mascotas y sus voluntarios.</p>
      <AdminNav />

      {data && localidades.length === 0 ? (
        <Aviso>
          Para cargar refugios primero tiene que haber alguna localidad.{" "}
          <Link to="/admin/localidades">Cargar localidades</Link>
        </Aviso>
      ) : (
        <form className={s.formulario} onSubmit={guardar}>
          <h2>{editando ? `Modificar ${editando.nombre}` : "Nuevo refugio"}</h2>
          <label className={s.campo}>
            Nombre
            <input
              value={form.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              required
              disabled={guardando}
            />
          </label>
          <label className={s.campo}>
            Localidad
            <select
              value={form.localidad}
              onChange={(e) => cambiar("localidad", e.target.value)}
              required
              disabled={guardando || !data}
            >
              <option value="">Elegí una localidad</option>
              {localidades.map((localidad) => (
                <option key={localidad.id} value={localidad.id}>
                  {localidad.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className={s.campo}>
            Dirección
            <input
              value={form.direccion}
              onChange={(e) => cambiar("direccion", e.target.value)}
              required
              disabled={guardando}
            />
          </label>
          <label className={s.campo}>
            Teléfono
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => cambiar("telefono", e.target.value)}
              required
              disabled={guardando}
            />
          </label>
          <label className={s.campo}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => cambiar("email", e.target.value)}
              required
              disabled={guardando}
            />
          </label>
          <BotonesFormulario
            editando={!!editando}
            guardando={guardando}
            completo={completo}
            onCancelar={limpiarFormulario}
          />
        </form>
      )}

      {errorAccion && <Aviso tipo="error">{errorAccion}</Aviso>}
      {aviso && <Aviso>{aviso}</Aviso>}

      {cargando && <Cargando que="los refugios" />}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {refugios && refugios.length === 0 && <Aviso>Todavía no hay refugios cargados.</Aviso>}

      {refugios && refugios.length > 0 && (
        <ul className={s.lista}>
          {refugios.map((refugio) => (
            <li key={refugio.id} className={editando?.id === refugio.id ? s.filaEditando : s.fila}>
              <span className={s.nombre}>
                {refugio.nombre}
                <span className={s.subdetalle}>
                  {refugio.direccion}, {refugio.localidad.nombre} · {refugio.telefono} · {refugio.email}
                </span>
              </span>
              <BotonesFila
                guardando={guardando}
                onModificar={() => empezarEdicion(refugio)}
                onEliminar={() => eliminar(refugio)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
