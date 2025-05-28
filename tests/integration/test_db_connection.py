import logging
import os

import psycopg2
import pytest
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(project_root, ".env"))

POSTGRES_HOST = "localhost"
POSTGRES_PORT = 5432
REQUIRED_TABLES = ["categoria", "tarea", "planificacion_tarea"]

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")

SUPABASE_url = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


@pytest.mark.usefixtures("docker_postgres_service")
def test_local_db_connection():
    missing_env_vars = []
    if not POSTGRES_USER:
        missing_env_vars.append("POSTGRES_USER")
    if not POSTGRES_PASSWORD:
        missing_env_vars.append("POSTGRES_PASSWORD")
    if not POSTGRES_DB:
        missing_env_vars.append("POSTGRES_DB")

    if missing_env_vars:
        pytest.fail(f"Faltan las siguientes variables de entorno: {', '.join(missing_env_vars)}")

    logging.info(
        f"Conectando a la base de datos {POSTGRES_DB} en {POSTGRES_HOST}:{POSTGRES_PORT}..."
    )
    try:
        with psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            dbname=POSTGRES_DB,
            connect_timeout=10,
        ) as conn:
            with conn.cursor() as cur:
                logging.info(f"Verificando las tablas requeridas: {', '.join(REQUIRED_TABLES)}")
                cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
                tables = [row[0] for row in cur.fetchall()]
                missing_tables = set(REQUIRED_TABLES) - set(tables)
                assert not missing_tables, (
                    "Faltan tablas requeridas en la base de datos local: "
                    f"{', '.join(missing_tables)}"
                )
                logging.info(
                    "Todas las tablas requeridas están presentes en la base de datos local."
                )

    except psycopg2.OperationalError as e:
        pytest.fail(f"Error de conexión a la base de datos local: {e}")
    except psycopg2.DatabaseError as e:
        pytest.fail(f"Error de base de datos: {e}")
    except Exception as e:
        pytest.fail(f"Error inesperado durante la prueba de DB local: {e}")


def test_supabase_connection():
    missing_env_vars = []
    if not SUPABASE_url:
        missing_env_vars.append("SUPABASE_URL")
    if not SUPABASE_KEY:
        missing_env_vars.append("SUPABASE_KEY")

    if missing_env_vars:
        pytest.fail(f"Faltan las siguientes variables de entorno: {', '.join(missing_env_vars)}")

    logging.info("Conectando a Supabase...")
    try:
        from supabase import Client, create_client

        supabase: Client = create_client(SUPABASE_url, SUPABASE_KEY)
        logging.info("Conexión a Supabase exitosa.")
        # Verificar si las tablas requeridas existen
        logging.info(f"Verificando las tablas requeridas en Supabase: {', '.join(REQUIRED_TABLES)}")
        for table in REQUIRED_TABLES:
            # Seleccionamos una fila de la tabla para verificar su existencia
            supabase.table(table).select("id").limit(0).execute()
        logging.info("Todas las tablas requeridas están presentes en Supabase.")
    except Exception as e:
        pytest.fail(f"Error al conectar a Supabase: {e}")
