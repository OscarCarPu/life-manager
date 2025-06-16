from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.urls import include, path


def health_check(request):
    return HttpResponse("OK")


urlpatterns = [path("", include("tasks.urls")), path("health/", health_check, name="health_check")]

# Explicitly add static files serving for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
