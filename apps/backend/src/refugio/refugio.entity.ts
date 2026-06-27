import { 
  Entity, 
  PrimaryKey, 
  Property
} from "@mikro-orm/decorators/legacy";
//preguntar al profe por el cambio de version
import { BaseEntity } from "../shared/db/baseEntity.entity.js";


@Entity()
export class Refugio extends BaseEntity {
  @Property({ nullable: false, unique: true })
  nombre!: string;

  @Property()
  direccion!: string;

  @Property()
  telefono!: string;

  @Property()
  email!: string;

  //localidadID: number;
}