<template>
  <div class="flex min-h-screen bg-[#080E1A] relative overflow-hidden font-sans">
    <!-- Decorative Background Glows -->
    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-radial from-[#0054ff]/10 to-transparent blur-3xl"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-radial from-[#002266]/30 to-transparent blur-3xl"></div>
    
    <div class="m-auto w-full max-w-md p-6 z-10">
      <div class="bg-white/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,34,102,0.15)] space-y-6 transition-all duration-300">
        
        <!-- Header / Branding -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[#0088FF] text-white font-extrabold text-2xl shadow-lg shadow-[#0054ff]/20 mb-2">
            P2P
          </div>
          <h2 class="text-2xl font-bold text-[var(--foreground)] tracking-tight">เข้าสู่ระบบ OneLink</h2>
          <p class="text-xs text-[var(--muted-foreground)]">ระบบจัดซื้อจัดจ้างอิเล็กทรอนิกส์ SCGJWD e-Procurement</p>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Error Alert -->
          <div 
            v-if="errorMessage" 
            class="p-3 bg-[var(--destructive-soft)] text-[var(--destructive-soft-foreground)] text-xs rounded-xl border border-[var(--destructive-soft-foreground)]/10"
          >
            {{ errorMessage }}
          </div>

          <UFormField label="อีเมลผู้ใช้งาน (Email)" name="email" required>
            <UInput 
              v-model="email" 
              type="email" 
              placeholder="napas.s@scgjwd.com" 
              size="md"
              icon="i-heroicons-envelope-20-solid"
              class="w-full mt-1"
            />
          </UFormField>

          <UFormField label="รหัสผ่าน (Password)" name="password" required>
            <UInput 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              size="md"
              icon="i-heroicons-lock-closed-20-solid"
              class="w-full mt-1"
            />
          </UFormField>

          <!-- Keep logged in & Forgot password -->
          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 text-[var(--muted-foreground)] cursor-pointer select-none">
              <input type="checkbox" class="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] w-4 h-4 transition" />
              <span>จดจำการเข้าสู่ระบบ</span>
            </label>
            <a href="#" class="text-[var(--primary)] hover:text-[#003BCC] transition font-medium">ลืมรหัสผ่าน?</a>
          </div>

          <UButton 
            type="submit" 
            block 
            size="md"
            :loading="isLoading"
            class="mt-6 font-semibold h-11 bg-gradient-to-r from-[var(--primary)] to-[#0044DD] hover:from-[#0044DD] hover:to-[#0033BB] text-white rounded-xl shadow-md shadow-[#0054ff]/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            เข้าสู่ระบบ (Sign In)
          </UButton>
        </form>

        <!-- SSO Divider -->
        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-[var(--border)]"></div>
          <span class="flex-shrink mx-4 text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">หรือเชื่อมต่อผ่านองค์กร</span>
          <div class="flex-grow border-t border-[var(--border)]"></div>
        </div>

        <!-- Microsoft Azure AD SSO Button -->
        <button 
          type="button"
          @click="handleSSOLogin"
          class="w-full h-11 border border-[var(--border)] hover:bg-[#F8FAFC] transition duration-200 rounded-xl flex items-center justify-center gap-3 text-xs font-semibold text-[var(--foreground)] cursor-pointer bg-white"
        >
          <svg class="w-4 h-4" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          <span>ลงชื่อเข้าใช้งานด้วย Azure AD SSO</span>
        </button>

        <div class="text-center text-[10px] text-[var(--muted-foreground)]">
          ระบบนี้ใช้งานสำหรับพนักงาน SCGJWD และคู่ค้าที่ลงทะเบียนแล้วเท่านั้น
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const email = ref('nantaporn.s@scgjwd.com'); // default admin email for easy demo
const password = ref('password123');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const success = await authStore.login(email.value, password.value);
    if (success) {
      navigateTo('/');
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
  } finally {
    isLoading.value = false;
  }
};

const handleSSOLogin = () => {
  isLoading.value = true;
  errorMessage.value = '';
  setTimeout(() => {
    // Mock Azure AD SSO login
    authStore.setToken('mock-sso-jwt-token-123456');
    authStore.setUser({
      userId: '00000000-0000-0000-0000-000000000410',
      username: 'nantaporn.s',
      email: 'nantaporn.s@scgjwd.com',
      role: 'ADMIN',
    });
    isLoading.value = false;
    navigateTo('/');
  }, 1000);
};
</script>
