from datetime import date, datetime
from typing import Optional

from common.insights.enums import InsightType
from pydantic import BaseModel, validator


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
