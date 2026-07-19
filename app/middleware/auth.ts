export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, user, fetchUser } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }

  if (!user.value) {
    try {
      await fetchUser();
    } catch {
      return navigateTo("/login");
    }
  }
});
