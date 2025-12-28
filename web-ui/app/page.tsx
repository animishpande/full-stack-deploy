'use client';

import { useState, useEffect } from 'react';
import { todoApi, Todo } from './services/todoApi';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await todoApi.getAllTodos();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Make sure the API is running.');
      console.error('Error loading todos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      try {
        await todoApi.createTodo({
          title: newTodoTitle,
          isCompleted: false,
        });
        setNewTodoTitle('');
        await loadTodos(); // Reload todos after adding
      } catch (err) {
        setError('Failed to add todo.');
        console.error('Error adding todo:', err);
      }
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      await todoApi.updateTodo(todo.id, {
        title: todo.title,
        isCompleted: !todo.isCompleted,
      });
      await loadTodos(); // Reload todos after updating
    } catch (err) {
      setError('Failed to update todo.');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      await loadTodos(); // Reload todos after deleting
    } catch (err) {
      setError('Failed to delete todo.');
      console.error('Error deleting todo:', err);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.isCompleted;
    if (filter === 'completed') return todo.isCompleted;
    return true;
  });

  const activeCount = todos.filter(t => !t.isCompleted).length;
  const completedCount = todos.filter(t => t.isCompleted).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">
            Todo List
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          
          {/* Add Todo Form */}
          <form onSubmit={handleAddTodo} className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-5 py-4 bg-slate-100/50 dark:bg-slate-800/50 border-0 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-medium rounded-2xl transition-all duration-150 shadow-lg shadow-blue-500/30"
              >
                Add
              </button>
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50">
            {(['all', 'active', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-150 ${
                  filter === filterType
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'active' && activeCount > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
                {filterType === 'completed' && completedCount > 0 && (
                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                    {completedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Todo List */}
          <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50 max-h-[500px] overflow-y-auto">
            {filteredTodos.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                  {filter === 'completed' ? 'No completed tasks' : filter === 'active' ? 'No active tasks' : 'No tasks yet'}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                  {filter === 'all' && 'Add a task to get started'}
                </p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo)}
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-150 flex items-center justify-center"
                    style={{
                      borderColor: todo.isCompleted ? '#3b82f6' : '#cbd5e1',
                      backgroundColor: todo.isCompleted ? '#3b82f6' : 'transparent',
                    }}
                  >
                    {todo.isCompleted && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Todo Title */}
                  <span
                    className={`flex-1 text-base transition-all ${
                      todo.isCompleted
                        ? 'text-slate-400 dark:text-slate-500 line-through'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {todo.title}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Stats */}
          {todos.length > 0 && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex justify-center gap-6 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Total: <span className="font-semibold text-slate-900 dark:text-white">{todos.length}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Active: <span className="font-semibold text-blue-600 dark:text-blue-400">{activeCount}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Done: <span className="font-semibold text-green-600 dark:text-green-400">{completedCount}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center mt-8 text-slate-400 dark:text-slate-600 text-sm">
          Press Enter to quickly add tasks
        </p>
      </div>
    </div>
  );
}