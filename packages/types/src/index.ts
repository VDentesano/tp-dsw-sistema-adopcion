/**
 * Tipos compartidos entre backend y frontend.
 *
 * Ojo: el backend solo puede hacer `import type` de este paquete (el main es un .ts,
 * Node no lo puede cargar en runtime). Los arrays de valores que el backend necesita
 * en runtime se redeclaran en la entity correspondiente, tipados contra estos tipos
 * para que el compilador avise si se desincronizan. El frontend (Vite) si puede
 * importar los arrays directamente.
 */

// ---------- Mascota ----------

export const ESTADOS_MASCOTA = [
  "Disponible",
  "En tratamiento",
  "Reservada",
  "Adoptada",
] as const;
export type EstadoMascota = (typeof ESTADOS_MASCOTA)[number];

// ---------- Pregunta del formulario dinamico ----------

export const TIPOS_PREGUNTA = ["texto", "numero", "booleano", "opcion"] as const;
export type TipoPregunta = (typeof TIPOS_PREGUNTA)[number];

/**
 * Pregunta que un refugio define para su formulario de postulacion.
 * Regla de inmutabilidad: una pregunta nunca se edita ni se borra fisicamente;
 * "editar" desactiva la vieja y crea una nueva, "borrar" pone activa=false.
 * Asi las respuestas guardadas en solicitudes viejas siempre apuntan al texto
 * exacto que se le pregunto al adoptante.
 */
export interface PreguntaDTO {
  id: number;
  texto: string;
  tipo: TipoPregunta;
  /** Solo para tipo "opcion": los valores posibles del select. */
  opciones?: string[];
  obligatoria: boolean;
  orden: number;
  activa: boolean;
}

/** Lo que el voluntario manda al crear una pregunta (POST /api/preguntas). */
export interface NuevaPreguntaDTO {
  refugio: number;
  texto: string;
  tipo: TipoPregunta;
  opciones?: string[];
  obligatoria: boolean;
  orden: number;
}

// ---------- DTOs de lectura (lo que la API devuelve al frontend) ----------

export interface EspecieDTO {
  id: number;
  nombre: string;
}

export interface RazaDTO {
  id: number;
  nombre: string;
  especie: EspecieDTO;
}

export interface RefugioResumenDTO {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

/** Mascota como la devuelve GET /api/mascota (populate raza.especie y refugio). */
export interface MascotaDTO {
  id: number;
  nombre: string;
  fechaDeNac: string | null;
  tamano: string | null;
  estado: EstadoMascota | null;
  fotoURL: string | null;
  estilo: string | null;
  raza: RazaDTO;
  refugio: RefugioResumenDTO;
}

/** Version resumida que viene anidada en una solicitud (sin populate profundo). */
export interface MascotaResumenDTO {
  id: number;
  nombre: string;
  fechaDeNac: string | null;
  tamano: string | null;
  estado: EstadoMascota | null;
  fotoURL: string | null;
}

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

/** Solicitud como la devuelve GET /api/solicitud_adopcion (populate mascota y usuario). */
export interface SolicitudDTO {
  id: number;
  fechaSolicitud: string;
  estado: EstadoSolicitud;
  respuestasFormulario: RespuestasFormulario;
  mascota: MascotaResumenDTO;
}
