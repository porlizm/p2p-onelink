<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();
authStore.initializeAuth();
</script>
