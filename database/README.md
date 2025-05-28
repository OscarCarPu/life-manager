# Database

Esta carpeta contiene todos los archivos relacionados con la base de datos del proyecto.

## Estructura

- `000_general.sql`: Define funciones generales de la base de datos,
- `001_tareas_schema.sql`: Define las tablas (`categoria`, `tarea`, `planificacion_tarea`)
- `002_tareas_seed.sql`: Inserta datos de ejemplo en las tablas del módulo de gestión de tareas, como categorías y tareas predefinidas.
- `999_flag_healthcheck.sql`: Script SQL utilizado para verificar el estado de la base de datos. Crea un esquema y una tabla específicos que indican que la base de datos se ha inicializado correctamente.
