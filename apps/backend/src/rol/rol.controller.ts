import type { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { responderError } from "../shared/errores.js";
import { esTextoValido, parsearId } from "../shared/sanitizacion.js";
import { Rol } from "./rol.entity.js";

const em = orm.em;

// rol solo tiene nombre, asi que el mismo middleware sirve para el alta y la modificacion
function sanitizeRolInput(req: Request, res: Response, next: NextFunction) {
  if (!esTextoValido(req.body.nombre)) {
    return res.status(400).json({ message: "nombre es obligatorio y no puede estar vacio" });
  }
  req.body.sanitizedInput = { nombre: req.body.nombre.trim() };
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const roles = await em.find(Rol, {});
    res.status(200).json({ message: "Roles encontrados", data: roles });
  } catch (error) {
    responderError(res, error);
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "id invalido" });
    }
    const rol = await em.findOne(Rol, { id });
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    res.status(200).json({ message: "Rol encontrado", data: rol });
  } catch (error) {
    responderError(res, error);
  }
}

async function add(req: Request, res: Response) {
  try {
    const rol = em.create(Rol, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: "Rol agregado", data: rol });
  } catch (error) {
    responderError(res, error);
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "id invalido" });
    }
    const rol = await em.findOne(Rol, { id });
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    em.assign(rol, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: "Rol actualizado", data: rol });
  } catch (error) {
    responderError(res, error);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "id invalido" });
    }
    const rol = await em.findOne(Rol, { id });
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    await em.remove(rol).flush();
    res.status(200).json({ message: "Rol eliminado", data: rol });
  } catch (error) {
    responderError(res, error);
  }
}

export { sanitizeRolInput, findAll, findOne, add, update, remove };
