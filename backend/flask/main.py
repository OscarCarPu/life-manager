import os
from collections import defaultdict
from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.tasks.models import TaskPlanning
from flask import Flask, render_template
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

babel = Babel(app)


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
            .options(selectinload(TaskPlanning.task))
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


@app.route("/projects")
def projects():
    projects
    return render_template("projects.html")
