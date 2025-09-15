from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from . import models
from .enums import ProjectState, TaskState


def get_task_recommendations(db: Session, limit: int) -> List[Dict[str, Any]]:
    """
    Generates a list of recommended tasks based on a scoring system.
    """
    today = datetime.utcnow().date()

    # 1. Get tasks from in-progress projects that are not done or archived
    in_progress_projects = (
        db.query(models.Project.id)
        .filter(models.Project.state == ProjectState.IN_PROGRESS)
        .subquery()
    )

    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.project_id.in_(in_progress_projects),
            models.Task.state.in_([TaskState.PENDING, TaskState.IN_PROGRESS]),
        )
        .all()
    )

    recommendations = []
    for task in tasks:
        score = 0.0

        # Priority score (normalized)
        if task.priority is not None:
            score += task.priority * 2  # Assuming priority is 1-5, this gives 2-10 points

        # Due date score
        if task.due_date:
            delta_days = (task.due_date - today).days
            if delta_days < 0:
                # Overdue tasks get a high score, increasing with delay
                score += 20 + abs(delta_days)
            elif delta_days <= 7:
                # Due in the next week, closer date gets higher score
                score += 10 - delta_days
            else:
                # Due later, diminishing score
                score += max(0, 5 - delta_days / 7)

        # Future planning score
        future_plannings_count = (
            db.query(models.TaskPlanning)
            .filter(
                models.TaskPlanning.task_id == task.id,
                models.TaskPlanning.planned_date >= today,
            )
            .count()
        )
        if future_plannings_count == 0:
            score += 15  # High score for no future plans

        # Task state score
        if task.state == TaskState.IN_PROGRESS:
            score += 5
        elif task.state == TaskState.PENDING:
            score += 2

        recommendations.append({"task": task, "score": score})

    # Sort recommendations by score in descending order
    recommendations.sort(key=lambda r: r["score"], reverse=True)

    return recommendations[:limit]
