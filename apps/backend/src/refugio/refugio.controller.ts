import type { NextFunction, Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { camposFaltantes, esEmailValido, esTextoValido, parsearId } from "../shared/sanitizacion.js"
import { Refugio } from "./refugio.entity.js"

const em = orm.em

/** Campos que se pueden cargar o modificar desde el CRUD. Usuarios, mascotas y preguntas se manejan desde sus propios CRUD. */
interface RefugioInput {
  nombre?: string
  direccion?: string
  telefono?: string
  email?: string
  localidad?: number
}


// --------- middlewares de sanitizacion ---------

// arma el input solo con los campos permitidos que vinieron; devuelve un string si alguno es invalido
function leerRefugio(body: Record<string, unknown>): RefugioInput | string{
  const input: RefugioInput = {}

  if(body.nombre !== undefined){
    if(!esTextoValido(body.nombre)) return 'nombre no puede estar vacio'
    input.nombre = body.nombre.trim()
  }
  if(body.direccion !== undefined){
    if(!esTextoValido(body.direccion)) return 'direccion no puede estar vacia'
    input.direccion = body.direccion.trim()
  }
  if(body.telefono !== undefined){
    if(!esTextoValido(body.telefono)) return 'telefono no puede estar vacio'
    input.telefono = body.telefono.trim()
  }
  if(body.email !== undefined){
    if(!esEmailValido(body.email)) return 'email invalido'
    input.email = body.email.trim().toLowerCase()
  }
  if(body.localidad !== undefined){
    const localidad = parsearId(body.localidad)
    if(!localidad) return 'localidad debe ser un id valido'
    input.localidad = localidad
  }
  return input
}

function sanitizeRefugioInput(req: Request, res: Response, next: NextFunction){
  const input = leerRefugio(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  const faltantes = camposFaltantes(input, ['nombre', 'direccion', 'telefono', 'email', 'localidad'])
  if(faltantes.length > 0){
    return res.status(400).json({message: `faltan campos obligatorios: ${faltantes.join(', ')}`})
  }
  req.body.sanitizedInput = input
  next()
}

// en la modificacion todos los campos son opcionales: solo se cambia lo que vino
function sanitizeRefugioUpdateInput(req: Request, res: Response, next: NextFunction){
  const input = leerRefugio(req.body)
  if(typeof input === 'string'){
    return res.status(400).json({message: input})
  }
  req.body.sanitizedInput = input
  next()
}


// --------- handlers ---------


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
    const refugio = em.create(Refugio, req.body.sanitizedInput)
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
    em.assign(refugio, req.body.sanitizedInput as RefugioInput)
    await em.flush()
    res.status(200).json({message: 'refugio correctly modified', data: refugio})
  } catch(error: any){
    res.status(500).json({message: error.message})
  }
}

async function remove(req: Request, res: Response){
  try{
    const id = Number(req.params.id);
    const refugio = await em.findOne(Refugio,{id})
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
export {sanitizeRefugioInput, sanitizeRefugioUpdateInput, findAll, findOne, add, update, remove}