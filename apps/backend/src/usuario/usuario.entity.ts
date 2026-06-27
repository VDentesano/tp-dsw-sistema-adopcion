import { 
  Entity, 
  Property,
  ManyToOne
} from "@mikro-orm/decorators/legacy";
//preguntar al profe por el cambio de version
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Refugio } from "../refugio/refugio.entity.js";
import { Rol } from "../rol/rol.entity.js";

@Entity()
export class Usuario extends BaseEntity {

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property()
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