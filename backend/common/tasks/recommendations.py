from datetime import datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from .enums import ProjectState, TaskState
from .models import Project, Task, TaskPlanning

# Scoring weights and constants
SCORE_WEIGHTS = {
    "priority_multiplier": 2,
    "overdue_base": 30,
    "upcoming_base": 20,
    "upcoming_penalty": 2,
    "future_base": 5,
    "future_decay": 10,
    "no_future_plans_bonus": 15,
    "in_progress_basic": 5,
    "pending_basic": 2,
    "in_progress_planning": 10,
    "pending_planning": 2,
    "age_limit": 10,
    "age_multiplier": 0.05,
}

# Time-related constants
TIME_CONSTANTS = {
    "upcoming_days": 7,
    "planning_window_days": 4,
}


def get_task_recommendations(
    db: Session, limit: int = None, for_planning: bool = False
) -> List[Dict[str, Any]]:
    today = datetime.now().date()

    # Retrieve IDs of projects that are currently in progress
    in_progress_projects = (
        db.query(Project.id).filter(Project.state == ProjectState.IN_PROGRESS).subquery()
    )

    # Fetch tasks from in-progress projects that are pending or in progress
    tasks = (
        db.query(Task)
        .filter(
            Task.project_id.in_(in_progress_projects),
            Task.state.in_([TaskState.PENDING, TaskState.IN_PROGRESS]),
        )
        .all()
    )

    # --- Pre-fetch all relevant plannings to avoid N+1 queries ---
    task_ids = [t.id for t in tasks]
    future_plannings = (
        db.query(TaskPlanning)
        .filter(TaskPlanning.task_id.in_(task_ids), TaskPlanning.planned_date >= today)
        .all()
    )

    # Map plannings to tasks for efficient lookup
    plannings_by_task = {}
    for planning in future_plannings:
        plannings_by_task.setdefault(planning.task_id, []).append(planning)

    recommendations = []
    for task in tasks:
        # --- Skip tasks that are already planned in the near future when planning ---
        if for_planning:
            current_plannings = plannings_by_task.get(task.id, [])
            has_near_term_plan = any(
                p.planned_date < today + timedelta(days=TIME_CONSTANTS["planning_window_days"])
                for p in current_plannings
            )

            # Skip this task if it's already planned within the planning window
            if has_near_term_plan:
                continue

        score = 0.0

        # Calculate priority score
        if task.priority is not None:
            score += task.priority * SCORE_WEIGHTS["priority_multiplier"]

        # Add project priority to the score
        if task.project and task.project.priority is not None:
            score += task.project.priority * SCORE_WEIGHTS["priority_multiplier"] * 2

        # Calculate due date score
        if task.due_date:
            delta_days = (task.due_date - today).days
            if delta_days < 0:
                score += SCORE_WEIGHTS["overdue_base"] + abs(delta_days)
            elif delta_days <= TIME_CONSTANTS["upcoming_days"]:
                score += (
                    SCORE_WEIGHTS["upcoming_base"] - delta_days * SCORE_WEIGHTS["upcoming_penalty"]
                )
            else:
                score += max(
                    0, SCORE_WEIGHTS["future_base"] - delta_days / SCORE_WEIGHTS["future_decay"]
                )

        # --- Dynamic Scoring based on `for_planning` flag ---
        if for_planning:
            # Get pre-fetched plannings for this task
            current_plannings = plannings_by_task.get(task.id, [])

            # Check for plannings that are after the due date
            has_valid_plan = False
            for planning in current_plannings:
                if task.due_date is None or planning.planned_date <= task.due_date:
                    has_valid_plan = True
                    break

            if not has_valid_plan:
                score += SCORE_WEIGHTS["no_future_plans_bonus"]

            # Simplified task state score since we already filtered out near-term planned tasks
            if task.state == TaskState.IN_PROGRESS:
                score += SCORE_WEIGHTS["in_progress_planning"]
            elif task.state == TaskState.PENDING:
                score += SCORE_WEIGHTS["pending_planning"]

        else:
            # Basic task state score
            if task.state == TaskState.IN_PROGRESS:
                score += SCORE_WEIGHTS["in_progress_basic"]
            elif task.state == TaskState.PENDING:
                score += SCORE_WEIGHTS["pending_basic"]

        # --- Age-related scoring ---
        if task.created_at:
            age_days = (today - task.created_at.date()).days
            score += min(SCORE_WEIGHTS["age_limit"], age_days * SCORE_WEIGHTS["age_multiplier"])

        recommendations.append({"task": task, "score": score})

    # Sort and return
    recommendations.sort(key=lambda r: r["score"], reverse=True)
    return recommendations[:limit] if limit else recommendations
