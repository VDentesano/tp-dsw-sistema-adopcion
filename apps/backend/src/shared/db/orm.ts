import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

/*
  Los datos de conexion salen de variables de entorno, no del codigo: el .env no se
  commitea (esta en .gitignore), asi que cada uno puede apuntar a su propia base y
  la contraseña no termina en el repo.

  Los scripts dev y seed le pasan a Node --env-file-if-exists=.env, que lee el archivo
  antes de ejecutar: por eso no hace falta instalar dotenv.
  Si todavia no tenes el .env: cp apps/backend/.env.example apps/backend/.env
*/
function variableDeEntorno(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `falta la variable de entorno ${nombre}. Copiá apps/backend/.env.example a apps/backend/.env`
    );
  }
  return valor;
}

export const orm = await MikroORM.init({
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  host: variableDeEntorno("DB_HOST"),
  port: Number(variableDeEntorno("DB_PORT")),
  dbName: variableDeEntorno("DB_NAME"),
  user: variableDeEntorno("DB_USER"),
  password: variableDeEntorno("DB_PASSWORD"),
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {  // no usar en prod
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  /*   Preguntar al profe
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
  */
  await orm.schema.update();
}
