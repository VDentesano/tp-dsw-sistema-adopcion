import { createContext } from "react";

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  rol: "Adoptante" | "Voluntario";
  /** Solo los voluntarios pertenecen a un refugio. */
  refugioId: number | null;
}

export interface Sesion {
  usuario: UsuarioSesion;
  /** Usuarios de prueba entre los que se puede cambiar hasta que exista el login. */
  usuariosDemo: UsuarioSesion[];
  cambiarUsuario: (id: number) => void;
}

export const SesionContext = createContext<Sesion | null>(null);
