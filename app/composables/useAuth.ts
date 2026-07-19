import type { User } from "~/utils/types";

export function useAuth() {
  const token = useCookie<string | null>("token", {
    default: () => null
  });
  const user = useState<User | null>("user", () => null);

  const {
    login: apiLogin,
    logout: apiLogout,
    getCurrentUser,
    normalizeError
  } = useApi();

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.is_admin ?? false);

  async function login(email: string, password: string) {
    const response = await apiLogin(email, password);
    token.value = response.token;
    user.value = response.user;
    return response;
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // игнорируем ошибки при логауте
    }

    token.value = null;
    user.value = null;

    await navigateTo("/login");
  }

  async function fetchUser() {
    try {
      const response = await getCurrentUser();
      user.value = response.data;
    } catch {
      user.value = null;
      throw new Error("Failed to fetch user");
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser,
    normalizeError
  };
}
