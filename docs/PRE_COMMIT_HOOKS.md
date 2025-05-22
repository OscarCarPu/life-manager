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

## Hooks Configurados

- `trailing-whitespace`: Elimina espacios en blanco al final de las líneas.
- `end-of-file-fixer`: Asegura que el archivo termine con una nueva línea.
- `check-yaml`: Verifica la validez de los archivos YAML.
- `check-added-large-files`: Evita añadir archivos grandes al repositorio.
- `check-case-conflict`: Verifica conflictos de mayúsculas y minúsculas en los nombres de archivos.
- `detect-private-key`: Detecta claves privadas en los archivos.
- `detect-secrets`: Detecta secretos en los archivos.
- `prettier`: Formatea el código con Prettier.
