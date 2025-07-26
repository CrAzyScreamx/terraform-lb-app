from pydantic import BaseModel, Field
from typing import Optional

class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    task_name: str = Field(..., min_length=1, max_length=255, description="Name of the task")
    task_description: str = Field(..., min_length=1, description="Description of the task")
    completed: Optional[bool] = Field(default=False, description="Whether the task is completed")

class TaskResponse(BaseModel):
    """Schema for task response"""
    id: int
    task_name: str
    task_description: str
    completed: bool
    
    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    """Schema for updating a task"""
    task_name: Optional[str] = Field(None, min_length=1, max_length=255)
    task_description: Optional[str] = Field(None, min_length=1)
    completed: Optional[bool] = None

class MessageResponse(BaseModel):
    """Schema for simple message responses"""
    message: str
