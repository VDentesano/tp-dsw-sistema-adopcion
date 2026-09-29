import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeRazaInput, sanitizeRazaUpdateInput } from "./raza.controller.js";

export const razaRouter: Router = Router();

razaRouter.get("/", findAll);
razaRouter.get("/:id", findOne);
razaRouter.post("/", sanitizeRazaInput, add);
razaRouter.put("/:id", sanitizeRazaUpdateInput, update);
razaRouter.delete("/:id", remove);
