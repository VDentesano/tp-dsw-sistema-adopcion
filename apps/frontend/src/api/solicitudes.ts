import type {
  EstadoSolicitud,
  NuevaSolicitudDTO,
  ResolucionSolicitudDTO,
  SolicitudDTO,
} from "@proyecto/types";
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

/** Lo que ve el voluntario: las solicitudes de las mascotas de su refugio, opcionalmente por estado. */
export function listarSolicitudesDeRefugio(
  refugioId: number,
  estado?: EstadoSolicitud,
): Promise<SolicitudDTO[]> {
  const params = new URLSearchParams({ refugio: String(refugioId) });
  if (estado) params.set("estado", estado);
  return api<SolicitudDTO[]>(`/solicitudes?${params}`);
}

export function buscarSolicitud(id: number): Promise<SolicitudDTO> {
  return api<SolicitudDTO>(`/solicitudes/${id}`);
}

export function resolverSolicitud(id: number, dto: ResolucionSolicitudDTO): Promise<SolicitudDTO> {
  return api<SolicitudDTO>(`/solicitudes/${id}/resolver`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
