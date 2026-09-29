/*
  Helpers para los middlewares sanitize... de los CRUD.
  Reciben el valor crudo que vino en el body (unknown: el cliente puede mandar cualquier cosa)
  y dicen si es valido o lo devuelven ya convertido.
*/

// devuelve el id como entero positivo, o undefined si no es un id valido
export function parsearId(valor: unknown): number | undefined{
  if(typeof valor !== 'string' && typeof valor !== 'number'){
    return undefined
  }
  const id = Number(valor)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function esTextoValido(valor: unknown): valor is string{
  return typeof valor === 'string' && valor.trim().length > 0
}

// validacion basica de formato: algo@algo.algo sin espacios
export function esEmailValido(valor: unknown): valor is string{
  return typeof valor === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
}

// fecha sin hora en formato YYYY-MM-DD, que es como MikroORM maneja las columnas date
export function esFechaValida(valor: unknown): valor is string{
  if(typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)){
    return false
  }
  // Date "corre" las fechas que no existen (2024-02-31 pasa a 2024-03-02), por eso comparamos
  const fecha = new Date(valor)
  return !isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor)
}

// solo links http o https (se usan como src de una imagen en el front)
export function esUrlValida(valor: unknown): valor is string{
  if(typeof valor !== 'string'){
    return false
  }
  try{
    const url = new URL(valor.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  }catch{
    return false
  }
}

// en un alta: devuelve los campos obligatorios que no vinieron en el input ya sanitizado
export function camposFaltantes<T extends object>(input: T, obligatorios: readonly (keyof T)[]): string[]{
  return obligatorios.filter((campo) => input[campo] === undefined).map(String)
}
