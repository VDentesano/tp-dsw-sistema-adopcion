import type { EntityManager } from "@mikro-orm/mysql";
import type { EstadoMascota } from "@proyecto/types";
import { Auditoria_Estado } from "./auditoria_estado.entity.js";
import type { Mascota } from "../mascota/mascota.entity.js";
/*
 * Registra en la auditoria que una mascota cambio de estado y le aplica el cambio.
 * No hace flush: el que llama decide cuando confirmar (ver el CUU de resolucion).
 */ 
export function registrarCambioEstado(
  em: EntityManager,
  mascota: Mascota,
  estadoNuevo: EstadoMascota,
  motivo?: string,
): Auditoria_Estado {
  const auditoria = em.create(Auditoria_Estado, {
    mascota,
    estadoAnterior: mascota.estado,
    estadoNuevo,
    motivo,
  });
  mascota.estado = estadoNuevo;
  return auditoria;
}