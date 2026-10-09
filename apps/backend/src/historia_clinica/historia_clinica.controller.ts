import type { NextFunction, Request, Response } from "express"
import type { FilterQuery } from "@mikro-orm/core"
import { orm } from "../shared/db/orm.js"
import { responderError } from "../shared/errores.js"
import { camposFaltantes, esFechaFutura, esFechaValida, parsearId } from "../shared/sanitizacion.js"
import { Historia_Clinica } from "./historia_clinica.entity.js"

const em = orm.em

/** Campos que se pueden cargar o modificar desde el CRUD. */
interface HistoriaClinicaInput {
  fechaAplicacion?: string
  proximoRefuerzo?: string | null  // null borra el refuerzo
  mascota?: number
  vacuna?: number
}

const MENSAJE_REFUERZO = 'proximoRefuerzo tiene que ser posterior a fechaAplicacion'

// las dos son YYYY-MM-DD, asi que se pueden comparar como texto.
// sin refuerzo es valido: en la base queda null, en un input que no lo trae es undefined
function refuerzoEsPosterior(fechaAplicacion: string, proximoRefuerzo: string | null | undefined): boolean{
  return proximoRefuerzo == null || proximoRefuerzo > fechaAplicacion
}


// --------- middlewares de sanitizacion ---------

// arma el input solo con los campos permitidos que vinieron; devuelve un string si alguno es invalido
function leerHistoriaClinica(body: Record<string, unknown>): HistoriaClinicaInput | string{
  const input: HistoriaClinicaInput = {}

  if(body.fechaAplicacion !== undefined){
    if(!esFechaValida(body.fechaAplicacion)) return 'fechaAplicacion debe ser una fecha valida con formato YYYY-MM-DD'
    if(esFechaFutura(body.fechaAplicacion)) return 'fechaAplicacion no puede ser una fecha futura'
    input.fechaAplicacion = body.fechaAplicacion
  }
  if(body.proximoRefuerzo !== undefined){
    if(body.proximoRefuerzo !== null && !esFechaValida(body.proximoRefuerzo)) return 'proximoRefuerzo debe ser una fecha valida con formato YYYY-MM-DD, o null para borrarlo'
    input.proximoRefuerzo = body.proximoRefuerzo
  }
  if(body.mascota !== undefined){
    const mascota = parsearId(body.mascota)
    if(!mascota) return 'mascota debe ser un id valido'
    input.mascota = mascota
  }
  if(body.vacuna !== undefined){
    const vacuna = parsearId(body.vacuna)
    if(!vacuna) return 'vacuna debe ser un id valido'
    input.vacuna = vacuna
  }
  return input
}

function sanitizeHistoriaClinicaInput(req: Request, res: Response, next: NextFunction){
  const input = leerHistoriaClinica(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  const faltantes = camposFaltantes(input, ['fechaAplicacion', 'mascota', 'vacuna'])
  if(faltantes.length > 0){
    return res.status(400).json({message: `faltan campos obligatorios: ${faltantes.join(', ')}`})
  }
  if(!refuerzoEsPosterior(input.fechaAplicacion!, input.proximoRefuerzo)){
    return res.status(400).json({message: MENSAJE_REFUERZO})
  }
  req.body.sanitizedInput = input
  next()
}

// en la modificacion todos los campos son opcionales: solo se cambia lo que vino
function sanitizeHistoriaClinicaUpdateInput(req: Request, res: Response, next: NextFunction){
  const input = leerHistoriaClinica(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  req.body.sanitizedInput = input
  next()
}


// --------- handlers ---------

// filtro: ?mascota=1  (la historia clinica de una mascota, de la vacuna mas reciente a la mas vieja)
async function findAll(req: Request, res: Response){
  try{
    const mascota = parsearId(req.query.mascota)
    const filtro: FilterQuery<Historia_Clinica> = mascota ? {mascota} : {}

    const historias = await em.find(Historia_Clinica, filtro, {
      populate: ['vacuna'],
      orderBy: {fechaAplicacion: 'desc'},
    })
    res.status(200).json({message: 'historias clinicas encontradas', data: historias})
  }catch(error){
    responderError(res, error)
  }
}

async function findOne(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const historia = await em.findOne(Historia_Clinica, {id}, {populate: ['vacuna']})
    if(!historia){
      return res.status(404).json({message: 'historia clinica no encontrada'})
    }
    res.status(200).json({message: 'historia clinica encontrada', data: historia})
  }catch(error){
    responderError(res, error)
  }
}

async function add(req: Request, res: Response){
  try{
    const historia = em.create(Historia_Clinica, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message: 'historia clinica creada', data: historia})
  }catch(error){
    responderError(res, error)
  }
}

async function update(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const historia = await em.findOne(Historia_Clinica, {id})
    if(!historia){
      return res.status(404).json({message: 'historia clinica no encontrada'})
    }
    const cambios = req.body.sanitizedInput as HistoriaClinicaInput

    // puede venir una sola de las dos fechas: se compara contra la que ya estaba guardada
    const fechaAplicacion = cambios.fechaAplicacion ?? historia.fechaAplicacion
    const proximoRefuerzo = cambios.proximoRefuerzo !== undefined ? cambios.proximoRefuerzo : historia.proximoRefuerzo
    if(!refuerzoEsPosterior(fechaAplicacion, proximoRefuerzo)){
      return res.status(400).json({message: MENSAJE_REFUERZO})
    }

    em.assign(historia, cambios)
    await em.flush()
    res.status(200).json({message: 'historia clinica modificada', data: historia})
  }catch(error){
    responderError(res, error)
  }
}

async function remove(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const historia = await em.findOne(Historia_Clinica, {id})
    if(!historia){
      return res.status(404).json({message: 'historia clinica no encontrada'})
    }
    await em.remove(historia).flush()
    res.status(200).json({message: 'historia clinica eliminada', data: historia})
  }catch(error){
    responderError(res, error)
  }
}

export {sanitizeHistoriaClinicaInput, sanitizeHistoriaClinicaUpdateInput, findAll, findOne, add, update, remove}
