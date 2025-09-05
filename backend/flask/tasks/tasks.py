from collections import defaultdict
from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.tasks.models import Project, Task, TaskPlanning
from flask import Blueprint, jsonify, render_template
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.sql import case

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks", template_folder="templates")

TASK_STATE_ORDER = {"in_progress": 0, "pending": 1, "completed": 2, "archived": 3}

PROJECT_STATE_ORDER = {"in_progress": 0, "not_started": 1, "completed": 2, "archived": 3}


@tasks_bp.route("/projects")
def projects():
    with get_db() as db:
        projects = (
            db.query(Project)
            .options(selectinload(Project.tasks))
            .order_by(Project.updated_at.desc())
            .all()
        )
        projects = sorted(
            projects, key=lambda p: (PROJECT_STATE_ORDER.get(p.state, 4), -p.updated_at.timestamp())
        )
    return render_template("tasks/project.html", projects=projects)


@tasks_bp.route("/projects/<int:project_id>")
def project_detail(project_id):
    with get_db() as db:
        project = (
            db.query(Project)
            .options(
                selectinload(Project.tasks),
                selectinload(Project.notes),
                selectinload(Project.category),
            )
            .filter(Project.id == project_id)
            .one_or_none()
        )
        if not project:
            return jsonify({"error": "Project not found"}), 404

        project.tasks = sorted(
            project.tasks,
            key=lambda t: (TASK_STATE_ORDER.get(t.state, 4), -t.updated_at.timestamp()),
        )

        category_path = []
        if project.category:
            current = project.category
            while current:
                category_path.append(current)
                current = current.parent_category
            category_path.reverse()

    return render_template(
        "tasks/project_detail.html",
        project=project,
        category_path=category_path,
    )


@tasks_bp.route("/calendar")
def calendar():
    with get_db() as db:
        today = date.today()
        four_days = [today + timedelta(days=i) for i in range(4)]

        plannings_four_days = (
            db.query(TaskPlanning)
            .join(Task)
            .options(joinedload(TaskPlanning.task).selectinload(Task.project))
            .filter(TaskPlanning.planned_date.in_(four_days))
            .order_by(
                case((Task.state == "completed", 1), else_=0),
                TaskPlanning.done.asc(),
                TaskPlanning.planned_date,
                TaskPlanning.start_hour,
                TaskPlanning.end_hour,
                TaskPlanning.priority.desc(),
            )
            .all()
        )

        plannings_by_day = defaultdict(list)
        for day in four_days:
            plannings_by_day[day] = []

        for planning in plannings_four_days:
            plannings_by_day[planning.planned_date].append(planning)

    import logging

    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    logger.info("Rendering calendar view")
    logger.info(plannings_by_day)

    return render_template("tasks/calendar.html", planning_by_day=plannings_by_day)


@tasks_bp.route("/pending-tasks")
def pending_tasks():
    with get_db() as db:
        # Get all pending tasks with their due dates
        pending_tasks = (
            db.query(Task)
            .join(Project)
            .options(selectinload(Task.project))
            .filter(Project.state == "in_progress")
            .filter(Task.state.in_(["pending", "in_progress"]))
            .order_by(Task.due_date.asc(), Task.updated_at.desc())
            .all()
        )

        # Separate tasks with and without due dates
        tasks_with_due_date = [task for task in pending_tasks if task.due_date]
        tasks_without_due_date = [task for task in pending_tasks if not task.due_date]

        # Group tasks by due date (convert date to string for JSON serialization)
        tasks_by_date = defaultdict(list)
        for task in tasks_with_due_date:
            date_str = task.due_date.isoformat() if task.due_date else None
            if date_str:
                task_dict = {
                    "id": task.id,
                    "title": task.title,
                    "state": task.state,
                    "due_date": date_str,
                    "project": (
                        {"id": task.project.id, "name": task.project.name} if task.project else None
                    ),
                }
                tasks_by_date[date_str].append(task_dict)

    return render_template(
        "tasks/pending_tasks.html",
        tasks_by_date=dict(tasks_by_date),
        tasks_without_due_date=tasks_without_due_date,
    )
