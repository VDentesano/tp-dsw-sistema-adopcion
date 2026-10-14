import type { RefugioDTO, RefugioInputDTO } from "@proyecto/types";
import { api } from "./client";

/** Vienen con la localidad populada. */
export function listarRefugios(): Promise<RefugioDTO[]> {
  return api<RefugioDTO[]>("/refugios");
}

export async function crearRefugio(dto: RefugioInputDTO): Promise<void> {
  await api("/refugios", { method: "POST", body: JSON.stringify(dto) });
}

export async function modificarRefugio(id: number, dto: RefugioInputDTO): Promise<void> {
  await api(`/refugios/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** Da 409 si el refugio tiene mascotas, voluntarios o preguntas. */
export async function eliminarRefugio(id: number): Promise<void> {
  await api(`/refugios/${id}`, { method: "DELETE" });
}
