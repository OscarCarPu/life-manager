from datetime import date, timedelta
from http import HTTPStatus

from django.db import IntegrityError
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views.generic import TemplateView, View

from .forms import CategoryForm, ProjectForm
from .models import Category, Project, TaskPlanning


class TreeView(View):
    template_name = "tree.html"

    def get(self, request):
        return render(request, self.template_name)


# Tree Utils Views


class CategoryBlockView(TemplateView):
    template_name = "components/tree/block.html"

    def _get_category_tree(self, categories):
        tree_nodes = {
            category.id: {"category": category, "subcategories": []} for category in categories
        }
        root_nodes = []
        for category in categories:
            if category.parent_category is None:
                root_nodes.append(tree_nodes[category.id])
            else:
                parent_id = category.parent_category.id
                if parent_id in tree_nodes:
                    tree_nodes[parent_id]["subcategories"].append(tree_nodes[category.id])

        def sort_nodes(nodes):
            nodes.sort(key=lambda x: x["category"].name.lower())
            for node in nodes:
                sort_nodes(node["subcategories"])

        sort_nodes(root_nodes)

        return root_nodes

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        categories = (
            Category.objects.select_related("parent_category")
            .prefetch_related("subcategories")
            .all()
        )
        context["nodes"] = self._get_category_tree(categories)
        return context


class CategoryModalFormView(View):
    template_name = "components/modals/category_form_modal.html"

    def get(self, request, *args, **kwargs):
        parent_id = kwargs.get("parent_id")
        category_id = kwargs.get("id")
        context = {}
        category = None
        parent_category = None

        if category_id:
            category = get_object_or_404(Category, id=category_id)
            form = CategoryForm(instance=category)
        else:
            if parent_id:
                parent_category = get_object_or_404(Category, id=parent_id)
                form = CategoryForm(initial={"parent_category": parent_category})
            else:
                form = CategoryForm()

        context["form"] = form
        context["category"] = category
        context["parent_category"] = parent_category
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        parent_id = kwargs.get("parent_id")
        category_id = kwargs.get("id")
        category = None
        parent_category = None

        if parent_id:
            parent_category = get_object_or_404(Category, id=parent_id)
        if category_id:
            category = get_object_or_404(Category, id=category_id)

        form_data = request.POST.copy()
        if parent_category and not category_id:
            form_data["parent_category"] = parent_category.id

        form = CategoryForm(form_data, instance=category)

        if form.is_valid():
            try:
                form.save()
                response = HttpResponse("")
                response["HX-Redirect"] = reverse("tree")
                return response
            except IntegrityError:
                form.add_error(None, "An unexpected database error occurred. Please try again.")
        context = {
            "form": form,
            "category": category,
            "parent_category": parent_category,
        }
        return render(request, self.template_name, context)


class ProjectCreateModalView(View):
    template_name = "components/modals/new_project_modal.html"

    def get(self, request, category_id, *args, **kwargs):
        category = get_object_or_404(Category, id=category_id)
        form = ProjectForm(initial={"category": category})
        context = {"form": form, "category": category}
        return render(request, self.template_name, context)

    def post(self, request, category_id, *args, **kwargs):
        category = get_object_or_404(Category, id=category_id)
        form = ProjectForm(request.POST)

        if form.is_valid():
            try:
                form.save()
                response = HttpResponse("")
                response["HX-Redirect"] = reverse("tree")
                return response
            except IntegrityError:
                form.add_error(None, "A project with this name already exists.")

        context = {"form": form, "category": category}
        return render(request, self.template_name, context)


class CategoryDeleteModalView(View):
    template_name = "components/modals/delete_modal.html"

    def get(self, request, id, *args, **kwargs):
        """Handle modal rendering"""
        try:
            category = get_object_or_404(Category, id=id)
        except Http404:
            return HttpResponse("Category not found.", status=HTTPStatus.NOT_FOUND)

        context = {"category": category}
        return render(request, self.template_name, context)

    def post(self, request, id, *args, **kwargs):
        """Handle post deletion request"""
        try:
            category = get_object_or_404(Category, id=id)
        except Http404:
            response = HttpResponse("Category not found.", status=HTTPStatus.NOT_FOUND)
            response["HX-Trigger"] = "closeModal"
            return response

        category.delete()
        response = HttpResponse("")
        response["HX-Redirect"] = reverse("tree")
        return response


# Project View
class ProjectView(View):
    template_name = "project.html"

    def get(self, request, id):
        project = get_object_or_404(Project.objects.prefetch_related("tasks"), id=id)

        category_path = []
        if project.category:
            current_category = project.category
            while current_category:
                category_path.insert(0, current_category)
                current_category = current_category.parent_category

        context = {
            "project": project,
            "category_path": category_path,
        }
        return render(request, self.template_name, context)


class TaskCreateModalView(View):
    pass


class TaskEditModalView(View):
    pass


class TaskDeleteModalView(View):
    pass


# Calendar View
class CalendarView(View):
    template_name = "calendar.html"

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
