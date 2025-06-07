from django.urls import path

from . import views

urlpatterns = [
    # Calendar View
    path("", views.calendar_view, name="calendar_view"),
    path("calendar/<str:date_str>/", views.calendar_daily_view, name="calendar_daily_view"),
    path(
        "planning/create/<str:planned_date>/",
        views.planning_create_form,
        name="planning_create_form",
    ),
    path("planning/edit/<int:pk>/", views.planning_edit_form, name="planning_edit_form"),
    path("planning/delete/<int:pk>/", views.planning_delete, name="planning_delete"),
    # Tree View
    path("tree/", views.tree_view, name="tree_view"),
    path("category/<int:pk>/details/", views.category_details_view, name="category_details_view"),
    path("category/create/", views.category_create_form, name="category_create_form"),
    path(
        "category/create/<int:parent_id>/",
        views.category_create_form,
        name="category_create_form_with_parent",
    ),
    path("category/edit/<int:pk>/", views.category_edit_form, name="category_edit_form"),
    path("category/delete/<int:pk>/", views.category_delete, name="category_delete"),
    path("task/create/", views.task_create_form, name="task_create_form"),
    path(
        "task/create/<int:category_id>/",
        views.task_create_form,
        name="task_create_form_with_category",
    ),
    path("task/edit/<int:pk>/", views.task_edit_form, name="task_edit_form"),
    path("task/delete/<int:pk>/", views.task_delete, name="task_delete"),
]
