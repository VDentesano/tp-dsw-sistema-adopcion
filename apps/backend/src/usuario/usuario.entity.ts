import { Entity, Property, ManyToOne, OneToMany } from "@mikro-orm/decorators/es";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Refugio } from "../refugio/refugio.entity.js";
import { Rol } from "../rol/rol.entity.js";
import { Solicitud_Adopcion } from "../solicitud_adopcion/solicitud_adopcion.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Usuario extends BaseEntity {
  @Property({ type: 'string' })
  nombre!: string;

  @Property({ type: 'string' })
  apellido!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

   @Property({ type: 'string', hidden: true }) // no se serializa en las respuestas de la API
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
  @OneToMany(()=>Solicitud_Adopcion, (solicitud_adopcion)=> solicitud_adopcion.usuario)
    solicitudes = new Collection<Solicitud_Adopcion>(this)
}
