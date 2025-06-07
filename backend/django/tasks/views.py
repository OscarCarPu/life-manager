from datetime import date, timedelta

from django.db import IntegrityError
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods

from .models import Category, Task, TaskPlanning

# region General Views


def calendar_view(request):
    """
    Vista principal del calendario que muestra el día actual y los próximos 13 días (total 14 días).
    """
    today = date.today()
    days = []

    # Generar 14 días consecutivos empezando desde hoy
    for i in range(14):
        current_date = today + timedelta(days=i)
        days.append(
            {
                "date_obj": current_date,
                "date_str": current_date.strftime("%Y-%m-%d"),
                "day_name": current_date.strftime("%A"),
                "day_number": current_date.day,
                "month_name": current_date.strftime("%B"),
                "is_today": current_date == today,
                "plannings": TaskPlanning.objects.filter(planned_date=current_date).order_by(
                    "start_hour", "priority"
                ),
            }
        )

    context = {"today": today, "days": days}
    return render(request, "calendar.html", context)


def tree_view(request):
    """
    Simple tree view: shows root categories, expandable to subcategories and tasks.
    """
    root_categories = Category.objects.filter(parent_category__isnull=True).order_by("name")
    return render(request, "tree.html", {"categories": root_categories})


# endregion

# region Calendar HTMX Views


@require_http_methods(["GET"])
def calendar_daily_view(request, date_str):
    try:
        selected_date = date.fromisoformat(date_str)
    except ValueError:
        return HttpResponseBadRequest("Invalid date format")

    plannings = TaskPlanning.objects.filter(planned_date=selected_date).order_by(
        "start_hour", "priority"
    )
    return render(
        request,
        "components/daily_planning_list.html",
        {"plannings": plannings, "selected_date": selected_date},
    )


@require_http_methods(["GET", "POST"])
def planning_create_form(request, planned_date):
    try:
        selected_date_obj = date.fromisoformat(planned_date)
    except ValueError:
        return HttpResponseBadRequest("Invalid date format for planned_date")

    if request.method == "POST":
        task_id = request.POST.get("task")
        start_hour = request.POST.get("start_hour")
        end_hour = request.POST.get("end_hour")
        priority = request.POST.get("priority")

        task = get_object_or_404(Task, id=task_id)

        try:
            planning = TaskPlanning.objects.create(
                task=task,
                planned_date=selected_date_obj,
                start_hour=start_hour if start_hour else None,
                end_hour=end_hour if end_hour else None,
                priority=int(priority) if priority else None,
            )
            return render(request, "components/planning_item.html", {"planning": planning})
        except IntegrityError:
            return HttpResponseBadRequest("Planning already exists for this task at this time")
        except Exception as e:
            return HttpResponseBadRequest(f"Error creating planning: {str(e)}")

    tasks = Task.objects.all().order_by("title")
    context = {
        "selected_date": selected_date_obj,
        "tasks": tasks,
    }
    return render(request, "components/planning_create_form.html", context)


@require_http_methods(["GET", "POST"])
def planning_edit_form(request, pk):
    planning = get_object_or_404(TaskPlanning, pk=pk)

    if request.method == "POST":
        task_id = request.POST.get("task")
        start_hour = request.POST.get("start_hour")
        end_hour = request.POST.get("end_hour")
        priority = request.POST.get("priority")
        planned_date_str = request.POST.get("planned_date")

        planning.task = get_object_or_404(Task, id=task_id)
        planning.planned_date = date.fromisoformat(planned_date_str)
        planning.start_hour = start_hour if start_hour else None
        planning.end_hour = end_hour if end_hour else None
        planning.priority = int(priority) if priority else None

        try:
            planning.save()
            return render(request, "components/planning_item.html", {"planning": planning})
        except IntegrityError:
            return HttpResponseBadRequest("Planning already exists for this task at this time")
        except Exception as e:
            return HttpResponseBadRequest(f"Error updating planning: {str(e)}")

    tasks = Task.objects.all().order_by("title")
    context = {
        "planning": planning,
        "tasks": tasks,
    }
    return render(request, "components/planning_edit_form.html", context)


@require_http_methods(["DELETE"])
def planning_delete(request, pk):
    planning = get_object_or_404(TaskPlanning, pk=pk)
    planning.delete()
    return HttpResponse("")  # Empty response signifies success for HTMX


# endregion

# region Tree HTMX Views


@require_http_methods(["GET"])
def category_details_view(request, pk):
    category = get_object_or_404(Category, pk=pk)
    tasks = Task.objects.filter(category=category).order_by("title")
    return render(
        request, "components/category_details.html", {"category": category, "tasks": tasks}
    )


@require_http_methods(["GET", "POST"])
def category_create_form(request, parent_id=None):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")
        parent_category = None

        if parent_id:
            parent_category = get_object_or_404(Category, id=parent_id)

        try:
            category = Category.objects.create(
                name=name,
                description=description if description else None,
                parent_category=parent_category,
            )
            return render(request, "components/category_node.html", {"category": category})
        except IntegrityError:
            return HttpResponseBadRequest("Category name already exists")
        except Exception as e:
            return HttpResponseBadRequest(f"Error creating category: {str(e)}")

    parent_category = None
    if parent_id:
        parent_category = get_object_or_404(Category, id=parent_id)

    context = {"parent_category": parent_category}
    return render(request, "components/category_create_form.html", context)


@require_http_methods(["GET", "POST"])
def category_edit_form(request, pk):
    category = get_object_or_404(Category, pk=pk)

    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")
        parent_id = request.POST.get("parent_category")

        category.name = name
        category.description = description if description else None

        if parent_id:
            category.parent_category = get_object_or_404(Category, id=parent_id)
        else:
            category.parent_category = None

        try:
            category.save()
            return render(request, "components/category_node.html", {"category": category})
        except IntegrityError:
            return HttpResponseBadRequest("Category name already exists")
        except Exception as e:
            return HttpResponseBadRequest(f"Error updating category: {str(e)}")

    categories = Category.objects.exclude(id=category.id).order_by("name")
    context = {
        "category": category,
        "categories": categories,
    }
    return render(request, "components/category_edit_form.html", context)


@require_http_methods(["DELETE"])
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    category.delete()
    return HttpResponse("")


@require_http_methods(["GET", "POST"])
def task_create_form(request, category_id=None):
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        due_date_str = request.POST.get("due_date")
        state = request.POST.get("state")

        category = None
        if category_id:
            category = get_object_or_404(Category, id=category_id)

        try:
            task = Task.objects.create(
                title=title,
                description=description if description else None,
                due_date=date.fromisoformat(due_date_str) if due_date_str else None,
                category=category,
                state=state if state else "pending",
            )
            return render(request, "components/task_item.html", {"task": task})
        except Exception as e:
            return HttpResponseBadRequest(f"Error creating task: {str(e)}")

    category = None
    if category_id:
        category = get_object_or_404(Category, id=category_id)

    categories = Category.objects.all().order_by("name")
    context = {
        "category": category,
        "categories": categories,
    }
    return render(request, "components/task_create_form.html", context)


@require_http_methods(["GET", "POST"])
def task_edit_form(request, pk):
    task = get_object_or_404(Task, pk=pk)

    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        due_date_str = request.POST.get("due_date")
        state = request.POST.get("state")
        category_id = request.POST.get("category")

        task.title = title
        task.description = description if description else None
        task.due_date = date.fromisoformat(due_date_str) if due_date_str else None
        task.state = state if state else "pending"

        if category_id:
            task.category = get_object_or_404(Category, id=category_id)
        else:
            task.category = None

        try:
            task.save()
            return render(request, "components/task_item.html", {"task": task})
        except Exception as e:
            return HttpResponseBadRequest(f"Error updating task: {str(e)}")

    categories = Category.objects.all().order_by("name")
    context = {
        "task": task,
        "categories": categories,
    }
    return render(request, "components/task_edit_form.html", context)


@require_http_methods(["DELETE"])
def task_delete(request, pk):
    task = get_object_or_404(Task, pk=pk)
    task.delete()
    return HttpResponse("")


# endregion
