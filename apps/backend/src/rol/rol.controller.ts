import type { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { esTextoValido } from "../shared/sanitizacion.js";
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
    res.status(500).json({ message: "Error al encontrar roles", error });
  }
}

async function findOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const rol = await em.findOne(Rol, { id });
    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    res.status(200).json({ message: "Rol encontrado", data: rol });
  } catch (error) {
    res.status(500).json({ message: "Error al encontrar rol", error });
  }
}

async function add(req: Request, res: Response) {
  try {
    em.create(Rol, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: "Rol agregado" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar rol", error });
  }
}

async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const rol = await em.findOne(Rol, { id });
  if (!rol) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }
  em.assign(rol, req.body.sanitizedInput);
  try {
    await em.flush();
    res.status(200).json({ message: "Rol actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar rol", error });
  }
}

async function remove(req: Request, res: Response) {
  const rol = await em.findOne(Rol, { id: Number(req.params.id) });
  if (!rol) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }
  try {
    await em.remove(rol).flush();
    res.status(200).json({ message: "Rol eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar rol", error });
  }
}

export { sanitizeRolInput, findAll, findOne, add, update, remove };
