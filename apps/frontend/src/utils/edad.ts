/*
  Las columnas date de la base llegan como "2025-05-10", sin hora. new Date() las toma como
  medianoche UTC y en Argentina (UTC-3) quedan en el dia anterior. Agregandole la hora sin
  zona se leen como medianoche local. Las fechas que ya traen hora se leen tal cual.
*/
export function leerFecha(fechaISO: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(fechaISO) ? new Date(`${fechaISO}T00:00`) : new Date(fechaISO);
}

/** "2 años", "8 meses", o null si no hay fecha de nacimiento registrada. */
export function edadDesde(fechaISO: string | null | undefined): string | null {
  if (!fechaISO) return null;
  const nacimiento = leerFecha(fechaISO);
  if (Number.isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
    (hoy.getMonth() - nacimiento.getMonth());
  if (hoy.getDate() < nacimiento.getDate()) meses--;

  if (meses < 0) return null;
  if (meses < 1) return "menos de un mes";
  if (meses < 12) return meses === 1 ? "1 mes" : `${meses} meses`;
  const anios = Math.floor(meses / 12);
  return anios === 1 ? "1 año" : `${anios} años`;
}

export function formatearFecha(fechaISO: string): string {
  return leerFecha(fechaISO).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
