/**
 * Unico punto de entrada HTTP del frontend: todos los requests pasan por aca.
 * Cuando exista login, el header Authorization se agrega en este archivo
 * y ninguna pantalla se entera.
 */

const API_URL = "http://localhost:3000/api";

/** Error de la API: conserva el status y el `data` que mando el backend (ej: preguntas faltantes). */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** Hace el request, desenvuelve el {message, data} del backend y devuelve solo data. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. ¿Está corriendo el backend?", 0);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.message ?? `Error ${res.status}`, res.status, body?.data);
  }
  return body.data as T;
}
