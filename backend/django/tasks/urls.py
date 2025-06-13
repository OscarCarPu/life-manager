from django.urls import path

from . import views

urlpatterns = [
    # Calendar URL
    path("", views.CalendarView.as_view(), name="calendar"),
    # Tree URL
    path("tree/", views.TreeView.as_view(), name="tree"),
    path("base", views.BaseView.as_view(), name="base"),
]
