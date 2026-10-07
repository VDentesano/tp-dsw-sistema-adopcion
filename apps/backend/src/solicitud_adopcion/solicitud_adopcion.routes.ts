import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeSolicitudInput, sanitizeSolicitudUpdateInput, sanitizeResolucionInput ,update, resolver } from "./solicitud_adopcion.controller.js";

export const solicitud_adopcion_router: Router = Router();

solicitud_adopcion_router.get("/", findAll)
solicitud_adopcion_router.get("/:id", findOne)
solicitud_adopcion_router.post("/", sanitizeSolicitudInput, add)
solicitud_adopcion_router.put("/:id", sanitizeSolicitudUpdateInput, update)
solicitud_adopcion_router.delete("/:id", remove)
solicitud_adopcion_router.post("/:id/resolver", sanitizeResolucionInput, resolver)
