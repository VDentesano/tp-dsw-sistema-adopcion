import { Entity, Property, ManyToOne, OneToMany } from "@mikro-orm/decorators/es";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Raza } from "../raza/raza.entity.js";
import { Refugio } from "../refugio/refugio.entity.js";
import { Solicitud_Adopcion } from "../solicitud_adopcion/solicitud_adopcion.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Mascota extends BaseEntity {
  @Property({ type: "string", nullable: false })
  nombre!: string;

  @Property({ type: "date", nullable: true })
  fechaDeNac?: Date;

  @Property({ type: "string", nullable: true })
  tamano?: string;

  @Property({ type: "string", nullable: true })
  estado?: string;

  @Property({ type: "string", nullable: true })
  fotoURL?: string;

  @Property({ type: "string", nullable: true })
  estilo?: string;

  @ManyToOne(() => Raza, { nullable: false })
  raza!: Raza;

  @ManyToOne(() => Refugio, { nullable: false })
  refugio!: Refugio;

  @OneToMany(() => Solicitud_Adopcion, (solicitud_adopcion) => solicitud_adopcion.mascota)
  solicitudes_adopcion= new Collection<Solicitud_Adopcion> (this)

}
