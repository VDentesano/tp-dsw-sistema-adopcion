import { Entity, OneToMany, Property } from "@mikro-orm/decorators/es";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Collection } from "@mikro-orm/core";
import { Refugio } from "../refugio/refugio.entity.js";

@Entity()
export class Localidad extends BaseEntity{
  @Property({type: "string", nullable:false, unique: true} )
  nombre!: string;
  @OneToMany(()=> Refugio, (refugio) => refugio.localidad)
  refugios = new Collection<Refugio>(this)
}