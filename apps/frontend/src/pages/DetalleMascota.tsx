import { Link, useParams } from "react-router";
import { buscarMascota } from "../api/mascotas";
import { useApi } from "../api/useApi";
import { edadDesde } from "../utils/edad";
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
    </>
  );
}
