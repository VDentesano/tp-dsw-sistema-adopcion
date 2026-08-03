import type { Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { Refugio } from "./refugio.entity.js"

const em = orm.em


async function findAll(req: Request, res: Response){
  try{
    const refugios = await em.find(Refugio,{}, {populate: ['localidad']})
    res.status(200).json({message: 'find all refugios', data:refugios})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}


async function findOne(req: Request, res: Response){
  const id=Number(req.params.id)
  try{
    const refugio= await em.findOne(Refugio,{id})
    if(!refugio){
      return res.status(404).json({message: 'not found refugio'})
    }
    res.status(200).json({message: 'found refugio', data: refugio})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}

async function add(req: Request, res: Response){
  try{
    const refugio = em.create(Refugio, req.body)
    await em.flush()
    res.status(201).json({message: 'refugio created', data: refugio})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function update(req: Request, res: Response){
    try{
    const id = Number(req.params.id);
    const refugio = await em.findOne(Refugio,{id})
    if(!refugio){
      return res.status(404).json({message: 'not found refugio'})
    }
    em.assign(refugio,req.body)
    await em.flush()
    res.status(200).json({message: 'refugio correctly modified', data: refugio})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function remove(req: Request, res: Response){
  try{
    const id = Number(req.params.id);
    const refugio = await em.findOne(Refugio,id)
    if(!refugio){
      return res.status(404).json({message: 'not found refugio'})
    }
    em.remove(refugio)
    await em.flush()
    res.status(200).json({message: 'refugio deleted', data: refugio})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}
export {findAll, findOne, add, update, remove}