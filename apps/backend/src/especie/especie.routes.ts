import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeEspecieInput } from "./especie.controller.js";

export const especieRouter: Router = Router();

especieRouter.get("/", findAll);
especieRouter.get("/:id", findOne);
especieRouter.post("/", sanitizeEspecieInput, add);
especieRouter.put("/:id", sanitizeEspecieInput, update);
especieRouter.delete("/:id", remove);
