import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeRefugioInput, sanitizeRefugioUpdateInput, update } from "./refugio.controller.js";

export const refugioRouter: Router= Router();

refugioRouter.get("/", findAll);
refugioRouter.get("/:id",findOne);
refugioRouter.post("/", sanitizeRefugioInput, add);
refugioRouter.put("/:id", sanitizeRefugioUpdateInput, update);
refugioRouter.delete("/:id", remove);
