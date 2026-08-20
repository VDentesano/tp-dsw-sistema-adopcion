/** "2 años", "8 meses", o null si no hay fecha de nacimiento registrada. */
export function edadDesde(fechaISO: string | null | undefined): string | null {
  if (!fechaISO) return null;
  const nacimiento = new Date(fechaISO);
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
  return new Date(fechaISO).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
