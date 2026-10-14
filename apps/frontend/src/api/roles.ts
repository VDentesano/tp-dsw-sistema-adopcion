import type { RolDTO } from "@proyecto/types";
import { api } from "./client";

/** Para el select de rol del ABM de usuarios. Los roles son fijos (Adoptante y Voluntario): no tienen ABM en el front. */
export function listarRoles(): Promise<RolDTO[]> {
  return api<RolDTO[]>("/roles");
}
