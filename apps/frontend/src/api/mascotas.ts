import type { MascotaDetalleDTO, MascotaDTO, MascotaInputDTO } from "@proyecto/types";
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

/** Las mascotas de un refugio, en cualquier estado: es lo que lista el ABM del voluntario. */
export function listarMascotasDeRefugio(refugioId: number): Promise<MascotaDTO[]> {
  return api<MascotaDTO[]>(`/mascotas?refugio=${refugioId}`);
}

export async function crearMascota(dto: MascotaInputDTO): Promise<void> {
  await api("/mascotas", { method: "POST", body: JSON.stringify(dto) });
}

export async function modificarMascota(id: number, dto: MascotaInputDTO): Promise<void> {
  await api(`/mascotas/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** Da 409 si la mascota tiene solicitudes o vacunas aplicadas. */
export async function eliminarMascota(id: number): Promise<void> {
  await api(`/mascotas/${id}`, { method: "DELETE" });
}
