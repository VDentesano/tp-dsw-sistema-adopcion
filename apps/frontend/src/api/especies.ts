import type { EspecieDTO, EspecieInputDTO } from "@proyecto/types";
import { api } from "./client";

export function listarEspecies(): Promise<EspecieDTO[]> {
  return api<EspecieDTO[]>("/especies");
}

export function crearEspecie(dto: EspecieInputDTO): Promise<EspecieDTO> {
  return api<EspecieDTO>("/especies", { method: "POST", body: JSON.stringify(dto) });
}

export function modificarEspecie(id: number, dto: EspecieInputDTO): Promise<EspecieDTO> {
  return api<EspecieDTO>(`/especies/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** Da 409 si la especie tiene razas: el backend no deja borrarla. */
export function eliminarEspecie(id: number): Promise<EspecieDTO> {
  return api<EspecieDTO>(`/especies/${id}`, { method: "DELETE" });
}
