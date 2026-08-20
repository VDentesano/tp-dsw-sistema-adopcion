import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/es";
import { OptionalProps } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Refugio } from "../refugio/refugio.entity.js";
import type { TipoPregunta } from "@proyecto/types";

/**
 * Tipos validos de pregunta, en runtime (para validar lo que llega por la API).
 * Tipado contra TipoPregunta: si se desincroniza con @proyecto/types no compila.
 */
export const TIPOS_PREGUNTA: readonly TipoPregunta[] = [
  "texto",
  "numero",
  "booleano",
  "opcion",
];

/*
  Pregunta del formulario dinamico de postulacion, definida por cada refugio.

  RN (inmutabilidad): una pregunta ya creada nunca se edita ni se borra fisicamente.
  - "editar"  = desactivar la vieja y crear una nueva (lo hace el PUT del controller)
  - "borrar"  = poner activa=false (soft delete)
  Motivo: las solicitudes guardan las respuestas como {preguntaId: respuesta};
  si la pregunta cambiara de texto, las respuestas viejas quedarian apuntando
  a una pregunta distinta de la que realmente se le hizo al adoptante.
*/
@Entity()
export class Pregunta_Formulario extends BaseEntity {
  [OptionalProps]?: "activa";

  @Property({ type: "string", nullable: false })
  texto!: string;

  @Property({ type: "string", nullable: false })
  tipo!: TipoPregunta;

  // solo para tipo "opcion": los valores posibles del select
  @Property({ type: "json", nullable: true })
  opciones?: string[];

  @Property({ type: "boolean", nullable: false })
  obligatoria!: boolean;

  // posicion en la que se muestra en el formulario
  @Property({ type: "number", nullable: false })
  orden!: number;

  @Property({ type: "boolean", nullable: false })
  activa: boolean = true;

  @ManyToOne(() => Refugio, { nullable: false })
  refugio!: Refugio;
}
