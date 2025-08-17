from datetime import date, datetime, time
from typing import Optional

from common.tasks.constants import (
    DEFAULT_CATEGORY_COLOR,
    DEFAULT_PROJECT_COLOR,
    MAX_PRIORITY,
    MIN_PRIORITY,
)
from common.tasks.enums import ProjectState, TaskState
from pydantic import BaseModel, validator


# region Category
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = DEFAULT_CATEGORY_COLOR
    parent_category_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    color: Optional[str] = None


class Category(CategoryBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion


# region Project
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    color: Optional[str] = DEFAULT_PROJECT_COLOR
    expected_start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    state: Optional[ProjectState] = ProjectState.NOT_STARTED


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    color: Optional[str] = None
    state: Optional[ProjectState] = None


class Project(ProjectBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion


# region Task
class TaskBase(BaseModel):
    title: str
    due_date: Optional[date] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    state: Optional[TaskState] = TaskState.PENDING


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    title: Optional[str] = None
    state: Optional[TaskState] = None


class Task(TaskBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion


# region TaskPlanning
class TaskPlanningBase(BaseModel):
    task_id: int
    planned_date: date
    start_hour: Optional[time] = None
    end_hour: Optional[time] = None
    priority: Optional[int] = None

    @validator("priority")
    def validate_priority(cls, v):
        if v is not None and (v < MIN_PRIORITY or v > MAX_PRIORITY):
            raise ValueError(f"Priority must be between {MIN_PRIORITY} and {MAX_PRIORITY}")
        return v


class TaskPlanningCreate(TaskPlanningBase):
    pass


class TaskPlanningUpdate(TaskPlanningBase):
    task_id: Optional[int] = None
    planned_date: Optional[date] = None


class TaskPlanning(TaskPlanningBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion


# region Note
class NoteBase(BaseModel):
    content: str
    task_id: Optional[int] = None
    project_id: Optional[int] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    content: Optional[str] = None


class Note(NoteBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# endregion


# region General
class TaskGeneralInfo(Task):
    project: Optional[ProjectBase] = None
    last_notes: list[NoteBase] = []
    next_plannings: list[TaskPlanningBase] = []


# endregion
