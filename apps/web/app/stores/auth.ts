import { defineStore } from 'pinia';
import { UserRole } from '@p2p/shared';

interface AuthState {
  token: string | null;
  user: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
    pdpaConsentDate?: string | null;
    allowedIpRange?: string | null;
    companyId?: string | null;
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
      // ── Demo shortcut: ข้ามการเรียก API สำหรับ prototype (ทำงานได้เสมอ) ──
      const DEMO_USERS: Record<string, { password: string; userId: string; username: string; role: UserRole }> = {
        'nantaporn.s@scgjwd.com': { password: 'password123', userId: '00000006-0000-0000-0000-000000000010', username: 'nantaporn.s', role: UserRole.ADMIN },
        'buyer@scgjwd.com':       { password: 'password123', userId: '00000006-0000-0000-0000-000000000011', username: 'buyer',       role: UserRole.BUYER },
        'vendor@supplier.com':    { password: 'password123', userId: '00000006-0000-0000-0000-000000000012', username: 'vendor',       role: UserRole.REQUESTER },
      };

      const demoUser = DEMO_USERS[email];
      if (demoUser && pass === demoUser.password) {
        this.setToken('mock-token-' + demoUser.role.toLowerCase() + '-123456');
        this.setUser({
          userId: demoUser.userId,
          username: demoUser.username,
          email,
          role: demoUser.role,
          pdpaConsentDate: new Date().toISOString(),
        });
        return true;
      }

      // ── Real backend (ถ้า API กำลัง run) ──
      try {
        const response = await $fetch<{ access_token: string; user: any }>('http://localhost:3001/api/auth/login', {
          method: 'POST',
          body: { email, password: pass },
        });
        this.setToken(response.access_token);
        this.setUser({ ...response.user, pdpaConsentDate: response.user.pdpaConsentDate ?? new Date().toISOString() });
        return true;
      } catch (err) {
        console.error('Login error (backend):', err);
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
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
        if (!this.user) {
          this.user = {
            userId: '00000000-0000-0000-0000-000000000410',
            username: 'nantaporn.s',
            email: 'nantaporn.s@scgjwd.com',
            role: UserRole.ADMIN,
            pdpaConsentDate: new Date().toISOString(),
          };
        }
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
