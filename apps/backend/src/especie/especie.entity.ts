import {
  Entity,
  Property,
  OneToMany,
} from "@mikro-orm/decorators/legacy";

import { Collection } from "@mikro-orm/core";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Raza } from "../raza/raza.entity.js";

@Entity()
export class Especie extends BaseEntity {

  @Property({ nullable: false, unique: true })
  nombre!: string;

  @OneToMany(() => Raza, raza => raza.especie)
  razas = new Collection<Raza>(this);

}