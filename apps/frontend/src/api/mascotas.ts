import type { MascotaDetalleDTO, MascotaDTO } from "@proyecto/types";
import { api } from "./client";

/**
 * El catalogo publico solo muestra mascotas en estado Disponible;
 * la regla queda explicita aca, el endpoint es generico.
 */
export function listarMascotasDisponibles(tamano?: string): Promise<MascotaDTO[]> {
  const params = new URLSearchParams({ estado: "Disponible" });
  if (tamano) params.set("tamano", tamano);
  return api<MascotaDTO[]>(`/mascotas?${params}`);
}

export function buscarMascota(id: number): Promise<MascotaDetalleDTO> {
  return api<MascotaDetalleDTO>(`/mascotas/${id}`);
}
