# Environment Variable Configuration for Backend API

## Overview
This document describes the changes made to configure the frontend to use environment variables for the backend API endpoint instead of hardcoded values.

## Changes Made

### 1. Updated `src/api.ts`
- Changed hardcoded API URL from `'http://localhost:8000'` to use environment variable
- Added fallback to localhost for development: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'`

### 2. Created TypeScript definitions (`src/vite-env.d.ts`)
- Added TypeScript interface for Vite environment variables
- Ensures type safety when accessing `import.meta.env.VITE_API_BASE_URL`

### 3. Environment files
- **`.env`**: Contains default environment variables for local development
- **`.env.example`**: Template file documenting required environment variables

### 4. Updated Docker configuration
- **`Dockerfile`**: Added support for build-time API URL configuration
- **`docker-compose.yml`**: Set `VITE_API_BASE_URL=http://tasks-api:8000` for container networking
- **`ansible/frontend-backend/docker-compose.frontend.yml`**: Added `VITE_API_BASE_URL` environment variable with fallback

### 5. Updated documentation
- Enhanced `README.md` with environment variable configuration instructions
- Added Docker deployment instructions with environment variable options

## Usage Examples

### Local Development
```bash
# Default (uses .env file or fallback)
npm run dev

# Override via command line
VITE_API_BASE_URL=http://192.168.1.100:8000 npm run dev
```

### Docker Development
```bash
# Using the full stack (containers communicate via Docker network)
docker-compose up -d

# Override backend URL for external API
BACKEND_API_URL=http://external-api:8000 docker-compose up -d
```

### Production Deployment
```bash
# Set environment variable before deployment
export BACKEND_API_URL=http://your-production-backend-host:8000
ansible-playbook ansible/frontend-backend/main_playbook.yml -e "type=frontend"
```

## Environment Variable Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Frontend environment variable for API endpoint | `http://localhost:8000` | `http://api.example.com:8000` |
| `BACKEND_API_URL` | Docker Compose variable passed to frontend | `http://localhost:8000` | `http://tasks-api:8000` |

## Benefits

1. **Flexibility**: Can deploy to different environments without code changes
2. **Security**: No hardcoded URLs in production builds
3. **Container-friendly**: Works seamlessly with Docker networking
4. **Development-friendly**: Maintains localhost fallback for easy development
5. **Type-safe**: TypeScript definitions ensure compile-time checking
