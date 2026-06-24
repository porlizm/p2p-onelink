import { defineStore } from 'pinia';
import { UserRole } from '@p2p/shared';

interface AuthState {
  token: string | null;
  user: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  } | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentRole: (state) => state.user?.role || null,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      const tokenCookie = useCookie('token');
      tokenCookie.value = token;
    },
    setUser(user: any) {
      this.user = user;
    },
    async login(email: string, pass: string) {
      try {
        const response = await $fetch<{ access_token: string; user: any }>('http://localhost:3001/api/auth/login', {
          method: 'POST',
          body: { email, password: pass },
        });
        
        this.setToken(response.access_token);
        this.setUser(response.user);
        return true;
      } catch (err) {
        console.error('Login error:', err);
        // Fallback for prototype demo if backend or database is offline
        if (email === 'nantaporn.s@scgjwd.com' && pass === 'password123') {
          console.warn('Backend connection failed. Using mock session for prototype demo.');
          this.setToken('mock-admin-token-123456');
          this.setUser({
            userId: '00000000-0000-0000-0000-000000000410',
            username: 'nantaporn.s',
            email: 'nantaporn.s@scgjwd.com',
            role: UserRole.ADMIN,
          });
          return true;
        }
        throw err;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      const tokenCookie = useCookie('token');
      tokenCookie.value = null;
      navigateTo('/login');
    },
    initializeAuth() {
      const tokenCookie = useCookie('token');
      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        // In prototype, we mock the user context if token is present
        this.user = {
            userId: '00000000-0000-0000-0000-000000000410',
            username: 'nantaporn.s',
            email: 'nantaporn.s@scgjwd.com',
            role: UserRole.ADMIN,
            pdpaConsentDate: null, // Set to null to show PDPA popup on first load
          };
        }
      },
      async recordPdpaConsent() {
        try {
          const response = await $fetch<{ success: boolean; pdpaConsentDate: string }>('http://localhost:3001/api/auth/pdpa-consent', {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.token}` },
          });
          if (this.user) {
            this.user.pdpaConsentDate = response.pdpaConsentDate;
          }
          return true;
        } catch (err) {
          console.error('Failed to record PDPA consent on server:', err);
          if (this.user) {
            this.user.pdpaConsentDate = new Date().toISOString();
          }
          return true;
        }
      }
    },
  });
