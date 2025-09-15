import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Square, Edit, Trash2, Plus, X, Loader } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Type Definitions ---
interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    description: string;
}

type FilterType = 'all' | 'active' | 'completed';

// --- Main App Component ---
export default function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState<string>('');
    const [newTaskDescription, setNewTaskDescription] = useState<string>('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // --- API Communication ---

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Task[] = await response.json();
            setTasks(data);
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
            setError('Failed to load tasks. Please ensure the backend is running and the API URL is correct.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const newTask: Omit<Task, 'id'> = {
            title: newTaskTitle.trim(), isCompleted: false,
            description: newTaskDescription.trim()
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            if (!response.ok) throw new Error('Failed to add task.');
            const addedTask: Task = await response.json();
            setTasks([addedTask, ...tasks]);
            setNewTaskTitle('');
        } catch (e) {
            console.error(e);
            setError('Failed to add task.');
        }
    };

    const handleToggleComplete = async (task: Task) => {
        const updatedTask = { ...task, isCompleted: !task.isCompleted };
        try {
            const response = await fetch(`${API_BASE_URL}/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask),
            });
            if (!response.ok) throw new Error('Failed to update task.');
            setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
        } catch (e) {
            console.error(e);
            setError('Failed to update task status.');
        }
    };

    const handleUpdateTask = async (taskToUpdate: Task) => {
        if (!taskToUpdate.title.trim()) {
            handleDeleteTask(taskToUpdate.id);
            setEditingTask(null);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/${taskToUpdate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskToUpdate),
            });
            if (!response.ok) throw new Error('Failed to save task.');
            setTasks(tasks.map(t => (t.id === taskToUpdate.id ? taskToUpdate : t)));
            setEditingTask(null);
        } catch (e) {
            console.error(e);
            setError('Failed to save task.');
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete task.');
            setTasks(tasks.filter(task => task.id !== id));
        } catch (e) {
            console.error(e);
            setError('Failed to delete task.');
        }
    };

    // --- Filtering Logic ---
    const filteredTasks = useMemo(() => {
        switch (filter) {
            case 'active':
                return tasks.filter(task => !task.isCompleted);
            case 'completed':
                return tasks.filter(task => task.isCompleted);
            default:
                return tasks;
        }
    }, [tasks, filter]);

    const activeTaskCount = useMemo(() => tasks.filter(task => !task.isCompleted).length, [tasks]);

    // --- Render Helper Components ---
    interface FilterButtonProps {
        value: FilterType;
        label: string;
    }
    const FilterButton = ({ value, label }: FilterButtonProps) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === value
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
        >
            {label}
        </button>
    );

    interface TaskItemProps {
        key: string;
        task: Task;
    }
    const TaskItem = ({ task }: TaskItemProps) => {
        const isEditing = editingTask?.id === task.id;

        const handleEdit = () => {
            setEditingTask({ ...task });
        };

        const handleCancelEdit = () => {
            setEditingTask(null);
        }

        const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (editingTask) {
                setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
            }
        }

        const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (editingTask) {
                handleUpdateTask(editingTask);
            }
        }

        //const handleBlurSave = () => {
        //    if (editingTask) {
        //        handleUpdateTask(editingTask);
        //    }
        //}

        return (
            <li className="items-center p-3 transition-colors duration-200 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="flex-grow w-full">
                        <input
                            name="title"
                            type="text"
                            value={editingTask?.title || ''}
                            onChange={handleEditChange}
                            className="w-full bg-transparent text-gray-900 dark:text-gray-100 border-b-2 border-blue-500 focus:outline-none font-medium text-base"
                        />
                        <textarea
                            name="description"
                            value={editingTask?.description || ''}
                            onChange={handleEditChange}
                            placeholder="Add a description..."
                            className="w-full mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            rows={3}
                        />
                        <div className="flex justify-end items-center space-x-2 mt-3">
                            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow">
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-start">
                        <button onClick={() => handleToggleComplete(task)} className="mr-4 flex-shrink-0 bg-transparent">
                        {task.isCompleted ? (
                            <CheckSquare size={24} className="text-green-500" />
                        ) : (
                            <Square size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        )}
                        </button>
                        <div className="flex-grow cursor-pointer" onDoubleClick={handleEdit}>
                            <span className={`text-gray-800 dark:text-gray-200 ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                                {task.title}
                            </span>
                            {task.description && (
                                <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${task.isCompleted ? 'line-through' : ''}`}>
                                    {task.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={handleEdit} className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </li>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <div>
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-2">Cliff's Task Management App</h1>
                    <p className="text-gray-500 dark:text-gray-400">Made for Ezra take-home assessment</p>
                </header>

                {/* --- Add Task Form --- */}
                <div className="mb-6">
                    <form onSubmit={handleAddTask} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
                        <div className="flex items-center">
                            <Plus size={24} className="text-gray-400 mr-3 flex-shrink-0" />
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Add Task name..."
                                className="w-full bg-transparent focus:outline-none text-lg font-medium"
                                required
                            />
                        </div>
                        <div className="pl-9 flex items-center">
                            <textarea
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                placeholder="Add a description... (optional)"
                                className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                rows={2}
                            />
                        </div>
                        <div className="flex justify-end mt-3">
                            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors shadow font-semibold text-sm">
                                Add Task
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- Main Content Area --- */}
                <main className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                    {/* --- Filters and Summary --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                            {activeTaskCount} {activeTaskCount === 1 ? 'task' : 'tasks'} left
                        </span>
                        <div className="flex items-center space-x-2">
                            <FilterButton value="all" label="All" />
                            <FilterButton value="active" label="Active" />
                            <FilterButton value="completed" label="Completed" />
                        </div>
                    </div>

                    {/* --- Error Display --- */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* --- Task List --- */}
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader size={32} className="animate-spin text-blue-500" />
                            <p className="ml-4 text-gray-500 dark:text-gray-400">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No tasks</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No tasks match the current filter.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {filteredTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                        </ul>
                    )}
                </main>

                <footer className="text-center mt-8 text-sm text-gray-400 dark:text-gray-500">
                    <p>Connects to ASP.NET Core backend API on port 8081 over SSL.</p>
                    <p>Hover over a task to see the edit and delete buttons.</p>
                </footer>
            </div>
        </div>
    );
}
