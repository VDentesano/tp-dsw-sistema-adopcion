import { Entity, Property, ManyToOne } from "@mikro-orm/decorators/es";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import type { EstadoMascota } from "@proyecto/types";
import { OptionalProps } from "@mikro-orm/core";

@Entity()
export class Auditoria_Estado extends BaseEntity {
  [OptionalProps]?: "fechaCambio";
  
  @ManyToOne(() => Mascota, {nullable: false})
  mascota!: Mascota;

  @Property({type:'string', nullable: true}) 
  estadoAnterior?: EstadoMascota | undefined;

  @Property({type:'string', nullable: false}) 
  estadoNuevo!: EstadoMascota;

  @Property({type:Date, nullable: false})
  fechaCambio: Date = new Date();

  @Property({type:'string', nullable: true})
  motivo?: string | undefined;
}