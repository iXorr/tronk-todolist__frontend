export type TaskStatus = "pending" | "in_progress" | "completed";

export interface User {
  id: number;
  email: string;
  name?: string;
  is_admin: boolean;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  can_update: boolean; // подсказка с backend
  can_delete: boolean; // подсказка с backend
}

/**
 * Laravel-ответ с ошибкой
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Laravel-ответ с
 * пагинацией (envelope)
 */
export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface TaskQuery {
  status?: TaskStatus;
  search?: string;
  sort?: "due_date" | "status" | "created_at";
  order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  status?: TaskStatus;
}

export type TaskUpdatePayload = Partial<TaskCreatePayload>;
