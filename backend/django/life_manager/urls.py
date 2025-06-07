from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path


def redirect_to_tasks(request):
    return redirect("/tasks/")


urlpatterns = [
    path("", redirect_to_tasks),  # Redirect root to tasks
    path("tasks/", include("tasks.urls")),
]
