import express from "express";
import cors from "cors";
import { orm, syncSchema } from "./shared/db/orm.js";
import { manejadorDeErrores } from "./shared/errores.js";
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
import { vacunaRouter } from "./vacuna/vacuna.routes.js";
import { historiaClinicaRouter } from "./historia_clinica/historia_clinica.routes.js";

const app = express();

// el frontend (vite) corre en otro puerto; en dev aceptamos el origen del dev server
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());//luego de los middlewares base

// en Express 5 req.body queda undefined si el request no trae JSON; lo dejamos en {} para que los sanitize respondan 400 y no rompan
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});
//antes de las rutas y middlewares de negocio
app.use("/api/roles", rolRouter);
app.use("/api/especies", especieRouter);
app.use("/api/razas", razaRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/localidades", localidadRouter);
app.use("/api/mascotas", mascotaRouter);
app.use("/api/refugios", refugioRouter);
app.use("/api/solicitudes", solicitud_adopcion_router);
app.use("/api/preguntas", preguntaRouter);
app.use("/api/vacunas", vacunaRouter);
app.use("/api/historias-clinicas", historiaClinicaRouter);

// si ninguna ruta de arriba coincidio, respondemos 404 en JSON (Express por defecto manda HTML)
app.use((req, res) => {
  res.status(404).json({ message: `no existe la ruta ${req.method} ${req.path}` });
});

// siempre al final: atrapa los errores que no se manejaron en los handlers y los de express.json()
app.use(manejadorDeErrores);

await syncSchema(); //no usar en produccion

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
