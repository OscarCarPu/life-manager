# Tests

Esta carpeta contiene los tests del proyecto. Se organizan en subcarpetas según el tipo o módulo que se este probando

En la raíz del proyecto están ubicado [pytest.ini](../pytest.ini) y [dev-requirements.txt](../dev-requirements.txt) que contienen la configuración de pytest y las dependencias necesarias para ejecutar los tests.

## Estructura de la carpeta de tests

- `integration/`: Tests de integración que verifican la interacción entre diferentes módulos del sistema.

### Integration Tests

    - [`test_db_connection`](integration/test_db_connection.py): Verifica la conexión a la base de datos y la creación de tablas.
