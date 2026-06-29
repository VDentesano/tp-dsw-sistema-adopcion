import { Entity, Property, ManyToOne } from "@mikro-orm/decorators/es";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Refugio } from "../refugio/refugio.entity.js";
import { Rol } from "../rol/rol.entity.js";

@Entity()
export class Usuario extends BaseEntity {
  @Property({ type: 'string' })
  nombre!: string;

  @Property({ type: 'string' })
  apellido!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ type: 'string' })
  password!: string;

  @Property({ type: 'string' })
  telefono!: string;

  @ManyToOne(() => Refugio, { nullable: true })
  refugio?: Refugio;

  @ManyToOne(() => Rol, { nullable: false })
  rol!: Rol;
  /*
  @Property()
  localidadID!: number;
*/
}
