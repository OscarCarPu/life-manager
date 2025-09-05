import os

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_babel import Babel
from flask_login import LoginManager, UserMixin, current_user, login_user
from insights.insights import insights_bp
from tasks.tasks import tasks_bp
from werkzeug.security import check_password_hash

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(24)
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

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


class User(UserMixin):
    def __init__(self, id="user"):
        self.id = id


@login_manager.user_loader
def load_user(user_id):
    return User(user_id)


PUBLIC_ENDPOINTS = ["login", "healthcheck", "static"]


@app.before_request
def before_request():
    if request.endpoint not in PUBLIC_ENDPOINTS and not current_user.is_authenticated:
        return redirect(url_for("login"))


app.register_blueprint(tasks_bp)
app.register_blueprint(insights_bp)


@app.route("/healthcheck")
def healthcheck():
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    return redirect(url_for("tasks.calendar"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        password = request.form.get("password")
        password_hash = os.getenv("FLASK_APP_PASSWORD_HASH")
        if password_hash and check_password_hash(password_hash, password):
            user = User()
            login_user(user)
            return redirect(url_for("index"))
        return f"{password_hash} {password}", 401
    return render_template("login.html")


@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
def api_proxy(path):
    api_key = os.getenv("FASTAPI_API_KEY")
    api_url = os.getenv("API_BASE_URL", "http://localhost:8001")
    if not api_url.startswith("http"):
        api_url = f"http://{api_url}"

    headers = {"X-API-Key": api_key}
    if request.data:
        headers["Content-Type"] = "application/json"

    try:
        response = requests.request(
            method=request.method,
            url=f"{api_url}/{path}",
            headers=headers,
            params=request.args,
            json=request.get_json(silent=True),
        )
        response.raise_for_status()
        if response.status_code == 204 or not response.content:
            return "", response.status_code
        return jsonify(response.json()), response.status_code
    except requests.exceptions.HTTPError as e:
        # Try to return backend error message
        try:
            error_json = e.response.json()
        except ValueError:
            error_json = {"error": "An unknown error occurred"}
        return jsonify(error_json), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


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
