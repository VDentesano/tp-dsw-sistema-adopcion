import type { RazaDTO, RazaInputDTO } from "@proyecto/types";
import { api } from "./client";

/** Vienen con la especie populada. */
export function listarRazas(): Promise<RazaDTO[]> {
  return api<RazaDTO[]>("/razas");
}

// el POST y el PUT no populan la especie en la respuesta, por eso devuelven void: la pantalla vuelve a pedir el listado
export async function crearRaza(dto: RazaInputDTO): Promise<void> {
  await api("/razas", { method: "POST", body: JSON.stringify(dto) });
}

export async function modificarRaza(id: number, dto: RazaInputDTO): Promise<void> {
  await api(`/razas/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** Da 409 si hay mascotas de esa raza. */
export async function eliminarRaza(id: number): Promise<void> {
  await api(`/razas/${id}`, { method: "DELETE" });
}
