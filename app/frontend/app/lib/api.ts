// API configuration and client
// Use relative URLs for API calls - the server will proxy them
const getApiBaseUrl = (): string => {
    // Always use relative URLs for client-side requests
    // The server will handle proxying to the actual backend
    if (typeof window !== 'undefined') {
        // In browser, use relative URLs
        return '/api';
    }

    // On server-side (SSR), we can use the backend URL directly
    if (typeof process !== 'undefined' && process.env?.BACKEND_URL) {
        return process.env.BACKEND_URL;
    }

    // Fallback for development
    return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API_BASE_URL configured as:', API_BASE_URL);

export interface Task {
    id: number;
    task_name: string;
    task_description: string;
    completed: boolean;
}

export interface TaskCreate {
    task_name: string;
    task_description: string;
    completed?: boolean;
}

export interface TaskUpdate {
    task_name?: string;
    task_description?: string;
    completed?: boolean;
}

export interface ServerInfo {
    server_id: string;
    hostname: string;
    container_id: string;
    timestamp: string;
    version: string;
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // Check if API base URL is configured
        if (!this.baseUrl) {
            throw new Error('Can\'t connect to backend: API host not configured');
        }

        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorData}`);
            }

            return response.json();
        } catch (error) {
            // Handle network errors (can't reach backend)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Can\'t connect to backend: Server is not responding');
            }
            // Re-throw other errors as-is
            throw error;
        }
    }

    // Tasks API methods
    async getAllTasks(): Promise<Task[]> {
        return this.makeRequest<Task[]>('/tasks/');
    }

    async createTask(task: TaskCreate): Promise<Task> {
        return this.makeRequest<Task>('/tasks/', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    }

    async updateTask(taskId: number, task: TaskUpdate): Promise<Task> {
        return this.makeRequest<Task>(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(task),
        });
    }

    async deleteTask(taskId: number): Promise<{ message: string }> {
        return this.makeRequest<{ message: string }>(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    // Server info
    async getServerInfo(): Promise<ServerInfo> {
        return this.makeRequest<ServerInfo>('/server-info');
    }

    // Health check
    async healthCheck(): Promise<any> {
        return this.makeRequest<any>('/health');
    }
}

export const apiClient = new ApiClient();
