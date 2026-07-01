import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./especie.controller.js";

export const especieRouter: Router = Router();

especieRouter.get("/", findAll);
especieRouter.get("/:id", findOne);
especieRouter.post("/", add);
especieRouter.put("/:id", update);
especieRouter.delete("/:id", remove);
