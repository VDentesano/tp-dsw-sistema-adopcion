import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./rol.controller.js";

export const rolRouter: Router = Router();

rolRouter.get("/", findAll);
rolRouter.get("/:id", findOne);
rolRouter.post("/", add);
rolRouter.put("/:id", update);
rolRouter.delete("/:id", remove);
