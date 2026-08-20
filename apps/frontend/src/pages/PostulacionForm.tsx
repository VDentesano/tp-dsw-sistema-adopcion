import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import type { PreguntaDTO, RespuestasFormulario } from "@proyecto/types";
import { buscarMascota } from "../api/mascotas";
import { listarPreguntasActivas } from "../api/preguntas";
import { crearSolicitud } from "../api/solicitudes";
import { ApiError } from "../api/client";
import { useApi } from "../api/useApi";
import { useSesion } from "../sesion/useSesion";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./PostulacionForm.module.css";

export function PostulacionForm() {
  const { id } = useParams();
  const { usuario } = useSesion();

  // la mascota define el refugio, y el refugio define qué se pregunta
  const { data, cargando, error } = useApi(async () => {
    const mascota = await buscarMascota(Number(id));
    const preguntas = await listarPreguntasActivas(mascota.refugio.id);
    return { mascota, preguntas };
  }, [id]);

  const [respuestas, setRespuestas] = useState<RespuestasFormulario>({});
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  if (cargando) return <Cargando que="el formulario" />;
  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!data) return null;

  const { mascota, preguntas } = data;

  if (mascota.estado !== "Disponible") {
    return (
      <Aviso>
        {mascota.nombre} ya no está disponible para adopción.{" "}
        <Link to="/mascotas">Ver otras mascotas</Link>
      </Aviso>
    );
  }

  if (enviada) {
    return (
      <div className={s.confirmacion}>
        <h1 className={s.tituloConfirmacion}>¡Solicitud enviada!</h1>
        <p>
          Tu postulación por <strong>{mascota.nombre}</strong> quedó registrada en{" "}
          {mascota.refugio.nombre}. El refugio la va a revisar y se contacta con vos.
        </p>
        <p className={s.accionesConfirmacion}>
          <Link to="/solicitudes">Ver mis solicitudes</Link>
          <Link to="/mascotas">Volver al listado</Link>
        </p>
      </div>
    );
  }

  function responder(preguntaId: number, valor: string | number | boolean | undefined) {
    setRespuestas((previas) => {
      const nuevas = { ...previas };
      if (valor === undefined) {
        delete nuevas[String(preguntaId)];
      } else {
        nuevas[String(preguntaId)] = valor;
      }
      return nuevas;
    });
  }

  function sinResponder(pregunta: PreguntaDTO): boolean {
    const respuesta = respuestas[String(pregunta.id)];
    return respuesta === undefined || (typeof respuesta === "string" && respuesta.trim() === "");
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErrorEnvio(null);

    // misma regla que valida el backend: obligatorias respondidas, string vacio no cuenta
    const faltantes = preguntas.filter((p) => p.obligatoria && sinResponder(p));
    if (faltantes.length > 0) {
      setErrorEnvio(`Falta responder: ${faltantes.map((p) => p.texto).join(" — ")}`);
      return;
    }

    const respuestasLimpias: RespuestasFormulario = Object.fromEntries(
      Object.entries(respuestas)
        .map(([clave, valor]) => [clave, typeof valor === "string" ? valor.trim() : valor])
        .filter(([, valor]) => valor !== ""),
    );

    setEnviando(true);
    try {
      await crearSolicitud({
        mascota: mascota.id,
        usuario: usuario.id,
        respuestasFormulario: respuestasLimpias,
      });
      setEnviada(true);
    } catch (e) {
      setErrorEnvio(e instanceof ApiError ? e.message : "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={s.marco}>
      <Link to={`/mascotas/${mascota.id}`} className={s.volver}>
        ← Volver a la ficha
      </Link>

      <h1 className={s.titulo}>Postulación por {mascota.nombre}</h1>
      <p className={s.bajada}>
        {mascota.refugio.nombre} usa estas respuestas para conocerte y decidir la adopción.
      </p>

      <form onSubmit={enviar} className={s.formulario} noValidate>
        {preguntas.length === 0 && (
          <Aviso>Este refugio no pide datos adicionales: enviá la solicitud directamente.</Aviso>
        )}

        {preguntas.map((pregunta) => (
          <CampoPregunta
            key={pregunta.id}
            pregunta={pregunta}
            valor={respuestas[String(pregunta.id)]}
            onCambio={(valor) => responder(pregunta.id, valor)}
          />
        ))}

        {errorEnvio && <Aviso tipo="error">{errorEnvio}</Aviso>}

        <button type="submit" className={s.enviar} disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar solicitud"}
        </button>
      </form>
    </div>
  );
}

/** Un campo del formulario dinámico: el input depende del tipo de la pregunta. */
function CampoPregunta({
  pregunta,
  valor,
  onCambio,
}: {
  pregunta: PreguntaDTO;
  valor: string | number | boolean | undefined;
  onCambio: (valor: string | number | boolean | undefined) => void;
}) {
  const etiqueta = (
    <span className={s.etiqueta}>
      {pregunta.texto}
      {!pregunta.obligatoria && <em className={s.opcional}> (opcional)</em>}
    </span>
  );

  if (pregunta.tipo === "booleano") {
    return (
      <fieldset className={s.campo}>
        <legend className={s.etiqueta}>
          {pregunta.texto}
          {!pregunta.obligatoria && <em className={s.opcional}> (opcional)</em>}
        </legend>
        <div className={s.radios}>
          <label className={s.radio}>
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              checked={valor === true}
              onChange={() => onCambio(true)}
            />
            Sí
          </label>
          <label className={s.radio}>
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              checked={valor === false}
              onChange={() => onCambio(false)}
            />
            No
          </label>
        </div>
      </fieldset>
    );
  }

  if (pregunta.tipo === "opcion") {
    return (
      <label className={s.campo}>
        {etiqueta}
        <select
          value={typeof valor === "string" ? valor : ""}
          onChange={(e) => onCambio(e.target.value || undefined)}
        >
          <option value="">Elegí una opción</option>
          {(pregunta.opciones ?? []).map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (pregunta.tipo === "numero") {
    return (
      <label className={s.campo}>
        {etiqueta}
        <input
          type="number"
          value={typeof valor === "number" ? valor : ""}
          onChange={(e) => onCambio(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </label>
    );
  }

  return (
    <label className={s.campo}>
      {etiqueta}
      <input
        type="text"
        value={typeof valor === "string" ? valor : ""}
        onChange={(e) => onCambio(e.target.value)}
      />
    </label>
  );
}
