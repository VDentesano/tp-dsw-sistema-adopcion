import { useState, type ReactNode } from "react";
import { SesionContext, type UsuarioSesion } from "./contexto";

/**
 * Sesion del usuario actual. Hoy se elige entre usuarios demo hardcodeados; cuando
 * exista el login, SOLO cambia el interior de este provider (login(), logout(), token)
 * y las pantallas siguen leyendo la sesion via useSesion().
 */

// usuarios de prueba: tienen que existir en la base con estos ids (los carga el seed, ver shared/db/seed.ts)
const USUARIOS_DEMO: UsuarioSesion[] = [
  { id: 3, nombre: "Juan", apellido: "Perez", rol: "Adoptante", refugioId: null },
  { id: 1, nombre: "Lucia", apellido: "Gomez", rol: "Voluntario", refugioId: 1 },
  { id: 2, nombre: "Martin", apellido: "Suarez", rol: "Voluntario", refugioId: 2 },
];

function buscarUsuarioDemo(id: number): UsuarioSesion {
  return USUARIOS_DEMO.find((u) => u.id === id) ?? USUARIOS_DEMO[0];
}

export function SesionProvider({ children }: { children: ReactNode }) {
  // el usuario elegido se guarda en localStorage para que no vuelva a Juan al recargar
  const [usuario, setUsuario] = useState(() => buscarUsuarioDemo(Number(localStorage.getItem("usuarioDemo"))));

  function cambiarUsuario(id: number) {
    setUsuario(buscarUsuarioDemo(id));
    localStorage.setItem("usuarioDemo", String(id));
  }

  return (
    <SesionContext.Provider value={{ usuario, usuariosDemo: USUARIOS_DEMO, cambiarUsuario }}>
      {children}
    </SesionContext.Provider>
  );
}
