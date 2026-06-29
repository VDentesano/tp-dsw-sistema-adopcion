import { PrimaryKey } from "@mikro-orm/decorators/es";

export abstract class BaseEntity {
  @PrimaryKey({ type: 'number' })
  id?: number;
}