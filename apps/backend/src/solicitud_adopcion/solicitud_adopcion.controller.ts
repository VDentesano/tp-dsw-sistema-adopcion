import type { Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { Solicitud_Adopcion } from "./solicitud_adopcion.entity.js"



const em = orm.em


async function findAll(req: Request, res: Response){
  try{
    const solicitudes= await em.find(Solicitud_Adopcion,{},{populate:['mascota']})
    res.status(200).json({message: 'find all solicitudes', data:solicitudes})
  }catch(error:any){
    res.status(500).json({message: error.message})
  }

}

async function findOne(req: Request, res: Response){
  
}
async function add(req: Request, res: Response){
  
}
async function update(req: Request, res: Response){
  
}
async function remove(req: Request, res: Response){
  
}

export {findAll, findOne, add, update, remove}