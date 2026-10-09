import { useState } from "react";
import { Link, useParams } from "react-router";
import type { DecisionSolicitud } from "@proyecto/types";
import { buscarSolicitud, resolverSolicitud } from "../api/solicitudes";
import { listarPreguntas } from "../api/preguntas";
import { ApiError } from "../api/client";
import { useApi } from "../api/useApi";
import { useSesion } from "../sesion/useSesion";
import { formatearFecha } from "../utils/edad";
import { tonoDeEstado } from "../utils/tonos";
import { mostrarRespuesta } from "../utils/respuestas";
import { Chapita } from "../components/Chapita";
import { FotoMascota } from "../components/FotoMascota";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./DetalleSolicitud.module.css";

/** Detalle de una solicitud para el voluntario: el formulario completo y la resolucion. */
export function DetalleSolicitud() {
  const { id } = useParams();
  const { usuario } = useSesion();

  // se incrementa despues de resolver, para volver a pedir la solicitud ya actualizada
  const [version, setVersion] = useState(0);
  const { data, cargando, error } = useApi(async () => {
    const [solicitud, preguntas] = await Promise.all([buscarSolicitud(Number(id)), listarPreguntas()]);
    // trae tambien las inactivas: una respuesta vieja puede apuntar a una pregunta que el refugio desactivo
    const preguntaPorId = new Map(preguntas.map((p) => [String(p.id), p]));
    return { solicitud, preguntaPorId };
  }, [id, version]);

  const [motivo, setMotivo] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const [errorResolucion, setErrorResolucion] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  if (usuario.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }
  if (cargando) return <Cargando que="la solicitud" />;
  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!data) return null;

  const { solicitud, preguntaPorId } = data;
  const { mascota, usuario: postulante } = solicitud;

  // resolverla igual da 403 en el backend, pero asi no se muestran los datos del postulante
  if (mascota.refugio !== usuario.refugioId) {
    return <Aviso>Esta solicitud es de una mascota de otro refugio.</Aviso>;
  }

  // las respuestas se muestran en el orden en que el refugio armo el formulario
  const respuestas = Object.entries(solicitud.respuestasFormulario)
    .map(([preguntaId, respuesta]) => ({ preguntaId, pregunta: preguntaPorId.get(preguntaId), respuesta }))
    .sort((a, b) => (a.pregunta?.orden ?? Infinity) - (b.pregunta?.orden ?? Infinity));

  const motivoLimpio = motivo.trim();

  async function resolver(decision: DecisionSolicitud) {
    setErrorResolucion(null);
    setResolviendo(true);
    try {
      await resolverSolicitud(solicitud.id, {
        decision,
        voluntario: usuario.id,
        ...(motivoLimpio ? { motivo: motivoLimpio } : {}),
      });
      setResultado(decision === "Aprobada" ? "Aprobaste la solicitud." : "Rechazaste la solicitud.");
      setMotivo("");
      setVersion((v) => v + 1);
    } catch (e) {
      setErrorResolucion(e instanceof ApiError ? e.message : "No se pudo resolver la solicitud.");
    } finally {
      setResolviendo(false);
    }
  }

  return (
    <div className={s.marco}>
      <Link to="/refugio/solicitudes" className={s.volver}>
        ← Volver a las solicitudes
      </Link>

      <div className={s.filaTitulo}>
        <h1 className={s.titulo}>
          {postulante.nombre} {postulante.apellido}
        </h1>
        <Chapita tono={tonoDeEstado(solicitud.estado)}>{solicitud.estado}</Chapita>
      </div>
      <p className={s.bajada}>
        Se postuló el {formatearFecha(solicitud.fechaSolicitud)} para adoptar a {mascota.nombre}.
      </p>

      {resultado && <Aviso>{resultado}</Aviso>}

      <div className={s.columnas}>
        <section className={s.carta}>
          <h2 className={s.subtitulo}>Mascota</h2>
          <Link to={`/mascotas/${mascota.id}`} className={s.mascota}>
            <span className={s.fotoMarco}>
              <FotoMascota nombre={mascota.nombre} fotoURL={mascota.fotoURL} />
            </span>
            <span className={s.nombreMascota}>{mascota.nombre}</span>
          </Link>
          <Chapita tono={tonoDeEstado(mascota.estado)}>{mascota.estado ?? "Sin estado"}</Chapita>
        </section>

        <section className={s.carta}>
          <h2 className={s.subtitulo}>Contacto</h2>
          <dl className={s.datos}>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${postulante.email}`}>{postulante.email}</a>
            </dd>
            <dt>Teléfono</dt>
            <dd>{postulante.telefono}</dd>
          </dl>
        </section>
      </div>

      <section className={s.carta}>
        <h2 className={s.subtitulo}>Formulario</h2>
        {respuestas.length === 0 ? (
          <p className={s.vacio}>El refugio no pedía datos adicionales cuando se postuló.</p>
        ) : (
          <dl className={s.respuestas}>
            {respuestas.map(({ preguntaId, pregunta, respuesta }) => (
              <div key={preguntaId} className={s.respuesta}>
                <dt>
                  {pregunta?.texto ?? `Pregunta ${preguntaId}`}
                  {pregunta && !pregunta.activa && <em className={s.inactiva}> (ya no se pregunta)</em>}
                </dt>
                <dd>{mostrarRespuesta(respuesta)}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {solicitud.estado === "Pendiente" ? (
        <section className={s.carta}>
          <h2 className={s.subtitulo}>Resolución</h2>
          <label className={s.campoMotivo}>
            Motivo <span className={s.ayuda}>(obligatorio para rechazar)</span>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              disabled={resolviendo}
            />
          </label>
          <p className={s.ayuda}>
            Al aprobar, {mascota.nombre} queda reservada y se rechazan las demás postulaciones
            pendientes que tenga.
          </p>

          {errorResolucion && <Aviso tipo="error">{errorResolucion}</Aviso>}

          <div className={s.acciones}>
            <button
              type="button"
              className={s.aprobar}
              disabled={resolviendo}
              onClick={() => resolver("Aprobada")}
            >
              Aprobar
            </button>
            <button
              type="button"
              className={s.rechazar}
              disabled={resolviendo || !motivoLimpio}
              title={motivoLimpio ? undefined : "Escribí el motivo para poder rechazar"}
              onClick={() => resolver("Rechazada")}
            >
              Rechazar
            </button>
          </div>
        </section>
      ) : (
        solicitud.motivo && (
          <section className={s.carta}>
            <h2 className={s.subtitulo}>Motivo</h2>
            <p className={s.motivo}>{solicitud.motivo}</p>
          </section>
        )
      )}
    </div>
  );
}
