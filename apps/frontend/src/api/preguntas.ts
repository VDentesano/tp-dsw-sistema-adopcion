import type { PreguntaDTO } from "@proyecto/types";
import { api } from "./client";

/** Las preguntas activas que definio un refugio, ya ordenadas por `orden`. */
export function listarPreguntasActivas(refugioId: number): Promise<PreguntaDTO[]> {
  return api<PreguntaDTO[]>(`/preguntas?refugio=${refugioId}&activa=true`);
}

/**
 * Todas las preguntas, incluidas las inactivas: sirve para mostrar el texto
 * de lo que respondio el adoptante en solicitudes viejas (regla de inmutabilidad:
 * las preguntas nunca se borran, asi que el texto siempre se puede resolver).
 */
export function listarPreguntas(): Promise<PreguntaDTO[]> {
  return api<PreguntaDTO[]>("/preguntas");
}
