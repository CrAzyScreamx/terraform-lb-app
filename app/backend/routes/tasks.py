from fastapi import APIRouter, HTTPException, status
from typing import List
from models import Task
from schemas import TaskCreate, TaskResponse, TaskUpdate, MessageResponse
from peewee import DoesNotExist

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
async def get_all_tasks():
    """Get all tasks from the database"""
    try:
        tasks = list(Task.select())
        return [task.to_dict() for task in tasks]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving tasks: {str(e)}"
        )

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate):
    """Create a new task"""
    try:
        task = Task.create(
            task_name=task_data.task_name,
            task_description=task_data.task_description,
            completed=task_data.completed
        )
        return task.to_dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task: {str(e)}"
        )

@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(task_id: int):
    """Delete a task by ID"""
    try:
        task = Task.get_by_id(task_id)
        task.delete_instance()
        return MessageResponse(message=f"Task with ID {task_id} has been successfully deleted")
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting task: {str(e)}"
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_data: TaskUpdate):
    """Update a task by ID"""
    try:
        task = Task.get_by_id(task_id)
        
        # Update only the fields that are provided
        if task_data.task_name is not None:
            task.task_name = task_data.task_name
        if task_data.task_description is not None:
            task.task_description = task_data.task_description
        if task_data.completed is not None:
            task.completed = task_data.completed
        
        task.save()
        return task.to_dict()
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating task: {str(e)}"
        )
