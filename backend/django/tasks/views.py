from datetime import date, timedelta
from http import HTTPStatus

from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import TemplateView, View

from .models import Category, TaskPlanning


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


class CategoryDeleteModalView(View):
    template_name = "components/tree/delete_modal.html"

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
        response["HX-Redirect"] = "/tree/"
        return response


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
