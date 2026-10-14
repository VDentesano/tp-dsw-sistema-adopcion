import type { UsuarioDTO, UsuarioInputDTO } from "@proyecto/types";
import { api } from "./client";

/** Vienen con el rol y el refugio populados. La contraseña nunca viene. */
export function listarUsuarios(): Promise<UsuarioDTO[]> {
  return api<UsuarioDTO[]>("/usuarios");
}

export async function crearUsuario(dto: UsuarioInputDTO): Promise<void> {
  await api("/usuarios", { method: "POST", body: JSON.stringify(dto) });
}

export async function modificarUsuario(id: number, dto: UsuarioInputDTO): Promise<void> {
  await api(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

/** Da 409 si el usuario tiene solicitudes. */
export async function eliminarUsuario(id: number): Promise<void> {
  await api(`/usuarios/${id}`, { method: "DELETE" });
}
