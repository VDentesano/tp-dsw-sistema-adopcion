import type { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { responderError } from "../shared/errores.js";
import { camposFaltantes, esEmailValido, esTextoValido, parsearId } from "../shared/sanitizacion.js";
import { Usuario } from "./usuario.entity.js";

const em = orm.em;

/** Campos que se pueden cargar o modificar desde el CRUD. El id y las solicitudes no. */
interface UsuarioInput {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  telefono?: string;
  rol?: number;
  refugio?: number | null; // null = el usuario no pertenece a ningun refugio (adoptante)
}


// --------- middlewares de sanitizacion ---------

// arma el input solo con los campos permitidos que vinieron; devuelve un string si alguno es invalido
function leerUsuario(body: Record<string, unknown>): UsuarioInput | string {
  const input: UsuarioInput = {};

  if (body.nombre !== undefined) {
    if (!esTextoValido(body.nombre)) return 'nombre no puede estar vacio';
    input.nombre = body.nombre.trim();
  }
  if (body.apellido !== undefined) {
    if (!esTextoValido(body.apellido)) return 'apellido no puede estar vacio';
    input.apellido = body.apellido.trim();
  }
  if (body.email !== undefined) {
    if (!esEmailValido(body.email)) return 'email invalido';
    input.email = body.email.trim().toLowerCase();
  }
  if (body.password !== undefined) {
    // la contraseña no se recorta: un espacio al principio o al final es parte de ella
    if (typeof body.password !== 'string' || body.password.length === 0) return 'password no puede estar vacia';
    input.password = body.password;
  }
  if (body.telefono !== undefined) {
    if (!esTextoValido(body.telefono)) return 'telefono no puede estar vacio';
    input.telefono = body.telefono.trim();
  }
  if (body.rol !== undefined) {
    const rol = parsearId(body.rol);
    if (!rol) return 'rol debe ser un id valido';
    input.rol = rol;
  }
  if (body.refugio !== undefined) {
    if (body.refugio === null) {
      input.refugio = null;
    } else {
      const refugio = parsearId(body.refugio);
      if (!refugio) return 'refugio debe ser un id valido o null';
      input.refugio = refugio;
    }
  }
  return input;
}

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  const input = leerUsuario(req.body);
  if (typeof input === 'string') {
    return res.status(400).json({ message: input });
  }
  const faltantes = camposFaltantes(input, ['nombre', 'apellido', 'email', 'password', 'telefono', 'rol']);
  if (faltantes.length > 0) {
    return res.status(400).json({ message: `faltan campos obligatorios: ${faltantes.join(', ')}` });
  }
  req.body.sanitizedInput = input;
  next();
}

// en la modificacion todos los campos son opcionales: solo se cambia lo que vino
function sanitizeUsuarioUpdateInput(req: Request, res: Response, next: NextFunction) {
  const input = leerUsuario(req.body);
  if (typeof input === 'string') {
    return res.status(400).json({ message: input });
  }
  req.body.sanitizedInput = input;
  next();
}


// --------- handlers ---------

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find( Usuario, {}, {populate: ['rol', 'refugio'] });
    res.status(200).json({ message: 'Usuarios encontrados', data: usuarios });
  } catch (error) {
    responderError(res, error);
  }
}


async function findOne(req: Request, res: Response) {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'id invalido' });
    }
    // findOne devuelve null si no existe; findOneOrFail en cambio tira una excepcion y terminaba en el catch con 500
    const usuario = await em.findOne(Usuario, { id }, {populate: ['rol', 'refugio']});
    if (!usuario) {
      return res.status(404).json({message: "Usuario no encontrado",});
    }
    res.status(200).json({message: "Usuario encontrado", data: usuario,});
  } catch (error) {
    responderError(res, error);
  }
}


async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Usuario agregado', data: usuario });
  } catch (error) {
    responderError(res, error);
  }
}


async function update(req: Request, res: Response) {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'id invalido' });
    }
    const usuario = await em.findOne(Usuario, { id });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    em.assign(usuario, req.body.sanitizedInput as UsuarioInput);
    await em.flush();
    res.status(200).json({ message: 'Usuario actualizado', data: usuario });
  } catch (error) {
    responderError(res, error);
  }
}


async function remove(req: Request, res: Response) {
  try {
    const id = parsearId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'id invalido' });
    }
    // getReference no va a la base: armaba una referencia aunque el usuario no existiera y nunca daba 404
    const usuario = await em.findOne(Usuario, { id });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await em.remove(usuario).flush();
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    responderError(res, error);
  }
}


export { sanitizeUsuarioInput, sanitizeUsuarioUpdateInput, findAll, findOne, add, update, remove }
