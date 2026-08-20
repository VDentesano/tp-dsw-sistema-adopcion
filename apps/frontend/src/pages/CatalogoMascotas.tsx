import { useMemo, useState } from "react";
import { Link } from "react-router";
import { listarMascotasDisponibles } from "../api/mascotas";
import { useApi } from "../api/useApi";
import { edadDesde } from "../utils/edad";
import { tonoDeEstado } from "../utils/tonos";
import { Chapita } from "../components/Chapita";
import { FotoMascota } from "../components/FotoMascota";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./CatalogoMascotas.module.css";

export function CatalogoMascotas() {
  const [tamano, setTamano] = useState("");
  // el filtrado lo hace el backend (?estado=Disponible&tamano=...)
  const { data: mascotas, cargando, error } = useApi(
    () => listarMascotasDisponibles(tamano || undefined),
    [tamano],
  );

  // las opciones del filtro salen del listado completo, que se pide una sola vez
  const { data: todas } = useApi(() => listarMascotasDisponibles(), []);
  const tamanos = useMemo(
    () =>
      todas ? [...new Set(todas.map((m) => m.tamano).filter((t): t is string => !!t))] : [],
    [todas],
  );

  return (
    <>
      <div className={s.encabezado}>
        <div>
          <h1 className={s.titulo}>Buscan casa</h1>
          <p className={s.bajada}>
            Cada mascota disponible tiene su ficha. Cuando encuentres la tuya, postulate:
            el refugio revisa tu solicitud y te contacta.
          </p>
        </div>

        <label className={s.filtro}>
          Tamaño
          <select value={tamano} onChange={(e) => setTamano(e.target.value)}>
            <option value="">Todos</option>
            {tamanos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cargando && <Cargando que="mascotas" />}
      {error && <Aviso tipo="error">{error}</Aviso>}

      {mascotas && mascotas.length === 0 && (
        <Aviso>
          No hay mascotas disponibles{tamano ? ` de tamaño ${tamano}` : ""} por ahora.
          {tamano && " Probá con otro tamaño."}
        </Aviso>
      )}

      {mascotas && mascotas.length > 0 && (
        <ul className={s.grilla}>
          {mascotas.map((m) => {
            const edad = edadDesde(m.fechaDeNac);
            return (
              <li key={m.id}>
                <Link to={`/mascotas/${m.id}`} className={s.carta}>
                  <div className={s.fotoMarco}>
                    <FotoMascota nombre={m.nombre} fotoURL={m.fotoURL} />
                  </div>
                  <div className={s.cuerpo}>
                    <div className={s.filaNombre}>
                      <span className={s.nombre}>{m.nombre}</span>
                      <Chapita tono={tonoDeEstado(m.estado)}>{m.estado ?? "Sin estado"}</Chapita>
                    </div>
                    <p className={s.meta}>
                      {[m.raza.especie.nombre, m.raza.nombre, m.tamano, edad]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className={s.refugio}>{m.refugio.nombre}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
