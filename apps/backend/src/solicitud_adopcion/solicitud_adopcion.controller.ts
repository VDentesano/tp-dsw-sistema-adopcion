import type { NextFunction, Request, Response } from "express"
import type { FilterQuery } from "@mikro-orm/core"
import type {  DecisionSolicitud, EstadoSolicitud, NuevaSolicitudDTO, ResolucionSolicitudDTO, RespuestasFormulario } from "@proyecto/types"
import { orm } from "../shared/db/orm.js"
import { responderError } from "../shared/errores.js"
import { esTextoValido, parsearId } from "../shared/sanitizacion.js"
import { DECISIONES_SOLICITUD , ESTADOS_SOLICITUD, Solicitud_Adopcion } from "./solicitud_adopcion.entity.js"
import { MASCOTA_DISPONIBLE, Mascota } from "../mascota/mascota.entity.js"
import { Usuario } from "../usuario/usuario.entity.js"
import { Pregunta_Formulario } from "../pregunta/pregunta.entity.js"
import { registrarCambioEstado } from "../auditoria_estado/auditoria_estado.service.js"



const em = orm.em

/** Campos que se pueden modificar en un update: la mascota y el usuario quedan fijos. */
interface SolicitudUpdateInput {
  respuestasFormulario?: RespuestasFormulario
}


// --------- helpers de validacion ---------

function esEstadoValido(valor: unknown): valor is EstadoSolicitud{
  return ESTADOS_SOLICITUD.some((estado) => estado === valor)
}

function esDecisionValida(valor: unknown): valor is DecisionSolicitud{
  return DECISIONES_SOLICITUD.some((decision) => decision === valor)
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


function sanitizeResolucionInput(req: Request, res: Response, next: NextFunction){
  const {decision, motivo} = req.body
  const voluntario = parsearId(req.body.voluntario)

  if(!esDecisionValida(decision)){
    return res.status(400).json({message: `decision invalida, valores posibles: ${DECISIONES_SOLICITUD.join(', ')}`})
  }
  if(!voluntario){
    return res.status(400).json({message: 'voluntario es obligatorio y debe ser un id valido'})
  }
  if(motivo !== undefined && !esTextoValido(motivo)){
    return res.status(400).json({message: 'motivo no puede estar vacio'})
  }
  if(decision === 'Rechazada' && motivo === undefined){
    return res.status(400).json({message: 'motivo es obligatorio para rechazar una solicitud'})
  }

  const sanitizedInput: ResolucionSolicitudDTO = {decision, voluntario}
  if(esTextoValido(motivo)){
    sanitizedInput.motivo = motivo.trim()
  }

  req.body.sanitizedInput = sanitizedInput
  next()
}


// en el update solo se cambian las respuestas: la mascota, el usuario y el estado quedan fijos
// (el estado se cambia unicamente por el CUU de resolucion, para que quede en la auditoria)
function sanitizeSolicitudUpdateInput(req: Request, res: Response, next: NextFunction){
  const sanitizedInput: SolicitudUpdateInput = {}


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
    // el voluntario solo ve las solicitudes de las mascotas de su refugio
    const refugio = parsearId(req.query.refugio)

    // mascota y refugio filtran los dos sobre la mascota: van en el mismo objeto para no pisarse
    const filtroMascota = {
      ...(mascota ? {id: mascota} : {}),
      ...(refugio ? {refugio} : {}),
    }

    const filtro: FilterQuery<Solicitud_Adopcion> = {
      ...(estado ? {estado} : {}),
      ...(usuario ? {usuario} : {}),
      ...(mascota || refugio ? {mascota: filtroMascota} : {}),
    }

    const solicitudes = await em.find(Solicitud_Adopcion, filtro, {populate:['mascota','usuario']})
    res.status(200).json({message: 'solicitudes encontradas', data: solicitudes})
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
    const solicitud = await em.findOne(Solicitud_Adopcion, {id}, {populate:['mascota','usuario']})
    if(!solicitud){
      return res.status(404).json({message: 'solicitud no encontrada'})
    }
    res.status(200).json({message: 'solicitud encontrada', data: solicitud})
  }catch(error){
    responderError(res, error)
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

    /*
      RN: hay que responder todas las preguntas obligatorias (y activas) que definio
      el refugio de la mascota. Las respuestas se guardan como {preguntaId: respuesta}.
      Un string vacio no cuenta como respuesta; false o 0 si (son respuestas validas
      de una pregunta booleana o numerica).
    */
    const obligatorias = await em.find(Pregunta_Formulario, {refugio: mascota.refugio, activa: true, obligatoria: true})
    const sinResponder = obligatorias.filter((pregunta) => {
      const respuesta = respuestasFormulario[String(pregunta.id)]
      return respuesta === undefined || (typeof respuesta === 'string' && respuesta.trim() === '')
    })
    if(sinResponder.length > 0){
      return res.status(400).json({
        message: 'faltan responder preguntas obligatorias del refugio',
        data: sinResponder.map((pregunta) => ({id: pregunta.id, texto: pregunta.texto})),
      })
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
    responderError(res, error)
  }
}


async function resolver(req: Request, res: Response){
  try{
    const id = parsearId(req.params.id)
    if(!id){
      return res.status(400).json({message: 'id invalido'})
    }
    const {decision, motivo, voluntario: voluntarioId} = req.body.sanitizedInput as ResolucionSolicitudDTO

    const solicitud = await em.findOne(Solicitud_Adopcion, {id}, {populate: ['mascota', 'usuario']})
    if(!solicitud){
      return res.status(404).json({message: 'solicitud no encontrada'})
    }
    if(solicitud.estado !== 'Pendiente'){
      return res.status(409).json({message: `la solicitud ya fue resuelta (estado actual: ${solicitud.estado})`})
    }

    const voluntario = await em.findOne(Usuario, {id: voluntarioId})
    if(!voluntario){
      return res.status(404).json({message: 'voluntario no encontrado'})
    }
    // RN: solo un voluntario del refugio de la mascota puede resolver sus solicitudes
    if(voluntario.refugio?.id !== solicitud.mascota.refugio.id){
      return res.status(403).json({message: 'el voluntario no pertenece al refugio de la mascota'})
    }
    
      const solicitudResuelta = await em.transactional(async (tem) => {
      const solicitudTx = await tem.findOneOrFail(Solicitud_Adopcion, {id}, {populate: ['mascota']})

      solicitudTx.estado = decision
      if(motivo !== undefined){
        solicitudTx.motivo = motivo
      }

      if(decision === 'Aprobada'){
        // la mascota queda Reservada: tiene dueño pero todavia no fue entregada
        registrarCambioEstado(tem, solicitudTx.mascota, 'Reservada', motivo)

        // RN: al aprobar una, las demas postulaciones a esa mascota se caen solas
        await tem.nativeUpdate(Solicitud_Adopcion,
          {mascota: solicitudTx.mascota, estado: 'Pendiente', id: {$ne: id}},
          {estado: 'Rechazada', motivo: 'se aprobo otra solicitud para esta mascota'})
      }

      return solicitudTx
    })

    res.status(200).json({message: 'solicitud resuelta', data: solicitudResuelta})
  }catch(error){
    responderError(res, error)
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
    responderError(res, error)
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
    responderError(res, error)
  }
}

export {sanitizeSolicitudInput, sanitizeSolicitudUpdateInput, findAll, findOne, add, update, remove, sanitizeResolucionInput, resolver}
