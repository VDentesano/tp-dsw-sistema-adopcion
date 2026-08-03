import { Router } from "express";
import { add, findAll, findOne, remove, update } from "./mascota.controller.js";

export const mascotaRouter: Router= Router();

mascotaRouter.get("/", findAll);
mascotaRouter.get("/:id",findOne);
mascotaRouter.post("/",add);
mascotaRouter.put("/:id",update);
mascotaRouter.delete("/:id", remove);
