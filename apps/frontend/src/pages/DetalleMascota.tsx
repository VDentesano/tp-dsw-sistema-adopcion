import { Link, useParams } from "react-router";
import { buscarMascota } from "../api/mascotas";
import { useApi } from "../api/useApi";
import { edadDesde, formatearFecha, leerFecha } from "../utils/edad";
import { tonoDeEstado } from "../utils/tonos";
import { Chapita } from "../components/Chapita";
import { FotoMascota } from "../components/FotoMascota";
import { Aviso, Cargando } from "../components/Aviso";
import s from "./DetalleMascota.module.css";

export function DetalleMascota() {
  const { id } = useParams();
  const { data: mascota, cargando, error } = useApi(() => buscarMascota(Number(id)), [id]);

  if (cargando) return <Cargando que="la ficha" />;
  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!mascota) return null;

  const edad = edadDesde(mascota.fechaDeNac);
  const disponible = mascota.estado === "Disponible";

  const ficha: [string, string | null][] = [
    ["Especie", mascota.raza.especie.nombre],
    ["Raza", mascota.raza.nombre],
    ["Edad", edad ?? "Sin registrar"],
    ["Tamaño", mascota.tamano],
    ["Estilo", mascota.estilo],
  ];

  return (
    <>
      <Link to="/mascotas" className={s.volver}>
        ← Volver al listado
      </Link>

      <article className={s.detalle}>
        <div className={s.fotoMarco}>
          <FotoMascota nombre={mascota.nombre} fotoURL={mascota.fotoURL} />
        </div>

        <div>
          <div className={s.filaTitulo}>
            <h1 className={s.nombre}>{mascota.nombre}</h1>
            <Chapita tono={tonoDeEstado(mascota.estado)}>{mascota.estado ?? "Sin estado"}</Chapita>
          </div>

          <dl className={s.ficha}>
            {ficha
              .filter(([, valor]) => valor)
              .map(([campo, valor]) => (
                <div key={campo} className={s.filaFicha}>
                  <dt>{campo}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
          </dl>

          <section className={s.refugio}>
            <h2 className={s.refugioTitulo}>Está en {mascota.refugio.nombre}</h2>
            <p className={s.refugioDato}>{mascota.refugio.direccion}</p>
            <p className={s.refugioDato}>
              {mascota.refugio.telefono} · {mascota.refugio.email}
            </p>
          </section>

          {disponible ? (
            <Link to={`/mascotas/${mascota.id}/postular`} className={s.postular}>
              Postularme para adoptar
            </Link>
          ) : (
            <Aviso>
              {mascota.nombre} no está disponible para adopción en este momento
              {mascota.estado ? ` (${mascota.estado.toLowerCase()})` : ""}.
            </Aviso>
          )}
        </div>
      </article>

      <section className={s.medica}>
        <h2 className={s.medicaTitulo}>Ficha médica</h2>
        {mascota.historiaClinica.length === 0 ? (
          <p className={s.sinVacunas}>Todavía no tiene vacunas registradas.</p>
        ) : (
          <ul className={s.vacunas}>
            {mascota.historiaClinica.map((aplicacion) => (
              <li key={aplicacion.id} className={s.vacuna}>
                <span className={s.vacunaNombre}>
                  {aplicacion.vacuna.nombre}
                  {aplicacion.vacuna.esObligatoria && <em className={s.obligatoria}> · obligatoria</em>}
                </span>
                <span className={s.vacunaDato}>Aplicada el {formatearFecha(aplicacion.fechaAplicacion)}</span>
                <span className={s.vacunaDato}>
                  {aplicacion.proximoRefuerzo
                    ? `Próximo refuerzo: ${formatearFecha(aplicacion.proximoRefuerzo)}`
                    : "Sin refuerzo"}
                  {refuerzoVencido(aplicacion.proximoRefuerzo) && <Chapita tono="rojo">Vencido</Chapita>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// un refuerzo cuya fecha ya paso se marca para que el refugio vea que hay que darlo
function refuerzoVencido(fecha: string | null): boolean {
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return leerFecha(fecha) < hoy;
}
