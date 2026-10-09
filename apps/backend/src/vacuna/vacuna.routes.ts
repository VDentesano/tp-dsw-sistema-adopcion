import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeVacunaInput, sanitizeVacunaUpdateInput, update } from "./vacuna.controller.js";

export const vacunaRouter: Router = Router();

vacunaRouter.get("/", findAll);
vacunaRouter.get("/:id", findOne);
vacunaRouter.post("/", sanitizeVacunaInput, add);
vacunaRouter.put("/:id", sanitizeVacunaUpdateInput, update);
vacunaRouter.delete("/:id", remove);
