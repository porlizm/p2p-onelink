<template>
  <div class="login-shell">
    <!-- Background glows -->
    <div class="login-bg" aria-hidden="true">
      <div class="login-bg__glow login-bg__glow--1" />
      <div class="login-bg__glow login-bg__glow--2" />
      <div class="login-bg__grid" />
    </div>

    <!-- Centered card -->
    <div class="login-center">
      <div class="login-card">

        <!-- Branding -->
        <div class="login-card__brand">
          <div class="brand-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.95"/>
              <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="brand-title">เข้าสู่ระบบ Procurement Hub</h1>
          <p class="brand-sub">ระบบจัดซื้อจัดจ้างอิเล็กทรอนิกส์ SCGJWD e-Procurement</p>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="login-error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" flex-shrink="0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">อีเมลผู้ใช้งาน (Email) <span class="form-required">*</span></label>
            <div class="form-input-wrap">
              <span class="form-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="login-email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="name@scgjwd.com"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">รหัสผ่าน (Password) <span class="form-required">*</span></label>
            <div class="form-input-wrap">
              <span class="form-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input form-input--pw"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button type="button" class="pw-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'">
                <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="form-remember">
              <input type="checkbox" v-model="rememberMe" class="form-remember__chk" />
              <span class="form-remember__mark" />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>
            <a href="#" class="form-forgot">ลืมรหัสผ่าน?</a>
          </div>

          <button type="submit" class="btn-signin" :class="{ 'btn-signin--loading': isLoading }" :disabled="isLoading">
            <span v-if="isLoading" class="btn-signin__spinner" aria-hidden="true" />
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </template>
            {{ isLoading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ (Sign In)' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="login-divider">
          <span class="login-divider__line" />
          <span class="login-divider__label">หรือ</span>
          <span class="login-divider__line" />
        </div>

        <!-- SSO -->
        <button type="button" class="btn-sso" @click="handleSSOLogin" :disabled="isLoading">
          <svg viewBox="0 0 21 21" width="18" height="18" style="flex-shrink:0">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          ลงชื่อเข้าใช้ด้วย Azure AD SSO
        </button>

        <!-- Footer note -->
        <p class="login-card__note">
          ระบบนี้สำหรับพนักงาน SCGJWD และคู่ค้าที่ลงทะเบียนแล้วเท่านั้น
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ layout: false });

const authStore = useAuthStore();
const email = ref('nantaporn.s@scgjwd.com');
const password = ref('password123');
const isLoading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

const handleLogin = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const success = await authStore.login(email.value, password.value);
    if (success) await navigateTo('/');
  } catch (err: any) {
    errorMessage.value = err?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  } finally {
    isLoading.value = false;
  }
};

const handleSSOLogin = () => {
  if (isLoading.value) return;
  isLoading.value = true;
  errorMessage.value = '';
  setTimeout(() => {
    authStore.setToken('mock-sso-jwt-token-123456');
    authStore.setUser({
      userId: '00000006-0000-0000-0000-000000000010',
      username: 'nantaporn.s',
      email: 'nantaporn.s@scgjwd.com',
      role: 'Admin',
    });
    isLoading.value = false;
    navigateTo('/');
  }, 1200);
};
</script>

<style scoped>
/* ── Shell ── */
.login-shell {
  display: flex;
  min-height: 100dvh;
  background: #080E1A;
  font-family: var(--font-sans, 'Chesna Grotesk', 'Inter', sans-serif);
  position: relative;
  overflow: hidden;
}

/* ── Background ── */
.login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.login-bg__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}
.login-bg__glow--1 {
  width: 55%; height: 55%;
  top: -15%; left: -10%;
  background: radial-gradient(circle, rgba(0,146,69,0.13) 0%, transparent 70%);
}
.login-bg__glow--2 {
  width: 60%; height: 60%;
  bottom: -20%; right: -10%;
  background: radial-gradient(circle, rgba(0,60,30,0.18) 0%, transparent 70%);
}
.login-bg__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ── Center container ── */
.login-center {
  position: relative;
  z-index: 1;
  margin: auto;
  width: 100%;
  max-width: 448px;
  padding: 24px 16px;
}

/* ── Card ── */
.login-card {
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow:
    0 24px 64px rgba(0,0,0,0.28),
    0 0 0 1px rgba(255,255,255,0.12);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Branding ── */
.login-card__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 28px;
  gap: 8px;
}

.brand-icon {
  width: 60px; height: 60px;
  border-radius: 18px;
  background: linear-gradient(135deg, #009245, #39b54a);
  box-shadow: 0 8px 24px rgba(0,146,69,0.35);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}

.brand-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin: 0;
}

.brand-sub {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

/* ── Error ── */
.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff0f0;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

/* ── Form ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-required { color: #ef4444; margin-left: 2px; }

.form-input-wrap {
  position: relative;
}

.form-input-icon {
  position: absolute;
  left: 13px; top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex; align-items: center;
  pointer-events: none;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  height: 46px;
  padding: 0 14px 0 40px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  font-family: inherit;
}
.form-input:focus {
  border-color: #009245;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0,146,69,0.11);
}
.form-input::placeholder { color: #c4c9d4; }
.form-input--pw { padding-right: 46px; }

.pw-toggle {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  padding: 4px; cursor: pointer;
  color: #9ca3af;
  display: flex; align-items: center;
  border-radius: 6px;
  transition: color 0.15s;
}
.pw-toggle:hover { color: #374151; }

/* Options */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -2px;
}

.form-remember {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #6b7280;
  cursor: pointer; user-select: none;
}
.form-remember__chk { display: none; }
.form-remember__mark {
  width: 16px; height: 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 5px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #fff; transition: all 0.15s;
}
.form-remember__chk:checked + .form-remember__mark {
  background: #009245; border-color: #009245;
}
.form-remember__chk:checked + .form-remember__mark::after {
  content: '';
  display: block;
  width: 4px; height: 7px;
  border: 2px solid white;
  border-top: none; border-left: none;
  transform: rotate(45deg) translateY(-1px);
}

.form-forgot {
  font-size: 13px; font-weight: 600;
  color: #009245; text-decoration: none;
  transition: color 0.15s;
}
.form-forgot:hover { color: #007838; }

/* ── Sign In Button ── */
.btn-signin {
  margin-top: 6px;
  width: 100%; height: 48px;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: linear-gradient(135deg, #009245 0%, #39b54a 100%);
  color: #fff;
  font-size: 15px; font-weight: 700; font-family: inherit;
  border: none; border-radius: 14px; cursor: pointer;
  letter-spacing: 0.01em;
  position: relative; overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  box-shadow: 0 4px 20px rgba(0,146,69,0.38), 0 1px 6px rgba(0,0,0,0.12);
}
.btn-signin::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%);
}
.btn-signin:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0,146,69,0.48), 0 2px 10px rgba(0,0,0,0.15);
}
.btn-signin:active:not(:disabled) { transform: translateY(0); }
.btn-signin:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-signin__spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divider ── */
.login-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 22px 0 16px;
}
.login-divider__line { flex: 1; height: 1px; background: #e5e7eb; }
.login-divider__label {
  font-size: 11px; font-weight: 600;
  color: #c4c9d4; letter-spacing: 0.08em; text-transform: uppercase;
}

/* ── SSO Button ── */
.btn-sso {
  width: 100%; height: 44px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px; font-weight: 600; color: #374151;
  font-family: inherit; cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.btn-sso:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  transform: translateY(-1px);
}
.btn-sso:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Footer note ── */
.login-card__note {
  margin-top: 20px;
  font-size: 11px;
  text-align: center;
  color: #c4c9d4;
  line-height: 1.6;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}
</style>
