import type { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { responderError } from "../shared/errores.js";
import { esTextoValido, parsearId } from "../shared/sanitizacion.js";
import { Localidad } from "./localidad.entity.js";

const em = orm.em

// localidad solo tiene nombre, asi que el mismo middleware sirve para el alta y la modificacion
function sanitizeLocalidadInput(req: Request, res: Response, next: NextFunction) {
  if(!esTextoValido(req.body.nombre)){
    return res.status(400).json({message: 'nombre es obligatorio y no puede estar vacio'})
  }
  req.body.sanitizedInput = {nombre: req.body.nombre.trim()}
  next()
}

async function findAll(req: Request, res: Response) {
  try{
    const localidades = await em.find(Localidad,{})
    res.status(200).json({message:'localidades encontradas', data:localidades})
  } catch(error){
    responderError(res, error)
  }
}

async function findOne(req: Request, res: Response) {
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const localidad = await em.findOne(Localidad, {id})
    if(!localidad){
      return res.status(404).json({message: 'no existe localidad'})
    }
    res.status(200).json({message:'localidad encontrada', data: localidad})
  }catch(error){
    responderError(res, error)
  }
}

async function add(req: Request, res: Response) {
  try{
    const localidad = em.create(Localidad, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'localidad creada', data: localidad})
  } catch(error){
    responderError(res, error)
  }
}

async function update(req: Request, res: Response) {
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const localidad = await em.findOne(Localidad, id)
    if(!localidad){
      return res.status(404).json({message: 'no existe localidad'})
    }
    em.assign(localidad, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message: 'localidad modificada correctamente', data: localidad})
  }catch(error){
    responderError(res, error)
  }
}

async function remove(req: Request, res: Response) {
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const localidad = await em.findOne(Localidad, id)
    if(!localidad){
      return res.status(404).json({message: 'no existe localidad'})
    }
    em.remove(localidad)
    await em.flush()
    res.status(200).json({message:'localidad eliminada', data: localidad})
  }catch(error){
    responderError(res, error)
  }
}

export {sanitizeLocalidadInput, findAll, findOne, add, update, remove}