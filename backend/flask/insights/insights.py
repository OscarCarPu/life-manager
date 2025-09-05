from datetime import date, timedelta

from common.database import get_db_context as get_db
from common.insights.models import DailyInsight
from flask import Blueprint, render_template

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
