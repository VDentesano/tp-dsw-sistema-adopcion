import { useState, type FormEvent } from "react";
import type { EspecieDTO } from "@proyecto/types";
import { crearEspecie, eliminarEspecie, listarEspecies, modificarEspecie } from "../api/especies";
import { useAbm } from "../api/useAbm";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { BotonesFila, BotonesFormulario } from "../components/AbmControles";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

/** ABM de especies: el mismo formulario sirve para el alta y para modificar la que se eligio de la lista. */
export function AbmEspecies() {
  const { usuario } = useSesion();
  const { data: especies, cargando, error, guardando, errorAccion, aviso, ejecutar, limpiarAvisos } =
    useAbm(listarEspecies);

  const [editando, setEditando] = useState<EspecieDTO | null>(null);
  const [nombre, setNombre] = useState("");

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  function empezarEdicion(especie: EspecieDTO) {
    setEditando(especie);
    setNombre(especie.nombre);
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
          () => modificarEspecie(editando.id, dto),
          `Se modificó la especie ${dto.nombre}.`,
          "No se pudo guardar la especie.",
        )
      : await ejecutar(() => crearEspecie(dto), `Se agregó la especie ${dto.nombre}.`, "No se pudo guardar la especie.");
    if (ok) limpiarFormulario();
  }

  async function eliminar(especie: EspecieDTO) {
    if (!window.confirm(`¿Eliminar la especie ${especie.nombre}?`)) return;
    const ok = await ejecutar(
      () => eliminarEspecie(especie.id),
      `Se eliminó la especie ${especie.nombre}.`,
      "No se pudo eliminar la especie.",
    );
    if (ok && editando?.id === especie.id) limpiarFormulario();
  }

  return (
    <>
      <h1 className={s.titulo}>Especies</h1>
      <p className={s.bajada}>Las especies agrupan a las razas de las mascotas.</p>
      <AdminNav />

      <form className={s.formulario} onSubmit={guardar}>
        <h2>{editando ? `Modificar ${editando.nombre}` : "Nueva especie"}</h2>
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

      {cargando && <Cargando que="las especies" />}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {especies && especies.length === 0 && <Aviso>Todavía no hay especies cargadas.</Aviso>}

      {especies && especies.length > 0 && (
        <ul className={s.lista}>
          {especies.map((especie) => (
            <li key={especie.id} className={editando?.id === especie.id ? s.filaEditando : s.fila}>
              <span className={s.nombre}>{especie.nombre}</span>
              <BotonesFila
                guardando={guardando}
                onModificar={() => empezarEdicion(especie)}
                onEliminar={() => eliminar(especie)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
