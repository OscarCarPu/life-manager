from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [path("", include("tasks.urls"))]

# Explicitly add static files serving for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
