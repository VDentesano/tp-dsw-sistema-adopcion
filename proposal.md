# Propuesta TP DSW

## Grupo
### Integrantes
* 54915 - Dentesano, Valentino
* 54714 - Giunta, Lautaro
* 54914 - Taborda, Fausto
* ????? - Lagos, Franco

### Repositorios
* [frontend app](http://hyperlinkToGihubOrGitlab)
* [backend app](http://hyperlinkToGihubOrGitlab)

## Tema
### Descripción
Plataforma SaaS para la gestión integral de refugios de animales y adopciones responsables. El sistema permite administrar el ciclo de vida de las mascotas (ingreso, tratamiento, disponibilidad), procesar solicitudes de adopción dinámicas y llevar un seguimiento post-adopción. Está orientado a facilitar el trabajo de los voluntarios y asegurar el bienestar animal mediante estrictas reglas de negocio para la transición de estados de las mascotas.

### Modelo

```mermaid
erDiagram
    REFUGIO ||--o{ MASCOTA : aloja
    REFUGIO ||--o{ USUARIO : administra
    USUARIO ||--o{ SOLICITUD : realiza
    MASCOTA ||--o{ SOLICITUD : recibe
    MASCOTA ||--o{ VACUNA : tiene
    MASCOTA ||--o{ SEGUIMIENTO : requiere
    ESTADO_MASCOTA ||--o{ MASCOTA : define
    
    USUARIO {
        int id
        string nombre
        string email
        string rol
    }
    REFUGIO {
        int id
        string nombre
        string direccion
    }
    ESTADO_MASCOTA {
        int id
        string descripcion
    }
    MASCOTA {
        int id
        string nombre
        string tamano
        int edad_estimada
        int refugio_id FK
        int estado_id FK
    }
    SOLICITUD {
        int id
        int usuario_id FK
        int mascota_id FK
        date fecha
        string estado
        json respuestas_formulario
    }
    SEGUIMIENTO {
        int id
        int mascota_id FK
        date fecha_limite
        string estado
        string foto_url
    }
    VACUNA {
        int id
        int mascota_id FK
        string nombre_vacuna
        date fecha_aplicacion
    }
````

## Alcance Funcional

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Refugio<br>2. CRUD Usuario<br>3. CRUD Especie/Raza|
|CRUD dependiente|1. CRUD Mascota {depende de} CRUD Refugio y CRUD Estado Mascota<br>2. CRUD Vacuna {depende de} CRUD Mascota|
|Listado<br>+<br>detalle| 1. Listado de mascotas filtrado por estado y tamaño, muestra nombre, edad y tamaño =\> detalle muestra ficha médica, vacunas y datos completos de la mascota.<br> 2. Listado de solicitudes de adopción filtrado por estado (pendiente, aprobada, rechazada), muestra fecha, nombre del postulante y mascota =\> detalle muestra formulario completo del adoptante.|
|CUU/Epic|1. Postularse a una adopción completando el formulario dinámico.<br>2. Aprobar o rechazar una solicitud de adopción (actualizando el estado de la mascota automáticamente).|

Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Refugio<br>2. CRUD Estado Mascota<br>3. CRUD Especie/Raza<br>4. CRUD Usuario (Roles: Admin, Voluntario, Adoptante)<br>5. CRUD Mascota<br>6. CRUD Vacuna<br>7. CRUD Seguimiento Post-Adopción|
|CUU/Epic|1. Postularse a una adopción completando el formulario dinámico.<br>2. Aprobar/Rechazar solicitud de adopción (transición de estados).<br>3. Registrar y validar controles en el seguimiento post-adopción.|

### Alcance Adicional Voluntario

|Req|Detalle|
|:-|:-|
|Listados |1. Listado de seguimientos pendientes filtrado por fecha límite, muestra mascota, adoptante y días restantes.<br>2. Estadísticas de adopción filtradas por refugio y mes.|
|CUU/Epic|1. Algoritmo de "Match" que sugiere mascotas según el estilo de vida del usuario.<br>2. Gestión de turnos presenciales para entrevistas en el refugio.|
|Otros|1. Envío de recordatorio/alerta automática por email cuando un seguimiento post-adopción está vencido.|

```