import type { NextFunction, Request, Response } from "express"
import type { FilterQuery } from "@mikro-orm/core"
import type { EstadoMascota } from "@proyecto/types"
import { orm } from "../shared/db/orm.js"
import { camposFaltantes, esFechaValida, esTextoValido, esUrlValida, parsearId } from "../shared/sanitizacion.js"
import { ESTADOS_MASCOTA, Mascota } from "./mascota.entity.js"

const em = orm.em

/** Campos que se pueden cargar o modificar desde el CRUD. El id y las solicitudes no. */
interface MascotaInput {
  nombre?: string
  fechaDeNac?: string
  tamano?: string
  estado?: EstadoMascota
  fotoURL?: string
  estilo?: string
  raza?: number
  refugio?: number
}


function esEstadoValido(valor: unknown): valor is EstadoMascota{
  return ESTADOS_MASCOTA.some((estado) => estado === valor)
}


// --------- middlewares de sanitizacion ---------

// arma el input solo con los campos permitidos que vinieron; devuelve un string si alguno es invalido
function leerMascota(body: Record<string, unknown>): MascotaInput | string{
  const input: MascotaInput = {}

  if(body.nombre !== undefined){
    if(!esTextoValido(body.nombre)) return 'nombre no puede estar vacio'
    input.nombre = body.nombre.trim()
  }
  if(body.fechaDeNac !== undefined){
    if(!esFechaValida(body.fechaDeNac)) return 'fechaDeNac debe ser una fecha valida con formato YYYY-MM-DD'
    // las dos son YYYY-MM-DD, asi que se pueden comparar como texto
    if(body.fechaDeNac > new Date().toISOString().slice(0, 10)) return 'fechaDeNac no puede ser una fecha futura'
    input.fechaDeNac = body.fechaDeNac
  }
  if(body.tamano !== undefined){
    if(!esTextoValido(body.tamano)) return 'tamano no puede estar vacio'
    input.tamano = body.tamano.trim()
  }
  /*
    Por ahora el estado se puede cargar y cambiar desde el CRUD (validando que sea uno de los posibles).
    Cuando este el CUU de resolucion, los cambios de estado van a pasar por ahi para quedar en la auditoria.
  */
  if(body.estado !== undefined){
    if(!esEstadoValido(body.estado)) return `estado invalido, valores posibles: ${ESTADOS_MASCOTA.join(', ')}`
    input.estado = body.estado
  }
  if(body.fotoURL !== undefined){
    if(!esUrlValida(body.fotoURL)) return 'fotoURL debe ser un link http o https'
    input.fotoURL = body.fotoURL.trim()
  }
  if(body.estilo !== undefined){
    if(!esTextoValido(body.estilo)) return 'estilo no puede estar vacio'
    input.estilo = body.estilo.trim()
  }
  if(body.raza !== undefined){
    const raza = parsearId(body.raza)
    if(!raza) return 'raza debe ser un id valido'
    input.raza = raza
  }
  if(body.refugio !== undefined){
    const refugio = parsearId(body.refugio)
    if(!refugio) return 'refugio debe ser un id valido'
    input.refugio = refugio
  }
  return input
}

function sanitizeMascotaInput(req: Request, res: Response, next: NextFunction){
  const input = leerMascota(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  const faltantes = camposFaltantes(input, ['nombre', 'raza', 'refugio'])
  if(faltantes.length > 0){
    return res.status(400).json({message: `faltan campos obligatorios: ${faltantes.join(', ')}`})
  }
  req.body.sanitizedInput = input
  next()
}

// en la modificacion todos los campos son opcionales: solo se cambia lo que vino
function sanitizeMascotaUpdateInput(req: Request, res: Response, next: NextFunction){
  const input = leerMascota(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  req.body.sanitizedInput = input
  next()
}


// --------- handlers ---------

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
    const mascota = em.create(Mascota, req.body.sanitizedInput)
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
    em.assign(mascota, req.body.sanitizedInput as MascotaInput)
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
export {sanitizeMascotaInput, sanitizeMascotaUpdateInput, findAll, findOne, add, update, remove}
