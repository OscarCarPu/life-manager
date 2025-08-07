# Guía de Desarrollo

## Enfoque por Features

Se desarrollará a base de features.

- **Planificación**: Antes de incluso crear la rama, se planificará la feature. Se definirá qué se quiere conseguir y cómo se va a hacer.
- **Rama dedicada**: Se creará una rama dedicada al feature. `feature/<nombre_feature>`.
- **Merge al finalizar**

Esto permitirá el desarrollo de cada feature de forma independiente y sin interferir en el desarrollo de otras features.

## Arquitectura del Proyecto

### Backend Dual
El proyecto implementa un backend dual que permite dos enfoques diferentes:

1. **FastAPI** (`/backend/fastapi/`):
   - API REST para operaciones CRUD
   - Documentación automática con Swagger UI
   - Validación con Pydantic
   - Ideal para integraciones y desarrollo de frontend

2. **Flask** (`/backend/flask/`):
   - Interfaz web con plantillas HTML
   - Vista de calendario interactiva
   - Gestión visual de tareas y proyectos
   - Ideal para uso directo por usuarios

### Módulos Comunes (`/backend/common/`)
- **Modelos SQLAlchemy**: Definición de tablas y relaciones
- **Enums**: Estados de proyectos y tareas
- **Constantes**: Valores por defecto y configuración
- **Base de datos**: Configuración de conexión compartida

### Base de Datos
- **PostgreSQL** mediante Supabase
- **Esquemas** en `/supabase/schema/`
- **Migraciones** en `/supabase/migrations/`
- **Datos de prueba** en `/supabase/seed.sql`

# Testing

A parte de los [hooks](PRE_COMMIT_HOOKS.md) que se ejecutan al hacer commit, el proyecto incluye dos backends principales:

- **FastAPI**: API REST para operaciones CRUD en `/backend/fastapi/`
  - Endpoint principal: http://localhost:8000
  - Documentación: http://localhost:8000/docs
  - Redoc: http://localhost:8000/redoc
- **Flask**: Interfaz web con plantillas en `/backend/flask/`
  - Endpoint principal: http://localhost:5000
  - Vista de calendario disponible

## Instalación de Dependencias

Instalar las dependencias de desarrollo:

```bash
pip install -r dev-requirements.txt
```

## Ejecución con Docker

Los backends se pueden ejecutar usando Docker Compose:

```bash
make up    # Inicia todos los servicios
make down  # Para todos los servicios
```
## Estructura de Datos

Consulta la [documentación de modelos](DATA_MODELS.md) para entender la estructura de datos y relaciones entre entidades.
