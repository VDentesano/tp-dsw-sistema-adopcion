import type { Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { Mascota } from "./mascota.entity.js"

const em = orm.em


async function findAll(req: Request, res: Response){
  try{
    const mascotas = await em.find(Mascota,{}, {populate: ['refugio']})
    res.status(200).json({message: 'find all mascotas', data:mascotas})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}


async function findOne(req: Request, res: Response){
  const id=Number(req.params.id)
  try{
    const mascota= await em.findOne(Mascota,{id})
    if(!mascota){
      return res.status(404).json({message: 'not found mascota'})
    }
    res.status(200).json({message: 'found mascota', data: mascota})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response){
  try{
    const mascota = em.create(Mascota, req.body)
    await em.flush()
    res.status(201).json({message: 'mascota created', data: mascota})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function update(req: Request, res: Response){
    try{
    const id = Number(req.params.id);
    const mascota = await em.findOne(Mascota,{id})
    if(!mascota){
      return res.status(404).json({message: 'not found mascota'})
    }
    em.assign(mascota,req.body)
    await em.flush()
    res.status(200).json({message: 'mascota correctly modified', data: mascota})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function remove(req: Request, res: Response){
  try{
    const id = Number(req.params.id);
    const mascota = await em.findOne(Mascota,{id})
    if(!mascota){
      return res.status(404).json({message: 'not found mascota'})
    }
    em.remove(mascota)
    await em.flush()
    res.status(200).json({message: 'mascota deleted', data: mascota})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}
export {findAll, findOne, add, update, remove}