import { useState, type FormEvent } from "react";
import type { LocalidadDTO } from "@proyecto/types";
import { crearLocalidad, eliminarLocalidad, listarLocalidades, modificarLocalidad } from "../api/localidades";
import { useAbm } from "../api/useAbm";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { BotonesFila, BotonesFormulario } from "../components/AbmControles";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

/** ABM de localidades: el mismo formulario sirve para el alta y para modificar la que se eligio de la lista. */
export function AbmLocalidades() {
  const { usuario } = useSesion();
  const { data: localidades, cargando, error, guardando, errorAccion, aviso, ejecutar, limpiarAvisos } =
    useAbm(listarLocalidades);

  const [editando, setEditando] = useState<LocalidadDTO | null>(null);
  const [nombre, setNombre] = useState("");

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  function empezarEdicion(localidad: LocalidadDTO) {
    setEditando(localidad);
    setNombre(localidad.nombre);
    limpiarAvisos();
  }

  function limpiarFormulario() {
    setEditando(null);
    setNombre("");
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const dto = { nombre: nombre.trim() };
    const ok = editando
      ? await ejecutar(
          () => modificarLocalidad(editando.id, dto),
          `Se modificó la localidad ${dto.nombre}.`,
          "No se pudo guardar la localidad.",
        )
      : await ejecutar(() => crearLocalidad(dto), `Se agregó la localidad ${dto.nombre}.`, "No se pudo guardar la localidad.");
    if (ok) limpiarFormulario();
  }

  async function eliminar(localidad: LocalidadDTO) {
    if (!window.confirm(`¿Eliminar la localidad ${localidad.nombre}?`)) return;
    const ok = await ejecutar(
      () => eliminarLocalidad(localidad.id),
      `Se eliminó la localidad ${localidad.nombre}.`,
      "No se pudo eliminar la localidad.",
    );
    if (ok && editando?.id === localidad.id) limpiarFormulario();
  }

  return (
    <>
      <h1 className={s.titulo}>Localidades</h1>
      <p className={s.bajada}>Las localidades donde están los refugios.</p>
      <AdminNav />

      <form className={s.formulario} onSubmit={guardar}>
        <h2>{editando ? `Modificar ${editando.nombre}` : "Nueva localidad"}</h2>
        <label className={s.campo}>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required disabled={guardando} />
        </label>
        <BotonesFormulario
          editando={!!editando}
          guardando={guardando}
          completo={!!nombre.trim()}
          onCancelar={limpiarFormulario}
        />
      </form>

      {errorAccion && <Aviso tipo="error">{errorAccion}</Aviso>}
      {aviso && <Aviso>{aviso}</Aviso>}

      {cargando && <Cargando que="las localidades" />}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {localidades && localidades.length === 0 && <Aviso>Todavía no hay localidades cargadas.</Aviso>}

      {localidades && localidades.length > 0 && (
        <ul className={s.lista}>
          {localidades.map((localidad) => (
            <li key={localidad.id} className={editando?.id === localidad.id ? s.filaEditando : s.fila}>
              <span className={s.nombre}>{localidad.nombre}</span>
              <BotonesFila
                guardando={guardando}
                onModificar={() => empezarEdicion(localidad)}
                onEliminar={() => eliminar(localidad)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
