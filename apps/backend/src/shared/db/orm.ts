import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  dbName: "refugio",
  clientUrl: "mysql://dsw:dsw@localhost:3306/refugio",
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {  // no usar en prod
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  await orm.schema.update();
}