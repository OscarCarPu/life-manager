from typing import List

import common.tasks.models as models
from common.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas

router = APIRouter()


# Category CRUD operations
@router.get("/categories/", response_model=List[schemas.Category])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.get("/categories/{category_id}", response_model=schemas.Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    # Validate parent category exists if provided
    if category.parent_category_id:
        parent_category = (
            db.query(models.Category)
            .filter(models.Category.id == category.parent_category_id)
            .first()
        )
        if not parent_category:
            raise HTTPException(status_code=400, detail="Parent category not found")

    # Check if category name already exists
    existing_category = (
        db.query(models.Category).filter(models.Category.name == category.name).first()
    )
    if existing_category:
        raise HTTPException(status_code=400, detail="Category name already exists")

    # Create category data, excluding None values to let model defaults apply
    category_data = category.dict(exclude_unset=True)
    try:
        db_category = models.Category(**category_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int, category_data: schemas.CategoryUpdate, db: Session = Depends(get_db)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Validate parent category exists if provided
    if category_data.parent_category_id:
        parent_category = (
            db.query(models.Category)
            .filter(models.Category.id == category_data.parent_category_id)
            .first()
        )
        if not parent_category:
            raise HTTPException(status_code=400, detail="Parent category not found")

    # Check if category name already exists (excluding current category)
    if category_data.name:
        existing_category = (
            db.query(models.Category)
            .filter(models.Category.name == category_data.name, models.Category.id != category_id)
            .first()
        )
        if existing_category:
            raise HTTPException(status_code=400, detail="Category name already exists")

    update_data = category_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)

    try:
        db.commit()
        db.refresh(db_category)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_category


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


# Project CRUD operations
@router.get("/projects/", response_model=List[schemas.Project])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()


@router.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    # Validate category exists if provided
    if project.category_id:
        category = (
            db.query(models.Category).filter(models.Category.id == project.category_id).first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    # Check if project name already exists
    existing_project = db.query(models.Project).filter(models.Project.name == project.name).first()
    if existing_project:
        raise HTTPException(status_code=400, detail="Project name already exists")

    # Create project data, excluding None values to let model defaults apply
    project_data = project.dict(exclude_unset=True)

    try:
        db_project = models.Project(**project_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int, project_data: schemas.ProjectUpdate, db: Session = Depends(get_db)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate category exists if provided
    if project_data.category_id:
        category = (
            db.query(models.Category).filter(models.Category.id == project_data.category_id).first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    # Check if project name already exists (excluding current project)
    if project_data.name:
        existing_project = (
            db.query(models.Project)
            .filter(models.Project.name == project_data.name, models.Project.id != project_id)
            .first()
        )
        if existing_project:
            raise HTTPException(status_code=400, detail="Project name already exists")

    update_data = project_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    try:
        db.commit()
        db.refresh(db_project)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_project


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


# Task CRUD operations
@router.get("/tasks/", response_model=List[schemas.Task])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()


@router.get("/tasks/{task_id}", response_model=schemas.Task)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Validate project exists if provided
    if task.project_id:
        project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
        if not project:
            raise HTTPException(status_code=400, detail="Project not found")

    # Create task data, excluding None values to let model defaults apply
    task_data = task.dict(exclude_unset=True)

    try:
        db_task = models.Task(**task_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_data: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validate project exists if provided
    if task_data.project_id:
        project = db.query(models.Project).filter(models.Project.id == task_data.project_id).first()
        if not project:
            raise HTTPException(status_code=400, detail="Project not found")

    update_data = task_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    try:
        db.commit()
        db.refresh(db_task)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


# TaskPlanning CRUD operations
@router.get("/task_planning/", response_model=List[schemas.TaskPlanning])
def list_task_plannings(db: Session = Depends(get_db)):
    return db.query(models.TaskPlanning).all()


@router.get("/task_planning/{task_planning_id}", response_model=schemas.TaskPlanning)
def get_task_planning(task_planning_id: int, db: Session = Depends(get_db)):
    task_planning = (
        db.query(models.TaskPlanning).filter(models.TaskPlanning.id == task_planning_id).first()
    )
    if not task_planning:
        raise HTTPException(status_code=404, detail="TaskPlanning not found")
    return task_planning


@router.post("/task_planning/", response_model=schemas.TaskPlanning)
def create_task_planning(task_planning: schemas.TaskPlanningCreate, db: Session = Depends(get_db)):
    # Validate task exists
    task = db.query(models.Task).filter(models.Task.id == task_planning.task_id).first()
    if not task:
        raise HTTPException(status_code=400, detail="Task not found")

    # Check if task planning for this date already exists
    existing_planning = (
        db.query(models.TaskPlanning)
        .filter(
            models.TaskPlanning.task_id == task_planning.task_id,
            models.TaskPlanning.planned_date == task_planning.planned_date,
        )
        .first()
    )
    if existing_planning:
        raise HTTPException(status_code=400, detail="Task planning for this date already exists")

    # Create task planning data, excluding None values
    task_planning_data = task_planning.dict(exclude_unset=True)
    try:
        db_task_planning = models.TaskPlanning(**task_planning_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_task_planning)
    db.commit()
    db.refresh(db_task_planning)
    return db_task_planning


@router.put("/task_planning/{task_planning_id}", response_model=schemas.TaskPlanning)
def update_task_planning(
    task_planning_id: int,
    task_planning_data: schemas.TaskPlanningUpdate,
    db: Session = Depends(get_db),
):
    db_task_planning = (
        db.query(models.TaskPlanning).filter(models.TaskPlanning.id == task_planning_id).first()
    )
    if not db_task_planning:
        raise HTTPException(status_code=404, detail="TaskPlanning not found")

    # Validate task exists if provided
    if task_planning_data.task_id:
        task = db.query(models.Task).filter(models.Task.id == task_planning_data.task_id).first()
        if not task:
            raise HTTPException(status_code=400, detail="Task not found")

    # Check if task planning for this date already exists (excluding current planning)
    if task_planning_data.planned_date and task_planning_data.task_id:
        existing_planning = (
            db.query(models.TaskPlanning)
            .filter(
                models.TaskPlanning.task_id == task_planning_data.task_id,
                models.TaskPlanning.planned_date == task_planning_data.planned_date,
                models.TaskPlanning.id != task_planning_id,
            )
            .first()
        )
        if existing_planning:
            raise HTTPException(
                status_code=400, detail="Task planning for this date already exists"
            )

    update_data = task_planning_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task_planning, key, value)

    try:
        db.commit()
        db.refresh(db_task_planning)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_task_planning


@router.patch("/task_planning/{task_planning_id}", response_model=schemas.TaskPlanning)
def patch_task_planning(
    task_planning_id: int,
    task_planning_data: schemas.TaskPlanningUpdate,
    db: Session = Depends(get_db),
):
    db_task_planning = (
        db.query(models.TaskPlanning).filter(models.TaskPlanning.id == task_planning_id).first()
    )
    if not db_task_planning:
        raise HTTPException(status_code=404, detail="TaskPlanning not found")

    # Validate task exists if provided
    if task_planning_data.task_id:
        task = db.query(models.Task).filter(models.Task.id == task_planning_data.task_id).first()
        if not task:
            raise HTTPException(status_code=400, detail="Task not found")

    # Check if task planning for this date already exists (excluding current planning)
    if task_planning_data.planned_date:
        # Determine the task_id to check against
        check_task_id = (
            task_planning_data.task_id
            if task_planning_data.task_id is not None
            else db_task_planning.task_id
        )

        existing_planning = (
            db.query(models.TaskPlanning)
            .filter(
                models.TaskPlanning.task_id == check_task_id,
                models.TaskPlanning.planned_date == task_planning_data.planned_date,
                models.TaskPlanning.id != task_planning_id,
            )
            .first()
        )
        if existing_planning:
            raise HTTPException(
                status_code=400, detail="Task planning for this date already exists"
            )

    # Only update fields that are provided (exclude_unset=True)
    update_data = task_planning_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task_planning, key, value)

    try:
        db.commit()
        db.refresh(db_task_planning)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_task_planning


@router.delete("/task_planning/{task_planning_id}")
def delete_task_planning(task_planning_id: int, db: Session = Depends(get_db)):
    task_planning = (
        db.query(models.TaskPlanning).filter(models.TaskPlanning.id == task_planning_id).first()
    )
    if not task_planning:
        raise HTTPException(status_code=404, detail="TaskPlanning not found")
    db.delete(task_planning)
    db.commit()
    return {"message": "TaskPlanning deleted successfully"}


@router.get("/notes/", response_model=List[schemas.Note])
def list_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()


@router.get("/notes/{note_id}", response_model=schemas.Note)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post("/notes/", response_model=schemas.Note)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    # Validate task or project exists if provided
    if note.task_id:
        task = db.query(models.Task).filter(models.Task.id == note.task_id).first()
        if not task:
            raise HTTPException(status_code=400, detail="Task not found")
    elif note.project_id:
        project = db.query(models.Project).filter(models.Project.id == note.project_id).first()
        if not project:
            raise HTTPException(status_code=400, detail="Project not found")

    # Create note data, excluding None values to let model defaults apply
    note_data = note.dict(exclude_unset=True)

    try:
        db_note = models.Note(**note_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(note_id: int, note_data: schemas.NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Validate task or project exists if provided
    if note_data.task_id:
        task = db.query(models.Task).filter(models.Task.id == note_data.task_id).first()
        if not task:
            raise HTTPException(status_code=400, detail="Task not found")
    elif note_data.project_id:
        project = db.query(models.Project).filter(models.Project.id == note_data.project_id).first()
        if not project:
            raise HTTPException(status_code=400, detail="Project not found")

    update_data = note_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)

    try:
        db.commit()
        db.refresh(db_note)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    return db_note


@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}
