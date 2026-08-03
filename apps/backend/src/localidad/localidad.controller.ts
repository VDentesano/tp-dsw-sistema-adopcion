import type { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Localidad } from "./localidad.entity.js";

const em = orm.em

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
    const localidad = await em.findOneOrFail(Localidad, {id})
    res.status(200).json({message:'found localidad', data: localidad})
  }catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response) {
  try{
    const localidad = em.create(Localidad, req.body)
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
    em.assign(localidad, req.body)
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

export {findAll, findOne, add, update, remove}