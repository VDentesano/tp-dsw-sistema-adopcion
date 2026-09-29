import type { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { esTextoValido } from "../shared/sanitizacion.js";
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
    res.status(200).json({message:'find all localidades', data:localidades})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
  try{
    const id = Number(req.params.id)
    const localidad = await em.findOne(Localidad, {id})
    if(!localidad){
      return res.status(404).json({message: 'no existe localidad'})
    }
    res.status(200).json({message:'found localidad', data: localidad})
  }catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try{
    const localidad = em.create(Localidad, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'localidad created', data: localidad})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function update(req: Request, res: Response) {
  try{
    const id = Number(req.params.id)
    const localidad = await em.findOne(Localidad, id)
    if(!localidad){
      return res.status(404).json({message: 'no existe localidad'})
    }
    em.assign(localidad, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message: 'localidad modificada correctamente', data: localidad})
  }catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function remove(req: Request, res: Response) {
  try{
    const id = Number(req.params.id)
    const localidad = await em.findOne(Localidad, id)
    if(!localidad){
      return res.status(404).json({message: 'no existe localidad'})
    }
    em.remove(localidad)
    await em.flush()
    res.status(200).json({message:'localidad deleted'})
  }catch(error:any){
    res.status(500).json({message: error.message})
  }
}

export {sanitizeLocalidadInput, findAll, findOne, add, update, remove}