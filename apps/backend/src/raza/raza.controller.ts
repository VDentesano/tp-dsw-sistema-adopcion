import type { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { responderError } from "../shared/errores.js";
import { camposFaltantes, esTextoValido, parsearId } from "../shared/sanitizacion.js";
import { Raza } from "./raza.entity.js";

const em = orm.em;

/** Campos que se pueden cargar o modificar desde el CRUD. */
interface RazaInput {
  nombre?: string;
  especie?: number;
}

// arma el input solo con los campos permitidos que vinieron; devuelve un string si alguno es invalido
const leerRaza = (body: Record<string, unknown>): RazaInput | string => {
  const input: RazaInput = {};

  if (body.nombre !== undefined) {
    if (!esTextoValido(body.nombre)) return "nombre no puede estar vacio";
    input.nombre = body.nombre.trim();
  }
  if (body.especie !== undefined) {
    const especie = parsearId(body.especie);
    if (!especie) return "especie debe ser un id valido";
    input.especie = especie;
  }
  return input;
};

const sanitizeRazaInput = (req: Request, res: Response, next: NextFunction) => {
  const input = leerRaza(req.body);
  if (typeof input === "string") {
    return res.status(400).json({ message: input });
  }
  const faltantes = camposFaltantes(input, ["nombre", "especie"]);
  if (faltantes.length > 0) {
    return res.status(400).json({ message: `faltan campos obligatorios: ${faltantes.join(", ")}` });
  }
  req.body.sanitizedInput = input;
  next();
};

// en la modificacion los campos son opcionales: solo se cambia lo que vino
const sanitizeRazaUpdateInput = (req: Request, res: Response, next: NextFunction) => {
  const input = leerRaza(req.body);
  if (typeof input === "string") {
    return res.status(400).json({ message: input });
  }
  req.body.sanitizedInput = input;
  next();
};

const findAll = async (req: Request, res: Response) => {
  try {
    const razas = await em.find(Raza, {}, { populate: ["especie"] });
    if (razas.length === 0) {
      res.status(200).json({ message: "No se encontraron razas", data: [] });
      return;
    }
    res.status(200).json({ message: "Razas encontradas", data: razas });
  } catch (error) {
    responderError(res, error);
  }
};

const findOne = async (req: Request, res: Response) => {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "id invalido" });
      return;
    }
    const raza = await em.findOne(Raza, { id }, { populate: ["especie"] });
    if (!raza) {
      res.status(404).json({ message: "Raza no encontrada" });
      return;
    }
    res.status(200).json({ message: "Raza encontrada", data: raza });
  } catch (error) {
    responderError(res, error);
  }
};

const add = async (req: Request, res: Response) => {
  try {
    const raza = em.create(Raza, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: "Raza agregada", data: raza });
  } catch (error) {
    responderError(res, error);
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "id invalido" });
      return;
    }
    const raza = await em.findOne(Raza, { id });
    if (!raza) {
      res.status(404).json({ message: "Raza no encontrada" });
      return;
    }
    em.assign(raza, req.body.sanitizedInput as RazaInput);
    await em.flush();
    res.status(200).json({ message: "Raza actualizada", data: raza });
  } catch (error) {
    responderError(res, error);
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "id invalido" });
      return;
    }
    const raza = await em.findOne(Raza, { id });
    if (!raza) {
      res.status(404).json({ message: "Raza no encontrada" });
      return;
    }
    await em.remove(raza).flush();
    res.status(200).json({ message: "Raza eliminada", data: raza });
  } catch (error) {
    responderError(res, error);
  }
};

export { sanitizeRazaInput, sanitizeRazaUpdateInput, findAll, findOne, add, update, remove };
