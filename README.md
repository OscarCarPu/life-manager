# Life Manager

Este proyecto actuará de cerebro de mi sistema de seguimiento personal y domótica.
La elección de tecnologías se basa en mi interés por aprender y explorar esas herramientas.
Cada módulo estará aislado del resto, permitiendo un código más limpio y fácil de mantener.

**Estructura del proyecto:**

- `backend/`: Aquí ersidirá toda la lógica del backend.
- `common/`: Aquí se guardarán módulos comunes y reutilizables en todo el proyecto
- `database/`: Contendrá los archivos `.sql` que defninen la estructura de la base de datos.
- `docs/`: Aquí se guardará la documentación del proyecto, desde arquitectura, diseño y guías de uso.
- `frontend/`: Aquí estará el frontend del proyecto.
- `hardware/`: Aquí estarán los esquemas y el código de los dispositivos de hardware.
- `scripts/`: Colección de scripts útiles para automatizar tareas de desarrollo y despliegue
- `tests/`: Tests para asegurar que todo el código funciona correctamente.

**Archivos importantes:**

- `docker-compose.yaml`: docker-compose para levantar el proyecto entero.
- `.pre-commit-config.yaml`: Configuración de pre-commit para asegurar que el código cumple con los estándares de calidad.
