import { NavLink, Outlet } from "react-router";
import { useSesion } from "../sesion/useSesion";
import s from "./Layout.module.css";

export function Layout() {
  const { usuario } = useSesion();

  return (
    <div className={s.pagina}>
      <header className={s.header}>
        <NavLink to="/mascotas" className={s.marca}>
          {/* chapita del logo */}
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M12 2a5 5 0 0 1 5 5v.5l3.2 8.1A5 5 0 0 1 15.5 22h-7a5 5 0 0 1-4.7-6.4L7 7.5V7a5 5 0 0 1 5-5Z"
              fill="var(--laton)"
            />
            <circle cx="12" cy="6.5" r="1.6" fill="var(--papel)" />
          </svg>
          Refugio Patitas
        </NavLink>

        <nav className={s.nav} aria-label="Secciones">
          <NavLink to="/mascotas" className={({ isActive }) => (isActive ? s.activo : s.link)}>
            En adopción
          </NavLink>
          <NavLink to="/solicitudes" className={({ isActive }) => (isActive ? s.activo : s.link)}>
            Mis solicitudes
          </NavLink>
        </nav>

        <span className={s.sesion} title="Sesión de prueba hasta que exista el login">
          {usuario.nombre} {usuario.apellido} · demo
        </span>
      </header>

      <main className={s.contenido}>
        <Outlet />
      </main>

      <footer className={s.footer}>
        Plataforma de gestión de refugios y adopciones · TP DSW
      </footer>
    </div>
  );
}
