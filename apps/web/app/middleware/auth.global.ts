import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  authStore.initializeAuth();
  
  // Skip middleware on login page
  if (to.path === '/login') {
    return;
  }
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});
