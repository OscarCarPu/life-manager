from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.insights.models import DailyInsight
from flask import Blueprint, flash, redirect, render_template, request, url_for

insights_bp = Blueprint("insights", __name__, url_prefix="/insights", template_folder="templates")


@insights_bp.route("/")
def index():
    today = date.today()
    last_month = today - timedelta(days=30)
    with get_db() as db:
        insights = (
            db.query(DailyInsight)
            .filter(DailyInsight.date >= last_month)
            .order_by(DailyInsight.date.desc())
            .all()
        )

    # Convert insights to dictionaries for JSON serialization
    insights_data = []
    for insight in insights:
        insights_data.append(
            {
                "id": insight.id,
                "date": insight.date.isoformat(),
                "text": insight.text,
                "type": insight.type,
                "focus_score": insight.focus_score,
                "productivity_score": insight.productivity_score,
                "sentiment_score": insight.sentiment_score,
                "general_score": insight.general_score,
                "created_at": insight.created_at.isoformat() if insight.created_at else None,
                "updated_at": insight.updated_at.isoformat() if insight.updated_at else None,
            }
        )

    return render_template("insights/index.html", today=today, insights=insights_data)


@insights_bp.route("/add", methods=["POST"])
def add_insight():
    # Get form data
    insight_date = request.form.get("date")
    insight_type = request.form.get("type")
    text = request.form.get("text")
    focus_score = request.form.get("focus_score") or None
    productivity_score = request.form.get("productivity_score") or None
    sentiment_score = request.form.get("sentiment_score") or None
    general_score = request.form.get("general_score") or None

    with get_db() as db:
        # Check if exists
        existing = (
            db.query(DailyInsight)
            .filter(DailyInsight.date == insight_date, DailyInsight.type == insight_type)
            .first()
        )
        if existing:
            flash("Insight for this date and type already exists", "error")
            return redirect(url_for("insights.index"))

        # Create new
        new_insight = DailyInsight(
            date=insight_date,
            type=insight_type,
            text=text,
            focus_score=int(focus_score) if focus_score else None,
            productivity_score=int(productivity_score) if productivity_score else None,
            sentiment_score=int(sentiment_score) if sentiment_score else None,
            general_score=int(general_score) if general_score else None,
        )
        db.add(new_insight)
        db.commit()
        flash("Insight added successfully!", "success")

    return redirect(url_for("insights.index"))
