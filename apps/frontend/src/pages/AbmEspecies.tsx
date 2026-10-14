import { useState, type FormEvent } from "react";
import type { EspecieDTO } from "@proyecto/types";
import { crearEspecie, eliminarEspecie, listarEspecies, modificarEspecie } from "../api/especies";
import { ApiError } from "../api/client";
import { useApi } from "../api/useApi";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

/** ABM de especies: el mismo formulario sirve para el alta y para modificar la que se eligio de la lista. */
export function AbmEspecies() {
  const { usuario } = useSesion();

  // se incrementa despues de cada alta, modificacion o baja para volver a pedir el listado
  const [version, setVersion] = useState(0);
  const { data: especies, cargando, error } = useApi(listarEspecies, [version]);

  const [editando, setEditando] = useState<EspecieDTO | null>(null);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  function empezarEdicion(especie: EspecieDTO) {
    setEditando(especie);
    setNombre(especie.nombre);
    setErrorAccion(null);
    setAviso(null);
  }

  function limpiarFormulario() {
    setEditando(null);
    setNombre("");
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setErrorAccion(null);
    setAviso(null);
    setGuardando(true);
    try {
      const dto = { nombre: nombre.trim() };
      if (editando) {
        await modificarEspecie(editando.id, dto);
        setAviso(`Se modificó la especie ${dto.nombre}.`);
      } else {
        await crearEspecie(dto);
        setAviso(`Se agregó la especie ${dto.nombre}.`);
      }
      limpiarFormulario();
      setVersion((v) => v + 1);
    } catch (e) {
      setErrorAccion(e instanceof ApiError ? e.message : "No se pudo guardar la especie.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(especie: EspecieDTO) {
    if (!window.confirm(`¿Eliminar la especie ${especie.nombre}?`)) return;
    setErrorAccion(null);
    setAviso(null);
    setGuardando(true);
    try {
      await eliminarEspecie(especie.id);
      if (editando?.id === especie.id) limpiarFormulario();
      setAviso(`Se eliminó la especie ${especie.nombre}.`);
      setVersion((v) => v + 1);
    } catch (e) {
      setErrorAccion(e instanceof ApiError ? e.message : "No se pudo eliminar la especie.");
    } finally {
      setGuardando(false);
    }
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
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            disabled={guardando}
          />
        </label>
        <div className={s.botones}>
          <button type="submit" className={s.primario} disabled={guardando || !nombre.trim()}>
            {editando ? "Guardar cambios" : "Agregar"}
          </button>
          {editando && (
            <button type="button" className={s.secundario} disabled={guardando} onClick={limpiarFormulario}>
              Cancelar
            </button>
          )}
        </div>
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
              <div className={s.botones}>
                <button
                  type="button"
                  className={s.secundario}
                  disabled={guardando}
                  onClick={() => empezarEdicion(especie)}
                >
                  Modificar
                </button>
                <button
                  type="button"
                  className={s.peligro}
                  disabled={guardando}
                  onClick={() => eliminar(especie)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
