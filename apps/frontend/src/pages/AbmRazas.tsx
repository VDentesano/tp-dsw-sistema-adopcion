import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { RazaDTO } from "@proyecto/types";
import { crearRaza, eliminarRaza, listarRazas, modificarRaza } from "../api/razas";
import { listarEspecies } from "../api/especies";
import { useAbm } from "../api/useAbm";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { BotonesFila, BotonesFormulario } from "../components/AbmControles";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

async function cargar() {
  const [razas, especies] = await Promise.all([listarRazas(), listarEspecies()]);
  // agrupadas por especie y en orden alfabetico, para encontrarlas facil
  razas.sort((a, b) => a.especie.nombre.localeCompare(b.especie.nombre) || a.nombre.localeCompare(b.nombre));
  return { razas, especies };
}

/** ABM de razas. Cada raza depende de una especie, que se elige de un select. */
export function AbmRazas() {
  const { usuario } = useSesion();
  const { data, cargando, error, guardando, errorAccion, aviso, ejecutar, limpiarAvisos } = useAbm(cargar);

  const [editando, setEditando] = useState<RazaDTO | null>(null);
  const [nombre, setNombre] = useState("");
  // el id de la especie como string, que es lo que maneja el select; "" es sin elegir
  const [especieId, setEspecieId] = useState("");

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  function empezarEdicion(raza: RazaDTO) {
    setEditando(raza);
    setNombre(raza.nombre);
    setEspecieId(String(raza.especie.id));
    limpiarAvisos();
  }

  function limpiarFormulario() {
    setEditando(null);
    setNombre("");
    setEspecieId("");
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const dto = { nombre: nombre.trim(), especie: Number(especieId) };
    const ok = editando
      ? await ejecutar(
          () => modificarRaza(editando.id, dto),
          `Se modificó la raza ${dto.nombre}.`,
          "No se pudo guardar la raza.",
        )
      : await ejecutar(() => crearRaza(dto), `Se agregó la raza ${dto.nombre}.`, "No se pudo guardar la raza.");
    if (ok) limpiarFormulario();
  }

  async function eliminar(raza: RazaDTO) {
    if (!window.confirm(`¿Eliminar la raza ${raza.nombre}?`)) return;
    const ok = await ejecutar(
      () => eliminarRaza(raza.id),
      `Se eliminó la raza ${raza.nombre}.`,
      "No se pudo eliminar la raza.",
    );
    if (ok && editando?.id === raza.id) limpiarFormulario();
  }

  const especies = data?.especies ?? [];
  const razas = data?.razas;

  return (
    <>
      <h1 className={s.titulo}>Razas</h1>
      <p className={s.bajada}>Cada mascota es de una raza, y cada raza pertenece a una especie.</p>
      <AdminNav />

      {data && especies.length === 0 ? (
        <Aviso>
          Para cargar razas primero tiene que haber alguna especie. <Link to="/admin/especies">Cargar especies</Link>
        </Aviso>
      ) : (
        <form className={s.formulario} onSubmit={guardar}>
          <h2>{editando ? `Modificar ${editando.nombre}` : "Nueva raza"}</h2>
          <label className={s.campo}>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required disabled={guardando} />
          </label>
          <label className={s.campo}>
            Especie
            <select
              value={especieId}
              onChange={(e) => setEspecieId(e.target.value)}
              required
              disabled={guardando || !data}
            >
              <option value="">Elegí una especie</option>
              {especies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nombre}
                </option>
              ))}
            </select>
          </label>
          <BotonesFormulario
            editando={!!editando}
            guardando={guardando}
            completo={!!nombre.trim() && !!especieId}
            onCancelar={limpiarFormulario}
          />
        </form>
      )}

      {errorAccion && <Aviso tipo="error">{errorAccion}</Aviso>}
      {aviso && <Aviso>{aviso}</Aviso>}

      {cargando && <Cargando que="las razas" />}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {razas && razas.length === 0 && especies.length > 0 && <Aviso>Todavía no hay razas cargadas.</Aviso>}

      {razas && razas.length > 0 && (
        <ul className={s.lista}>
          {razas.map((raza) => (
            <li key={raza.id} className={editando?.id === raza.id ? s.filaEditando : s.fila}>
              <span className={s.nombre}>{raza.nombre}</span>
              <span className={s.detalle}>{raza.especie.nombre}</span>
              <BotonesFila
                guardando={guardando}
                onModificar={() => empezarEdicion(raza)}
                onEliminar={() => eliminar(raza)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
