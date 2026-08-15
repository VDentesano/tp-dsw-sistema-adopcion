/**
 * Tipos compartidos entre backend y frontend.*/

// ---------- Solicitud de adopcion ----------

export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";

/**
 * Respuestas del formulario dinamico de postulacion.
 * La clave es el id de la pregunta, el valor lo que respondio el adoptante.
 */
export type RespuestasFormulario = Record<string, string | number | boolean>;

/** Lo que el adoptante manda al postularse (POST /api/solicitud_adopcion). */
export interface NuevaSolicitudDTO {
  mascota: number;
  usuario: number;
  respuestasFormulario: RespuestasFormulario;
}
