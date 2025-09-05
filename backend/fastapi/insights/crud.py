from typing import List

import common.insights.models as models
from common.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas

router = APIRouter()


@router.get("/daily-insights/", response_model=List[schemas.DailyInsight])
def list_daily_insights(db: Session = Depends(get_db)):
    return db.query(models.DailyInsight).all()


@router.get("/daily-insights/{insight_id}", response_model=schemas.DailyInsight)
def get_daily_insight(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(models.DailyInsight).filter(models.DailyInsight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Daily insight not found")
    return insight


@router.post("/daily-insights/", response_model=schemas.DailyInsight)
def create_daily_insight(insight: schemas.DailyInsightCreate, db: Session = Depends(get_db)):
    # Check if insight for date and type already exists
    existing_insight = (
        db.query(models.DailyInsight)
        .filter(
            models.DailyInsight.date == insight.date, models.DailyInsight.type == insight.type.value
        )
        .first()
    )
    if existing_insight:
        raise HTTPException(status_code=400, detail="Insight for this date and type already exists")

    # Create insight data, excluding None values to let model defaults apply
    insight_data = insight.dict(exclude_unset=True)
    insight_data["type"] = insight.type.value  # Convert enum to string

    try:
        db_insight = models.DailyInsight(**insight_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_insight)
    db.commit()
    db.refresh(db_insight)
    return db_insight


@router.put("/daily-insights/{insight_id}", response_model=schemas.DailyInsight)
def update_daily_insight(
    insight_id: int, insight_data: schemas.DailyInsightUpdate, db: Session = Depends(get_db)
):
    db_insight = db.query(models.DailyInsight).filter(models.DailyInsight.id == insight_id).first()
    if not db_insight:
        raise HTTPException(status_code=404, detail="Daily insight not found")

    # Check if updated date and type would conflict with another insight
    if insight_data.date and insight_data.type:
        existing_insight = (
            db.query(models.DailyInsight)
            .filter(
                models.DailyInsight.date == insight_data.date,
                models.DailyInsight.type == insight_data.type.value,
                models.DailyInsight.id != insight_id,
            )
            .first()
        )
        if existing_insight:
            raise HTTPException(
                status_code=400, detail="Insight for this date and type already exists"
            )

    update_data = insight_data.dict(exclude_unset=True)
    if "type" in update_data:
        update_data["type"] = update_data["type"].value  # Convert enum to string

    for key, value in update_data.items():
        setattr(db_insight, key, value)

    try:
        db.commit()
        db.refresh(db_insight)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_insight


@router.delete("/daily-insights/{insight_id}")
def delete_daily_insight(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(models.DailyInsight).filter(models.DailyInsight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Daily insight not found")
    db.delete(insight)
    db.commit()
    return {"message": "Daily insight deleted successfully"}
