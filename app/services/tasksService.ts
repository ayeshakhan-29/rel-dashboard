import api from './api';

export interface Task {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    lead_id?: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface TasksResponse {
    success: boolean;
    data: Task[];
}

export interface TaskResponse {
    success: boolean;
    data: Task;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    due_date?: string;
    priority?: 'High' | 'Medium' | 'Low';
    status?: 'Pending' | 'In Progress' | 'Completed';
    lead_id?: number;
}

/**
 * Get all tasks with optional filters
 */
export const getTasks = async (params?: {
    status?: string;
    priority?: string;
    lead_id?: number;
}): Promise<TasksResponse> => {
    const response = await api.get('/tasks', { params });
    return response.data;
};

/**
 * Get single task by ID
 */
export const getTaskById = async (id: number): Promise<TaskResponse> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (data: CreateTaskData): Promise<TaskResponse> => {
    const response = await api.post('/tasks', data);
    return response.data;
};

/**
 * Update a task
 */
export const updateTask = async (id: number, data: Partial<CreateTaskData>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
};

/**
 * Update task status only
 */
export const updateTaskStatus = async (id: number, status: 'Pending' | 'In Progress' | 'Completed'): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};
