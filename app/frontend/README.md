# Task Manager Frontend

A modern React-based frontend for the Task Manager API built with React Router v7 and TypeScript.

## Features

### ✨ Core Functionality
- **Create Tasks**: Add new tasks with name, description, and completion status
- **View Tasks**: Display all tasks in a clean table format
- **Edit Tasks**: Click-to-edit functionality for task names and descriptions
- **Toggle Status**: Mark tasks as completed or pending with a single click
- **Delete Tasks**: Remove tasks with confirmation dialogs
- **Real-time Updates**: Immediate UI updates for all operations
- **Batch Operations**: Select multiple tasks and perform bulk actions

### 🔍 Filtering & Search
- **Filter by Status**: All, Completed, or Pending tasks
- **Search**: Find tasks by name or description
- **Task Counts**: See how many tasks are in each category

### 📋 Batch Operations
- **Multi-Select**: Select individual tasks or use "Select All" checkbox
- **Batch Status Update**: Mark multiple tasks as completed or pending
- **Bulk Delete**: Delete multiple selected tasks at once
- **Visual Feedback**: Clear indication of selected tasks and operation progress

### 🖥️ Backend Monitoring
- **Server Info Display**: Shows which backend instance you're connected to
- **Real-time Status**: Displays server ID, hostname, container ID, and version

### 🎨 User Experience
- **Loading States**: Visual feedback during operations
- **Error Handling**: Clear error messages and validation
- **Success Notifications**: Confirmation messages for successful operations
- **Keyboard Support**: Enter to save, Escape to cancel editing
- **Responsive Design**: Works on desktop and mobile devices

## Development Setup

### Prerequisites
- Node.js 20+ 
- Backend API running on localhost:8000

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd app/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   The app will be available at `http://localhost:5173` (or the next available port)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking

## Docker Setup

### Using Docker Compose

The frontend is configured to work with Docker Compose and can be customized using environment variables.

1. **Copy environment file**:
   ```bash
   cd app/dockerFiles
   cp .env.example .env
   ```

2. **Configure API host** (in `.env` file):
   ```bash
   # For container-to-container communication (default)
   API_HOST=http://tasks-api:8000
   
   # For external API server
   API_HOST=http://localhost:8000
   
   # For custom API server
   API_HOST=http://your-api-server.com
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - phpMyAdmin: http://localhost:8080

## Usage Guide

### Creating Tasks
1. Fill in the "Task Name" and "Task Description" fields
2. Optionally check "Mark as completed" for completed tasks
3. Click "Create Task"

### Editing Tasks
1. Click on any task name or description in the table
2. Edit the text in the input field that appears
3. Press Enter to save or Escape to cancel

### Managing Task Status
1. Click the status badge (Completed/Pending) to toggle
2. The status will update immediately

### Filtering Tasks
1. Use the filter buttons: All, Completed, Pending
2. Use the search box to find specific tasks
3. Filters and search work together

### Deleting Tasks
1. Click the 🗑️ delete icon for any task
2. The task will be immediately deleted

### Batch Operations
1. **Select Tasks**: Click the checkbox next to individual tasks or use the "Select All" checkbox in the header
2. **View Selection**: Selected tasks are highlighted and a batch operations toolbar appears
3. **Batch Actions**: Choose from:
   - **Mark Completed**: Set all selected tasks as completed
   - **Mark Pending**: Set all selected tasks as pending  
   - **Delete Selected**: Remove all selected tasks
4. **Clear Selection**: Click "Clear selection" or uncheck individual tasks

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
