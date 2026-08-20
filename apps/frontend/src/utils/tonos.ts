export type TonoChapita = "verde" | "ambar" | "azul" | "rojo" | "neutro";

/** Un solo mapa para estados de mascota y de solicitud: el color siempre significa lo mismo. */
export function tonoDeEstado(estado: string | null | undefined): TonoChapita {
  switch (estado) {
    case "Disponible":
    case "Aprobada":
      return "verde";
    case "En tratamiento":
    case "Pendiente":
      return "ambar";
    case "Reservada":
      return "azul";
    case "Rechazada":
      return "rojo";
    default:
      return "neutro";
  }
}
