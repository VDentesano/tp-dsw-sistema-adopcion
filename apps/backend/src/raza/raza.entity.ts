import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
} from "@mikro-orm/decorators/es";

import { Collection } from "@mikro-orm/core";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Especie } from "../especie/especie.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";

@Entity()
export class Raza extends BaseEntity {

  @Property({ type: 'string', nullable: false, unique: true })
  nombre!: string;

  @ManyToOne(() => Especie, { nullable: false })
  especie!: Especie;

  @OneToMany(() => Mascota, (mascota) => mascota.raza)
  mascotas = new Collection<Mascota>(this);

}