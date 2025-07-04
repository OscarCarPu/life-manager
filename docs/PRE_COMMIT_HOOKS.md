# Guía de Pre-commit Hooks

## Cómo Usar

**Requisitos:**

- Tener instalado [pre-commit](https://pre-commit.com/):
- Se recomienda utilizar un entorno virtual de Python.

```bash
pip install pre-commit
```

**Instalación:**

```bash
pre-commit install
```

**Ejecutar Hooks Manualmente:**

```bash
pre-commit run --all-files
pre-commit run <hook_id> --all-files
pre-commit run # Solo lo ejecuta en los archivos modificados
```

## Hooks Generales

- `pre-commit-hooks`: Incluye varios hooks útiles para la limpieza y verificación de archivos.
  - `trailing-whitespace`: Elimina espacios en blanco al final de las líneas.
  - `end-of-file-fixer`: Asegura que el archivo termine con una nueva línea.
  - `check-yaml`: Verifica la validez de los archivos YAML.
  - `check-added-large-files`: Evita añadir archivos grandes al repositorio.
  - `check-case-conflict`: Verifica conflictos de mayúsculas y minúsculas en los nombres de archivos.
  - `detect-private-key`: Detecta claves privadas en los archivos.
- `detect-secrets`: Detecta secretos en los archivos, tiene un [.secrets.baseline](../.secrets.baseline) para ignorar secretos conocidos.
- `prettier`: Formatea el código con Prettier.

## Hooks de Python

- `flake8`: Verifica el estilo del código Python.
- `isort`: Ordena las importaciones de Python.
- `black`: Formatea el código Python.

## Hooks de SQL

- `sqlfluff`: Contiene un [`.sqlfluff`](../.sqlfluff) para configuraciones personalizadas.
  - `sqlfluff-fix`: Verifica el estilo y la sintaxis de los archivos SQL.
  - `sqlfluff-lint`: Ejecuta `sqlfluff` en modo de linting.
