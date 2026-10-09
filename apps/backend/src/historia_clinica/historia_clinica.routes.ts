import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeHistoriaClinicaInput, sanitizeHistoriaClinicaUpdateInput, update } from "./historia_clinica.controller.js";

export const historiaClinicaRouter: Router = Router();

historiaClinicaRouter.get("/", findAll);
historiaClinicaRouter.get("/:id", findOne);
historiaClinicaRouter.post("/", sanitizeHistoriaClinicaInput, add);
historiaClinicaRouter.put("/:id", sanitizeHistoriaClinicaUpdateInput, update);
historiaClinicaRouter.delete("/:id", remove);
