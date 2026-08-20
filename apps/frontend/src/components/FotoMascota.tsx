import s from "./FotoMascota.module.css";

/** Foto de la mascota, o la inicial del nombre sobre verde si no hay foto cargada. */
export function FotoMascota({ nombre, fotoURL }: { nombre: string; fotoURL: string | null }) {
  if (fotoURL) {
    return <img className={s.foto} src={fotoURL} alt={`Foto de ${nombre}`} />;
  }
  return (
    <div className={s.placeholder} role="img" aria-label={`${nombre}, sin foto todavía`}>
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}
