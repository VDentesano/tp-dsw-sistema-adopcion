import { useState } from "react";
import { ApiError } from "./client";
import { useApi } from "./useApi";

/**
 * Lo que comparten todas las pantallas de ABM: el listado, y las altas, modificaciones y bajas
 * con su aviso de exito o error. Despues de cada accion que sale bien vuelve a pedir el listado.
 * El estado del formulario queda en cada pantalla, porque los campos cambian en cada una.
 */
export function useAbm<T>(cargar: () => Promise<T>, deps: unknown[] = []) {
  // se incrementa despues de cada accion para volver a pedir el listado
  const [version, setVersion] = useState(0);
  const lectura = useApi(cargar, [version, ...deps]);

  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function limpiarAvisos() {
    setErrorAccion(null);
    setAviso(null);
  }

  /** Corre la accion y devuelve si salio bien, para que la pantalla sepa si limpiar el formulario. */
  async function ejecutar(accion: () => Promise<unknown>, exito: string, falla: string): Promise<boolean> {
    limpiarAvisos();
    setGuardando(true);
    try {
      await accion();
      setAviso(exito);
      setVersion((v) => v + 1);
      return true;
    } catch (e) {
      setErrorAccion(e instanceof ApiError ? e.message : falla);
      return false;
    } finally {
      setGuardando(false);
    }
  }

  return { ...lectura, guardando, errorAccion, aviso, ejecutar, limpiarAvisos };
}
