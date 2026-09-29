import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeLocalidadInput } from "./localidad.controller.js";

export const localidadRouter: Router = Router();

localidadRouter.get("/", findAll);
localidadRouter.get("/:id", findOne);
localidadRouter.post("/", sanitizeLocalidadInput, add);
localidadRouter.put("/:id", sanitizeLocalidadInput, update);
localidadRouter.delete("/:id", remove);
