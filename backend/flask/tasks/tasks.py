from collections import defaultdict
from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.tasks.models import Project, Task, TaskPlanning
from flask import Blueprint, jsonify, render_template
from sqlalchemy.orm import selectinload

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks", template_folder="templates")


@tasks_bp.route("/projects")
def projects():
    with get_db() as db:
        projects = (
            db.query(Project)
            .options(selectinload(Project.tasks))
            .order_by(Project.updated_at.desc())
            .all()
        )
    return render_template("project.html", projects=projects)


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

        category_path = []
        if project.category:
            current = project.category
            while current:
                category_path.append(current)
                current = current.parent_category
            category_path.reverse()

    return render_template(
        "project_detail.html",
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
            .options(selectinload(TaskPlanning.task).selectinload(Task.project))
            .filter(TaskPlanning.planned_date.in_(four_days))
            .order_by(
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

    return render_template("calendar.html", planning_by_day=plannings_by_day)
