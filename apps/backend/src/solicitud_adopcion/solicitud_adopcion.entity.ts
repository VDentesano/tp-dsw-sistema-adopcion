import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity()
export class Solicitud_Adopcion extends BaseEntity{
  @Property({ type : Date, nullable:false})
    fechaSolicitud: Date = new Date();
  
  @Property({type: "string", nullable:false})
    estado:string = "Pendiente";
  
  @Property({type: "json", nullable:false})
    respuestasFormulario!:any
  
  @ManyToOne(() => Mascota, {nullable:false})
    mascota!: Mascota

  @ManyToOne(() =>Usuario,{nullable:false})
    usuario!: Usuario
}