from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class DailyInsight(Base):
    __tablename__ = "daily_insights"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String(3), nullable=False)
    focus_score = Column(Integer)
    productivity_score = Column(Integer)
    sentiment_score = Column(Integer)
    general_score = Column(Integer)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("date", "type", name="unique_date_type"),)

    def __repr__(self):
        return f"<DailyInsight(id={self.id}, date='{self.date}', type='{self.type}')>"
