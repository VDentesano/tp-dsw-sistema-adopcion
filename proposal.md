# Propuesta TP DSW: Plataforma de Gestión de Refugios y Adopciones

## Grupo
**Integrantes:**
* 54915 - Dentesano, Valentino
* 54714 - Giunta, Lautaro
* 54914 - Taborda, Fausto
* 54887 - Lagos, Franco

**Repositorios:**
* [Fullstack App](#) 

---

## Tema
### Descripción
Plataforma SaaS para la gestión integral de refugios de animales y adopciones responsables. El sistema permite administrar el ciclo de vida de las mascotas (ingreso, tratamiento, disponibilidad), procesar solicitudes de adopción dinámicas y llevar un seguimiento post-adopción. Está orientado a facilitar el trabajo de los voluntarios y asegurar el bienestar animal mediante estrictas reglas de negocio para la transición de estados de las mascotas, apoyándose en un sistema de auditoría y roles.

---

## Modelo de Datos (Diagrama ER)
El modelo se basa en una arquitectura de roles para centralizar la gestión de usuarios, permitiendo que un mismo sistema administre refugios, voluntarios y adoptantes sin redundancia de datos.

```mermaid
erDiagram
    REFUGIO ||--o{ MASCOTA : "alberga"
    REFUGIO ||--o{ USUARIO : "tiene voluntarios"
    USUARIO }o--|| ROL : "tiene"
    USUARIO ||--o{ SOLICITUD_ADOPCION : "realiza"
    MASCOTA }o--|| ESPECIE : "pertenece"
    MASCOTA }o--|| RAZA : "es de"
    MASCOTA ||--o{ AUDITORIA_ESTADO : "registra historial"
    MASCOTA ||--o{ HISTORIA_CLINICA : "tiene vacunas"
    MASCOTA ||--o{ SOLICITUD_ADOPCION : "recibe"
    VACUNA ||--o{ HISTORIA_CLINICA : "aplicada en"
    SOLICITUD_ADOPCION ||--o{ SEGUIMIENTO : "genera"
    SOLICITUD_ADOPCION ||--o{ ENTREVISTA_VISITA : "requiere"
    USUARIO ||--o{ NOTIFICACION : "recibe"

    ROL {
        int RolID PK
        string Nombre
    }
    
    USUARIO {
        int UsuarioID PK
        string Email
        string Contrasena
        string NombreCompleto
        string Telefono
        int RolID FK
        int LocalidadID
        int RefugioID FK
    }

    REFUGIO {
        int RefugioID PK
        string Nombre
        string Direccion
        string Telefono
        int LocalidadID
    }

    MASCOTA {
        int MascotaID PK
        string Nombre
        date FechaDeNac
        string Tamano
        string Estado
        string FotoURL
        string Estilo
        int EspecieID FK
        int RazaID FK
        int RefugioID FK
    }

    AUDITORIA_ESTADO {
        int AuditoriaID PK
        int MascotaID FK
        string EstadoAnterior
        string EstadoNuevo
        datetime FechaCambio
        string Motivo
    }

    SOLICITUD_ADOPCION {
        int SolicitudID PK
        date FechaSolicitud
        string Estado
        string RespuestasFormulario
        int UsuarioID FK
        int MascotaID FK
    }

    SEGUIMIENTO {
        int SeguimientoID PK
        date FechaProgramada
        string Estado
        string FotoReporteURL
        string ComentariosAdoptante
        int SolicitudID FK
    }

    ENTREVISTA_VISITA {
        int EntrevistaID PK
        datetime FechaHora
        string Estado
        string ObservacionesVoluntario
        int SolicitudID FK
    }

    HISTORIA_CLINICA {
        int HistorialClinicaID PK
        date FechaAplicacion
        date ProximoRefuerzo
        int MascotaID FK
        int VacunaID FK
    }

    VACUNA {
        int VacunaID PK
        string Nombre
        boolean EsObligatoria
    }

    ESPECIE {
        int EspecieID PK
        string Nombre
    }

    RAZA {
        int RazaID PK
        string Nombre
        int EspecieID FK
    }

    NOTIFICACION {
        int NotificacionID PK
        int UsuarioID FK
        string Titulo
        string Mensaje
        datetime FechaCreacion
        string TipoRelacion
        int RelacionadoID
    }
````
## Alcance Funcional

A continuación, se detallan los requerimientos funcionales del sistema, estructurados según su prioridad técnica y complejidad. Este alcance fue definido en base a los procesos de negocio críticos del refugio, garantizando que los actores principales (Voluntarios y Adoptantes) puedan interactuar fluidamente a través de los casos de uso centrales: la gestión del estado de los animales y el ciclo completo de adopción.

### Alcance Mínimo (Regularidad)

| Requerimiento | Detalle |
| :--- | :--- |
| **CRUD Simple** | 1. CRUD Refugio<br>2. CRUD Usuario<br>3. CRUD Especie |
| **CRUD Dependiente** | 1. CRUD Mascota (Depende de Refugio y Estado)<br>2. CRUD Vacuna (Depende de Mascota)<br>3. CRUD Raza (Depende de Especie)|
| **Listados + Detalle** | 1. **Catálogo de Mascotas:** Listado filtrado por estado y tamaño. Muestra nombre, edad y tamaño. El detalle expone la ficha médica y vacunas.<br>2. **Gestión de Solicitudes:** Listado filtrado por estado (pendiente, aprobada, rechazada). Muestra fecha, postulante y mascota. Detalle muestra formulario completo. |
| **CUU / Epic** | 1. **Postulación:** El usuario se postula a una adopción completando un formulario dinámico.<br>2. **Resolución:** El voluntario aprueba o rechaza una solicitud, actualizando automáticamente el estado de la mascota y registrando la auditoría. |

### Adicionales para Aprobación

| Requerimiento | Detalle |
| :--- | :--- |
| **Gestión de Entidades (CRUD)** | Extensión de ABMs para cubrir el modelo completo:<br>1. CRUD Refugio, Estado Mascota, Especie/Raza.<br>2. CRUD Usuario (Roles: Admin, Voluntario, Adoptante).<br>3. CRUD Mascota, Vacuna y Seguimiento Post-Adopción. |
| **CUU / Epic** | 1. Postulación con formulario dinámico.<br>2. Resolución de solicitud con transiciones automáticas en el sistema de auditoría.<br>3. Registro y validación de controles periódicos en el módulo de seguimiento. |

### Alcance Adicional Voluntario

| Requerimiento | Detalle |
| :--- | :--- |
| **Listados Complejos** | 1. **Panel de Seguimientos:** Listado de tareas y visitas pendientes por fecha límite.<br>2. **Reportes:** Estadísticas mensuales de adopción filtradas por refugio. |
| **CUU / Epic** | 1. **Match de Adopción:** Algoritmo que sugiere mascotas compatibles según las preferencias del adoptante.<br>2. **Turnos de Entrevista:** Gestión de agenda para visitas presenciales en la institución. |
| **Automatización** | 1. **Alertas:** Envío de notificaciones y recordatorios por email automáticos cuando un seguimiento post-adopción está vencido. |
