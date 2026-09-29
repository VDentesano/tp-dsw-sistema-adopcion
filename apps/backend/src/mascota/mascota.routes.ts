import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeMascotaInput, sanitizeMascotaUpdateInput, update } from "./mascota.controller.js";

export const mascotaRouter: Router= Router();

mascotaRouter.get("/", findAll);
mascotaRouter.get("/:id",findOne);
mascotaRouter.post("/", sanitizeMascotaInput, add);
mascotaRouter.put("/:id", sanitizeMascotaUpdateInput, update);
mascotaRouter.delete("/:id", remove);
