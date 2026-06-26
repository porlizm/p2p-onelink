<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();
authStore.initializeAuth();

// Force light mode globally to prevent theme mismatch with light layouts
const colorMode = useColorMode();
colorMode.preference = 'light';
</script>
