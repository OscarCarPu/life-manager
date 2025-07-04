import sys
from pathlib import Path

from decouple import config

IS_TESTING = "test" in sys.argv  # For testing database managed

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY", default="123456")

DEBUG = config("STAGE", default="dev") == "dev"

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*").split(",")

INSTALLED_APPS = [
    "tasks",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.contenttypes",
    "django_bootstrap5",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

ROOT_URLCONF = "life_manager.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "tasks" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "life_manager.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("SUPABASE_PSQL_NAME", default="postgres"),
        "USER": config("SUPABASE_PSQL_USER", default="postgres"),
        "PASSWORD": config("SUPABASE_PSQL_PASSWORD", default="postgres"),
        "HOST": config("SUPABASE_PSQL_HOST", default="localhost"),
        "PORT": config("SUPABASE_PSQL_PORT", default="54322"),
    }
}

LANGUAGE_CODE = "es-es"
TIME_ZONE = "Europe/Madrid"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"

STATICFILES_DIRS = [
    BASE_DIR / "tasks" / "static",
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

INTERNAL_IPS = ["127.0.0.1"]
