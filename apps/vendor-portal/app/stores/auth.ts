import { defineStore } from 'pinia';
import { VendorStatus } from '@p2p/shared';

interface VendorAuthState {
  token: string | null;
  vendor: {
    vendorId: string;
    vendorName: string;
    email: string;
    status: VendorStatus;
  } | null;
}

export const useVendorAuthStore = defineStore('vendor-auth', {
  state: (): VendorAuthState => ({
    token: null,
    vendor: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      const tokenCookie = useCookie('vendor-token');
      tokenCookie.value = token;
    },
    setVendor(vendor: any) {
      this.vendor = vendor;
    },
    async login(email: string, pass: string) {
      try {
        if (email.includes('vendor') || email.includes('ven')) {
          this.setToken('mock-vendor-jwt-token-123456');
          this.setVendor({
            vendorId: '00000000-0000-0000-0000-000000000601',
            vendorName: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
            email: email,
            status: VendorStatus.ACTIVE,
          });
          return true;
        }
        throw new Error('Invalid vendor credentials');
      } catch (err) {
        console.error('Vendor login error:', err);
        throw err;
      }
    },
    logout() {
      this.token = null;
      this.vendor = null;
      const tokenCookie = useCookie('vendor-token');
      tokenCookie.value = null;
      navigateTo('/login');
    },
    initializeAuth() {
      const tokenCookie = useCookie('vendor-token');
      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        this.vendor = {
          vendorId: '00000000-0000-0000-0000-000000000601',
          vendorName: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
          email: 'vendor1@scgjwd.com',
          status: VendorStatus.ACTIVE,
        };
      }
    }
  },
});
