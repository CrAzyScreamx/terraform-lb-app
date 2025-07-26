import React, { useState, useEffect } from 'react';
import { apiClient, type Task, type TaskCreate, type TaskUpdate, type ServerInfo } from '../lib/api';
import { ConfirmDialog, LoadingSpinner, Alert } from './ui';

interface EditableTaskRowProps {
    task: Task;
    onUpdate: (id: number, updates: TaskUpdate) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    isUpdating: boolean;
    isDeleting: boolean;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
}

const EditableTaskRow: React.FC<EditableTaskRowProps> = ({
    task,
    onUpdate,
    onDelete,
    isUpdating,
    isDeleting,
    isSelected,
    onToggleSelect,
}) => {
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({
        task_name: task.task_name,
        task_description: task.task_description,
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleStartEdit = (field: string) => {
        if (isUpdating || isDeleting) return;
        setIsEditing(field);
        setEditValues({
            task_name: task.task_name,
            task_description: task.task_description,
        });
    };

    const handleSaveEdit = async () => {
        if (!isEditing) return;

        try {
            if (isEditing === 'task_name' && editValues.task_name.trim() === '') {
                alert('Task name cannot be empty');
                return;
            }
            if (isEditing === 'task_description' && editValues.task_description.trim() === '') {
                alert('Task description cannot be empty');
                return;
            }

            await onUpdate(task.id, {
                [isEditing]: editValues[isEditing as keyof typeof editValues],
            });
            setIsEditing(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setEditValues({
            task_name: task.task_name,
            task_description: task.task_description,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleToggleComplete = async () => {
        if (isUpdating || isDeleting) return;
        await onUpdate(task.id, { completed: !task.completed });
    };

    const handleDeleteClick = async () => {
        if (isUpdating || isDeleting) return;
        await onDelete(task.id);
    };

    return (
        <>
            <tr className={`border-b hover:bg-gray-50 ${isUpdating || isDeleting ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-sm">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(task.id)}
                        disabled={isUpdating || isDeleting}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.id}</td>

                <td className="px-4 py-3 text-sm text-gray-900">
                    {isEditing === 'task_name' ? (
                        <input
                            type="text"
                            value={editValues.task_name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, task_name: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            autoFocus
                        />
                    ) : (
                        <span
                            onClick={() => handleStartEdit('task_name')}
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded block"
                            title="Click to edit"
                        >
                            {task.task_name}
                        </span>
                    )}
                </td>

                <td className="px-4 py-3 text-sm text-gray-900">
                    {isEditing === 'task_description' ? (
                        <textarea
                            value={editValues.task_description}
                            onChange={(e) => setEditValues(prev => ({ ...prev, task_description: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
                            rows={2}
                            autoFocus
                        />
                    ) : (
                        <span
                            onClick={() => handleStartEdit('task_description')}
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded block max-w-xs truncate"
                            title="Click to edit"
                        >
                            {task.task_description}
                        </span>
                    )}
                </td>

                <td className="px-4 py-3 text-sm">
                    <button
                        onClick={handleToggleComplete}
                        disabled={isUpdating || isDeleting}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${task.completed
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {task.completed ? 'Completed' : 'Pending'}
                    </button>
                </td>

                <td className="px-4 py-3 text-sm">
                    <button
                        onClick={handleDeleteClick}
                        disabled={isUpdating || isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete task"
                    >
                        {isDeleting ? <LoadingSpinner size="sm" /> : '🗑️'}
                    </button>
                </td>
            </tr>
        </>
    );
};

const TaskManager: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter states
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [isCreating, setIsCreating] = useState(false);
    const [newTask, setNewTask] = useState<TaskCreate>({
        task_name: '',
        task_description: '',
        completed: false,
    });

    // Operation states
    const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set());
    const [deletingTasks, setDeletingTasks] = useState<Set<number>>(new Set());

    // Batch operation states
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
    const [isBatchOperating, setIsBatchOperating] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, filter, searchTerm]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [tasksData, serverData] = await Promise.all([
                apiClient.getAllTasks(),
                apiClient.getServerInfo(),
            ]);
            setTasks(tasksData);
            setServerInfo(serverData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filterTasks = () => {
        let filtered = tasks;

        // Apply completion filter
        if (filter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        } else if (filter === 'pending') {
            filtered = filtered.filter(task => !task.completed);
        }

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(task =>
                task.task_name.toLowerCase().includes(search) ||
                task.task_description.toLowerCase().includes(search)
            );
        }

        setFilteredTasks(filtered);
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTask.task_name.trim() || !newTask.task_description.trim()) {
            setError('Task name and description are required');
            return;
        }

        try {
            setIsCreating(true);
            const createdTask = await apiClient.createTask(newTask);
            setTasks(prev => [...prev, createdTask]);
            setNewTask({ task_name: '', task_description: '', completed: false });
            setSuccess('Task created successfully!');
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateTask = async (taskId: number, updates: TaskUpdate) => {
        try {
            setUpdatingTasks(prev => new Set(prev).add(taskId));
            const updatedTask = await apiClient.updateTask(taskId, updates);
            setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
            setSuccess('Task updated successfully!');
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
        } finally {
            setUpdatingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            setDeletingTasks(prev => new Set(prev).add(taskId));
            await apiClient.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
            setSelectedTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
            setSuccess('Task deleted successfully!');
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete task');
        } finally {
            setDeletingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }
    };

    // Batch operation functions
    const handleToggleSelect = (taskId: number) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedTasks.size === filteredTasks.length) {
            setSelectedTasks(new Set());
        } else {
            setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
        }
    };

    const handleBatchMarkCompleted = async () => {
        if (selectedTasks.size === 0) return;

        try {
            setIsBatchOperating(true);
            const promises = Array.from(selectedTasks).map(taskId =>
                apiClient.updateTask(taskId, { completed: true })
            );

            const updatedTasks = await Promise.all(promises);

            setTasks(prev => prev.map(task => {
                const updated = updatedTasks.find(ut => ut.id === task.id);
                return updated || task;
            }));

            setSelectedTasks(new Set());
            setSuccess(`${selectedTasks.size} tasks marked as completed!`);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update tasks');
        } finally {
            setIsBatchOperating(false);
        }
    };

    const handleBatchMarkPending = async () => {
        if (selectedTasks.size === 0) return;

        try {
            setIsBatchOperating(true);
            const promises = Array.from(selectedTasks).map(taskId =>
                apiClient.updateTask(taskId, { completed: false })
            );

            const updatedTasks = await Promise.all(promises);

            setTasks(prev => prev.map(task => {
                const updated = updatedTasks.find(ut => ut.id === task.id);
                return updated || task;
            }));

            setSelectedTasks(new Set());
            setSuccess(`${selectedTasks.size} tasks marked as pending!`);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update tasks');
        } finally {
            setIsBatchOperating(false);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedTasks.size === 0) return;

        try {
            setIsBatchOperating(true);
            const promises = Array.from(selectedTasks).map(taskId =>
                apiClient.deleteTask(taskId)
            );

            await Promise.all(promises);

            setTasks(prev => prev.filter(task => !selectedTasks.has(task.id)));
            setSelectedTasks(new Set());
            setSuccess(`${selectedTasks.size} tasks deleted successfully!`);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tasks');
        } finally {
            setIsBatchOperating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    // Show prominent error state for connection issues
    if (error && (error.includes("Can't connect to backend") || error.includes("Failed to load data"))) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200 max-w-md">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Task Manager</h1>

                {/* Server Info */}
                {serverInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="text-lg font-semibold text-blue-900 mb-2">Backend Server Info</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-blue-800">Server ID:</span>
                                <p className="text-blue-700">{serverInfo.server_id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-blue-800">Hostname:</span>
                                <p className="text-blue-700">{serverInfo.hostname}</p>
                            </div>
                            <div>
                                <span className="font-medium text-blue-800">Container ID:</span>
                                <p className="text-blue-700 font-mono text-xs break-all">{serverInfo.container_id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}
                {success && (
                    <Alert
                        type="success"
                        message={success}
                        onClose={() => setSuccess(null)}
                    />
                )}

                {/* Create Task Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task Name
                                </label>
                                <input
                                    type="text"
                                    value={newTask.task_name}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, task_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                    placeholder="Enter task name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task Description
                                </label>
                                <input
                                    type="text"
                                    value={newTask.task_description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, task_description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                    placeholder="Enter task description"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="completed"
                                checked={newTask.completed}
                                onChange={(e) => setNewTask(prev => ({ ...prev, completed: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
                                Mark as completed
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isCreating ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                    </form>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({tasks.length})
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'completed'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Completed ({tasks.filter(t => t.completed).length})
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'pending'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Pending ({tasks.filter(t => !t.completed).length})
                            </button>
                        </div>

                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search tasks by name or description..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Batch Operations */}
                {selectedTasks.size > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
                                </span>
                                <button
                                    onClick={() => setSelectedTasks(new Set())}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear selection
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleBatchMarkCompleted}
                                    disabled={isBatchOperating}
                                    className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isBatchOperating ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                                    Mark Completed
                                </button>
                                <button
                                    onClick={handleBatchMarkPending}
                                    disabled={isBatchOperating}
                                    className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isBatchOperating ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                                    Mark Pending
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    disabled={isBatchOperating}
                                    className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isBatchOperating ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Tasks ({filteredTasks.length})
                        </h2>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                {searchTerm ? 'No tasks match your search criteria.' : 'No tasks found. Create your first task above!'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTasks.map((task) => (
                                        <EditableTaskRow
                                            key={task.id}
                                            task={task}
                                            onUpdate={handleUpdateTask}
                                            onDelete={handleDeleteTask}
                                            isUpdating={updatingTasks.has(task.id)}
                                            isDeleting={deletingTasks.has(task.id)}
                                            isSelected={selectedTasks.has(task.id)}
                                            onToggleSelect={handleToggleSelect}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskManager;
