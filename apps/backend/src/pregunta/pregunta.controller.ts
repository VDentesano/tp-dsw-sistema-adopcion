import type { NextFunction, Request, Response } from "express"
import type { FilterQuery } from "@mikro-orm/core"
import type { NuevaPreguntaDTO, TipoPregunta } from "@proyecto/types"
import { orm } from "../shared/db/orm.js"
import { Pregunta_Formulario, TIPOS_PREGUNTA } from "./pregunta.entity.js"
import { Refugio } from "../refugio/refugio.entity.js"

const em = orm.em

/** Campos que se pueden "modificar" en un update (regla A: en realidad se crea una pregunta nueva). */
interface PreguntaUpdateInput {
  texto?: string
  tipo?: TipoPregunta
  opciones?: string[]
  obligatoria?: boolean
  orden?: number
}


// --------- helpers de validacion ---------

function esTipoValido(valor: unknown): valor is TipoPregunta{
  return TIPOS_PREGUNTA.some((tipo) => tipo === valor)
}

function esTextoValido(valor: unknown): valor is string{
  return typeof valor === 'string' && valor.trim().length > 0
}

// las opciones de un select: al menos dos, todas strings no vacios
function sonOpcionesValidas(valor: unknown): valor is string[]{
  return Array.isArray(valor)
    && valor.length >= 2
    && valor.every((opcion) => typeof opcion === 'string' && opcion.trim().length > 0)
}

function parsearId(valor: unknown): number | undefined{
  if(typeof valor !== 'string' && typeof valor !== 'number'){
    return undefined
  }
  const id = Number(valor)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

function mensajeDeError(error: unknown): string{
  return error instanceof Error ? error.message : 'error inesperado'
}


// --------- middlewares de sanitizacion ---------

function sanitizePreguntaInput(req: Request, res: Response, next: NextFunction){
  const refugio = parsearId(req.body.refugio)
  if(!refugio){
    return res.status(400).json({message: 'refugio es obligatorio y debe ser un id valido'})
  }
  if(!esTextoValido(req.body.texto)){
    return res.status(400).json({message: 'texto es obligatorio y no puede estar vacio'})
  }
  if(!esTipoValido(req.body.tipo)){
    return res.status(400).json({message: `tipo invalido, valores posibles: ${TIPOS_PREGUNTA.join(', ')}`})
  }
  if(req.body.tipo === 'opcion'){
    if(!sonOpcionesValidas(req.body.opciones)){
      return res.status(400).json({message: 'una pregunta de tipo opcion necesita un array opciones con al menos dos textos no vacios'})
    }
  }else if(req.body.opciones !== undefined){
    return res.status(400).json({message: 'opciones solo aplica a preguntas de tipo opcion'})
  }
  if(req.body.obligatoria !== undefined && typeof req.body.obligatoria !== 'boolean'){
    return res.status(400).json({message: 'obligatoria debe ser booleano'})
  }
  if(req.body.orden !== undefined && parsearId(req.body.orden) === undefined && req.body.orden !== 0){
    return res.status(400).json({message: 'orden debe ser un entero no negativo'})
  }

  const sanitizedInput: NuevaPreguntaDTO = {
    refugio,
    texto: req.body.texto.trim(),
    tipo: req.body.tipo,
    ...(req.body.tipo === 'opcion' ? {opciones: req.body.opciones} : {}),
    obligatoria: req.body.obligatoria ?? false,
    orden: req.body.orden ?? 0,
  }
  req.body.sanitizedInput = sanitizedInput
  next()
}

// en el update todos los campos son opcionales; refugio, activa e id no se tocan
function sanitizePreguntaUpdateInput(req: Request, res: Response, next: NextFunction){
  const sanitizedInput: PreguntaUpdateInput = {}

  if(req.body.texto !== undefined){
    if(!esTextoValido(req.body.texto)){
      return res.status(400).json({message: 'texto no puede estar vacio'})
    }
    sanitizedInput.texto = req.body.texto.trim()
  }
  if(req.body.tipo !== undefined){
    if(!esTipoValido(req.body.tipo)){
      return res.status(400).json({message: `tipo invalido, valores posibles: ${TIPOS_PREGUNTA.join(', ')}`})
    }
    sanitizedInput.tipo = req.body.tipo
  }
  if(req.body.opciones !== undefined){
    if(!sonOpcionesValidas(req.body.opciones)){
      return res.status(400).json({message: 'opciones debe ser un array con al menos dos textos no vacios'})
    }
    sanitizedInput.opciones = req.body.opciones
  }
  if(req.body.obligatoria !== undefined){
    if(typeof req.body.obligatoria !== 'boolean'){
      return res.status(400).json({message: 'obligatoria debe ser booleano'})
    }
    sanitizedInput.obligatoria = req.body.obligatoria
  }
  if(req.body.orden !== undefined){
    if(parsearId(req.body.orden) === undefined && req.body.orden !== 0){
      return res.status(400).json({message: 'orden debe ser un entero no negativo'})
    }
    sanitizedInput.orden = req.body.orden
  }

  req.body.sanitizedInput = sanitizedInput
  next()
}


// --------- handlers ---------

// filtros: ?refugio=1&activa=true  (el formulario de postulacion pide las activas de un refugio)
async function findAll(req: Request, res: Response){
  try{
    const refugio = parsearId(req.query.refugio)

    let activa: boolean | undefined
    if(req.query.activa !== undefined){
      if(req.query.activa !== 'true' && req.query.activa !== 'false'){
        return res.status(400).json({message: 'activa debe ser true o false'})
      }
      activa = req.query.activa === 'true'
    }

    const filtro: FilterQuery<Pregunta_Formulario> = {
      ...(refugio ? {refugio} : {}),
      ...(activa !== undefined ? {activa} : {}),
    }

    const preguntas = await em.find(Pregunta_Formulario, filtro, {orderBy: {orden: 'asc', id: 'asc'}})
    res.status(200).json({message: 'preguntas encontradas', data: preguntas})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

async function findOne(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const pregunta = await em.findOne(Pregunta_Formulario, {id})
    if(!pregunta){
      return res.status(404).json({message: 'pregunta no encontrada'})
    }
    res.status(200).json({message: 'pregunta encontrada', data: pregunta})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

async function add(req: Request, res: Response){
  try{
    const {refugio: refugioId, ...datos} = req.body.sanitizedInput as NuevaPreguntaDTO

    const refugio = await em.findOne(Refugio, {id: refugioId})
    if(!refugio){
      return res.status(404).json({message: 'refugio no encontrado'})
    }

    const pregunta = em.create(Pregunta_Formulario, {...datos, refugio})
    await em.flush()
    res.status(201).json({message: 'pregunta creada', data: pregunta})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

/*
  RN (regla A): las preguntas son inmutables. "Editar" desactiva la vieja y crea una
  nueva con los campos que cambiaron; asi las solicitudes viejas siguen apuntando al
  texto exacto que respondio cada adoptante. La respuesta devuelve la pregunta nueva.
*/
async function update(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const vieja = await em.findOne(Pregunta_Formulario, {id})
    if(!vieja){
      return res.status(404).json({message: 'pregunta no encontrada'})
    }
    if(!vieja.activa){
      return res.status(409).json({message: 'no se puede editar una pregunta inactiva'})
    }

    const cambios = req.body.sanitizedInput as PreguntaUpdateInput

    // la pregunta nueva hereda lo que no se haya cambiado
    const tipo = cambios.tipo ?? vieja.tipo
    const opciones = cambios.opciones ?? vieja.opciones
    if(tipo === 'opcion' && !opciones){
      return res.status(400).json({message: 'una pregunta de tipo opcion necesita opciones'})
    }

    vieja.activa = false
    const nueva = em.create(Pregunta_Formulario, {
      texto: cambios.texto ?? vieja.texto,
      tipo,
      // si dejo de ser de tipo opcion, las opciones no se arrastran
      ...(tipo === 'opcion' && opciones ? {opciones} : {}),
      obligatoria: cambios.obligatoria ?? vieja.obligatoria,
      orden: cambios.orden ?? vieja.orden,
      refugio: vieja.refugio,
    })
    await em.flush()
    res.status(200).json({message: 'pregunta reemplazada: se desactivo la anterior y se creo una nueva', data: nueva})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

// soft delete: la pregunta queda inactiva pero sigue existiendo para las solicitudes viejas
async function remove(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const pregunta = await em.findOne(Pregunta_Formulario, {id})
    if(!pregunta){
      return res.status(404).json({message: 'pregunta no encontrada'})
    }
    if(!pregunta.activa){
      return res.status(409).json({message: 'la pregunta ya estaba inactiva'})
    }
    pregunta.activa = false
    await em.flush()
    res.status(200).json({message: 'pregunta desactivada (soft delete)', data: pregunta})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

export {sanitizePreguntaInput, sanitizePreguntaUpdateInput, findAll, findOne, add, update, remove}
