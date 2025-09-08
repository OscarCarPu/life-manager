from datetime import date, datetime
from typing import Optional

from common.insights.enums import HabitType, InsightType
from pydantic import BaseModel, validator


# reg
class DailyInsightBase(BaseModel):
    date: date
    text: str
    type: InsightType
    focus_score: Optional[int] = None
    productivity_score: Optional[int] = None
    sentiment_score: Optional[int] = None
    general_score: Optional[int] = None

    @validator("focus_score", "productivity_score", "sentiment_score", "general_score")
    def validate_score(cls, v):
        if v is not None and (v < 1 or v > 10):
            raise ValueError("Score must be between 1 and 10")
        return v


class DailyInsightCreate(DailyInsightBase):
    pass


class DailyInsightUpdate(DailyInsightBase):
    date: Optional[date] = None
    text: Optional[str] = None
    type: Optional[InsightType] = None


class DailyInsight(DailyInsightBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# region Habits


class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: HabitType


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[HabitType] = None


class Habit(HabitBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class HabitEntryBase(BaseModel):
    date: date
    score: Optional[int] = None
    completed: Optional[bool] = None

    @validator("score")
    def validate_entry_score(cls, v):
        if v is not None and (v < 1 or v > 10):
            raise ValueError("Score must be between 1 and 10")
        return v


class HabitEntryCreate(HabitEntryBase):
    pass


class HabitEntryUpdate(BaseModel):
    date: Optional[date] = None
    score: Optional[int] = None
    completed: Optional[bool] = None

    @validator("score")
    def validate_update_score(cls, v):
        if v is not None and (v < 1 or v > 10):
            raise ValueError("Score must be between 1 and 10")
        return v


class HabitEntry(HabitEntryBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion


# region Metrics


class MetricBase(BaseModel):
    name: str
    description: Optional[str] = None
    unit: Optional[str] = None


class MetricCreate(MetricBase):
    pass


class MetricUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None


class Metric(MetricBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class MetricEntryBase(BaseModel):
    date: date
    value: float


class MetricEntryCreate(MetricEntryBase):
    pass


class MetricEntryUpdate(BaseModel):
    date: Optional[date] = None
    value: Optional[float] = None


class MetricEntry(MetricEntryBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion
