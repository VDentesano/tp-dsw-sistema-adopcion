import type { NuevaSolicitudDTO, SolicitudDTO } from "@proyecto/types";
import { api } from "./client";

export function crearSolicitud(dto: NuevaSolicitudDTO): Promise<SolicitudDTO> {
  return api<SolicitudDTO>("/solicitudes", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function listarSolicitudesDeUsuario(usuarioId: number): Promise<SolicitudDTO[]> {
  return api<SolicitudDTO[]>(`/solicitudes?usuario=${usuarioId}`);
}
