import { 
  Entity, 
  Property,
  OneToMany,
  ManyToOne
} from "@mikro-orm/decorators/es";
//preguntar al profe por el cambio de version
import { Collection, Cascade } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";
import { Pregunta_Formulario } from "../pregunta/pregunta.entity.js";


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

  @ManyToOne(()=> Localidad)
  localidad!: Localidad;

  // preguntas del formulario dinamico de postulacion que definio este refugio
  @OneToMany(() => Pregunta_Formulario, (pregunta) => pregunta.refugio)
  preguntas = new Collection<Pregunta_Formulario>(this);
}