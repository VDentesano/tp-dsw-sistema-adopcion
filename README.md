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

3. Levantar el back y el front juntos desde la raíz:

   ```bash
   pnpm dev
   ```

   * API: http://localhost:3000/api
   * Frontend: http://localhost:5173

   Al arrancar, el backend crea o actualiza las tablas solo (`orm.schema.update()`), no hace falta correr migraciones.

### Cargar datos de prueba

La base arranca vacía. Los datos se cargan con los archivos `.http` de cada entidad (en VS Code con la extensión REST Client). Por las relaciones hay que respetar este orden:

1. `rol.http`, `especie.http` y `localidad.http`
2. `raza.http` (necesita una especie)
3. `refugio.http` (necesita una localidad)
4. `usuario.http` (necesita un rol y opcionalmente un refugio)
5. `mascota.http` (necesita una raza y un refugio)
6. `pregunta.http` (las preguntas del formulario de postulación de cada refugio)

Los ids de los ejemplos pueden no coincidir con los de tu base: revisalos antes de mandar cada request.

Como todavía no hay login, el front usa un usuario demo fijo definido en `apps/frontend/src/sesion/SesionContext.tsx`. Ese usuario tiene que existir en tu base: si no, cambiá el `id` por el de uno que hayas creado.

### Otros comandos

| Comando | Dónde | Qué hace |
| :--- | :--- | :--- |
| `pnpm dev` | raíz | levanta back y front en paralelo |
| `pnpm lint` | `apps/frontend` | corre ESLint |
| `pnpm build` | `apps/frontend` | build de producción del front |
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
| Solicitud de adopción | `/solicitudes` | `?estado=Pendiente&usuario=1&mascota=1` |

Las respuestas tienen la forma `{ message, data }`.

Cada `POST` y `PUT` pasa primero por un middleware `sanitize...` que valida el body y deja pasar solo los campos permitidos (el resto se ignora). En el `POST` los campos obligatorios tienen que venir; en el `PUT` solo se modifican los campos que se manden.

Los errores responden `{ message }` con estos códigos:

| Código | Cuándo |
| :--- | :--- |
| 400 | Datos inválidos: body mal formado o incompleto, id inválido, o un id de otra entidad que no existe |
| 404 | El registro o la ruta no existen |
| 409 | Valor repetido en un campo único, o se quiere borrar algo que otros registros usan |
| 500 | Error interno. El detalle no se manda al cliente: se ve en la consola del backend |

## Estado del proyecto (alcance mínimo)

- [x] CRUD simple: Refugio, Usuario, Especie, Rol
- [x] CRUD dependiente: Mascota, Raza
- [x] Catálogo de mascotas filtrado por estado y tamaño
- [ ] Detalle de mascota con ficha médica y vacunas
- [ ] Gestión de solicitudes para el voluntario (listado por estado y detalle del formulario)
- [x] CUU Postulación con formulario dinámico
- [ ] CUU Resolución de solicitudes con auditoría de estados

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
