from enum import Enum


class InsightType(str, Enum):
    JOB = "job"
    DAY = "day"


class HabitType(str, Enum):
    SCORE = "score"
    BOOLEAN = "boolean"
