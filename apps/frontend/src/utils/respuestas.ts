/** Las respuestas booleanas del formulario se muestran como Sí / No. */
export function mostrarRespuesta(respuesta: string | number | boolean): string {
  if (typeof respuesta === "boolean") return respuesta ? "Sí" : "No";
  return String(respuesta);
}
