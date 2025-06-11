from datetime import date, timedelta

from django.shortcuts import render
from django.views.generic import View

from .models import Category, TaskPlanning

# Tree View


class TreeView(View):
    template_name = "tree.html"

    def get(self, request):
        # Fetch root categories and subcategories
        categories = Category.objects.filter(parent_category__isnull=True).prefetch_related(
            "subcategories"
        )
        context = {"categories": categories}
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
