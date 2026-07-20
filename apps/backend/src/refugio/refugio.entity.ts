import { 
  Entity, 
  Property,
  OneToMany
} from "@mikro-orm/decorators/es";
//preguntar al profe por el cambio de version
import { Collection, Cascade } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import type { Localidad } from "../localidad/localidad.entity.js";


@Entity()
export class Refugio extends BaseEntity {
  @Property({ type: 'string', nullable: false, unique: true })
  nombre!: string;

  @Property({ type: 'string' })
  direccion!: string;

  @Property({ type: 'string' })
  telefono!: string;

  @Property({ type: 'string' })
  email!: string;

  @OneToMany(() => Usuario, (usuario) => usuario.refugio /*, {cascade: [Cascade.PERSIST]} */) // deberiamos usar cascade??
  usuarios = new Collection<Usuario>(this);

  @OneToMany(() => Mascota, (mascota) => mascota.refugio /*, {cascade: [Cascade.PERSIST]} */) // deberiamos usar cascade??
  mascotas = new Collection<Mascota>(this);

  @Property()
  localidad!: Localidad;
}