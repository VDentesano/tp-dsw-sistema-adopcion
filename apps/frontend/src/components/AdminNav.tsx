import { NavLink } from "react-router";
import s from "../pages/Abm.module.css";

// cada CRUD nuevo se suma aca y queda en las pestañas de todas las pantallas de administracion
const SECCIONES = [
  { ruta: "/admin/mascotas", etiqueta: "Mascotas" },
  { ruta: "/admin/razas", etiqueta: "Razas" },
  { ruta: "/admin/especies", etiqueta: "Especies" },
  { ruta: "/admin/refugios", etiqueta: "Refugios" },
  { ruta: "/admin/localidades", etiqueta: "Localidades" },
  { ruta: "/admin/usuarios", etiqueta: "Usuarios" },
];

/** Pestañas para moverse entre los ABM del voluntario. */
export function AdminNav() {
  return (
    <nav className={s.pestanas} aria-label="Datos del sistema">
      {SECCIONES.map(({ ruta, etiqueta }) => (
        <NavLink key={ruta} to={ruta} className={({ isActive }) => (isActive ? s.pestanaActiva : s.pestana)}>
          {etiqueta}
        </NavLink>
      ))}
    </nav>
  );
}
