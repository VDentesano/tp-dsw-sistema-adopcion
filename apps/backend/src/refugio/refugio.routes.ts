import { Router } from "express";
import { add, findAll, findOne, remove, update } from "./refugio.controller.js";

export const refugioRouter: Router= Router();

refugioRouter.get("/", findAll);
refugioRouter.get("/:id",findOne);
refugioRouter.post("/",add);
refugioRouter.put("/:id",update);
refugioRouter.delete("/:id", remove);
