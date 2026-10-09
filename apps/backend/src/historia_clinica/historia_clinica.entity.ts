import { Entity, Property, ManyToOne } from "@mikro-orm/decorators/es";

import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Vacuna } from "../vacuna/vacuna.entity.js";

// cada fila es una vacuna aplicada a una mascota; todas las de una mascota forman su historia clinica
@Entity()
export class Historia_Clinica extends BaseEntity {
  // columnas date (sin hora): MikroORM las maneja como string YYYY-MM-DD
  @Property({ type: "date", nullable: false })
  fechaAplicacion!: string;

  @Property({ type: "date", nullable: true })
  proximoRefuerzo?: string | null;

  @ManyToOne(() => Mascota, { nullable: false })
  mascota!: Mascota;

  @ManyToOne(() => Vacuna, { nullable: false })
  vacuna!: Vacuna;
}
