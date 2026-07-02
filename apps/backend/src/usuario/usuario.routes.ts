import { Router } from "express";
import { findAll, findOne, add, update, remove} from "./usuario.controller.js";

export const usuarioRouter: Router = Router();

usuarioRouter.get("/", findAll);
usuarioRouter.get("/:id", findOne);
usuarioRouter.post("/", add);
usuarioRouter.put("/:id", update);
usuarioRouter.delete("/:id", remove);