from django.urls import path

from . import views

urlpatterns = [
    # Tree URL
    path("", views.TreeView.as_view(), name="tree"),
    # Category URLs
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("categories/<int:pk>/", views.CategoryDetailView.as_view(), name="category-detail"),
    path("categories/create/", views.CategoryCreateView.as_view(), name="category-create"),
    path("categories/<int:pk>/update/", views.CategoryUpdateView.as_view(), name="category-update"),
    path("categories/<int:pk>/delete/", views.CategoryDeleteView.as_view(), name="category-delete"),
    # Task URLs
    path("tasks/", views.TaskListView.as_view(), name="task-list"),
    path("tasks/<int:pk>/", views.TaskDetailView.as_view(), name="task-detail"),
    path("tasks/create/", views.TaskCreateView.as_view(), name="task-create"),
    path("tasks/<int:pk>/update/", views.TaskUpdateView.as_view(), name="task-update"),
    path("tasks/<int:pk>/delete/", views.TaskDeleteView.as_view(), name="task-delete"),
    # TaskPlanning URLs
    path("plannings/", views.TaskPlanningListView.as_view(), name="taskplanning-list"),
    path("plannings/<int:pk>/", views.TaskPlanningDetailView.as_view(), name="taskplanning-detail"),
    path("plannings/create/", views.TaskPlanningCreateView.as_view(), name="taskplanning-create"),
    path(
        "plannings/<int:pk>/update/",
        views.TaskPlanningUpdateView.as_view(),
        name="taskplanning-update",
    ),
    path(
        "plannings/<int:pk>/delete/",
        views.TaskPlanningDeleteView.as_view(),
        name="taskplanning-delete",
    ),
]
