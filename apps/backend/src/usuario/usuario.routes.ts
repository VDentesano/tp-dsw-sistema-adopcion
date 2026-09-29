import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeUsuarioInput, sanitizeUsuarioUpdateInput } from "./usuario.controller.js";

export const usuarioRouter: Router = Router();

usuarioRouter.get("/", findAll);
usuarioRouter.get("/:id", findOne);
usuarioRouter.post("/", sanitizeUsuarioInput, add);
usuarioRouter.put("/:id", sanitizeUsuarioUpdateInput, update);
usuarioRouter.delete("/:id", remove);
