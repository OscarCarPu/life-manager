from django.urls import path

from . import views

urlpatterns = [
    # Calendar URL
    path("", views.CalendarView.as_view(), name="calendar"),
    # Tree URL
    path("tree/", views.TreeView.as_view(), name="tree"),
    path("tree/categories-block/", views.CategoryBlockView.as_view(), name="category_block"),
    path(
        "categories/<int:id>/delete-modal/",
        views.CategoryDeleteModalView.as_view(),
        name="category_delete_modal",
    ),
]
