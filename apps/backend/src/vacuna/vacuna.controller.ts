import type { NextFunction, Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { responderError } from "../shared/errores.js"
import { camposFaltantes, esTextoValido, parsearId } from "../shared/sanitizacion.js"
import { Vacuna } from "./vacuna.entity.js"

const em = orm.em

/** Campos que se pueden cargar o modificar desde el CRUD. */
interface VacunaInput {
  nombre?: string
  esObligatoria?: boolean
}


// --------- middlewares de sanitizacion ---------

// arma el input solo con los campos permitidos que vinieron; devuelve un string si alguno es invalido
function leerVacuna(body: Record<string, unknown>): VacunaInput | string{
  const input: VacunaInput = {}

  if(body.nombre !== undefined){
    if(!esTextoValido(body.nombre)) return 'nombre no puede estar vacio'
    input.nombre = body.nombre.trim()
  }
  if(body.esObligatoria !== undefined){
    if(typeof body.esObligatoria !== 'boolean') return 'esObligatoria debe ser booleano'
    input.esObligatoria = body.esObligatoria
  }
  return input
}

function sanitizeVacunaInput(req: Request, res: Response, next: NextFunction){
  const input = leerVacuna(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  const faltantes = camposFaltantes(input, ['nombre'])
  if(faltantes.length > 0){
    return res.status(400).json({message: `faltan campos obligatorios: ${faltantes.join(', ')}`})
  }
  req.body.sanitizedInput = {esObligatoria: false, ...input}
  next()
}

// en la modificacion todos los campos son opcionales: solo se cambia lo que vino
function sanitizeVacunaUpdateInput(req: Request, res: Response, next: NextFunction){
  const input = leerVacuna(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  req.body.sanitizedInput = input
  next()
}


// --------- handlers ---------

async function findAll(req: Request, res: Response){
  try{
    const vacunas = await em.find(Vacuna, {}, {orderBy: {nombre: 'asc'}})
    res.status(200).json({message: 'vacunas encontradas', data: vacunas})
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
    const vacuna = await em.findOne(Vacuna, {id})
    if(!vacuna){
      return res.status(404).json({message: 'vacuna no encontrada'})
    }
    res.status(200).json({message: 'vacuna encontrada', data: vacuna})
  }catch(error){
    responderError(res, error)
  }
}

async function add(req: Request, res: Response){
  try{
    const vacuna = em.create(Vacuna, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message: 'vacuna creada', data: vacuna})
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
    const vacuna = await em.findOne(Vacuna, {id})
    if(!vacuna){
      return res.status(404).json({message: 'vacuna no encontrada'})
    }
    em.assign(vacuna, req.body.sanitizedInput as VacunaInput)
    await em.flush()
    res.status(200).json({message: 'vacuna modificada', data: vacuna})
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
    const vacuna = await em.findOne(Vacuna, {id})
    if(!vacuna){
      return res.status(404).json({message: 'vacuna no encontrada'})
    }
    await em.remove(vacuna).flush()
    res.status(200).json({message: 'vacuna eliminada', data: vacuna})
  }catch(error){
    responderError(res, error)
  }
}

export {sanitizeVacunaInput, sanitizeVacunaUpdateInput, findAll, findOne, add, update, remove}
