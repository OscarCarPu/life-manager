from typing import List

import common.insights.models as models
from common.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas

router = APIRouter()

# region Daily Insights CRUD


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


# endregion

# region Habit CRUD


@router.get("/habits/", response_model=List[schemas.Habit])
def list_habits(db: Session = Depends(get_db)):
    return db.query(models.Habit).all()


@router.get("/habits/{habit_id}", response_model=schemas.Habit)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.post("/habits/", response_model=schemas.Habit)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db)):
    try:
        db_habit = models.Habit(
            name=habit.name,
            description=habit.description,
            type=habit.type.value,  # Convert enum to string
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


@router.put("/habits/{habit_id}", response_model=schemas.Habit)
def update_habit(habit_id: int, habit_data: schemas.HabitUpdate, db: Session = Depends(get_db)):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    update_data = habit_data.dict(exclude_unset=True)
    if "type" in update_data and update_data["type"] is not None:
        update_data["type"] = update_data["type"].value

    for key, value in update_data.items():
        setattr(db_habit, key, value)

    try:
        db.commit()
        db.refresh(db_habit)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_habit


@router.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted successfully"}


@router.get("/habits/{habit_id}/entries", response_model=List[schemas.HabitEntry])
def list_habit_entries(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return (
        db.query(models.HabitEntry)
        .filter(models.HabitEntry.habit_id == habit_id)
        .order_by(models.HabitEntry.date.desc())
        .all()
    )


@router.post("/habits/{habit_id}/entries", response_model=schemas.HabitEntry)
def create_habit_entry(
    habit_id: int, entry: schemas.HabitEntryCreate, db: Session = Depends(get_db)
):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Validate mutually exclusive fields based on habit type
    if habit.type == "boolean":
        if entry.completed is None:
            raise HTTPException(status_code=400, detail="completed is required for boolean habits")
        if entry.score is not None:
            raise HTTPException(status_code=400, detail="score is not allowed for boolean habits")
    elif habit.type == "score":
        if entry.score is None:
            raise HTTPException(status_code=400, detail="score is required for score habits")
        if entry.completed is not None:
            raise HTTPException(status_code=400, detail="completed is not allowed for score habits")

    existing = (
        db.query(models.HabitEntry)
        .filter(models.HabitEntry.habit_id == habit_id, models.HabitEntry.date == entry.date)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Entry for this date already exists")

    db_entry = models.HabitEntry(
        habit_id=habit_id,
        date=entry.date,
        score=entry.score,
        completed=entry.completed,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.put("/habits/{habit_id}/entries/{entry_id}", response_model=schemas.HabitEntry)
def update_habit_entry(
    habit_id: int,
    entry_id: int,
    entry_data: schemas.HabitEntryUpdate,
    db: Session = Depends(get_db),
):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    db_entry = (
        db.query(models.HabitEntry)
        .filter(models.HabitEntry.id == entry_id, models.HabitEntry.habit_id == habit_id)
        .first()
    )
    if not db_entry:
        raise HTTPException(status_code=404, detail="Habit entry not found")

    update_data = entry_data.dict(exclude_unset=True)

    # Validate based on habit type
    if habit.type == "boolean":
        if "score" in update_data and update_data["score"] is not None:
            raise HTTPException(status_code=400, detail="score is not allowed for boolean habits")
    elif habit.type == "score":
        if "completed" in update_data and update_data["completed"] is not None:
            raise HTTPException(status_code=400, detail="completed is not allowed for score habits")

    # Ensure date uniqueness if date is updated
    if "date" in update_data:
        exists = (
            db.query(models.HabitEntry)
            .filter(
                models.HabitEntry.habit_id == habit_id,
                models.HabitEntry.date == update_data["date"],
                models.HabitEntry.id != entry_id,
            )
            .first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="Entry for this date already exists")

    for key, value in update_data.items():
        setattr(db_entry, key, value)

    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.delete("/habits/{habit_id}/entries/{entry_id}")
def delete_habit_entry(habit_id: int, entry_id: int, db: Session = Depends(get_db)):
    entry = (
        db.query(models.HabitEntry)
        .filter(models.HabitEntry.id == entry_id, models.HabitEntry.habit_id == habit_id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Habit entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Habit entry deleted successfully"}


# endregion

# region Metrics CRUD


@router.get("/metrics/", response_model=List[schemas.Metric])
def list_metrics(db: Session = Depends(get_db)):
    return db.query(models.Metric).all()


@router.get("/metrics/{metric_id}", response_model=schemas.Metric)
def get_metric(metric_id: int, db: Session = Depends(get_db)):
    metric = db.query(models.Metric).filter(models.Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    return metric


@router.post("/metrics/", response_model=schemas.Metric)
def create_metric(metric: schemas.MetricCreate, db: Session = Depends(get_db)):
    db_metric = models.Metric(name=metric.name, description=metric.description, unit=metric.unit)
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric


@router.put("/metrics/{metric_id}", response_model=schemas.Metric)
def update_metric(metric_id: int, metric_data: schemas.MetricUpdate, db: Session = Depends(get_db)):
    db_metric = db.query(models.Metric).filter(models.Metric.id == metric_id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")

    for key, value in metric_data.dict(exclude_unset=True).items():
        setattr(db_metric, key, value)
    db.commit()
    db.refresh(db_metric)
    return db_metric


@router.delete("/metrics/{metric_id}")
def delete_metric(metric_id: int, db: Session = Depends(get_db)):
    metric = db.query(models.Metric).filter(models.Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    db.delete(metric)
    db.commit()
    return {"message": "Metric deleted successfully"}


@router.get("/metrics/{metric_id}/entries", response_model=List[schemas.MetricEntry])
def list_metric_entries(metric_id: int, db: Session = Depends(get_db)):
    metric = db.query(models.Metric).filter(models.Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    return (
        db.query(models.MetricEntry)
        .filter(models.MetricEntry.metric_id == metric_id)
        .order_by(models.MetricEntry.date.desc())
        .all()
    )


@router.post("/metrics/{metric_id}/entries", response_model=schemas.MetricEntry)
def create_metric_entry(
    metric_id: int, entry: schemas.MetricEntryCreate, db: Session = Depends(get_db)
):
    metric = db.query(models.Metric).filter(models.Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")

    existing = (
        db.query(models.MetricEntry)
        .filter(models.MetricEntry.metric_id == metric_id, models.MetricEntry.date == entry.date)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Entry for this date already exists")

    db_entry = models.MetricEntry(metric_id=metric_id, date=entry.date, value=entry.value)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.put("/metrics/{metric_id}/entries/{entry_id}", response_model=schemas.MetricEntry)
def update_metric_entry(
    metric_id: int,
    entry_id: int,
    entry_data: schemas.MetricEntryUpdate,
    db: Session = Depends(get_db),
):
    metric = db.query(models.Metric).filter(models.Metric.id == metric_id).first()
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")

    db_entry = (
        db.query(models.MetricEntry)
        .filter(models.MetricEntry.id == entry_id, models.MetricEntry.metric_id == metric_id)
        .first()
    )
    if not db_entry:
        raise HTTPException(status_code=404, detail="Metric entry not found")

    update_data = entry_data.dict(exclude_unset=True)

    if "date" in update_data:
        exists = (
            db.query(models.MetricEntry)
            .filter(
                models.MetricEntry.metric_id == metric_id,
                models.MetricEntry.date == update_data["date"],
                models.MetricEntry.id != entry_id,
            )
            .first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="Entry for this date already exists")

    for key, value in update_data.items():
        setattr(db_entry, key, value)

    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.delete("/metrics/{metric_id}/entries/{entry_id}")
def delete_metric_entry(metric_id: int, entry_id: int, db: Session = Depends(get_db)):
    entry = (
        db.query(models.MetricEntry)
        .filter(models.MetricEntry.id == entry_id, models.MetricEntry.metric_id == metric_id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Metric entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Metric entry deleted successfully"}


# endregion

# region PATCH endpoints


@router.patch("/daily-insights/{insight_id}", response_model=schemas.DailyInsight)
def patch_daily_insight(
    insight_id: int, insight_data: schemas.DailyInsightUpdate, db: Session = Depends(get_db)
):
    return update_daily_insight(insight_id, insight_data, db)


@router.patch("/habits/{habit_id}", response_model=schemas.Habit)
def patch_habit(habit_id: int, habit_data: schemas.HabitUpdate, db: Session = Depends(get_db)):
    return update_habit(habit_id, habit_data, db)


@router.patch("/habits/{habit_id}/entries/{entry_id}", response_model=schemas.HabitEntry)
def patch_habit_entry(
    habit_id: int,
    entry_id: int,
    entry_data: schemas.HabitEntryUpdate,
    db: Session = Depends(get_db),
):
    return update_habit_entry(habit_id, entry_id, entry_data, db)


@router.patch("/metrics/{metric_id}", response_model=schemas.Metric)
def patch_metric(metric_id: int, metric_data: schemas.MetricUpdate, db: Session = Depends(get_db)):
    return update_metric(metric_id, metric_data, db)


@router.patch("/metrics/{metric_id}/entries/{entry_id}", response_model=schemas.MetricEntry)
def patch_metric_entry(
    metric_id: int,
    entry_id: int,
    entry_data: schemas.MetricEntryUpdate,
    db: Session = Depends(get_db),
):
    return update_metric_entry(metric_id, entry_id, entry_data, db)


# endregion
