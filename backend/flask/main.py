import os

from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_babel import Babel
from tasks.tasks import tasks_bp

app = Flask(__name__)
app.config["BABEL_DEFAULT_LOCALE"] = "es"
app.config["BABEL_DEFAULT_TIMEZONE"] = "Europe/Madrid"
app.config["TEMPLATES_AUTO_RELOAD"] = True

if os.getenv("STAGE") == "dev":
    app.config["DEBUG"] = True
    app.jinja_env.auto_reload = True
    app.jinja_env.cache = {}
    # Configure logging for development
    import logging

    logging.basicConfig(level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)

babel = Babel(app)

app.register_blueprint(tasks_bp)


@app.context_processor
def inject_api_url():
    url = os.getenv("API_BASE_URL", "http://localhost:8001")
    if not url.startswith("http") and not url.startswith("https"):
        url = f"http://{url}"
    return dict(api_base_url=url)


@app.route("/healthcheck")
def healthcheck():
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    return redirect(url_for("tasks.calendar"))


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
