import type {
  ApiError,
  LoginResponse,
  Paginated,
  Task,
  TaskCreatePayload,
  TaskQuery,
  TaskUpdatePayload,
  User
} from "~/utils/types";

export function useApi() {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("token", {
    default: () => null
  });

  const $api = $fetch.create({
    baseURL: config.public.apiBase as string,

    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${token.value}`);
        options.headers = headers;
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        token.value = null;
        navigateTo("/login");
      }
    }
  });

  async function getCurrentUser() {
    return $api<User>("/user");
  }

  async function login(email: string, password: string) {
    return $api<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password }
    });
  }

  async function logout() {
    return $api("/auth/logout", { method: "POST" });
  }

  async function fetchTasks(query: TaskQuery) {
    const params = new URLSearchParams();

    if (query.status) params.append("status", query.status);
    if (query.search) params.append("search", query.search);
    if (query.sort) params.append("sort", query.sort);
    if (query.order) params.append("order", query.order);
    if (query.page) params.append("page", String(query.page));
    if (query.per_page) params.append("per_page", String(query.per_page));

    return $api<Paginated<Task>>(`/tasks?${params.toString()}`);
  }

  async function fetchTask(id: number) {
    return $api<{ data: Task }>(`/tasks/${id}`);
  }

  async function createTask(payload: TaskCreatePayload) {
    return $api<{ data: Task }>("/tasks", {
      method: "POST",
      body: payload
    });
  }

  async function updateTask(id: number, payload: TaskUpdatePayload) {
    return $api<{ data: Task }>(`/tasks/${id}`, {
      method: "PUT",
      body: payload
    });
  }

  async function deleteTask(id: number) {
    return $api(`/tasks/${id}`, { method: "DELETE" });
  }

  function normalizeError(err: unknown): ApiError {
    return (err as { data?: ApiError })?.data ?? {
      message: "Что-то пошло не так"
    };
  }

  return {
    $api,
    login,
    logout,
    getCurrentUser,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    normalizeError
  };
}
