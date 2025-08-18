# Supabase

Esta carpeta contiene los archivos SQL que definen la estructura de la base de datos PostgreSQL usando Supabase.

## Estructura

- `migrations/`: Archivos de migración de la base de datos
  - `20250807082808_general.sql`: Funciones y triggers generales
  - `20250807082825_tareas.sql`: Tablas específicas del sistema de tareas
- `schema/`: Esquemas fijos de la base de datos
  - `general.sql`: Funciones base y utilidades
  - `tareas.sql`: Definición de tablas para el sistema de gestión de tareas
- `seed.sql`: Datos de ejemplo para desarrollo local

## Tablas Principales

### Sistema de Tareas
- `category`: Categorías jerárquicas para organizar proyectos
- `project`: Proyectos con estados y fechas
- `task`: Tareas individuales con estados y fechas límite
- `task_planning`: Planificación de tareas en fechas específicas
- `note`: Notas asociadas a proyectos o tareas

## Estados y Enums

### Estados de Proyecto
- `not_started`: No iniciado
- `in_progress`: En progreso
- `completed`: Completado
- `archived`: Archivado

### Estados de Tarea
- `pending`: Pendiente
- `in_progress`: En progreso
- `completed`: Completada
- `archived`: Archivada

## Funcionalidades de Base de Datos

- **Triggers automáticos**: Actualización de `updated_at` en todas las tablas
- **Restricciones de integridad**: Validación de estados y prioridades
- **Claves foráneas**: Relaciones entre tablas con CASCADE/RESTRICT apropiados
- **Índices**: Optimización de consultas en campos frecuentemente usados
