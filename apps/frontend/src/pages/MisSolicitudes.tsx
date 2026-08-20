import { Link } from "react-router";
import { listarSolicitudesDeUsuario } from "../api/solicitudes";
import { listarPreguntas } from "../api/preguntas";
import { useApi } from "../api/useApi";
import { useSesion } from "../sesion/useSesion";
import { formatearFecha } from "../utils/edad";
import { tonoDeEstado } from "../utils/tonos";
import { Chapita } from "../components/Chapita";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./MisSolicitudes.module.css";

export function MisSolicitudes() {
  const { usuario } = useSesion();
  const { data, cargando, error } = useApi(async () => {
    const [solicitudes, preguntas] = await Promise.all([
      listarSolicitudesDeUsuario(usuario.id),
      listarPreguntas(),
    ]);
    // las respuestas guardan {preguntaId: valor}; este mapa recupera el texto
    const textoPorId = new Map(preguntas.map((p) => [String(p.id), p.texto]));
    return { solicitudes, textoPorId };
  }, [usuario.id]);

  const solicitudes = data?.solicitudes ?? null;

  return (
    <>
      <h1 className={s.titulo}>Mis solicitudes</h1>
      <p className={s.bajada}>El estado de cada postulación que hiciste.</p>

      {cargando && <Cargando que="tus solicitudes" />}
      {error && <Aviso tipo="error">{error}</Aviso>}

      {solicitudes && solicitudes.length === 0 && (
        <Aviso>
          Todavía no te postulaste por ninguna mascota.{" "}
          <Link to="/mascotas">Mirá quiénes buscan casa</Link>
        </Aviso>
      )}

      {solicitudes && solicitudes.length > 0 && (
        <ul className={s.lista}>
          {solicitudes.map((solicitud) => {
            const respuestas = Object.entries(solicitud.respuestasFormulario);
            return (
              <li key={solicitud.id} className={s.fila}>
                <div className={s.principal}>
                  <Link to={`/mascotas/${solicitud.mascota.id}`} className={s.mascota}>
                    {solicitud.mascota.nombre}
                  </Link>
                  <span className={s.fecha}>
                    Enviada el {formatearFecha(solicitud.fechaSolicitud)}
                  </span>
                </div>

                <Chapita tono={tonoDeEstado(solicitud.estado)}>{solicitud.estado}</Chapita>

                {respuestas.length > 0 && (
                  <details className={s.respuestas}>
                    <summary>
                      {respuestas.length === 1 ? "1 respuesta" : `${respuestas.length} respuestas`}
                    </summary>
                    <dl className={s.listaRespuestas}>
                      {respuestas.map(([pregunta, respuesta]) => (
                        <div key={pregunta} className={s.respuesta}>
                          <dt>{data?.textoPorId.get(pregunta) ?? pregunta}</dt>
                          <dd>
                            {typeof respuesta === "boolean" ? (respuesta ? "Sí" : "No") : String(respuesta)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
