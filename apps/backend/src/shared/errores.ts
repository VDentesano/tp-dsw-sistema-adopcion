import type { NextFunction, Request, Response } from "express"
import { ForeignKeyConstraintViolationException, UniqueConstraintViolationException } from "@mikro-orm/core"

// codigos de error de MySQL para una foreign key
const MYSQL_FILA_REFERENCIADA = 1451  // se quiere borrar algo que otros registros apuntan
const MYSQL_REFERENCIA_INEXISTENTE = 1452  // se quiere guardar un id de otra tabla que no existe

/*
  Todos los catch de los controllers terminan aca, asi los errores responden siempre igual: {message}.
  - Si el error es culpa del request (un valor repetido, una referencia que no existe, borrar algo
    que se esta usando) responde 4xx con un mensaje que explica que paso.
  - Cualquier otro error es un problema nuestro: responde 500 con un mensaje generico y el detalle
    queda en la consola del backend. No se lo mandamos al cliente porque trae el SQL y nombres de tablas.
*/
export function responderError(res: Response, error: unknown){
  if(error instanceof UniqueConstraintViolationException){
    // sqlMessage: Duplicate entry 'Voluntario' for key 'rol.rol_nombre_unique'
    const valor = error.sqlMessage?.match(/Duplicate entry '(.*)' for key/)?.[1]
    return res.status(409).json({message: valor ? `ya existe un registro con el valor '${valor}'` : 'ya existe un registro con esos datos'})
  }

  if(error instanceof ForeignKeyConstraintViolationException){
    if(error.errno === MYSQL_FILA_REFERENCIADA){
      // sqlMessage: Cannot delete or update a parent row: a foreign key constraint fails (`refugio`.`raza`, ...
      const tabla = error.sqlMessage?.match(/fails \(`[^`]+`\.`([^`]+)`/)?.[1]
      return res.status(409).json({message: tabla ? `no se puede eliminar porque hay registros de ${tabla} asociados` : 'no se puede eliminar porque tiene registros asociados'})
    }
    if(error.errno === MYSQL_REFERENCIA_INEXISTENTE){
      // sqlMessage: ... FOREIGN KEY (`especie_id`) REFERENCES `especie` (`id`))
      const tabla = error.sqlMessage?.match(/REFERENCES `([^`]+)`/)?.[1]
      return res.status(400).json({message: tabla ? `el id indicado para ${tabla} no existe` : 'alguno de los ids indicados no existe'})
    }
  }

  console.error(error)
  return res.status(500).json({message: 'error interno del servidor'})
}

// errores que arma Express al leer el body (JSON mal formado, body demasiado grande): traen su propio status
function esErrorDelBody(error: unknown): error is {status: number, type?: string, message: string}{
  return typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
}

/*
  Middleware de errores: va al final de app.ts. Express 5 manda aca cualquier error que no se haya
  atrapado en un handler, y tambien los errores de express.json(). Sin esto Express responde una
  pagina HTML con el stack trace.
  Tiene que declarar los 4 parametros: asi es como Express reconoce que es un manejador de errores.
*/
export function manejadorDeErrores(error: unknown, req: Request, res: Response, next: NextFunction){
  if(res.headersSent){
    return next(error)
  }
  if(esErrorDelBody(error) && error.status < 500){
    const message = error.type === 'entity.parse.failed' ? 'el body no es un JSON valido' : error.message
    return res.status(error.status).json({message})
  }
  responderError(res, error)
}
