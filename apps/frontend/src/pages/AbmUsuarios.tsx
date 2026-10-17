import { useState, type FormEvent } from "react";
import type { UsuarioDTO, UsuarioInputDTO } from "@proyecto/types";
import { crearUsuario, eliminarUsuario, listarUsuarios, modificarUsuario } from "../api/usuarios";
import { listarRoles } from "../api/roles";
import { listarRefugios } from "../api/refugios";
import { useAbm } from "../api/useAbm";
import { useSesion } from "../sesion/useSesion";
import { AdminNav } from "../components/AdminNav";
import { BotonesFila, BotonesFormulario } from "../components/AbmControles";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./Abm.module.css";

async function cargar() {
  const [usuarios, roles, refugios] = await Promise.all([listarUsuarios(), listarRoles(), listarRefugios()]);
  usuarios.sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre));
  return { usuarios, roles, refugios };
}

// rol y refugio son el id como string; refugio "" es sin refugio (adoptante)
const VACIO = { nombre: "", apellido: "", email: "", telefono: "", password: "", rol: "", refugio: "" };

/** ABM de usuarios. Depende de rol y, si es voluntario, de refugio. */
export function AbmUsuarios() {
  const { usuario: sesion } = useSesion();
  const { data, cargando, error, guardando, errorAccion, aviso, ejecutar, limpiarAvisos } = useAbm(cargar);

  const [editando, setEditando] = useState<UsuarioDTO | null>(null);
  const [form, setForm] = useState(VACIO);

  if (sesion.rol !== "Voluntario") {
    return <Aviso>Esta sección es para los voluntarios de un refugio.</Aviso>;
  }

  const roles = data?.roles ?? [];
  const refugios = data?.refugios ?? [];
  const usuarios = data?.usuarios;
  // solo los voluntarios tienen refugio: con otro rol el select se deshabilita y se manda null
  const esVoluntario = roles.find((rol) => String(rol.id) === form.rol)?.nombre === "Voluntario";

  function cambiar(campo: keyof typeof VACIO, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function empezarEdicion(usuario: UsuarioDTO) {
    setEditando(usuario);
    // la contraseña nunca viene de la API: si se deja vacia no se cambia
    setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      password: "",
      rol: String(usuario.rol.id),
      refugio: usuario.refugio ? String(usuario.refugio.id) : "",
    });
    limpiarAvisos();
  }

  function limpiarFormulario() {
    setEditando(null);
    setForm(VACIO);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const dto: UsuarioInputDTO = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      rol: Number(form.rol),
      refugio: esVoluntario ? Number(form.refugio) : null,
      ...(form.password ? { password: form.password } : {}),
    };
    const quien = `${dto.nombre} ${dto.apellido}`;
    const ok = editando
      ? await ejecutar(
          () => modificarUsuario(editando.id, dto),
          `Se modificó el usuario ${quien}.`,
          "No se pudo guardar el usuario.",
        )
      : await ejecutar(() => crearUsuario(dto), `Se agregó el usuario ${quien}.`, "No se pudo guardar el usuario.");
    if (ok) limpiarFormulario();
  }

  async function eliminar(usuario: UsuarioDTO) {
    const quien = `${usuario.nombre} ${usuario.apellido}`;
    if (!window.confirm(`¿Eliminar el usuario ${quien}?`)) return;
    const ok = await ejecutar(
      () => eliminarUsuario(usuario.id),
      `Se eliminó el usuario ${quien}.`,
      "No se pudo eliminar el usuario.",
    );
    if (ok && editando?.id === usuario.id) limpiarFormulario();
  }

  // en el alta la contraseña es obligatoria; al modificar, vacia significa que no se cambia
  const completo =
    [form.nombre, form.apellido, form.email, form.telefono, form.rol].every((valor) => valor.trim() !== "") &&
    (!!editando || form.password !== "") &&
    (!esVoluntario || form.refugio !== "");

  return (
    <>
      <h1 className={s.titulo}>Usuarios</h1>
      <p className={s.bajada}>Adoptantes y voluntarios. Los voluntarios pertenecen a un refugio; los adoptantes no.</p>
      <AdminNav />

      <form className={s.formulario} onSubmit={guardar}>
        <h2>{editando ? `Modificar ${editando.nombre} ${editando.apellido}` : "Nuevo usuario"}</h2>
        <label className={s.campo}>
          Nombre
          <input value={form.nombre} onChange={(e) => cambiar("nombre", e.target.value)} required disabled={guardando} />
        </label>
        <label className={s.campo}>
          Apellido
          <input
            value={form.apellido}
            onChange={(e) => cambiar("apellido", e.target.value)}
            required
            disabled={guardando}
          />
        </label>
        <label className={s.campo}>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => cambiar("email", e.target.value)}
            required
            disabled={guardando}
          />
        </label>
        <label className={s.campo}>
          Teléfono
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => cambiar("telefono", e.target.value)}
            required
            disabled={guardando}
          />
        </label>
        <label className={s.campo}>
          Contraseña
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => cambiar("password", e.target.value)}
            required={!editando}
            placeholder={editando ? "Dejala vacía para no cambiarla" : undefined}
            disabled={guardando}
          />
        </label>
        <label className={s.campo}>
          Rol
          <select
            value={form.rol}
            onChange={(e) => cambiar("rol", e.target.value)}
            required
            disabled={guardando || !data}
          >
            <option value="">Elegí un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={s.campo}>
          Refugio
          <select
            value={esVoluntario ? form.refugio : ""}
            onChange={(e) => cambiar("refugio", e.target.value)}
            required={esVoluntario}
            disabled={guardando || !data || !esVoluntario}
          >
            <option value="">{esVoluntario ? "Elegí un refugio" : "Ninguno (solo para voluntarios)"}</option>
            {refugios.map((refugio) => (
              <option key={refugio.id} value={refugio.id}>
                {refugio.nombre}
              </option>
            ))}
          </select>
        </label>
        <BotonesFormulario
          editando={!!editando}
          guardando={guardando}
          completo={completo}
          onCancelar={limpiarFormulario}
        />
      </form>

      {errorAccion && <Aviso tipo="error">{errorAccion}</Aviso>}
      {aviso && <Aviso>{aviso}</Aviso>}

      {cargando && <Cargando que="los usuarios" />}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {usuarios && usuarios.length === 0 && <Aviso>Todavía no hay usuarios cargados.</Aviso>}

      {usuarios && usuarios.length > 0 && (
        <ul className={s.lista}>
          {usuarios.map((usuario) => (
            <li key={usuario.id} className={editando?.id === usuario.id ? s.filaEditando : s.fila}>
              <span className={s.nombre}>
                {usuario.nombre} {usuario.apellido}
                <span className={s.subdetalle}>
                  {usuario.email} · {usuario.telefono}
                </span>
              </span>
              <span className={s.detalle}>
                {usuario.rol.nombre}
                {usuario.refugio && ` · ${usuario.refugio.nombre}`}
              </span>
              <BotonesFila
                guardando={guardando}
                onModificar={() => empezarEdicion(usuario)}
                onEliminar={() => eliminar(usuario)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
