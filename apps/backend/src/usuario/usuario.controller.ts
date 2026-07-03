import type { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Usuario } from "./usuario.entity.js";

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find( Usuario, {}, {populate: ['rol', 'refugio'] });
    res.status(200).json({ message: 'Usuarios encontrados', data: usuarios });
  } catch (error) {
    res.status(500).json({ message: 'Error al encontrar usuarios', error});
  }
}


async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);  //preguntar al profe si poner adentro del try o afuera y por parseint
    const usuario = await em.findOneOrFail(Usuario, { id }, {populate: ['rol', 'refugio']});
    if (!usuario) {
      return res.status(404).json({message: "Usuario no encontrado",});
    }
    res.status(200).json({message: "Usuario encontrado", data: usuario,});
  } catch (error) {
    res.status(500).json({message: "Error al encontrar usuario", error,});
  }
}


async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body);
    await em.flush();
    res.status(201).json({ message: 'Usuario agregado', data: usuario });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar usuario', error});
  }
}


async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const usuario = await em.findOne(Usuario, { id }); //preguntar por getReference y dejar afuera el id y validacion
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    em.assign(usuario, req.body);
    await em.flush();
    res.status(200).json({ message: 'Usuario actualizado', data: usuario });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error });
  }
}


async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const usuario = em.getReference(Usuario, id );
    await em.remove(usuario).flush();
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error });
  }
}


export { findAll, findOne, add, update, remove }
