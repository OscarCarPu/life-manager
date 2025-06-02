import logging
import os

import pytest
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(project_root, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

REQUIRED_TABLES = ["categoria", "tarea", "planificacion_tarea"]


def test_supabase_connection():
    missing_env_vars = []
    if not SUPABASE_URL:
        missing_env_vars.append("SUPABASE_URL")
    if not SUPABASE_KEY:
        missing_env_vars.append("SUPABASE_KEY")

    if missing_env_vars:
        pytest.fail(f"Faltan las siguientes variables de entorno: {', '.join(missing_env_vars)}")

    logging.info("Conectando a Supabase...")
    try:
        from supabase import Client, create_client

        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logging.info("Conexión a Supabase exitosa.")
        # Verificar si las tablas requeridas existen
        logging.info(f"Verificando las tablas requeridas en Supabase: {', '.join(REQUIRED_TABLES)}")
        for table in REQUIRED_TABLES:
            # Seleccionamos una fila de la tabla para verificar su existencia
            supabase.table(table).select("id").limit(0).execute()
        logging.info("Todas las tablas requeridas están presentes en Supabase.")
    except Exception as e:
        pytest.fail(f"Error al conectar a Supabase: {e}")
