import type { Request, Response } from "express"
import type { FilterQuery } from "@mikro-orm/core"
import type { EstadoMascota } from "@proyecto/types"
import { orm } from "../shared/db/orm.js"
import { ESTADOS_MASCOTA, Mascota } from "./mascota.entity.js"

const em = orm.em


function esEstadoValido(valor: unknown): valor is EstadoMascota{
  return ESTADOS_MASCOTA.some((estado) => estado === valor)
}

// el catalogo pide raza -> especie y el refugio para mostrar la ficha completa
const POPULATE_MASCOTA = ['raza.especie', 'refugio'] as const


// filtros: ?estado=Disponible&tamano=Mediano  (el catalogo publico siempre manda estado=Disponible)
async function findAll(req: Request, res: Response){
  try{
    const estado = req.query.estado
    if(estado !== undefined && !esEstadoValido(estado)){
      return res.status(400).json({message: `estado invalido, valores posibles: ${ESTADOS_MASCOTA.join(', ')}`})
    }
    const tamano = typeof req.query.tamano === 'string' && req.query.tamano.trim() !== ''
      ? req.query.tamano
      : undefined

    const filtro: FilterQuery<Mascota> = {
      ...(estado ? {estado} : {}),
      ...(tamano ? {tamano} : {}),
    }

    const mascotas = await em.find(Mascota, filtro, {populate: POPULATE_MASCOTA})
    res.status(200).json({message: 'find all mascotas', data: mascotas})
  } catch(error:any){
    res.status(500).json({message: error.message})
  }
}


async function findOne(req: Request, res: Response){
  const id=Number(req.params.id)
  try{
    const mascota= await em.findOne(Mascota,{id}, {populate: POPULATE_MASCOTA})
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
    if(req.body.estado !== undefined && !esEstadoValido(req.body.estado)){
      return res.status(400).json({message: `estado invalido, valores posibles: ${ESTADOS_MASCOTA.join(', ')}`})
    }
    const mascota = em.create(Mascota, req.body)
    await em.flush()
    res.status(201).json({message: 'mascota created', data: mascota})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function update(req: Request, res: Response){
    try{
    if(req.body.estado !== undefined && !esEstadoValido(req.body.estado)){
      return res.status(400).json({message: `estado invalido, valores posibles: ${ESTADOS_MASCOTA.join(', ')}`})
    }
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
