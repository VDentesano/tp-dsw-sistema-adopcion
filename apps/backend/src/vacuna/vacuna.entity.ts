import { Entity, Property, OneToMany } from "@mikro-orm/decorators/es";

import { Collection } from "@mikro-orm/core";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Historia_Clinica } from "../historia_clinica/historia_clinica.entity.js";

@Entity()
export class Vacuna extends BaseEntity {
  @Property({ type: "string", nullable: false, unique: true })
  nombre!: string;

  @Property({ type: "boolean", nullable: false })
  esObligatoria!: boolean;

  @OneToMany(() => Historia_Clinica, (historia) => historia.vacuna)
  aplicaciones = new Collection<Historia_Clinica>(this);
}
