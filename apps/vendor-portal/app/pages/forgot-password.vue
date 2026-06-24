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
          <h2 class="text-2xl font-bold text-[var(--foreground)] tracking-tight">ลืมรหัสผ่าน</h2>
          <p class="text-xs text-[var(--muted-foreground)]">กรอกอีเมลของคุณเพื่อรับลิงก์กู้คืนรหัสผ่าน</p>
        </div>

        <div v-if="successMessage" class="space-y-4">
          <div class="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 space-y-2">
            <p class="font-semibold">{{ successMessage }}</p>
            <p class="text-[10px] text-emerald-600">สำหรับการทดสอบในระบบจำลอง (Prototype) คุณสามารถคลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านได้ทันที:</p>
          </div>
          
          <UButton
            block
            size="md"
            color="emerald"
            class="font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            @click="goToResetPage"
          >
            ไปที่หน้ากำหนดรหัสผ่านใหม่
          </UButton>

          <div class="text-center pt-2">
            <NuxtLink to="/login" class="text-xs text-[var(--primary)] hover:underline font-semibold">
              กลับไปหน้าเข้าสู่ระบบ
            </NuxtLink>
          </div>
        </div>

        <!-- Form Content -->
        <form v-else @submit.prevent="handleRequestReset" class="space-y-4">
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
              placeholder="vendor@company.com" 
              size="md"
              icon="i-heroicons-envelope-20-solid"
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
            ส่งอีเมลตั้งรหัสผ่านใหม่
          </UButton>

          <div class="text-center pt-2">
            <NuxtLink to="/login" class="text-xs text-[var(--primary)] hover:underline font-semibold">
              กลับหน้าเข้าสู่ระบบ
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  layout: false,
});

const email = ref('vendor1@scgjwd.com');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const resetToken = ref('');

const handleRequestReset = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const response: any = await $fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    });
    if (response.success) {
      successMessage.value = response.message;
      resetToken.value = response.token;
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'ไม่พบอีเมลผู้ใช้งานในระบบ หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
  } finally {
    isLoading.value = false;
  }
};

const goToResetPage = () => {
  navigateTo(`/reset-password?token=${resetToken.value}`);
};
</script>
