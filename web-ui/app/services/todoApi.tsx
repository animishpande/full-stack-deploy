import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5200';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TodoDTO {
  title: string;
  isCompleted: boolean;
}

export const todoApi = {
  // Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todoitems');
    return response.data;
  },

  // Get completed todos
  getCompletedTodos: async (): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/todoitems/complete');
    return response.data;
  },

  // Get todo by id
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await api.get<Todo>(`/todoitems/${id}`);
    return response.data;
  },

  // Create new todo
  createTodo: async (todoDto: TodoDTO): Promise<Todo> => {
    const response = await api.post<Todo>('/todoitems', todoDto);
    return response.data;
  },

  // Update todo
  updateTodo: async (id: string, todoDto: TodoDTO): Promise<string> => {
    const response = await api.put<string>(`/todoitems/${id}`, todoDto);
    return response.data;
  },

  // Complete todo by title
  completeTodoByTitle: async (title: string): Promise<string> => {
    const response = await api.put<string>(`/todoitems/complete/${title}`);
    return response.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<string> => {
    const response = await api.delete<string>(`/todoitems/${id}`);
    return response.data;
  },
};