import logging
import os
from collections import defaultdict
from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.tasks.models import Task, TaskPlanning
from flask import Flask, jsonify, render_template, request
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
    return render_template("main.html")


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


@app.route("/projects")
def projects():
    projects
    return render_template("projects.html")


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
