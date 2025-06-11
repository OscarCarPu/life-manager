from datetime import date, timedelta

from django.shortcuts import render
from django.views.generic import View

from .models import Category, TaskPlanning

# Tree View


class TreeView(View):
    template_name = "tree.html"

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

    def get(self, request):
        categories = (
            Category.objects.select_related("parent_category").prefetch_related("projects").all()
        )
        root_categories = self._get_category_tree(categories)
        context = {"root_categories": root_categories}
        return render(request, self.template_name, context)


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
