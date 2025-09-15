from datetime import datetime, timedelta

import common.tasks.models as models
from common.database import get_db
from common.tasks.recommendations import (
    get_task_recommendations as get_common_task_recommendations,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas

router = APIRouter()


@router.get("/tasks/{task_id}/general-info", response_model=schemas.TaskGeneralInfo)
def get_task_general_info(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Get project
    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()

    # Get last 5 notes
    last_notes = (
        db.query(models.Note)
        .filter(models.Note.task_id == task_id)
        .order_by(models.Note.updated_at.desc())
        .limit(5)
        .all()
    )
    if not last_notes:
        last_notes = []

    # Get next week plannings
    today = datetime.utcnow().date()
    next_week = today + timedelta(days=7)
    next_plannings = (
        db.query(models.TaskPlanning)
        .filter(
            models.TaskPlanning.task_id == task_id,
            models.TaskPlanning.planned_date >= today,
            models.TaskPlanning.planned_date <= next_week,
        )
        .all()
    )

    task_info = schemas.TaskGeneralInfo(
        **task.__dict__,
        project=schemas.ProjectBase(**project.__dict__) if project else None,
        last_notes=[schemas.NoteBase(**note.__dict__) for note in last_notes],
        next_plannings=[
            schemas.TaskPlanningBase(**planning.__dict__) for planning in next_plannings
        ],
    )
    return task_info


@router.get("/tasks/recommendations", response_model=list[schemas.TaskRecommendation])
def get_task_recommendations(db: Session = Depends(get_db)):
    recommendations = get_common_task_recommendations(db)
    return [schemas.TaskRecommendation(task=r["task"], score=r["score"]) for r in recommendations]
