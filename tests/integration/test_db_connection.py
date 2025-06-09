import os

import psycopg2
import pytest
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(project_root, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_PSQL_NAME = os.getenv("SUPABASE_PSQL_NAME")
SUPABASE_PSQL_USER = os.getenv("SUPABASE_PSQL_USER")
SUPABASE_PSQL_PASSWORD = os.getenv("SUPABASE_PSQL_PASSWORD")
SUPABASE_PSQL_HOST = os.getenv("SUPABASE_PSQL_HOST")
SUPABASE_PSQL_PORT = os.getenv("SUPABASE_PSQL_PORT")

REQUIRED_TABLES = ["categoria", "tarea", "planificacion_tarea"]


def test_supabase_connection():
    missing_env_vars = []
    if not SUPABASE_URL:
        missing_env_vars.append("SUPABASE_URL")
    if not SUPABASE_KEY:
        missing_env_vars.append("SUPABASE_KEY")

    if missing_env_vars:
        pytest.fail(f"Faltan las siguientes variables de entorno: {', '.join(missing_env_vars)}")

    try:
        from supabase import Client, create_client

        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        supabase.auth.get_session()
    except Exception as e:
        pytest.fail(f"Error al conectar a Supabase: {e}")


def test_psql_connection():
    missing_env_vars = []
    if not SUPABASE_PSQL_NAME:
        missing_env_vars.append("SUPABASE_PSQL_NAME")
    if not SUPABASE_PSQL_USER:
        missing_env_vars.append("SUPABASE_PSQL_USER")
    if not SUPABASE_PSQL_PASSWORD:
        missing_env_vars.append("SUPABASE_PSQL_PASSWORD")
    if not SUPABASE_PSQL_HOST:
        missing_env_vars.append("SUPABASE_PSQL_HOST")
    if not SUPABASE_PSQL_PORT:
        missing_env_vars.append("SUPABASE_PSQL_PORT")

    if missing_env_vars:
        pytest.fail(f"Faltan las siguientes variables de entorno: {', '.join(missing_env_vars)}")

    try:
        conn = psycopg2.connect(
            dbname=SUPABASE_PSQL_NAME,
            user=SUPABASE_PSQL_USER,
            password=SUPABASE_PSQL_PASSWORD,
            host=SUPABASE_PSQL_HOST,
            port=SUPABASE_PSQL_PORT,
        )
        cur = conn.cursor()
        cur.execute("SELECT 1")
        result = cur.fetchone()
        assert result[0] == 1
        conn.close()
    except Exception as e:
        pytest.fail(f"Error al conectar a la base de datos PostgreSQL: {e}")
