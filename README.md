# Life Manager

Este proyecto actuará de cerebro de mi sistema de seguimiento personal y domótica.
La elección de tecnologías se basa en mi interés por aprender y explorar esas herramientas.
Cada módulo estará aislado del resto, permitiendo un código más limpio y fácil de mantener.

## Tecnologías Principales

- **Backend**: FastAPI (API REST) + Flask (Interfaz Web)
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: SQLAlchemy
- **Validación**: Pydantic
- **Contenedores**: Docker & Docker Compose

## Estructura del Proyecto

- `backend/`: Lógica del backend con dos implementaciones:
  - `fastapi/`: API REST usando FastAPI para operaciones CRUD
  - `flask/`: Interfaz web con plantillas HTML usando Flask
  - `common/`: Módulos comunes y reutilizables compartidos entre ambos backends
    - `tasks/`: Modelos, enums y constantes para el sistema de tareas
- `supabase/`: Archivos SQL que definen la estructura de la base de datos
  - `schema/`: Esquemas de base de datos
  - `migrations/`: Migraciones de base de datos
  - `seed.sql`: Datos de ejemplo para desarrollo
- `docs/`: Documentación del proyecto
- `hardware/`: Esquemas y código de dispositivos de hardware (por implementar)

## Funcionalidades Actuales

### Sistema de Gestión de Tareas
- **Categorías**: Organización jerárquica de proyectos
- **Proyectos**: Gestión de proyectos con estados, fechas y colores
- **Tareas**: Creación y seguimiento de tareas individuales
- **Planificación**: Programación de tareas en fechas específicas con prioridades
- **Notas**: Sistema de notas vinculadas a proyectos o tareas

### APIs y Interfaces
- **API REST (FastAPI)**: Operaciones CRUD completas para todos los modelos
- **Interfaz Web (Flask)**: Vista de calendario y gestión visual de tareas
- **Documentación automática**: Swagger UI disponible en FastAPI

## Archivos Importantes

- `docker-compose.yaml`: Configuración para levantar el proyecto completo
- `.pre-commit-config.yaml`: Hooks de calidad de código
- `Makefile`: Comandos comunes de desarrollo
- `dev-requirements.txt`: Dependencias de desarrollo

## Inicio Rápido

1. **Clonar el repositorio**
2. **Instalar dependencias de desarrollo**:
   ```bash
   pip install -r dev-requirements.txt
   ```
3. **Levantar los servicios**:
   ```bash
   make up
   ```
4. **Acceder a las interfaces**:
   - API REST (FastAPI): http://localhost:8000
   - Documentación API: http://localhost:8000/docs
   - Interfaz Web (Flask): http://localhost:5000

## Documentación

- [Modelos de Datos](docs/DATA_MODELS.md)
- [Guía de Desarrollo](docs/DESARROLLO.md)
- [Pre-commit Hooks](docs/PRE_COMMIT_HOOKS.md)
