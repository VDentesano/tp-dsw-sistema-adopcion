import { Entity, Property, ManyToOne, OneToMany } from "@mikro-orm/decorators/es";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Raza } from "../raza/raza.entity.js";
import { Refugio } from "../refugio/refugio.entity.js";
import { Solicitud_Adopcion } from "../solicitud_adopcion/solicitud_adopcion.entity.js";
import { Historia_Clinica } from "../historia_clinica/historia_clinica.entity.js";
import { Collection } from "@mikro-orm/core";
import type { EstadoMascota } from "@proyecto/types";

/**
 * Estados validos de una mascota, en runtime (para validar filtros y altas por la API).
 * Tipado contra EstadoMascota: si se desincroniza con @proyecto/types no compila.
 */
export const ESTADOS_MASCOTA: readonly EstadoMascota[] = [
  "Disponible",
  "En tratamiento",
  "Reservada",
  "Adoptada",
];

/** Estado en el que una mascota puede ser solicitada para adopción. */
export const MASCOTA_DISPONIBLE: EstadoMascota = "Disponible";

@Entity()
export class Mascota extends BaseEntity {
  @Property({ type: "string", nullable: false })
  nombre!: string;

  // una columna date (sin hora) MikroORM la maneja como string YYYY-MM-DD, no como Date
  @Property({ type: "date", nullable: true })
  fechaDeNac?: string;

  @Property({ type: "string", nullable: true })
  tamano?: string;

  // nullable por compatibilidad con filas viejas; las nuevas nacen "Disponible"
  @Property({ type: "string", nullable: true })
  estado?: EstadoMascota = MASCOTA_DISPONIBLE;

  @Property({ type: "string", nullable: true })
  fotoURL?: string;

  @Property({ type: "string", nullable: true })
  estilo?: string;

  @ManyToOne(() => Raza, { nullable: false })
  raza!: Raza;

  @ManyToOne(() => Refugio, { nullable: false })
  refugio!: Refugio;

  @OneToMany(() => Solicitud_Adopcion, (solicitud_adopcion) => solicitud_adopcion.mascota)
  solicitudes_adopcion= new Collection<Solicitud_Adopcion> (this)

  // las vacunas aplicadas, de la mas reciente a la mas vieja
  @OneToMany(() => Historia_Clinica, (historia) => historia.mascota, { orderBy: { fechaAplicacion: "desc" } })
  historiaClinica = new Collection<Historia_Clinica>(this)

}
