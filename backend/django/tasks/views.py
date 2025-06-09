from datetime import date, timedelta

from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    ListView,
    UpdateView,
    View,
)

from .models import Category, Task, TaskPlanning


# Tree View
class TreeView(View):
    template_name = "tree.html"

    def get(self, request):
        today = date.today()
        days_to_show = 4

        daily_schedules = []
        for i in range(days_to_show):
            current_date = today + timedelta(days=i)
            plannings_for_day = (
                TaskPlanning.objects.filter(planned_date=current_date)
                .select_related("task")
                .order_by("start_hour", "priority")
            )
            daily_schedules.append({"date": current_date, "plannings": plannings_for_day})

        context = {"daily_schedules": daily_schedules}
        return render(request, self.template_name, context)


# Category Views
class CategoryListView(ListView):
    model = Category
    template_name = "category/list.html"
    context_object_name = "categories"


class CategoryDetailView(DetailView):
    model = Category
    template_name = "category/detail.html"
    context_object_name = "category"


class CategoryCreateView(CreateView):
    model = Category
    fields = ["name", "description", "parent_category"]
    template_name = "category/form.html"
    success_url = reverse_lazy("category-list")


class CategoryUpdateView(UpdateView):
    model = Category
    fields = ["name", "description", "parent_category"]
    template_name = "category/form.html"
    success_url = reverse_lazy("category-list")


class CategoryDeleteView(DeleteView):
    model = Category
    template_name = "category/confirm_delete.html"
    success_url = reverse_lazy("category-list")


# Task Views
class TaskListView(ListView):
    model = Task
    template_name = "task/list.html"
    context_object_name = "tasks"


class TaskDetailView(DetailView):
    model = Task
    template_name = "task/detail.html"
    context_object_name = "task"


class TaskCreateView(CreateView):
    model = Task
    fields = ["title", "due_date", "description", "category", "state"]  # Closed the list
    template_name = "task/form.html"
    success_url = reverse_lazy("task-list")


class TaskUpdateView(UpdateView):
    model = Task
    fields = ["title", "due_date", "description", "category", "state"]  # Closed the list
    template_name = "task/form.html"
    success_url = reverse_lazy("task-list")


class TaskDeleteView(DeleteView):
    model = Task
    template_name = "task/confirm_delete.html"
    success_url = reverse_lazy("task-list")


# TaskPlanning Views
class TaskPlanningListView(ListView):
    model = TaskPlanning
    template_name = "taskplanning/list.html"
    context_object_name = "task_plannings"


class TaskPlanningDetailView(DetailView):
    model = TaskPlanning
    template_name = "taskplanning/detail.html"
    context_object_name = "task_planning"


class TaskPlanningCreateView(CreateView):
    model = TaskPlanning
    fields = ["task", "planned_date", "start_hour", "end_hour", "priority"]
    template_name = "taskplanning/form.html"
    success_url = reverse_lazy("taskplanning-list")


class TaskPlanningUpdateView(UpdateView):
    model = TaskPlanning
    fields = ["task", "planned_date", "start_hour", "end_hour", "priority"]
    template_name = "taskplanning/form.html"
    success_url = reverse_lazy("taskplanning-list")


class TaskPlanningDeleteView(DeleteView):
    model = TaskPlanning
    template_name = "taskplanning/confirm_delete.html"
    success_url = reverse_lazy("taskplanning-list")
