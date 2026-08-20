import express from "express";
import cors from "cors";
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from "@mikro-orm/mysql";
import { rolRouter } from "./rol/rol.routes.js";
import { especieRouter } from "./especie/especie.routes.js";
import { razaRouter } from "./raza/raza.routes.js";
import { usuarioRouter } from "./usuario/usuario.routes.js";
import { localidadRouter } from "./localidad/localidad.routes.js";
import { mascotaRouter } from "./mascota/mascota.routes.js";
import { refugioRouter } from "./refugio/refugio.routes.js";
import { solicitud_adopcion_router } from "./solicitud_adopcion/solicitud_adopcion.routes.js";
import { preguntaRouter } from "./pregunta/pregunta.routes.js";

const app = express();

// el frontend (vite) corre en otro puerto; en dev aceptamos el origen del dev server
app.use(cors({ origin: "http://localhost:5173" }));

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
app.use("/api/solicitud_adopcion", solicitud_adopcion_router);
app.use("/api/preguntas", preguntaRouter);

await syncSchema(); //no usar en produccion

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
