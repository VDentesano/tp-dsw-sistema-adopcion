import { createContext } from "react";

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
}

export interface Sesion {
  usuario: UsuarioSesion;
}

export const SesionContext = createContext<Sesion | null>(null);
