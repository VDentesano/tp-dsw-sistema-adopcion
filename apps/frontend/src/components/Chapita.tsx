import type { ReactNode } from "react";
import type { TonoChapita } from "../utils/tonos";
import s from "./Chapita.module.css";

/**
 * La chapita del collar: badge de estado con forma de medalla y agujero
 * perforado. Es el mismo elemento en el catalogo, el detalle y las solicitudes,
 * asi el estado siempre se lee igual en toda la app.
 */
export function Chapita({ tono, children }: { tono: TonoChapita; children: ReactNode }) {
  return <span className={`${s.chapita} ${s[tono]}`}>{children}</span>;
}
