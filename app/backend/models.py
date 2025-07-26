from peewee import *
from database import database

class BaseModel(Model):
    """Base model class that connects to our database"""
    class Meta:
        database = database

class Task(BaseModel):
    """Task model with ID, task name, description, and completion status"""
    id = AutoField(primary_key=True)
    task_name = CharField(max_length=255, null=False)
    task_description = TextField(null=False)
    completed = BooleanField(default=False)
    
    class Meta:
        table_name = 'tasks'
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        return {
            'id': self.id,
            'task_name': self.task_name,
            'task_description': self.task_description,
            'completed': self.completed
        }
