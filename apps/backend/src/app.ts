import express from "express";
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from "@mikro-orm/mysql";
import { rolRouter } from "./rol/rol.routes.js";
import { especieRouter } from "./especie/especie.routes.js";
import { razaRouter } from "./raza/raza.routes.js";
import { usuarioRouter } from "./usuario/usuario.routes.js";
import { localidadRouter } from "./localidad/localidad.routes.js";
import { mascotaRouter } from "./mascota/mascota.routes.js";
import { refugioRouter } from "./refugio/refugio.routes.js";

const app = express();


app.use(express.json());//luego de los middlewares base

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});
//antes de las rutas y middlewares de negocio
app.use("/api/roles", rolRouter);
app.use("/api/especies", especieRouter);
app.use("/api/razas", razaRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/localidad", localidadRouter);
app.use("/api/mascota",mascotaRouter);
app.use("/api/refugio",refugioRouter);

await syncSchema(); //no usar en produccion

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
