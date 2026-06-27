import {
  Entity,
  Property,
  ManyToOne,
} from "@mikro-orm/decorators/legacy";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Raza } from "../raza/raza.entity.js";
import { Especie } from "../especie/especie.entity.js";
import { Refugio } from "../refugio/refugio.entity.js"; // Asumiendo esta ruta

@Entity()
export class Mascota extends BaseEntity {

  @Property({ nullable: false })
  nombre!: string;

  @Property({ type: 'date', nullable: true })
  fechaDeNac?: Date;

  @Property({ nullable: true })
  tamano?: string;

  @Property({ nullable: true })
  estado?: string;

  @Property({ nullable: true })
  fotoURL?: string;

  @Property({ nullable: true })
  estilo?: string;

  @ManyToOne(() => Raza, { nullable: false })
  raza!: Raza;

  @ManyToOne(() => Refugio, { nullable: false })
  refugio!: Refugio;

}