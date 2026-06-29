import { 
  Entity, 
  Property,
  OneToMany
} from "@mikro-orm/decorators/es";
//preguntar al profe por el cambio de version
import { Collection } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity()
export class Rol extends BaseEntity {

  @Property({ type: 'string', nullable: false, unique: true })
  nombre!: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios = new Collection<Usuario>(this);

}

