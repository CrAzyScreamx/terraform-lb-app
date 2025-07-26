from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import socket
import os
from datetime import datetime

# Import our modules
from database import connect_db, close_db, create_tables
from routes.tasks import router as tasks_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    try:
        connect_db()
        create_tables()
        print("✅ Database connected and tables created successfully")
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        raise
    
    yield
    
    # Shutdown
    try:
        close_db()
        print("✅ Database connection closed")
    except Exception as e:
        print(f"❌ Error closing database: {e}")

# Create FastAPI application
app = FastAPI(
    title="Tasks API",
    description="A simple Tasks API for managing todo items",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)

# Root endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Tasks API is running!",
        "status": "healthy",
        "version": "1.0.0"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        from database import database
        if database.is_closed():
            connect_db()
        
        # Test database connection
        database.execute_sql("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    }

# Server info endpoint for load balancer identification
@app.get("/server-info")
async def server_info():
    """Get server information for load balancer identification"""
    try:
        # Get hostname
        hostname = socket.gethostname()
        
        # Get container ID (if running in Docker)
        container_id = "unknown"
        try:
            # Try to read from Docker's cgroup file
            with open('/proc/1/cgroup', 'r') as f:
                content = f.read()
                for line in content.split('\n'):
                    if 'docker' in line:
                        container_id = line.split('/')[-1].strip()
                        break
        except:
            # If not in Docker or can't read, use hostname
            container_id = hostname
        
        # Generate a unique server ID based on hostname and process
        server_id = f"{hostname}-{os.getpid()}"
        
        return {
            "server_id": server_id,
            "hostname": hostname,
            "container_id": container_id,
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        # Fallback response
        return {
            "server_id": f"unknown-{os.getpid()}",
            "hostname": "unknown",
            "container_id": "unknown",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )