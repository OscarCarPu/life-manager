from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

from .enums import ProjectState, TaskState

Base = declarative_base()


class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    parent_category_id = Column(Integer, ForeignKey("category.id", ondelete="RESTRICT"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    parent_category = relationship("Category", remote_side=[id], back_populates="subcategories")
    subcategories = relationship(
        "Category", back_populates="parent_category", cascade="all, delete-orphan"
    )
    projects = relationship("Project", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"


class Project(Base):
    __tablename__ = "project"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="SET NULL"))
    expected_start_date = Column(Date)
    expected_end_date = Column(Date)
    state = Column(String(50), default=ProjectState.NOT_STARTED.value)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="projects", foreign_keys=[category_id])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

    # One-to-many relationship with Note
    notes = relationship("Note", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}', state='{self.state}')>"


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    due_date = Column(Date)
    description = Column(Text)
    project_id = Column(Integer, ForeignKey("project.id", ondelete="CASCADE"))
    state = Column(String(50), default=TaskState.PENDING.value)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    plannings = relationship("TaskPlanning", back_populates="task", cascade="all, delete-orphan")

    # One-to-many relationship with Note
    notes = relationship("Note", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', state='{self.state}')>"


class TaskPlanning(Base):
    __tablename__ = "task_planning"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("task.id", ondelete="CASCADE"), nullable=False)
    planned_date = Column(Date, nullable=False)
    start_hour = Column(Time)
    end_hour = Column(Time)
    priority = Column(Integer)
    done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Assuming the Task model has a `plannings` attribute
    task = relationship("Task", back_populates="plannings")

    def __repr__(self):
        return (
            f"<TaskPlanning(id={self.id}, task_id={self.task_id}, "
            f"planned_date='{self.planned_date}')>"
        )


class Note(Base):
    __tablename__ = "note"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Foreign key for the one-to-many relationship with Project
    project_id = Column(Integer, ForeignKey("project.id", ondelete="CASCADE"))
    project = relationship("Project", back_populates="notes")

    # Foreign key for the one-to-many relationship with Task
    task_id = Column(Integer, ForeignKey("task.id", ondelete="CASCADE"))
    task = relationship("Task", back_populates="notes")

    # A check constraint to ensure a note is linked to either a project or a task, but not both.
    __table_args__ = (
        CheckConstraint(
            (
                "(project_id IS NOT NULL AND task_id IS NULL) OR "
                "(project_id IS NULL AND task_id IS NOT NULL)"
            ),
            name="_project_or_task_id_check",
        ),
    )

    def __repr__(self):
        return (
            f"<Note(id={self.id}, content='{self.content[:20]}...', "
            f"project_id={self.project_id}, task_id={self.task_id})>"
        )
