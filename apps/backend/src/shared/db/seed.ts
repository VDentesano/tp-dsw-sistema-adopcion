/*
  Datos de prueba para desarrollo. Se corre con `pnpm --filter backend seed`.

  Es destructivo: primero borra TODAS las filas y despues las vuelve a cargar, asi
  siempre queda la misma base y los ids son estables (el front tiene un usuario demo
  hardcodeado que depende de eso). No usar en produccion.
*/
import type { EntityClass } from "@mikro-orm/core";
import { orm, syncSchema } from "./orm.js";
import { Rol } from "../../rol/rol.entity.js";
import { Localidad } from "../../localidad/localidad.entity.js";
import { Especie } from "../../especie/especie.entity.js";
import { Raza } from "../../raza/raza.entity.js";
import { Refugio } from "../../refugio/refugio.entity.js";
import { Usuario } from "../../usuario/usuario.entity.js";
import { Mascota } from "../../mascota/mascota.entity.js";
import { Pregunta_Formulario } from "../../pregunta/pregunta.entity.js";
import { Solicitud_Adopcion } from "../../solicitud_adopcion/solicitud_adopcion.entity.js";
import { Auditoria_Estado } from "../../auditoria_estado/auditoria_estado.entity.js";
import { Vacuna } from "../../vacuna/vacuna.entity.js";
import { Historia_Clinica } from "../../historia_clinica/historia_clinica.entity.js";

// por si la base esta vieja: crea las tablas que falten antes de insertar
await syncSchema();

const em = orm.em.fork();

/*
  Borrado en orden inverso a las dependencias: primero las tablas que apuntan a otras.
  Si se borrara al reves, MySQL rechazaria el delete por las foreign keys.
*/
const entidades: EntityClass<object>[] = [
  Historia_Clinica,
  Auditoria_Estado,
  Solicitud_Adopcion,
  Pregunta_Formulario,
  Mascota,
  Vacuna,
  Usuario,
  Refugio,
  Raza,
  Especie,
  Localidad,
  Rol,
];
/*
  Despues de borrar hay que reiniciar el contador de AUTO_INCREMENT a mano: MySQL no lo
  hace vuelta atras solo. Si no, las filas que se creen DESPUES del seed (por ejemplo las
  de los .http) arrancarian en el maximo historico de la tabla y no serian predecibles.
*/
const conexion = em.getConnection();
for (const entidad of entidades) {
  await em.nativeDelete(entidad, {});
  const tabla = orm.getMetadata().get(entidad).tableName;
  await conexion.execute(`alter table \`${tabla}\` auto_increment = 1`);
}

// --------- catalogos ---------

const rolAdoptante = em.create(Rol, { id: 1, nombre: "Adoptante" });
const rolVoluntario = em.create(Rol, { id: 2, nombre: "Voluntario" });
em.create(Rol, { id: 3, nombre: "Administrador" });

const rosario = em.create(Localidad, { id: 1, nombre: "Rosario" });
const funes = em.create(Localidad, { id: 2, nombre: "Funes" });
em.create(Localidad, { id: 3, nombre: "Villa Gobernador Galvez" });

const perro = em.create(Especie, { id: 1, nombre: "Perro" });
const gato = em.create(Especie, { id: 2, nombre: "Gato" });

const labrador = em.create(Raza, { id: 1, nombre: "Labrador", especie: perro });
const caniche = em.create(Raza, { id: 2, nombre: "Caniche", especie: perro });
const mestizoPerro = em.create(Raza, { id: 3, nombre: "Mestizo", especie: perro });
const siames = em.create(Raza, { id: 4, nombre: "Siames", especie: gato });
const mestizoGato = em.create(Raza, { id: 5, nombre: "Mestizo criollo", especie: gato });

// --------- refugios ---------

const patitas = em.create(Refugio, {
  id: 1,
  nombre: "Patitas al Rescate",
  direccion: "Av. Pellegrini 1234",
  telefono: "3415550001",
  email: "contacto@patitasalrescate.org",
  localidad: rosario,
});

const huellitas = em.create(Refugio, {
  id: 2,
  nombre: "Huellitas Funes",
  direccion: "San Martin 567",
  telefono: "3415550002",
  email: "info@huellitasfunes.org",
  localidad: funes,
});

// --------- usuarios ---------
// la password va en texto plano a proposito: el hash es parte de los adicionales (login)

const voluntariaPatitas = em.create(Usuario, {
  id: 1,
  nombre: "Lucia",
  apellido: "Gomez",
  email: "lucia.gomez@patitasalrescate.org",
  password: "123456",
  telefono: "3415551001",
  rol: rolVoluntario,
  refugio: patitas,
});

em.create(Usuario, {
  id: 2,
  nombre: "Martin",
  apellido: "Suarez",
  email: "martin.suarez@huellitasfunes.org",
  password: "123456",
  telefono: "3415551002",
  rol: rolVoluntario,
  refugio: huellitas,
});

// usuario demo del front (ver SesionContext.tsx)
const juan = em.create(Usuario, {
  id: 3,
  nombre: "Juan",
  apellido: "Perez",
  email: "juan.perez@example.com",
  password: "123456",
  telefono: "3415552001",
  rol: rolAdoptante,
});

const ana = em.create(Usuario, {
  id: 4,
  nombre: "Ana",
  apellido: "Torres",
  email: "ana.torres@example.com",
  password: "123456",
  telefono: "3415552002",
  rol: rolAdoptante,
});

const carlos = em.create(Usuario, {
  id: 5,
  nombre: "Carlos",
  apellido: "Benitez",
  email: "carlos.benitez@example.com",
  password: "123456",
  telefono: "3415552003",
  rol: rolAdoptante,
});

// --------- mascotas ---------
// algunas quedan sin fotoURL para ver el placeholder con la inicial del nombre

const mora = em.create(Mascota, {
  id: 1,
  nombre: "Mora",
  fechaDeNac: "2022-03-14",
  tamano: "Mediano",
  estado: "Disponible",
  fotoURL: "https://placedog.net/600/400?id=1",
  estilo: "Tranquila, ideal para departamento",
  raza: labrador,
  refugio: patitas,
});

const tito = em.create(Mascota, {
  id: 2,
  nombre: "Tito",
  fechaDeNac: "2019-11-02",
  tamano: "Chico",
  estado: "Disponible",
  fotoURL: "https://placedog.net/600/400?id=2",
  estilo: "Jugueton, se lleva bien con chicos",
  raza: caniche,
  refugio: patitas,
});

const nina = em.create(Mascota, {
  id: 3,
  nombre: "Nina",
  fechaDeNac: "2023-06-20",
  tamano: "Grande",
  estado: "Disponible",
  fotoURL: "https://placedog.net/600/400?id=3",
  estilo: "Muy energica, necesita patio",
  raza: mestizoPerro,
  refugio: patitas,
});

const simba = em.create(Mascota, {
  id: 4,
  nombre: "Simba",
  fechaDeNac: "2021-01-09",
  tamano: "Chico",
  estado: "Disponible",
  estilo: "Independiente pero cariñoso",
  raza: siames,
  refugio: patitas,
});

const pelusa = em.create(Mascota, {
  id: 5,
  nombre: "Pelusa",
  fechaDeNac: "2020-08-30",
  tamano: "Chico",
  estado: "En tratamiento",
  estilo: "En recuperacion por una fractura",
  raza: mestizoGato,
  refugio: patitas,
});

const rocco = em.create(Mascota, {
  id: 6,
  nombre: "Rocco",
  fechaDeNac: "2018-05-17",
  tamano: "Grande",
  estado: "Disponible",
  fotoURL: "https://placedog.net/600/400?id=6",
  estilo: "Adulto, muy obediente",
  raza: labrador,
  refugio: huellitas,
});

em.create(Mascota, {
  id: 7,
  nombre: "Luna",
  fechaDeNac: "2024-02-11",
  tamano: "Mediano",
  estado: "Reservada",
  fotoURL: "https://placedog.net/600/400?id=7",
  estilo: "Cachorra, en proceso de adopcion",
  raza: mestizoPerro,
  refugio: huellitas,
});

const bruno = em.create(Mascota, {
  id: 8,
  nombre: "Bruno",
  fechaDeNac: "2017-09-05",
  tamano: "Mediano",
  estado: "Adoptada",
  fotoURL: "https://placedog.net/600/400?id=8",
  estilo: "Ya encontro familia",
  raza: mestizoPerro,
  refugio: huellitas,
});

// --------- vacunas e historia clinica ---------
// Mora y Pelusa tienen un refuerzo vencido y Nina no tiene ninguna vacuna cargada,
// para ver esos casos en el detalle de la mascota

const antirrabica = em.create(Vacuna, { id: 1, nombre: "Antirrabica", esObligatoria: true });
const sextuple = em.create(Vacuna, { id: 2, nombre: "Sextuple", esObligatoria: true });
const tripleFelina = em.create(Vacuna, { id: 3, nombre: "Triple felina", esObligatoria: true });
const tosDeLasPerreras = em.create(Vacuna, { id: 4, nombre: "Tos de las perreras", esObligatoria: false });
const leucemiaFelina = em.create(Vacuna, { id: 5, nombre: "Leucemia felina", esObligatoria: false });

const aplicaciones = [
  { id: 1, mascota: mora, vacuna: sextuple, fechaAplicacion: "2025-05-10", proximoRefuerzo: "2026-05-10" },
  { id: 2, mascota: mora, vacuna: antirrabica, fechaAplicacion: "2025-11-03", proximoRefuerzo: "2026-11-03" },
  { id: 3, mascota: tito, vacuna: sextuple, fechaAplicacion: "2026-02-15", proximoRefuerzo: "2027-02-15" },
  { id: 4, mascota: tito, vacuna: antirrabica, fechaAplicacion: "2026-02-15", proximoRefuerzo: "2027-02-15" },
  { id: 5, mascota: tito, vacuna: tosDeLasPerreras, fechaAplicacion: "2026-03-01" },
  { id: 6, mascota: simba, vacuna: tripleFelina, fechaAplicacion: "2026-01-20", proximoRefuerzo: "2027-01-20" },
  { id: 7, mascota: simba, vacuna: leucemiaFelina, fechaAplicacion: "2026-01-20", proximoRefuerzo: "2027-01-20" },
  { id: 8, mascota: pelusa, vacuna: tripleFelina, fechaAplicacion: "2025-09-01", proximoRefuerzo: "2026-09-01" },
  { id: 9, mascota: rocco, vacuna: antirrabica, fechaAplicacion: "2026-06-10", proximoRefuerzo: "2027-06-10" },
];
for (const aplicacion of aplicaciones) {
  em.create(Historia_Clinica, aplicacion);
}

// --------- preguntas del formulario dinamico ---------
// la 4 esta inactiva a proposito: sirve para probar que el detalle de una solicitud
// vieja igual puede mostrar el texto de la pregunta que se respondio

const p1 = em.create(Pregunta_Formulario, {
  id: 1,
  texto: "¿En que tipo de vivienda vivis?",
  tipo: "opcion",
  opciones: ["Casa con patio", "Casa sin patio", "Departamento"],
  obligatoria: true,
  orden: 1,
  activa: true,
  refugio: patitas,
});

const p2 = em.create(Pregunta_Formulario, {
  id: 2,
  texto: "¿Cuantas personas viven en tu casa?",
  tipo: "numero",
  obligatoria: true,
  orden: 2,
  activa: true,
  refugio: patitas,
});

const p3 = em.create(Pregunta_Formulario, {
  id: 3,
  texto: "¿Tuviste mascotas antes? Contanos tu experiencia",
  tipo: "texto",
  obligatoria: false,
  orden: 3,
  activa: true,
  refugio: patitas,
});

const p4 = em.create(Pregunta_Formulario, {
  id: 4,
  texto: "¿Aceptas recibir visitas de seguimiento?",
  tipo: "booleano",
  obligatoria: true,
  orden: 4,
  activa: false,
  refugio: patitas,
});

const p5 = em.create(Pregunta_Formulario, {
  id: 5,
  texto: "¿Tenes experiencia con perros grandes?",
  tipo: "booleano",
  obligatoria: true,
  orden: 1,
  activa: true,
  refugio: huellitas,
});

em.create(Pregunta_Formulario, {
  id: 6,
  texto: "¿Cuantas horas por dia estaria sola la mascota?",
  tipo: "numero",
  obligatoria: false,
  orden: 2,
  activa: true,
  refugio: huellitas,
});

// --------- solicitudes ---------
// Mora (id 1) queda con tres pendientes: es el caso que necesita el CUU de resolucion
// (al aprobar una, las otras dos tienen que pasar a Rechazada)

em.create(Solicitud_Adopcion, {
  id: 1,
  fechaSolicitud: new Date("2026-09-20"),
  estado: "Pendiente",
  respuestasFormulario: {
    [String(p1.id)]: "Casa con patio",
    [String(p2.id)]: 4,
    [String(p3.id)]: "Tuve un labrador durante 12 años",
  },
  mascota: mora,
  usuario: juan,
});

em.create(Solicitud_Adopcion, {
  id: 2,
  fechaSolicitud: new Date("2026-09-25"),
  estado: "Pendiente",
  respuestasFormulario: {
    [String(p1.id)]: "Departamento",
    [String(p2.id)]: 2,
    [String(p3.id)]: "Es mi primera mascota",
  },
  mascota: mora,
  usuario: ana,
});

em.create(Solicitud_Adopcion, {
  id: 3,
  fechaSolicitud: new Date("2026-10-01"),
  estado: "Pendiente",
  respuestasFormulario: {
    [String(p1.id)]: "Casa sin patio",
    [String(p2.id)]: 3,
  },
  mascota: mora,
  usuario: carlos,
});

em.create(Solicitud_Adopcion, {
  id: 4,
  fechaSolicitud: new Date("2026-10-02"),
  estado: "Pendiente",
  respuestasFormulario: {
    [String(p1.id)]: "Casa con patio",
    [String(p2.id)]: 5,
    [String(p3.id)]: "Tenemos dos gatos",
  },
  mascota: tito,
  usuario: juan,
});

em.create(Solicitud_Adopcion, {
  id: 5,
  fechaSolicitud: new Date("2026-08-11"),
  estado: "Rechazada",
  respuestasFormulario: {
    [String(p1.id)]: "Departamento",
    [String(p2.id)]: 1,
    [String(p4.id)]: false,
  },
  mascota: nina,
  usuario: juan,
});

// esta es la que explica por que Bruno quedo Adoptada
em.create(Solicitud_Adopcion, {
  id: 6,
  fechaSolicitud: new Date("2026-07-03"),
  estado: "Aprobada",
  respuestasFormulario: {
    [String(p5.id)]: true,
  },
  mascota: bruno,
  usuario: ana,
});

await em.flush();

console.log("datos de prueba cargados:");
for (const entidad of entidades) {
  console.log(`  ${entidad.name}: ${await em.count(entidad)}`);
}
console.log(`\nusuario demo del front: ${juan.nombre} ${juan.apellido} (id ${juan.id})`);
console.log(`voluntaria de ${patitas.nombre}: ${voluntariaPatitas.email} (id ${voluntariaPatitas.id})`);

await orm.close(true);
