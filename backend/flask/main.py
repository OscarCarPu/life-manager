import logging
import os
from collections import defaultdict
from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.tasks.models import Project, Task, TaskPlanning
from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_babel import Babel
from sqlalchemy.orm import selectinload

app = Flask(__name__)
app.config["BABEL_DEFAULT_LOCALE"] = "es"
app.config["BABEL_DEFAULT_TIMEZONE"] = "Europe/Madrid"
app.config["TEMPLATES_AUTO_RELOAD"] = True

if os.getenv("STAGE") == "dev":
    app.config["DEBUG"] = True
    app.jinja_env.auto_reload = True
    app.jinja_env.cache = {}
    # Configure logging for development
    logging.basicConfig(level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)

babel = Babel(app)


@app.route("/healthcheck")
def healthcheck():
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    # redirect to the projects listing which uses the unified `project.html` template
    return redirect(url_for("projects"))


@app.route("/projects")
def projects():
    with get_db() as db:
        projects = (
            db.query(Project)
            .options(selectinload(Project.tasks))
            .order_by(Project.updated_at.desc())
            .all()
        )
    return render_template("project.html", projects=projects)


@app.route("/projects/<int:project_id>")
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

        logger = logging.getLogger(__name__)
        logger.setLevel(logging.DEBUG)
        logger.debug(
            f"Category path for project {project_id}: {[cat.name for cat in category_path]}"
        )
    api_base_url = get_api_base_url()
    return render_template(
        "project_detail.html",
        project=project,
        category_path=category_path,
        api_base_url=api_base_url,
    )


@app.route("/calendar")
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

    api_base_url = get_api_base_url()
    return render_template(
        "calendar.html", planning_by_day=plannings_by_day, api_base_url=api_base_url
    )


@app.route("/notification", methods=["POST"])
def render_notification():
    """Render a single notification template"""
    data = request.get_json()
    message = data.get("message", "")
    notification_type = data.get("type", "info")
    notification_id = data.get("id", "")

    return render_template(
        "notifications/single.html", message=message, type=notification_type, id=notification_id
    )


def get_api_base_url():
    """Get the API base URL based on environment"""
    stage = os.getenv("STAGE", "dev")
    if stage == "dev":
        return "http://localhost:8001"
    else:
        return "https://api.yourdomain.com"
