import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { OptionalProps } from "@mikro-orm/core";
import type { DecisionSolicitud, EstadoSolicitud, RespuestasFormulario } from "@proyecto/types";

/** Estados validos de una solicitud, en runtime (para validar lo que llega por la API). */
export const ESTADOS_SOLICITUD = ["Pendiente", "Aprobada", "Rechazada"] as const;
/** Decisiones validas al resolver, en runtime (para validar lo que llega por la API). */
export const DECISIONES_SOLICITUD: readonly DecisionSolicitud[] = ["Aprobada", "Rechazada"];

@Entity()
export class Solicitud_Adopcion extends BaseEntity{
  // fechaSolicitud y estado los pone el servidor, no se envian al crear
  [OptionalProps]?: 'fechaSolicitud' | 'estado'

  @Property({ type : Date, nullable:false})
    fechaSolicitud: Date = new Date();
  
  @Property({type: "string", nullable:false})
    estado: EstadoSolicitud = "Pendiente";

  @Property({type: "json", nullable:false})
    respuestasFormulario!: RespuestasFormulario

  @Property({type: 'string', nullable: true})
    motivo?: string| undefined;
  
  @ManyToOne(() => Mascota, {nullable:false})
    mascota!: Mascota

  @ManyToOne(() =>Usuario,{nullable:false})
    usuario!: Usuario
}