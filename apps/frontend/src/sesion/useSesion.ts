import { useContext } from "react";
import { SesionContext, type Sesion } from "./contexto";

export function useSesion(): Sesion {
  const sesion = useContext(SesionContext);
  if (!sesion) {
    throw new Error("useSesion debe usarse adentro de <SesionProvider>");
  }
  return sesion;
}
