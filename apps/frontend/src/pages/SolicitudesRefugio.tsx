import { Link, useSearchParams } from "react-router";
import { ESTADOS_SOLICITUD, type EstadoSolicitud } from "@proyecto/types";
import { listarSolicitudesDeRefugio } from "../api/solicitudes";
import { useApi } from "../api/useApi";
import { useSesion } from "../sesion/useSesion";
import { formatearFecha } from "../utils/edad";
import { tonoDeEstado } from "../utils/tonos";
import { Chapita } from "../components/Chapita";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./SolicitudesRefugio.module.css";

const ETIQUETA_FILTRO: Record<EstadoSolicitud, string> = {
  Pendiente: "Pendientes",
  Aprobada: "Aprobadas",
  Rechazada: "Rechazadas",
};

/** Gestion de solicitudes del voluntario: las postulaciones a las mascotas de su refugio, por estado. */
export function SolicitudesRefugio() {
  const { usuario } = useSesion();
  const refugioId = usuario.refugioId;

  // el filtro vive en la URL: volviendo con el boton atras del navegador se mantiene el estado elegido
  const [params, setParams] = useSearchParams();
  // sin parametro arranca en Pendiente, que es lo que el voluntario tiene que resolver; con "todas" no filtra
  const filtro = params.get("estado") ?? "Pendiente";
  const estado = ESTADOS_SOLICITUD.find((e) => e === filtro);

  const { data: solicitudes, cargando, error } = useApi(
    () => (refugioId === null ? Promise.resolve([]) : listarSolicitudesDeRefugio(refugioId, estado)),
    [refugioId, estado],
  );

  if (usuario.rol !== "Voluntario" || refugioId === null) {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  return (
    <>
      <h1 className={s.titulo}>Solicitudes del refugio</h1>
      <p className={s.bajada}>Las postulaciones para adoptar a las mascotas de tu refugio.</p>

      <div className={s.filtros}>
        {ESTADOS_SOLICITUD.map((e) => (
          <button
            key={e}
            type="button"
            className={estado === e ? s.filtroActivo : s.filtro}
            aria-pressed={estado === e}
            onClick={() => setParams({ estado: e })}
          >
            {ETIQUETA_FILTRO[e]}
          </button>
        ))}
        <button
          type="button"
          className={estado === undefined ? s.filtroActivo : s.filtro}
          aria-pressed={estado === undefined}
          onClick={() => setParams({ estado: "todas" })}
        >
          Todas
        </button>
      </div>

      {cargando && <Cargando que="las solicitudes" />}
      {error && <Aviso tipo="error">{error}</Aviso>}

      {solicitudes && solicitudes.length === 0 && (
        <Aviso>
          {estado
            ? `No hay solicitudes en estado ${estado.toLowerCase()}.`
            : "Todavía nadie se postuló para las mascotas del refugio."}
        </Aviso>
      )}

      {solicitudes && solicitudes.length > 0 && (
        <ul className={s.lista}>
          {solicitudes.map((solicitud) => (
            <li key={solicitud.id}>
              <Link to={`/refugio/solicitudes/${solicitud.id}`} className={s.fila}>
                <span className={s.fecha}>{formatearFecha(solicitud.fechaSolicitud)}</span>
                <span className={s.postulante}>
                  {solicitud.usuario.nombre} {solicitud.usuario.apellido}
                </span>
                <span className={s.mascota}>quiere adoptar a {solicitud.mascota.nombre}</span>
                <Chapita tono={tonoDeEstado(solicitud.estado)}>{solicitud.estado}</Chapita>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
