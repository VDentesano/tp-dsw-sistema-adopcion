# tp-dsw-sistema-adopcion

Plataforma para la gestión de refugios de animales y adopciones responsables. Trabajo práctico de Desarrollo de Software (UTN).

La propuesta completa (modelo de datos y alcance) está en [proposal.md](proposal.md).

## Integrantes

* 54915 - Dentesano, Valentino
* 54714 - Giunta, Lautaro
* 54914 - Taborda, Fausto
* 54887 - Lagos, Franco

## Stack

* **Backend:** Node.js + Express 5 + TypeScript, con MikroORM 7 sobre MySQL
* **Frontend:** React 19 + TypeScript + Vite, con React Router
* **Monorepo:** pnpm workspaces. Los tipos que comparten el back y el front están en `packages/types`
* **Base de datos:** MySQL en Docker (`docker-compose.yml`)

## Estructura

```
apps/
  backend/     API REST. Cada entidad tiene su carpeta con entity, controller, routes y un .http para probarla
  frontend/    app React (pages, components, api, sesion)
packages/
  types/       tipos y DTOs compartidos entre back y front (@proyecto/types)
docker-compose.yml
proposal.md
```

## Cómo levantar el proyecto

### Requisitos

* Node.js 22.12 o superior
* pnpm 10 o superior (`npm install -g pnpm`)
* Docker (para la base de datos). Si no, un MySQL local con el mismo usuario, contraseña y base que figuran en `docker-compose.yml`

### Pasos

1. Clonar el repo e instalar las dependencias desde la raíz:

   ```bash
   git clone https://github.com/VDentesano/tp-dsw-sistema-adopcion.git
   cd tp-dsw-sistema-adopcion
   pnpm install
   ```

2. Levantar MySQL:

   ```bash
   docker compose up -d
   ```

   Crea la base `refugio` con el usuario `dsw` / contraseña `dsw` en el puerto 3306.

3. Crear el archivo de variables de entorno del backend:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Ahí van los datos de conexión a MySQL. El `.env` no se commitea (está en `.gitignore`), así que cada uno tiene el suyo; los valores de `.env.example` ya coinciden con los del `docker-compose.yml`, así que si usás Docker se copia tal cual y no hay nada que editar. Si falta una variable, el backend no arranca y avisa cuál es.

4. Levantar el back y el front juntos desde la raíz:

   ```bash
   pnpm dev
   ```

   * API: http://localhost:3000/api
   * Frontend: http://localhost:5173

   Al arrancar, el backend crea o actualiza las tablas solo (`orm.schema.update()`), no hace falta correr migraciones.

### Cargar datos de prueba

La base arranca vacía. Para tener algo que mirar en el front, desde la raíz:

```bash
pnpm --filter backend seed
```

Carga refugios, razas, usuarios, mascotas, las preguntas del formulario y algunas solicitudes (`apps/backend/src/shared/db/seed.ts`). Es destructivo: **borra todas las filas y las vuelve a cargar**, así los ids son siempre los mismos. Se puede correr todas las veces que haga falta para volver a un estado conocido.

Qué queda cargado:

| Dato | Para qué sirve |
| :--- | :--- |
| Juan Perez (usuario id 3, rol Adoptante) | es el usuario demo del front, el que se postula |
| Lucia Gomez (usuario id 1, rol Voluntario de *Patitas al Rescate*) | el que va a resolver solicitudes |
| 8 mascotas en los 4 estados, en 2 refugios | el catálogo y sus filtros. Dos quedan sin foto para ver el placeholder |
| 6 preguntas de formulario, una inactiva | el formulario dinámico y la regla de inmutabilidad de las preguntas |
| 4 solicitudes pendientes (3 son de la misma mascota), 1 aprobada y 1 rechazada | el listado por estado y el CUU de resolución |

También se pueden cargar datos a mano con los archivos `.http` de cada entidad (en VS Code con la extensión REST Client), respetando el orden de las relaciones: `rol`, `especie` y `localidad` primero, después `raza` (necesita especie), `refugio` (necesita localidad), `usuario` (necesita rol), `mascota` (necesita raza y refugio) y `pregunta` (necesita refugio). Ojo que los ids de los ejemplos pueden no coincidir con los de tu base.

Como todavía no hay login, en el header del front hay un selector para elegir con qué usuario de prueba entrar: Juan Perez (adoptante, id 3), Lucia Gomez (voluntaria de *Patitas al Rescate*, id 1) o Martin Suarez (voluntario de *Huellitas Funes*, id 2). La lista está en `apps/frontend/src/sesion/SesionContext.tsx` y usa los ids que carga el seed: si cargaste los datos a mano, cambiá los `id` por los de usuarios que existan.

### Otros comandos

| Comando | Dónde | Qué hace |
| :--- | :--- | :--- |
| `pnpm dev` | raíz | levanta back y front en paralelo |
| `pnpm --filter backend seed` | raíz | borra y recarga los datos de prueba |
| `pnpm lint` | `apps/frontend` | corre ESLint |
| `pnpm build` | `apps/frontend` | build de producción del front |
| `pnpm --filter backend build` | raíz | compila el backend a `dist/` |
| `docker compose down` | raíz | apaga MySQL (los datos quedan en el volumen `refugio-data`) |

## API

Todas las rutas cuelgan de `http://localhost:3000/api`, en plural. Cada recurso tiene `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id`.

| Recurso | Ruta | Filtros en el listado |
| :--- | :--- | :--- |
| Rol | `/roles` | |
| Especie | `/especies` | |
| Raza | `/razas` | |
| Localidad | `/localidades` | |
| Refugio | `/refugios` | |
| Usuario | `/usuarios` | |
| Mascota | `/mascotas` | `?estado=Disponible&tamano=Mediano` |
| Pregunta del formulario | `/preguntas` | `?refugio=1&activa=true` |
| Solicitud de adopción | `/solicitudes` | `?estado=Pendiente&usuario=1&mascota=1&refugio=1` |

Además de los CRUD hay un endpoint de negocio:

| Acción | Ruta | Body |
| :--- | :--- | :--- |
| Resolver una solicitud | `POST /solicitudes/:id/resolver` | `{ decision: "Aprobada" \| "Rechazada", voluntario, motivo? }` |

Solo resuelve solicitudes `Pendiente` (si no, 409) y solo si el voluntario pertenece al refugio de la mascota (si no, 403). El `motivo` es obligatorio al rechazar. Al aprobar, en una sola transacción: la solicitud pasa a `Aprobada`, la mascota a `Reservada`, se registra la auditoría del cambio de estado y las demás solicitudes pendientes de esa mascota pasan a `Rechazada`.

El `estado` de una mascota y de una solicitud **no se puede cambiar por los `PUT`**: se cambia solo por este endpoint, para que todo cambio quede en `Auditoria_Estado`.

Las respuestas tienen la forma `{ message, data }`.

Cada `POST` y `PUT` pasa primero por un middleware `sanitize...` que valida el body y deja pasar solo los campos permitidos (el resto se ignora). En el `POST` los campos obligatorios tienen que venir; en el `PUT` solo se modifican los campos que se manden.

Los errores responden `{ message }` con estos códigos:

| Código | Cuándo |
| :--- | :--- |
| 400 | Datos inválidos: body mal formado o incompleto, id inválido, o un id de otra entidad que no existe |
| 403 | El voluntario no pertenece al refugio de la mascota de la solicitud |
| 404 | El registro o la ruta no existen |
| 409 | Valor repetido en un campo único, se quiere borrar algo que otros registros usan, o el estado actual no permite la operación (postularse a una mascota no disponible, resolver una solicitud ya resuelta) |
| 500 | Error interno. El detalle no se manda al cliente: se ve en la consola del backend |

## Estado del proyecto (alcance mínimo)

- [x] CRUD simple: Refugio, Usuario, Especie, Rol
- [x] CRUD dependiente: Mascota, Raza
- [x] Catálogo de mascotas filtrado por estado y tamaño
- [ ] Detalle de mascota con ficha médica y vacunas
- [x] Gestión de solicitudes para el voluntario (listado por estado y detalle del formulario)
- [x] CUU Postulación con formulario dinámico
- [x] CUU Resolución de solicitudes con auditoría de estados

## Paso a paso del desarrollo app de adopción

1) Creamos el monorepo para tener el back y el front juntos preparado (template) para react + ts + vite
2) Importamos y configuramos Mikro-Orm para MySQL
3) Configuramos los middlewares en app.ts (api)
4) Creamos refugio entity (falta ver las relaciones con otras entidades) y base entity
5) creamos entities usuario y rol con sus relaciones
6) Creamos las entities especie, raza y mascota. Corregimos la relación mascota-especie: la mascota ya no apunta directo a especie, la especie se obtiene a través de la raza
7) Creamos el CRUD de rol (controller y routes)
8) Migramos las entities a MikroORM v7 (los decorators ahora se importan de @mikro-orm/decorators), pasamos la ruta de rol a plural (/api/roles) y agregamos docker-compose.yml para levantar MySQL
9) Agregamos la relación refugio-mascota
10) Agregamos los archivos .http para probar las requests (a partir de acá cada CRUD tiene el suyo)
11) Creamos los CRUD de especie y raza
12) Creamos el CRUD de usuario, con populate de rol y refugio
13) Creamos la entity localidad con su relación con refugio, y después su CRUD (con fixes en findOne, update y delete)
14) Creamos los CRUD de refugio y mascota
15) Creamos la entity solicitud_adopcion, relacionada con mascota y usuario
16) Terminamos en el back el caso de uso "el usuario crea una solicitud de adopción": sanitizamos el input para que la fecha y el estado los ponga el servidor, validamos que la mascota esté disponible y que el usuario no tenga otra solicitud pendiente para la misma mascota. Empezamos a compartir tipos entre back y front en packages/types
17) Agregamos la entity pregunta_formulario para el formulario dinámico: cada refugio define sus preguntas y al postularse hay que responder las obligatorias. Las preguntas no se editan ni se borran físicamente, se desactivan, así las respuestas viejas siguen apuntando al texto original
18) Agregamos filtros por estado y tamaño al listado de mascotas y habilitamos CORS para el front
19) Creamos el front: catálogo de mascotas, detalle, formulario de postulación y "Mis solicitudes". Por ahora la sesión es un usuario demo hardcodeado hasta que tengamos login
20) Unificamos todas las rutas de la API en plural (/api/mascotas, /api/refugios, /api/localidades, /api/solicitudes)
21) Arreglamos findOne y remove de usuario: usaban findOneOrFail y getReference, así que nunca devolvían 404 cuando el usuario no existía
22) Agregamos sanitización a todos los CRUD con middlewares sanitize... en las rutas (como ya tenían solicitud y pregunta): validan el body y descartan los campos que no corresponden, así nadie puede mandar un id, relaciones anidadas o datos inválidos. Los helpers compartidos están en shared/sanitizacion.ts
23) Unificamos el manejo de errores en shared/errores.ts: todos los controllers responden los errores igual ({ message }) con 400, 404, 409 o 500, sin exponer el SQL ni el stack trace. Agregamos un 404 en JSON para rutas que no existen y un middleware de errores al final de app.ts
24) Agregamos un script de datos de prueba (`pnpm --filter backend seed`): borra todo y carga refugios, razas, usuarios, mascotas, preguntas y solicitudes con ids fijos, para poder probar el front sin ir cargando todo a mano con los `.http`
25) Hicimos el CUU de resolución: creamos la entity `Auditoria_Estado` (que guarda estado anterior, estado nuevo, fecha y motivo de cada cambio de una mascota) y el endpoint `POST /api/solicitudes/:id/resolver`. Solo se puede resolver una solicitud pendiente, y solo un voluntario del refugio de la mascota. Al aprobar, dentro de una transacción, la solicitud pasa a Aprobada, la mascota a Reservada (tiene dueño pero todavía no fue entregada), se registra la auditoría y las demás postulaciones a esa mascota se rechazan solas. Al rechazar solo cambia la solicitud. El cambio de estado de la mascota vive en un único lugar (`auditoria_estado.service.ts`) para que nunca se pueda cambiar sin dejar rastro
26) Sacamos el `estado` de los `PUT` genéricos de mascota y solicitud, y le agregamos el campo `motivo` a la solicitud. Hasta acá el CRUD permitía mandar `{"estado": "Aprobada"}` y saltearse el CUU entero: sin auditoría, sin rechazar las otras postulaciones y sin verificar el refugio. Ahora una mascota nueva nace `Disponible` por el valor por defecto de la entity, y el único camino para cambiar un estado es resolver una solicitud
27) Limpieza de configuración: sacamos los datos de conexión a MySQL de `orm.ts` y los pasamos a variables de entorno (`apps/backend/.env`, con un `.env.example` de plantilla). Los scripts le pasan a Node `--env-file-if-exists`, así que no hizo falta instalar dotenv. Renombramos el script `publish` a `build`, borramos la config `mikro-orm.configPaths` del package.json (apuntaba a un archivo que no existe) y actualizamos los `.http` de todas las entidades para que los ids coincidan con los que carga el seed
28) Hicimos el front de la gestión de solicitudes del voluntario: un listado (`/refugio/solicitudes`) filtrado por estado que muestra fecha, postulante y mascota, y un detalle (`/refugio/solicitudes/:id`) con los datos de contacto, el formulario completo y los botones para aprobar o rechazar, que usan el endpoint de resolución. El motivo es obligatorio para rechazar, así que el botón queda deshabilitado hasta que se escribe. Las respuestas se muestran con el texto de cada pregunta, aunque el refugio la haya desactivado después. Al listado de solicitudes le sumamos el filtro `?refugio=`, para que cada voluntario vea solo las de las mascotas de su refugio, y en el header agregamos un selector de usuario de prueba para poder entrar como adoptante o como voluntario hasta que exista el login
