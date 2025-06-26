from django.urls import path, re_path

from . import views

urlpatterns = [
    # Calendar URL
    path("", views.CalendarView.as_view(), name="calendar"),
    # Tree URL
    path("tree/", views.TreeView.as_view(), name="tree"),
    path("tree/categories-block/", views.CategoryBlockView.as_view(), name="category_block"),
    re_path(
        r"^tree/categories/create/(?:(?P<parent_id>\d+)/)?$",
        views.CategoryModalFormView.as_view(),
        name="category_create",
    ),
    path(
        "tree/categories/<int:id>/edit/",
        views.CategoryModalFormView.as_view(),
        name="category_edit_modal",
    ),
    path(
        "categories/<int:id>/delete-modal/",
        views.CategoryDeleteModalView.as_view(),
        name="category_delete_modal",
    ),
    path(
        "tree/categories/<int:category_id>/projects/create/",
        views.ProjectCreateModalView.as_view(),
        name="project_create_modal",
    ),
]
