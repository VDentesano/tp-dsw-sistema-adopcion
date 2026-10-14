import type { LocalidadDTO, LocalidadInputDTO } from "@proyecto/types";
import { api } from "./client";

export function listarLocalidades(): Promise<LocalidadDTO[]> {
  return api<LocalidadDTO[]>("/localidades");
}

export async function crearLocalidad(dto: LocalidadInputDTO): Promise<void> {
  await api("/localidades", { method: "POST", body: JSON.stringify(dto) });
}

export async function modificarLocalidad(id: number, dto: LocalidadInputDTO): Promise<void> {
  await api(`/localidades/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** Da 409 si hay refugios en esa localidad. */
export async function eliminarLocalidad(id: number): Promise<void> {
  await api(`/localidades/${id}`, { method: "DELETE" });
}
