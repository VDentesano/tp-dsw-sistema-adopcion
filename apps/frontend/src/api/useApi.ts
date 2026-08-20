import { useEffect, useState } from "react";

interface EstadoApi<T> {
  data: T | null;
  cargando: boolean;
  error: string | null;
}

/**
 * Hook minimo para GETs: ejecuta el fetcher al montar y cada vez que cambian
 * las deps. `cargando` se deriva comparando la clave de deps del ultimo
 * resultado con la actual, asi no hace falta setear estado adentro del efecto.
 * Suficiente para este alcance; si algun dia hace falta cache o invalidacion,
 * se reemplaza por TanStack Query sin tocar la capa de api/.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[]): EstadoApi<T> {
  const clave = JSON.stringify(deps);
  const [resultado, setResultado] = useState<{
    data: T | null;
    error: string | null;
    clave: string | null;
  }>({ data: null, error: null, clave: null });

  useEffect(() => {
    let vigente = true; // evita pisar el estado si el componente se desmonto o cambio la dep
    fetcher()
      .then((data) => {
        if (vigente) setResultado({ data, error: null, clave });
      })
      .catch((error: unknown) => {
        if (vigente)
          setResultado({
            data: null,
            error: error instanceof Error ? error.message : "Error inesperado",
            clave,
          });
      });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el fetcher se identifica por sus deps serializadas
  }, [clave]);

  const cargando = resultado.clave !== clave;
  return {
    data: cargando ? null : resultado.data,
    cargando,
    error: cargando ? null : resultado.error,
  };
}
