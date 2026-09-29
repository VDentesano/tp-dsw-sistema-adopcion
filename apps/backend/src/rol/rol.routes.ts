import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeRolInput } from "./rol.controller.js";

export const rolRouter: Router = Router();

rolRouter.get("/", findAll);
rolRouter.get("/:id", findOne);
rolRouter.post("/", sanitizeRolInput, add);
rolRouter.put("/:id", sanitizeRolInput, update);
rolRouter.delete("/:id", remove);
