# Data Models

Este documento describe los modelos de datos utilizados en el proyecto Life Manager.

## Arquitectura

El proyecto utiliza SQLAlchemy como ORM con PostgreSQL (Supabase) como base de datos. Los modelos están definidos en `/backend/common/tasks/models.py` y son compartidos entre los backends de FastAPI y Flask.

## Modelos

### Category

Modelo para categorizar proyectos de forma jerárquica.

**Campos:**
- `id`: Integer, clave primaria
- `name`: String(100), nombre único de la categoría
- `description`: Text, descripción opcional
- `color`: String(7), color en formato hexadecimal (default: `#3182CE`)
- `parent_category_id`: Integer, referencia a categoría padre (opcional)
- `created_at`: DateTime, fecha de creación
- `updated_at`: DateTime, fecha de última actualización

**Relaciones:**
- `parent_category`: Relación con categoría padre
- `subcategories`: Relación con subcategorías
- `projects`: Relación con proyectos de esta categoría

### Project

Modelo para gestionar proyectos.

**Campos:**
- `id`: Integer, clave primaria
- `name`: String(100), nombre único del proyecto
- `description`: Text, descripción opcional
- `category_id`: Integer, referencia a categoría (opcional)
- `color`: String(7), color en formato hexadecimal (default: `#F6E05E`)
- `expected_start_date`: Date, fecha de inicio esperada (opcional)
- `expected_end_date`: Date, fecha de fin esperada (opcional)
- `state`: String(50), estado del proyecto (default: `not_started`)
- `created_at`: DateTime, fecha de creación
- `updated_at`: DateTime, fecha de última actualización

**Estados disponibles:**
- `not_started`: No iniciado
- `in_progress`: En progreso
- `completed`: Completado
- `archived`: Archivado

**Relaciones:**
- `category`: Relación con categoría
- `tasks`: Relación con tareas del proyecto
- `notes`: Relación con notas del proyecto

### Task

Modelo para gestionar tareas individuales dentro de proyectos.

**Campos:**
- `id`: Integer, clave primaria
- `title`: String(255), título de la tarea
- `due_date`: Date, fecha límite (opcional)
- `description`: Text, descripción opcional
- `project_id`: Integer, referencia al proyecto (opcional)
- `state`: String(50), estado de la tarea (default: `pending`)
- `created_at`: DateTime, fecha de creación
- `updated_at`: DateTime, fecha de última actualización

**Estados disponibles:**
- `pending`: Pendiente
- `in_progress`: En progreso
- `completed`: Completada
- `archived`: Archivada

**Relaciones:**
- `project`: Relación con proyecto
- `plannings`: Relación con planificaciones de la tarea
- `notes`: Relación con notas de la tarea

### TaskPlanning

Modelo para planificar tareas en fechas específicas.

**Campos:**
- `id`: Integer, clave primaria
- `task_id`: Integer, referencia a la tarea
- `planned_date`: Date, fecha planificada
- `start_hour`: Time, hora de inicio (opcional)
- `end_hour`: Time, hora de fin (opcional)
- `priority`: Integer, prioridad (1-5, opcional)
- `created_at`: DateTime, fecha de creación
- `updated_at`: DateTime, fecha de última actualización

**Restricciones:**
- Combinación única de `task_id` y `planned_date`
- Prioridad debe estar entre 1 y 5

**Relaciones:**
- `task`: Relación con tarea

### Note

Modelo para almacenar notas asociadas a proyectos o tareas.

**Campos:**
- `id`: Integer, clave primaria
- `content`: Text, contenido de la nota
- `project_id`: Integer, referencia a proyecto (opcional)
- `task_id`: Integer, referencia a tarea (opcional)
- `created_at`: DateTime, fecha de creación
- `updated_at`: DateTime, fecha de última actualización

**Restricciones:**
- Una nota debe estar asociada a un proyecto O a una tarea, pero no a ambos
- Al menos uno de `project_id` o `task_id` debe estar presente

**Relaciones:**
- `project`: Relación con proyecto
- `task`: Relación con tarea

## Enums

### ProjectState
- `NOT_STARTED`: "not_started"
- `IN_PROGRESS`: "in_progress"
- `COMPLETED`: "completed"
- `ARCHIVED`: "archived"

### TaskState
- `PENDING`: "pending"
- `IN_PROGRESS`: "in_progress"
- `COMPLETED`: "completed"
- `ARCHIVED`: "archived"

## Constantes

**Colores por defecto:**
- `DEFAULT_CATEGORY_COLOR`: "#3182CE" (azul)
- `DEFAULT_PROJECT_COLOR`: "#F6E05E" (amarillo)

**Prioridades:**
- `MIN_PRIORITY`: 1
- `MAX_PRIORITY`: 5

## Esquemas Pydantic

Los esquemas de Pydantic para validación de datos están definidos en `/backend/fastapi/tasks/schemas.py` e incluyen:

- Esquemas base (Base)
- Esquemas de creación (Create)
- Esquemas de respuesta con metadatos (incluyen `id`, `created_at`, `updated_at`)

Cada modelo tiene sus correspondientes esquemas para operaciones CRUD a través de la API REST.
