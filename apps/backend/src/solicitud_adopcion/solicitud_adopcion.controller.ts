import type { NextFunction, Request, Response } from "express"
import type { FilterQuery } from "@mikro-orm/core"
import type { EstadoSolicitud, NuevaSolicitudDTO, RespuestasFormulario } from "@proyecto/types"
import { orm } from "../shared/db/orm.js"
import { ESTADOS_SOLICITUD, Solicitud_Adopcion } from "./solicitud_adopcion.entity.js"
import { MASCOTA_DISPONIBLE, Mascota } from "../mascota/mascota.entity.js"
import { Usuario } from "../usuario/usuario.entity.js"



const em = orm.em

/** Campos que se pueden modificar en un update: la mascota y el usuario quedan fijos. */
interface SolicitudUpdateInput {
  estado?: EstadoSolicitud
  respuestasFormulario?: RespuestasFormulario
}


// --------- helpers de validacion ---------

function esEstadoValido(valor: unknown): valor is EstadoSolicitud{
  return ESTADOS_SOLICITUD.some((estado) => estado === valor)
}

// el formulario dinamico es un objeto plano {pregunta: respuesta} con valores primitivos
function esFormularioValido(valor: unknown): valor is RespuestasFormulario{
  if(typeof valor !== 'object' || valor === null || Array.isArray(valor)){
    return false
  }
  return Object.values(valor).every((respuesta) =>
    typeof respuesta === 'string' || typeof respuesta === 'number' || typeof respuesta === 'boolean'
  )
}

// devuelve el id como entero positivo, o undefined si no es un id valido
function parsearId(valor: unknown): number | undefined{
  if(typeof valor !== 'string' && typeof valor !== 'number'){
    return undefined
  }
  const id = Number(valor)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

// en un catch el error es unknown: solo podemos leer .message si realmente es un Error, esto habria que aplicarlo en los demas controladores tambien
function mensajeDeError(error: unknown): string{
  return error instanceof Error ? error.message : 'error inesperado'
}


// --------- middlewares de sanitizacion ---------

/*
  RN: El adoptante solo puede elegir a que mascota se postula y que responde.
      fechaSolicitud y estado los pone el servidor: si los tomaramos de req.body
      cualquiera podria mandar {"estado": "Aprobada"} y auto aprobarse la adopcion.
*/
function sanitizeSolicitudInput(req: Request, res: Response, next: NextFunction){
  const mascota = parsearId(req.body.mascota)
  const usuario = parsearId(req.body.usuario)
  const respuestasFormulario = req.body.respuestasFormulario

  if(!mascota || !usuario){
    return res.status(400).json({message: 'mascota y usuario son obligatorios y deben ser ids validos'})
  }
  if(!esFormularioValido(respuestasFormulario)){
    return res.status(400).json({message: 'respuestasFormulario debe ser un objeto con valores de texto, numero o booleano'})
  }

  const sanitizedInput: NuevaSolicitudDTO = {mascota, usuario, respuestasFormulario}
  req.body.sanitizedInput = sanitizedInput
  next()
}

// en el update no se puede reapuntar la solicitud a otra mascota u otro usuario
function sanitizeSolicitudUpdateInput(req: Request, res: Response, next: NextFunction){
  const sanitizedInput: SolicitudUpdateInput = {}

  if(req.body.estado !== undefined){
    if(!esEstadoValido(req.body.estado)){
      return res.status(400).json({message: `estado invalido, valores posibles: ${ESTADOS_SOLICITUD.join(', ')}`})
    }
    sanitizedInput.estado = req.body.estado
  }
  if(req.body.respuestasFormulario !== undefined){
    if(!esFormularioValido(req.body.respuestasFormulario)){
      return res.status(400).json({message: 'respuestasFormulario debe ser un objeto con valores de texto, numero o booleano'})
    }
    sanitizedInput.respuestasFormulario = req.body.respuestasFormulario
  }

  req.body.sanitizedInput = sanitizedInput
  next()
}


// --------- handlers ---------


// estado es case sensitive, por ejemplo Pendiente, no esta manejado el caso de mandar otra cosa que no sea id en mascota o usuario
async function findAll(req: Request, res: Response){
  try{
    const estado = req.query.estado
    if(estado !== undefined && !esEstadoValido(estado)){
      return res.status(400).json({message: `estado invalido, valores posibles: ${ESTADOS_SOLICITUD.join(', ')}`})
    }
    const usuario = parsearId(req.query.usuario)
    const mascota = parsearId(req.query.mascota)

    const filtro: FilterQuery<Solicitud_Adopcion> = {
      ...(estado ? {estado} : {}),
      ...(usuario ? {usuario} : {}),
      ...(mascota ? {mascota} : {}),
    }

    const solicitudes = await em.find(Solicitud_Adopcion, filtro, {populate:['mascota','usuario']})
    res.status(200).json({message: 'solicitudes encontradas', data: solicitudes})
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
    const solicitud = await em.findOne(Solicitud_Adopcion, {id}, {populate:['mascota','usuario']})
    if(!solicitud){
      return res.status(404).json({message: 'solicitud no encontrada'})
    }
    res.status(200).json({message: 'solicitud encontrada', data: solicitud})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

// CUU: el usuario se postula a adoptar una mascota
async function add(req: Request, res: Response){
  try{
    const {mascota: mascotaId, usuario: usuarioId, respuestasFormulario} = req.body.sanitizedInput as NuevaSolicitudDTO

    const mascota = await em.findOne(Mascota, {id: mascotaId})
    if(!mascota){
      return res.status(404).json({message: 'mascota no encontrada'})
    }
    if(mascota.estado !== MASCOTA_DISPONIBLE){
      return res.status(409).json({message: `la mascota no esta disponible para adopcion (estado actual: ${mascota.estado})`})
    }

    const usuario = await em.findOne(Usuario, {id: usuarioId})
    if(!usuario){
      return res.status(404).json({message: 'usuario no encontrado'})
    }

    // un mismo usuario no puede tener dos postulaciones abiertas para la misma mascota
    const pendiente = await em.findOne(Solicitud_Adopcion, {mascota, usuario, estado: 'Pendiente'})
    if(pendiente){
      return res.status(409).json({message: 'ya existe una solicitud pendiente de este usuario para esta mascota', data: pendiente})
    }

    const solicitud = em.create(Solicitud_Adopcion, {mascota, usuario, respuestasFormulario})
    await em.flush()
    res.status(201).json({message: 'solicitud creada', data: solicitud})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

/*
  Update generico del CRUD. La resolucion de la solicitud (aprobar/rechazar, que ademas
  cambia el estado de la mascota y registra la auditoria) va aparte, en el CUU de resolucion.
*/
async function update(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const solicitud = await em.findOne(Solicitud_Adopcion, {id})
    if(!solicitud){
      return res.status(404).json({message: 'solicitud no encontrada'})
    }
    em.assign(solicitud, req.body.sanitizedInput as SolicitudUpdateInput)
    await em.flush()
    res.status(200).json({message: 'solicitud modificada correctamente', data: solicitud})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

async function remove(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const solicitud = await em.findOne(Solicitud_Adopcion, {id})
    if(!solicitud){
      return res.status(404).json({message: 'solicitud no encontrada'})
    }
    em.remove(solicitud)
    await em.flush()
    res.status(200).json({message: 'solicitud eliminada', data: solicitud})
  }catch(error){
    res.status(500).json({message: mensajeDeError(error)})
  }
}

export {sanitizeSolicitudInput, sanitizeSolicitudUpdateInput, findAll, findOne, add, update, remove}
