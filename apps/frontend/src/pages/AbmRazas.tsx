import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { RazaDTO } from "@proyecto/types";
import { crearRaza, eliminarRaza, listarRazas, modificarRaza } from "../api/razas";
import { listarEspecies } from "../api/especies";
import { ApiError } from "../api/client";
import { useApi } from "../api/useApi";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

/** ABM de razas. Cada raza depende de una especie, que se elige de un select. */
export function AbmRazas() {
  const { usuario } = useSesion();

  // se incrementa despues de cada alta, modificacion o baja para volver a pedir el listado
  const [version, setVersion] = useState(0);
  const { data, cargando, error } = useApi(async () => {
    const [razas, especies] = await Promise.all([listarRazas(), listarEspecies()]);
    // agrupadas por especie y en orden alfabetico, para encontrarlas facil
    razas.sort(
      (a, b) => a.especie.nombre.localeCompare(b.especie.nombre) || a.nombre.localeCompare(b.nombre),
    );
    return { razas, especies };
  }, [version]);

  const [editando, setEditando] = useState<RazaDTO | null>(null);
  const [nombre, setNombre] = useState("");
  // el id de la especie como string, que es lo que maneja el select; "" es sin elegir
  const [especieId, setEspecieId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  function empezarEdicion(raza: RazaDTO) {
    setEditando(raza);
    setNombre(raza.nombre);
    setEspecieId(String(raza.especie.id));
    setErrorAccion(null);
    setAviso(null);
  }

  function limpiarFormulario() {
    setEditando(null);
    setNombre("");
    setEspecieId("");
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setErrorAccion(null);
    setAviso(null);
    setGuardando(true);
    try {
      const dto = { nombre: nombre.trim(), especie: Number(especieId) };
      if (editando) {
        await modificarRaza(editando.id, dto);
        setAviso(`Se modificó la raza ${dto.nombre}.`);
      } else {
        await crearRaza(dto);
        setAviso(`Se agregó la raza ${dto.nombre}.`);
      }
      limpiarFormulario();
      setVersion((v) => v + 1);
    } catch (e) {
      setErrorAccion(e instanceof ApiError ? e.message : "No se pudo guardar la raza.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(raza: RazaDTO) {
    if (!window.confirm(`¿Eliminar la raza ${raza.nombre}?`)) return;
    setErrorAccion(null);
    setAviso(null);
    setGuardando(true);
    try {
      await eliminarRaza(raza.id);
      if (editando?.id === raza.id) limpiarFormulario();
      setAviso(`Se eliminó la raza ${raza.nombre}.`);
      setVersion((v) => v + 1);
    } catch (e) {
      setErrorAccion(e instanceof ApiError ? e.message : "No se pudo eliminar la raza.");
    } finally {
      setGuardando(false);
    }
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
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={guardando}
            />
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
          <div className={s.botones}>
            <button type="submit" className={s.primario} disabled={guardando || !nombre.trim() || !especieId}>
              {editando ? "Guardar cambios" : "Agregar"}
            </button>
            {editando && (
              <button type="button" className={s.secundario} disabled={guardando} onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>
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
              <div className={s.botones}>
                <button
                  type="button"
                  className={s.secundario}
                  disabled={guardando}
                  onClick={() => empezarEdicion(raza)}
                >
                  Modificar
                </button>
                <button
                  type="button"
                  className={s.peligro}
                  disabled={guardando}
                  onClick={() => eliminar(raza)}
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
