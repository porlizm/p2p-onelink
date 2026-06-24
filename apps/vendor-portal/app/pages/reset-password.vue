<template>
  <div class="flex min-h-screen bg-[#080E1A] relative overflow-hidden font-sans">
    <!-- Decorative Background Glows -->
    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-radial from-[#0054ff]/10 to-transparent blur-3xl"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-radial from-[#002266]/30 to-transparent blur-3xl"></div>
    
    <div class="m-auto w-full max-w-md p-6 z-10">
      <div class="bg-white/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,34,102,0.15)] space-y-6 transition-all duration-300">
        
        <!-- Header / Branding -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#EF5C23] to-[#FF8E53] text-white font-extrabold text-2xl shadow-lg shadow-[#EF5C23]/20 mb-2">
            V
          </div>
          <h2 class="text-2xl font-bold text-[var(--foreground)] tracking-tight">กำหนดรหัสผ่านใหม่</h2>
          <p class="text-xs text-[var(--muted-foreground)]">สร้างรหัสผ่านที่มีความปลอดภัยสูงระดับองค์กร</p>
        </div>

        <div v-if="successMessage" class="space-y-4">
          <div class="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
            <p class="font-semibold text-center">{{ successMessage }}</p>
          </div>
          
          <UButton
            block
            size="md"
            class="font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[#0044DD] hover:from-[#0044DD] hover:to-[#0033BB] rounded-xl h-11"
            to="/login"
          >
            เข้าสู่ระบบด้วยรหัสใหม่
          </UButton>
        </div>

        <!-- Form Content -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
          <!-- Error Alert -->
          <div 
            v-if="errorMessage" 
            class="p-3 bg-[var(--destructive-soft)] text-[var(--destructive-soft-foreground)] text-xs rounded-xl border border-[var(--destructive-soft-foreground)]/10"
          >
            {{ errorMessage }}
          </div>

          <div class="space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] text-slate-500">
            <p class="font-semibold text-slate-700">นโยบายความปลอดภัยของรหัสผ่าน:</p>
            <p :class="hasMinLength ? 'text-emerald-600' : 'text-slate-500'">• ความยาวอย่างน้อย 8 ตัวอักษร</p>
            <p :class="hasUpperLower ? 'text-emerald-600' : 'text-slate-500'">• ประกอบด้วยอักษรพิมพ์ใหญ่ (A-Z) และพิมพ์เล็ก (a-z)</p>
            <p :class="hasNumber ? 'text-emerald-600' : 'text-slate-500'">• ประกอบด้วยตัวเลขอย่างน้อย 1 ตัว</p>
            <p :class="hasSpecial ? 'text-emerald-600' : 'text-slate-500'">• ประกอบด้วยอักษรพิเศษอย่างน้อย 1 ตัว (@, #, $, %, etc.)</p>
          </div>

          <UFormField label="รหัสผ่านใหม่ (New Password)" name="password" required>
            <UInput 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              size="md"
              icon="i-heroicons-lock-closed-20-solid"
              class="w-full mt-1"
            />
          </UFormField>

          <UFormField label="ยืนยันรหัสผ่านใหม่ (Confirm Password)" name="confirmPassword" required>
            <UInput 
              v-model="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              size="md"
              icon="i-heroicons-lock-closed-20-solid"
              class="w-full mt-1"
            />
          </UFormField>

          <UButton 
            type="submit" 
            block 
            size="md"
            :loading="isLoading"
            class="mt-6 font-semibold h-11 bg-gradient-to-r from-[var(--primary)] to-[#0044DD] hover:from-[#0044DD] hover:to-[#0033BB] text-white rounded-xl shadow-md shadow-[#0054ff]/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            อัปเดตรหัสผ่านใหม่
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
  layout: false,
});

const route = useRoute();
const token = computed(() => route.query.token as string);

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Password validation computed properties
const hasMinLength = computed(() => password.value.length >= 8);
const hasUpperLower = computed(() => /[a-z]/.test(password.value) && /[A-Z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));
const hasSpecial = computed(() => /[@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`-]/.test(password.value));

const isPasswordValid = computed(() => {
  return hasMinLength.value && hasUpperLower.value && hasNumber.value && hasSpecial.value;
});

const handleResetPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!token.value) {
    errorMessage.value = 'ไม่พบ Token สำหรับกู้คืนรหัสผ่าน กรุณากดลิงก์จากอีเมลของท่านอีกครั้ง';
    return;
  }

  if (!isPasswordValid.value) {
    errorMessage.value = 'รหัสผ่านของคุณไม่ตรงตามเกณฑ์นโยบายความปลอดภัย';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน';
    return;
  }

  isLoading.value = true;
  try {
    const response: any = await $fetch('http://localhost:3001/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
      },
    });
    if (response.success) {
      successMessage.value = response.message;
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้ หรือ Token หมดอายุแล้ว';
  } finally {
    isLoading.value = false;
  }
};
</script>
