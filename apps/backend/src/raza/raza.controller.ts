import type { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Raza } from "./raza.entity.js";

const em = orm.em;

const findAll = async (req: Request, res: Response) => {
  try {
    const razas = await em.find(Raza, {}, { populate: ["especie"] });
    if (razas.length === 0) {
      res.status(200).json({ message: "No se encontraron razas", data: [] });
      return;
    }
    res.status(200).json({ message: "Razas encontradas", data: razas });
  } catch (error) {
    res.status(500).json({ message: "Error al encontrar razas", error });
  }
};

const findOne = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const raza = await em.findOne(Raza, { id }, { populate: ["especie"] });
    if (!raza) {
      res.status(404).json({ message: "Raza no encontrada" });
      return;
    }
    res.status(200).json({ message: "Raza encontrada", data: raza });
  } catch (error) {
    res.status(500).json({ message: "Error al encontrar raza", error });
  }
};

const add = async (req: Request, res: Response) => {
  try {
    em.create(Raza, req.body);
    await em.flush();
    res.status(201).json({ message: "Raza agregada" });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar raza", error });
  }
};

const update = async (req: Request, res: Response) => {
  const raza = await em.findOne(Raza, Number(req.params.id));
  if (!raza) {
    res.status(404).json({ message: "Raza no encontrada" });
    return;
  }
  try {
    em.assign(raza, req.body);
    await em.flush();
    res.status(200).json({ message: "Raza actualizada" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar raza", error });
  }
};

const remove = async (req: Request, res: Response) => {
  const raza = await em.findOne(Raza, Number(req.params.id));
  if (!raza) {
    res.status(404).json({ message: "Raza no encontrada" });
    return;
  }
  try {
    await em.remove(raza).flush();
    res.status(200).json({ message: "Raza eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar raza", error });
  }
};

export { findAll, findOne, add, update, remove };
