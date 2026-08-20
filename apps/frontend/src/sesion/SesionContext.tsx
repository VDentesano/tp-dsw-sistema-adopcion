import type { ReactNode } from "react";
import { SesionContext, type UsuarioSesion } from "./contexto";

/**
 * Sesion del usuario actual. Hoy es un usuario demo hardcodeado; cuando exista
 * el login, SOLO cambia el interior de este provider (login(), logout(), token)
 * y ninguna pantalla se toca: todas leen la sesion via useSesion().
 */

// usuario de prueba: tiene que existir en la base (ver usuario.http)
const USUARIO_DEMO: UsuarioSesion = {
  id: 12,
  nombre: "Juan",
  apellido: "Perez",
};

export function SesionProvider({ children }: { children: ReactNode }) {
  return (
    <SesionContext.Provider value={{ usuario: USUARIO_DEMO }}>
      {children}
    </SesionContext.Provider>
  );
}
