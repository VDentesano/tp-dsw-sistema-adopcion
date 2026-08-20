import { Router } from "express";
import { add, findAll, findOne, remove, sanitizePreguntaInput, sanitizePreguntaUpdateInput, update } from "./pregunta.controller.js";

export const preguntaRouter: Router = Router();

preguntaRouter.get("/", findAll)
preguntaRouter.get("/:id", findOne)
preguntaRouter.post("/", sanitizePreguntaInput, add)
preguntaRouter.put("/:id", sanitizePreguntaUpdateInput, update)
preguntaRouter.delete("/:id", remove)
