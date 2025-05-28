# Enfoque por features

Se desarrollará a base de features.

- **Planificación**: Antes de incluso crear la rama, se planificará la feature. Se definirá qué se quiere conseguir y cómo se va a hacer.
- **Rama dedicada**: Se creará una rama dedicada al feature. `feature/<nombre_feature>`.
- **Merge al finalizar**

Esto permitirá el desarrollo de cada feature de forma independiente y sin interferir en el desarrollo de otras features.

# Testing

A parte de los [hooks](PRE_COMMIT_HOOKS.md) que se ejecutan al hacer commit, se ejecutaran los tests desde la raíz del proyecto.

Hará falta installar las dependencias de desarrollo:

```bash
pip install -r dev-requirements.txt
pytest tests/
```
