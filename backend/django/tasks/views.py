from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, View
from django.shortcuts import render
from django.urls import reverse_lazy
from .models import Category, Task, TaskPlanning

# Home View
class HomeView(View):
    template_name = 'home.html'

    def get(self, request):
        return render(request, self.template_name)

# Category Views
class CategoryListView(ListView):
    model = Category
    template_name = 'category/list.html' 
    context_object_name = 'categories'

class CategoryDetailView(DetailView):
    model = Category
    template_name = 'category/detail.html'
    context_object_name = 'category'

class CategoryCreateView(CreateView):
    model = Category
    fields = ['name', 'description', 'parent_category']
    template_name = 'category/form.html'
    success_url = reverse_lazy('category-list')

class CategoryUpdateView(UpdateView):
    model = Category
    fields = ['name', 'description', 'parent_category']
    template_name = 'category/form.html'
    success_url = reverse_lazy('category-list')

class CategoryDeleteView(DeleteView):
    model = Category
    template_name = 'category/confirm_delete.html'
    success_url = reverse_lazy('category-list')

# Task Views
class TaskListView(ListView):
    model = Task
    template_name = 'task/list.html'
    context_object_name = 'tasks'

class TaskDetailView(DetailView):
    model = Task
    template_name = 'task/detail.html'
    context_object_name = 'task'

class TaskCreateView(CreateView):
    model = Task
    fields = ['title', 'due_date', 'description', 'category', 'state']
    template_name = 'task/form.html'
    success_url = reverse_lazy('task-list')

class TaskUpdateView(UpdateView):
    model = Task
    fields = ['title', 'due_date', 'description', 'category', 'state']
    template_name = 'task/form.html'
    success_url = reverse_lazy('task-list')

class TaskDeleteView(DeleteView):
    model = Task
    template_name = 'task/confirm_delete.html'
    success_url = reverse_lazy('task-list')

# TaskPlanning Views
class TaskPlanningListView(ListView):
    model = TaskPlanning
    template_name = 'taskplanning/list.html'
    context_object_name = 'task_plannings'

class TaskPlanningDetailView(DetailView):
    model = TaskPlanning
    template_name = 'taskplanning/detail.html'
    context_object_name = 'task_planning'

class TaskPlanningCreateView(CreateView):
    model = TaskPlanning
    fields = ['task', 'planned_date', 'start_hour', 'end_hour', 'priority']
    template_name = 'taskplanning/form.html'
    success_url = reverse_lazy('taskplanning-list')

class TaskPlanningUpdateView(UpdateView):
    model = TaskPlanning
    fields = ['task', 'planned_date', 'start_hour', 'end_hour', 'priority']
    template_name = 'taskplanning/form.html'
    success_url = reverse_lazy('taskplanning-list')

class TaskPlanningDeleteView(DeleteView):
    model = TaskPlanning
    template_name = 'taskplanning/confirm_delete.html'
    success_url = reverse_lazy('taskplanning-list')


