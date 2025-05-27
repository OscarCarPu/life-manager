import logging
import os
import subprocess

import pytest
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(project_root, ".env"))

POSTGRES_SERVICE = "db-local"


def run_command(command):
    subprocess.run(command, check=True, text=True, capture_output=True)


@pytest.fixture(scope="session")
def docker_postgres_service():
    logging.info(f"Iniciando el contenedor {POSTGRES_SERVICE}...")
    try:
        run_command(["docker", "compose", "up", "-d", "--wait", POSTGRES_SERVICE])
        yield
    except Exception as e:
        logging.error(f"Error al iniciar el servicio Docker: {e}")
        pytest.fail(f"No se pudo iniciar el servicio Docker PostgreSQL: {e}")
    finally:
        logging.info(f"Deteniendo el contenedor {POSTGRES_SERVICE}...")
        subprocess.run(
            ["docker", "compose", "down", "-v", POSTGRES_SERVICE],
            check=False,
            text=True,
            capture_output=True,
        )
        logging.info("Contenedor detenido y volúmenes eliminados.")
