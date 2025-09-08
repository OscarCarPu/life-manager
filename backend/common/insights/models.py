from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship
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


class Habit(Base):
    __tablename__ = "habit"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    description = Column(Text)
    type = Column(String(20), nullable=False)  # 'score' | 'boolean'
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    entries = relationship("HabitEntry", back_populates="habit", cascade="all, delete-orphan")

    __table_args__ = (CheckConstraint("type IN ('score','boolean')", name="habit_type_check"),)

    def __repr__(self):
        return f"<Habit(id={self.id}, name='{self.name}', type='{self.type}')>"


class HabitEntry(Base):
    __tablename__ = "habit_entry"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habit.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    score = Column(Integer)  # 1..10 when type='score'
    completed = Column(Boolean)  # when type='boolean'
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    habit = relationship("Habit", back_populates="entries")

    __table_args__ = (
        UniqueConstraint("habit_id", "date", name="unique_habit_date"),
        CheckConstraint("score IS NULL OR (score >= 1 AND score <= 10)", name="habit_score_range"),
    )

    def __repr__(self):
        return f"<HabitEntry(id={self.id}, habit_id={self.habit_id}, date='{self.date}')>"


class Metric(Base):
    __tablename__ = "metric"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    description = Column(Text)
    unit = Column(String(20))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    entries = relationship("MetricEntry", back_populates="metric", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Metric(id={self.id}, name='{self.name}', unit='{self.unit}')>"


class MetricEntry(Base):
    __tablename__ = "metric_entry"

    id = Column(Integer, primary_key=True, index=True)
    metric_id = Column(Integer, ForeignKey("metric.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    value = Column(Numeric, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    metric = relationship("Metric", back_populates="entries")

    __table_args__ = (UniqueConstraint("metric_id", "date", name="unique_metric_date"),)

    def __repr__(self):
        return (
            f"<MetricEntry(id={self.id}, metric_id={self.metric_id}, date='{self.date}', "
            f"value={self.value})>"
        )
