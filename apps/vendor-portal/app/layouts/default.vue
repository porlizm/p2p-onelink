<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-[var(--background)] font-sans text-[var(--foreground)]">
    <!-- Topbar Centric Layout for Vendor Portal -->
    <header class="flex items-center justify-between h-16 bg-[var(--sidebar)] border-b border-[var(--border)] px-6 z-10 shadow-[var(--shadow-sm)]">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shadow-[var(--shadow-sm)]">
            V
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-sm tracking-tight text-[var(--foreground)]">
              SCGJWD e-Procurement
            </span>
            <span class="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider">
              Vendor Self-Service Portal
            </span>
          </div>
        </div>

        <!-- Desktop Navigation Items -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path"
            class="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)] transition-colors"
            active-class="bg-[var(--sidebar-accent)] !text-[var(--primary)] font-medium"
          >
            <UIcon :name="item.icon" class="w-4 h-4" />
            <span>{{ item.title }}</span>
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <!-- Vendor Badge -->
        <div class="flex items-center gap-2 px-3 py-1 bg-[var(--success-soft)] rounded-full text-xs text-[var(--success-soft-foreground)] border border-[var(--success-soft-foreground)]/10 font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
          <span>{{ vendorName }}</span>
        </div>

        <!-- Notification Bell -->
        <button class="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--secondary)] transition-all">
          <UIcon name="i-heroicons-bell-20-solid" class="w-5 h-5" />
        </button>

        <!-- Divider -->
        <div class="h-6 w-px bg-[var(--border)]"></div>

        <!-- Logout Button -->
        <button 
          @click="handleLogout"
          class="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-sm text-[var(--destructive)] hover:bg-[var(--destructive-soft)] transition-colors"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle-20-solid" class="w-4 h-4" />
          <span class="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>

    <!-- Mobile Navigation Bar -->
    <div class="md:hidden flex items-center justify-around h-12 bg-white border-b border-[var(--border)] px-4">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path"
        class="flex flex-col items-center justify-center flex-1 py-1 text-[10px] text-[var(--muted-foreground)]"
        active-class="!text-[var(--primary)] font-semibold"
      >
        <UIcon :name="item.icon" class="w-5 h-5 mb-0.5" />
        <span>{{ item.title }}</span>
      </NuxtLink>
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();

const vendorName = computed(() => authStore.vendor?.vendorName || 'คู่ค้าทดสอบ');

const handleLogout = () => {
  authStore.logout();
};

const navItems = [
  { title: 'แดชบอร์ด', path: '/', icon: 'i-heroicons-squares-2x2-20-solid' },
  { title: 'เสนอราคา (Bidding)', path: '/bids', icon: 'i-heroicons-document-currency-bangladesh-20-solid' }, // i-heroicons-banknotes
  { title: 'ใบสั่งซื้อ (PO)', path: '/orders', icon: 'i-heroicons-shopping-bag-20-solid' },
  { title: 'ใบกำกับภาษี (Invoice)', path: '/invoices', icon: 'i-heroicons-document-text-20-solid' },
  { title: 'ข้อมูลบริษัท', path: '/profile', icon: 'i-heroicons-building-office-20-solid' },
];
</script>
