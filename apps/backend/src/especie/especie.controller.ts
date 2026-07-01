import type { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Especie } from "./especie.entity.js";

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const especies = await em.find(Especie, {});
    res.status(200).json({ message: "Especies encontradas", data: especies });
  } catch (error) {
    res.status(500).json({ message: "Error al encontrar especies", error });
  }
}

async function findOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const especie = await em.findOne(Especie, { id });
    if (!especie) {
      res.status(404).json({ message: "Especie no encontrada" });
      return;
    }
    res.status(200).json({ message: "Especie encontrada", data: especie });
  } catch (error) {
    res.status(500).json({ message: "Error al encontrar especie", error });
  }
}

async function add(req: Request, res: Response) {
  try {
    em.create(Especie, req.body);
    await em.flush();
    res.status(201).json({ message: "Especie agregada" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar especie", error });
  }
}

async function update(req: Request, res: Response) {
  const especie = await em.findOne(Especie, Number(req.params.id));
  if (!especie) {
    res.status(404).json({ message: "Especie no encontrada" });
    return;
  }
  try {
    em.assign(especie, req.body);
    await em.flush();
    res.status(200).json({ message: "Especie actualizada" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar especie", error });
  }
}

async function remove(req: Request, res: Response) {
  const especie = await em.findOne(Especie, Number(req.params.id));
  if (!especie) {
    res.status(404).json({ message: "Especie no encontrada" });
    return;
  }
  try {
    await em.remove(especie).flush();
    res.status(200).json({ message: "Especie eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar especie", error });
  }
}

export { findAll, findOne, add, update, remove };
