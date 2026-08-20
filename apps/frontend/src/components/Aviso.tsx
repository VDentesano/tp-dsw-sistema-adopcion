import type { ReactNode } from "react";
import s from "./Aviso.module.css";

/** Banner de estado: errores que explican qué pasó, o info neutral. */
export function Aviso({ tipo = "info", children }: { tipo?: "error" | "info"; children: ReactNode }) {
  return (
    <p className={tipo === "error" ? s.error : s.info} role={tipo === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

export function Cargando({ que }: { que: string }) {
  return (
    <p className={s.cargando} role="status">
      Cargando {que}…
    </p>
  );
}
