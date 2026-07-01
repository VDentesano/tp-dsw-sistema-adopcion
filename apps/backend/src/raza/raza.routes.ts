import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./raza.controller.js";

export const razaRouter: Router = Router();

razaRouter.get("/", findAll);
razaRouter.get("/:id", findOne);
razaRouter.post("/", add);
razaRouter.put("/:id", update);
razaRouter.delete("/:id", remove);
