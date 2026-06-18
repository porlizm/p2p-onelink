<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[var(--background)] font-sans text-[var(--foreground)]">
    <!-- Sidebar -->
    <aside 
      class="flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transition-all duration-300 ease-in-out shadow-[var(--shadow-sm)]"
      :class="[isCollapsed ? 'w-[72px]' : 'w-[260px]']"
    >
      <!-- Logo Area -->
      <div class="flex items-center h-16 px-4 border-b border-[var(--sidebar-border)] justify-between overflow-hidden">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shadow-[var(--shadow-sm)]">
            O
          </div>
          <span v-if="!isCollapsed" class="font-semibold text-base tracking-tight text-[var(--foreground)] whitespace-nowrap">
            P2P OneLink
          </span>
        </div>
        <button 
          v-if="!isCollapsed" 
          @click="toggleSidebar" 
          class="p-1 rounded-md hover:bg-[var(--sidebar-accent)] text-[var(--muted-foreground)] transition-colors"
        >
          <UIcon name="i-heroicons-bars-3-bottom-left-20-solid" class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Menus -->
      <nav class="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        <NuxtLink 
          v-for="menu in menus" 
          :key="menu.path" 
          :to="menu.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-all duration-200 group text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
          active-class="bg-[var(--sidebar-accent)] !text-[var(--sidebar-primary)] border-l-3 border-[var(--sidebar-primary)] pl-2.25 font-medium"
        >
          <UIcon :name="menu.icon" class="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform" />
          <span v-if="!isCollapsed" class="text-sm whitespace-nowrap">{{ menu.title }}</span>
        </NuxtLink>
      </nav>

      <!-- Collapse Toggle when collapsed -->
      <div class="p-3 border-t border-[var(--sidebar-border)] flex justify-center" v-if="isCollapsed">
        <button 
          @click="toggleSidebar" 
          class="p-2 rounded-md hover:bg-[var(--sidebar-accent)] text-[var(--muted-foreground)] transition-colors"
        >
          <UIcon name="i-heroicons-chevron-double-right-20-solid" class="w-5 h-5" />
        </button>
      </div>

      <!-- User Info Footer -->
      <div class="p-4 border-t border-[var(--sidebar-border)] flex items-center gap-3 overflow-hidden">
        <UAvatar 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
          alt="Avatar"
          size="sm"
        />
        <div v-if="!isCollapsed" class="flex flex-col min-w-0">
          <span class="text-sm font-medium truncate text-[var(--foreground)]">คุณนันทพร ศิริวัฒน์</span>
          <span class="text-xs text-[var(--muted-foreground)] truncate">System Admin</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Topbar -->
      <header class="flex items-center justify-between h-16 bg-white border-b border-[var(--border)] px-6 z-10 shadow-[var(--shadow-sm)]">
        <div class="flex items-center gap-4">
          <button 
            v-if="isCollapsed" 
            @click="toggleSidebar" 
            class="p-1.5 rounded-md hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors"
          >
            <UIcon name="i-heroicons-bars-3-20-solid" class="w-5 h-5" />
          </button>
          <h1 class="text-lg font-medium text-[var(--foreground)]">{{ currentTitle }}</h1>
        </div>

        <div class="flex items-center gap-4">
          <!-- Company Badge -->
          <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)] rounded-[var(--radius)] text-xs text-[var(--foreground)] border border-[var(--border)]">
            <UIcon name="i-heroicons-building-office-2-20-solid" class="w-4 h-4 text-[var(--primary)]" />
            <span>SCGJWD Logistics</span>
          </div>

          <!-- Notification Bell -->
          <button class="relative p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--secondary)] transition-all">
            <UIcon name="i-heroicons-bell-20-solid" class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--destructive)] rounded-full ring-2 ring-white"></span>
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

      <!-- Router Content -->
      <main class="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleLogout = () => {
  authStore.logout();
};

const menus = [
  { title: 'แดชบอร์ด', path: '/', icon: 'i-heroicons-squares-2x2-20-solid' },
  { title: 'ข้อมูลคู่ค้า (Vendor)', path: '/vendors', icon: 'i-heroicons-users-20-solid' },
  { title: 'รายการสินค้า (Catalog)', path: '/catalog', icon: 'i-heroicons-shopping-bag-20-solid' },
  { title: 'ใบขอซื้อ (PR)', path: '/pr', icon: 'i-heroicons-document-text-20-solid' },
  { title: 'ประกวดราคา (Bidding)', path: '/bidding', icon: 'i-heroicons-trophy-20-solid' },
  { title: 'ใบสั่งซื้อ (PO)', path: '/po', icon: 'i-heroicons-shopping-cart-20-solid' },
  { title: 'รับของ & คลังสินค้า (GR)', path: '/gr-stock', icon: 'i-heroicons-archive-box-20-solid' },
  { title: 'การบัญชี (AP)', path: '/finance', icon: 'i-heroicons-banknotes-20-solid' },
  { title: 'รายการอนุมัติ (Approval)', path: '/approval', icon: 'i-heroicons-check-badge-20-solid' },
  { title: 'ตั้งค่าระบบ (Admin)', path: '/admin', icon: 'i-heroicons-cog-6-tooth-20-solid' },
];

const route = useRoute();
const currentTitle = computed(() => {
  const activeMenu = menus.find((m) => m.path === route.path);
  return activeMenu ? activeMenu.title : 'หน้าหลัก';
});
</script>
