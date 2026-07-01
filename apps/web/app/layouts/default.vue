<template>
  <div class="app-shell">
    <!-- Ambient glowing backgrounds for glassmorphism -->
    <div class="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#009245]/8 blur-[120px] pointer-events-none z-0"></div>
    <div class="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#39B54A]/8 blur-[120px] pointer-events-none z-0"></div>
    <div class="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#002266]/6 blur-[120px] pointer-events-none z-0"></div>

    <!-- ================================================================ -->
    <!-- Sidebar                                                           -->
    <!-- ================================================================ -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">

      <!-- Logo Area -->
      <div class="sidebar__logo">
        <div class="sidebar__logo-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7v5c0 4.8 3.5 9.2 9 10 5.5-.8 9-5.2 9-10V7l-9-5z" fill="white" fill-opacity="0.2" />
            <path d="M12 21c3.8-.7 6.7-4.2 6.7-8.2V8l-6.7-3.7L5.3 8v4.8c0 4 2.9 7.5 6.7 8.2z" stroke="white" stroke-width="2" stroke-linejoin="round" />
            <path d="M9 11l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <Transition name="fade-slide">
          <div v-if="!isCollapsed" class="sidebar__logo-text">
            <span class="sidebar__product-name">Procurement Hub</span>
            <span class="sidebar__company-name">SCGJWD Logistics</span>
          </div>
        </Transition>
        <button
          v-if="!isCollapsed"
          class="sidebar__collapse-btn"
          @click="toggleSidebar"
          aria-label="ย่อ Sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">

        <!-- ── หลัก ── -->
        <div class="sidebar__nav-group">
          <span v-if="!isCollapsed" class="sidebar__group-label">หลัก</span>
          <NuxtLink
            v-for="menu in mainMenus"
            :key="menu.path"
            :to="menu.path"
            class="sidebar__item"
            :class="{ 'sidebar__item--active': isMenuActive(menu.path) }"
            :title="isCollapsed ? menu.title : ''"
          >
            <span class="sidebar__item-icon" v-html="menu.svgIcon" aria-hidden="true" />
            <Transition name="fade-slide">
              <span v-if="!isCollapsed" class="sidebar__item-label">{{ menu.title }}</span>
            </Transition>
            <span v-if="!isCollapsed && menu.badge" class="sidebar__item-badge">{{ menu.badge }}</span>
          </NuxtLink>
        </div>

        <!-- ── จัดซื้อ ── -->
        <div class="sidebar__nav-group">
          <span v-if="!isCollapsed" class="sidebar__group-label">จัดซื้อ</span>

          <!-- Vendor (parent with sub-menu) -->
          <div class="sidebar__parent-wrap">
            <NuxtLink
              to="/vendors"
              class="sidebar__item sidebar__item--parent"
              :class="{
                'sidebar__item--active': route.path === '/vendors',
                'sidebar__item--parent-active': isVendorSectionActive
              }"
              :aria-expanded="isVendorSubOpen"
              :title="isCollapsed ? 'คู่ค้า (Vendor)' : ''"
            >
              <span class="sidebar__item-icon" v-html="icons.users" aria-hidden="true" />
              <Transition name="fade-slide">
                <span v-if="!isCollapsed" class="sidebar__item-label">คู่ค้า (Vendor)</span>
              </Transition>
            </NuxtLink>

            <!-- Sub-items -->
            <Transition name="submenu">
              <div v-if="isVendorSubOpen && !isCollapsed" class="sidebar__sub-group">
                <NuxtLink
                  to="/vendors/evaluation"
                  class="sidebar__sub-item"
                  :class="{ 'sidebar__sub-item--active': route.path.startsWith('/vendors/evaluation') }"
                >
                  <span class="sidebar__sub-dot" aria-hidden="true" />
                  <span class="sidebar__sub-label">ประเมินผลผู้ค้า</span>
                </NuxtLink>

                <NuxtLink
                  to="/vendors/contracts"
                  class="sidebar__sub-item"
                  :class="{ 'sidebar__sub-item--active': route.path.startsWith('/vendors/contracts') }"
                >
                  <span class="sidebar__sub-dot" aria-hidden="true" />
                  <span class="sidebar__sub-label">สัญญาจัดซื้อ</span>
                </NuxtLink>

                <NuxtLink
                  to="/vendors/catalog-approval"
                  class="sidebar__sub-item"
                  :class="{ 'sidebar__sub-item--active': route.path.startsWith('/vendors/catalog-approval') }"
                >
                  <span class="sidebar__sub-dot" aria-hidden="true" />
                  <span class="sidebar__sub-label">อนุมัติแค็ตตาล็อก</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <!-- Procurement menus (non-vendor) -->
          <NuxtLink
            v-for="menu in procureMenus"
            :key="menu.path"
            :to="menu.path"
            class="sidebar__item"
            :class="{ 'sidebar__item--active': isMenuActive(menu.path) }"
            :title="isCollapsed ? menu.title : ''"
          >
            <span class="sidebar__item-icon" v-html="menu.svgIcon" aria-hidden="true" />
            <Transition name="fade-slide">
              <span v-if="!isCollapsed" class="sidebar__item-label">{{ menu.title }}</span>
            </Transition>
          </NuxtLink>
        </div>

        <!-- ── การเงิน & ระบบ ── -->
        <div class="sidebar__nav-group">
          <span v-if="!isCollapsed" class="sidebar__group-label">การเงิน & ระบบ</span>
          <NuxtLink
            v-for="menu in adminMenus"
            :key="menu.path"
            :to="menu.path"
            class="sidebar__item"
            :class="{ 'sidebar__item--active': isMenuActive(menu.path) }"
            :title="isCollapsed ? menu.title : ''"
          >
            <span class="sidebar__item-icon" v-html="menu.svgIcon" aria-hidden="true" />
            <Transition name="fade-slide">
              <span v-if="!isCollapsed" class="sidebar__item-label">{{ menu.title }}</span>
            </Transition>
          </NuxtLink>
        </div>

      </nav>

      <!-- User footer -->
      <div class="sidebar__footer">
        <div class="sidebar__user-avatar">
          <span>{{ (authStore.user?.username || 'น').charAt(0).toUpperCase() }}</span>
        </div>
        <Transition name="fade-slide">
          <div v-if="!isCollapsed" class="sidebar__user-info">
            <span class="sidebar__user-name">{{ authStore.user?.username || 'nantaporn.s' }}</span>
            <span class="sidebar__user-role">{{ authStore.user?.role || 'Admin' }}</span>
          </div>
        </Transition>
      </div>

      <!-- Expand button (collapsed) -->
      <button
        v-if="isCollapsed"
        class="sidebar__expand-btn"
        @click="toggleSidebar"
        aria-label="ขยาย Sidebar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </aside>

    <!-- ================================================================ -->
    <!-- Main Content                                                       -->
    <!-- ================================================================ -->
    <div class="main-area">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar__left">
          <div class="topbar__breadcrumb">
            <!-- Breadcrumb: show parent > child when in sub-menu -->
            <template v-if="breadcrumb.parent">
              <span class="topbar__breadcrumb-parent">{{ breadcrumb.parent }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="topbar__breadcrumb-sep">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </template>
            <span class="topbar__page-title">{{ breadcrumb.title }}</span>
          </div>
        </div>

        <div class="topbar__right">
          <div class="topbar__company-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>SCGJWD</span>
          </div>
          <button class="topbar__icon-btn" aria-label="การแจ้งเตือน">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="topbar__notif-dot" aria-hidden="true" />
          </button>
          <div class="topbar__divider" aria-hidden="true" />
          <button class="topbar__logout-btn" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span class="topbar__logout-label">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>

  <!-- Global Dialog (replaces alert/confirm) -->
  <AppDialog />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const isCollapsed = ref(false);

const moduleNameMap: Record<string, string> = {
  '/': 'Dashboard',
  '/vendors/evaluation': 'Vendor Evaluation',
  '/vendors/contracts': 'Contract Management',
  '/vendors/catalog-approval': 'Catalog Approval',
  '/vendors': 'Vendor',
  '/catalog': 'Catalog',
  '/pr': 'Purchase Requisition',
  '/bidding': 'RFQ Bidding',
  '/po': 'Purchase Order',
  '/gr-stock': 'Goods Receipt & Inventory',
  '/approval': 'Approval Inbox',
  '/finance': 'Accounting & e-Payment',
  '/admin/assets': 'Asset Management',
  '/admin': 'Settings',
};

useHead({
  titleTemplate: 'Procurement Hub | %s',
  title: () => {
    const path = route.path;
    const sortedEntries = Object.entries(moduleNameMap).sort((a, b) => b[0].length - a[0].length);
    for (const [routePrefix, name] of sortedEntries) {
      if (path === routePrefix || (routePrefix !== '/' && path.startsWith(routePrefix))) {
        return name;
      }
    }
    return 'Dashboard';
  }
});

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
const handleLogout = () => authStore.logout();

/* ---- Vendor sub-menu state ---- */
const vendorPaths = ['/vendors', '/vendors/evaluation', '/vendors/contracts', '/vendors/catalog-approval'];

const isVendorSectionActive = computed(() =>
  vendorPaths.some(p => p === '/vendors' ? route.path === p : route.path.startsWith(p))
);

const isVendorSubOpen = ref(isVendorSectionActive.value && !isCollapsed.value);

// Auto-open when navigating into vendor section
watch(isVendorSectionActive, (active) => {
  isVendorSubOpen.value = active && !isCollapsed.value;
});

// When sidebar collapses, close sub-menu
watch(isCollapsed, (collapsed) => {
  if (collapsed) isVendorSubOpen.value = false;
});

/* ---- Icons ---- */
const icons = {
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  catalog: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  fileText: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  trophy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H4a2 2 0 0 0 0 4c0 2.4 1.6 4.4 4 5"/><path d="M17 4h3a2 2 0 0 1 0 4c0 2.4-1.6 4.4-4 5"/><path d="M7 4h10v9.5a5 5 0 0 1-10 0V4z"/></svg>`,
  shoppingCart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  archive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  checkBadge: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  banknotes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  cube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M2 12h2M20 12h2M17.66 5.34l-1.41 1.41M4.93 18.07l-1.41-1.41M12 2v2M12 20v2"/></svg>`,
};

const mainMenus: { title: string; path: string; svgIcon: string; badge?: string }[] = [
  { title: 'แดชบอร์ด', path: '/', svgIcon: icons.dashboard },
];

// Vendor sub-items label/path map (for breadcrumb)
const vendorHomeItem = { label: 'ข้อมูลคู่ค้า', path: '/vendors' };
const vendorSubItems = [
  { label: 'ประเมินผลผู้ค้า',   path: '/vendors/evaluation' },
  { label: 'สัญญาจัดซื้อ',     path: '/vendors/contracts' },
  { label: 'อนุมัติแค็ตตาล็อก', path: '/vendors/catalog-approval' },
];

const procureMenus = [
  { title: 'รายการสินค้า (Catalog)', path: '/catalog',   svgIcon: icons.catalog },
  { title: 'ใบขอซื้อ (PR)',          path: '/pr',        svgIcon: icons.fileText },
  { title: 'ประกวดราคา (Bidding)',   path: '/bidding',   svgIcon: icons.trophy },
  { title: 'ใบสั่งซื้อ (PO)',        path: '/po',        svgIcon: icons.shoppingCart },
  { title: 'รับของ & คลัง (GR)',     path: '/gr-stock',  svgIcon: icons.archive },
  { title: 'รายการอนุมัติ',         path: '/approval',  svgIcon: icons.checkBadge },
];

const adminMenus = [
  { title: 'การบัญชี (AP)',    path: '/finance',       svgIcon: icons.banknotes },
  { title: 'บริหารสินทรัพย์', path: '/admin/assets',  svgIcon: icons.cube },
  { title: 'ตั้งค่าระบบ',     path: '/admin',         svgIcon: icons.settings },
];

const allFlatMenus = [
  ...mainMenus,
  { title: vendorHomeItem.label, path: vendorHomeItem.path },
  ...vendorSubItems.map(v => ({ title: v.label, path: v.path })),
  ...procureMenus,
  ...adminMenus,
];

const isMenuActive = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(`${path}/`);
};

/* ---- Breadcrumb ---- */
const breadcrumb = computed(() => {
  // Check if we're in a vendor sub-page
  const vendorSub = vendorSubItems.find(v =>
    route.path.startsWith(v.path)
  );
  if (vendorSub) {
    return { parent: 'คู่ค้า (Vendor)', title: vendorSub.label };
  }

  // General menu match
  const active = [...allFlatMenus]
    .sort((a, b) => b.path.length - a.path.length)
    .find(m => isMenuActive(m.path));
  return { parent: null, title: active?.title ?? 'หน้าหลัก' };
});
</script>

<style scoped>
/* ================================================================
   App Shell
   ================================================================ */
.app-shell {
  display: flex;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-subtle);
  position: relative;
}

/* ================================================================
   Sidebar
   ================================================================ */
.sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  height: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(120%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(120%);
  border-right: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: width var(--duration-slower) var(--ease-default);
  flex-shrink: 0;
  overflow: hidden;
  z-index: var(--z-fixed);
}

.sidebar--collapsed { width: var(--sidebar-collapsed); }

/* ── Logo ── */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  height: var(--topbar-height);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar__logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-lg);
  background: var(--gradient-brand-diagonal);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,146,69,0.35);
}

.sidebar__logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.sidebar__product-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--fg-primary);
  white-space: nowrap;
  letter-spacing: var(--tracking-tight);
}

.sidebar__company-name {
  font-size: 10px;
  color: var(--fg-tertiary);
  white-space: nowrap;
  font-weight: var(--weight-medium);
}

.sidebar__collapse-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: var(--radius-md);
  color: var(--fg-tertiary);
  background: transparent; border: none; cursor: pointer;
  flex-shrink: 0;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.sidebar__collapse-btn:hover { background-color: var(--bg-surface); color: var(--fg-secondary); }

/* ── Navigation ── */
.sidebar__nav {
  flex: 1;
  padding: var(--space-3);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  scrollbar-width: thin;
  scrollbar-color: rgba(155,155,155,0.3) transparent;
}

.sidebar__nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__group-label {
  font-size: 9px;
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--fg-tertiary);
  padding: var(--space-1) var(--space-2);
  margin-bottom: 2px;
}

/* ── Flat menu item ── */
.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 7px var(--space-2);
  border-radius: var(--radius-md);
  color: var(--fg-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  transition: background-color var(--transition-base), color var(--transition-base);
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  min-height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.sidebar__item:hover {
  background-color: var(--bg-surface);
  color: var(--fg-primary);
}

.sidebar__item--active {
  background-color: var(--color-green-50);
  color: var(--color-green-700);
  font-weight: var(--weight-semibold);
}

.sidebar__item--active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 20px;
  background-color: var(--color-green-600);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

/* Parent item (Vendor) — show slightly different when sub is open */
.sidebar__item--parent.sidebar__item--active,
.sidebar__item--parent-active,
.sidebar__item--parent[aria-expanded="true"] {
  background-color: var(--color-green-50);
  color: var(--color-green-700);
  font-weight: var(--weight-semibold);
}

.sidebar__item-icon {
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; width: 18px; height: 18px; color: inherit;
}

.sidebar__item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__item-badge {
  display: flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background-color: var(--color-green-600);
  color: white;
  font-size: 10px; font-weight: var(--weight-bold);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

/* ── Chevron for parent ── */
.sidebar__chevron {
  flex-shrink: 0;
  color: var(--fg-tertiary);
  transition: transform var(--duration-slow) var(--ease-default);
}
.sidebar__chevron--open {
  transform: rotate(180deg);
}

/* ── Sub-menu group ── */
.sidebar__parent-wrap {
  display: flex;
  flex-direction: column;
}

.sidebar__sub-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  /* indent: left border + padding */
  margin-left: 18px;
  margin-top: 2px;
  margin-bottom: 2px;
  padding-left: var(--space-3);
  border-left: 1.5px solid var(--border-default);
  overflow: hidden;
}

.sidebar__sub-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px var(--space-2);
  border-radius: var(--radius-md);
  color: var(--fg-tertiary);
  text-decoration: none;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  transition: background-color var(--transition-base), color var(--transition-base);
  position: relative;
}

.sidebar__sub-item:hover {
  background-color: var(--bg-surface);
  color: var(--fg-secondary);
}

.sidebar__sub-item--active {
  color: var(--color-green-700);
  background-color: var(--color-green-50);
  font-weight: var(--weight-semibold);
}

.sidebar__sub-dot {
  width: 5px; height: 5px;
  border-radius: var(--radius-full);
  background: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
  transition: opacity var(--transition-base);
}
.sidebar__sub-item--active .sidebar__sub-dot {
  opacity: 1;
  background: var(--color-green-600);
  width: 6px; height: 6px;
}

.sidebar__sub-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Sub-menu transition ── */
.submenu-enter-active {
  transition: max-height var(--duration-slow) var(--ease-enter),
              opacity var(--duration-base) var(--ease-out);
  max-height: 200px;
  overflow: hidden;
}
.submenu-leave-active {
  transition: max-height var(--duration-base) var(--ease-exit),
              opacity var(--duration-fast) var(--ease-in);
  overflow: hidden;
}
.submenu-enter-from {
  max-height: 0;
  opacity: 0;
}
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Expand btn (collapsed) ── */
.sidebar__expand-btn {
  display: flex; align-items: center; justify-content: center;
  margin: var(--space-3);
  height: 36px;
  border-radius: var(--radius-md);
  background-color: var(--bg-surface);
  border: none; cursor: pointer;
  color: var(--fg-secondary);
  transition: background-color var(--transition-base), color var(--transition-base);
}
.sidebar__expand-btn:hover { background-color: var(--color-green-50); color: var(--color-green-600); }

/* ── User Footer ── */
.sidebar__footer {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  overflow: hidden; flex-shrink: 0;
}

.sidebar__user-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  border-radius: var(--radius-full);
  background: var(--gradient-brand-diagonal);
  color: white;
  font-size: var(--text-sm); font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.sidebar__user-info {
  display: flex; flex-direction: column; gap: 2px; min-width: 0;
}

.sidebar__user-name {
  font-size: var(--text-xs); font-weight: var(--weight-semibold);
  color: var(--fg-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 10px; color: var(--fg-tertiary); white-space: nowrap;
}

/* ================================================================
   Main Area
   ================================================================ */
.main-area {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-width: 0;
}

/* Topbar */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--space-6);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(120%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(120%);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  flex-shrink: 0; z-index: var(--z-sticky);
}

.topbar__left { display: flex; align-items: center; gap: var(--space-3); }

.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
}

.topbar__breadcrumb-parent {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--fg-tertiary);
}

.topbar__breadcrumb-sep {
  color: var(--fg-tertiary);
  opacity: 0.6;
  flex-shrink: 0;
}

.topbar__page-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--fg-primary);
  letter-spacing: var(--tracking-tight);
}

.topbar__right { display: flex; align-items: center; gap: var(--space-3); }

.topbar__company-chip {
  display: flex; align-items: center; gap: var(--space-1-5);
  padding: var(--space-1-5) var(--space-3);
  background-color: var(--color-green-50);
  border: 1px solid var(--color-green-200);
  border-radius: var(--radius-full);
  font-size: var(--text-xs); font-weight: var(--weight-medium);
  color: var(--color-green-700); white-space: nowrap;
}

.topbar__icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: var(--radius-full);
  background: transparent; border: none; cursor: pointer;
  color: var(--fg-tertiary); position: relative;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.topbar__icon-btn:hover { background-color: var(--bg-surface); color: var(--fg-primary); }

.topbar__notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 8px; height: 8px;
  background-color: var(--color-error-500);
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-elevated);
}

.topbar__divider { width: 1px; height: 20px; background-color: var(--border-subtle); flex-shrink: 0; }

.topbar__logout-btn {
  display: flex; align-items: center; gap: var(--space-1-5);
  padding: var(--space-1-5) var(--space-3);
  border-radius: var(--radius-md);
  background: transparent; border: none; cursor: pointer;
  color: var(--fg-error);
  font-size: var(--text-sm); font-weight: var(--weight-medium);
  transition: background-color var(--transition-base);
}
.topbar__logout-btn:hover { background-color: var(--color-error-50); }

.topbar__logout-label { display: none; }
@media (min-width: 640px) { .topbar__logout-label { display: inline; } }

/* Main content */
.main-content {
  flex: 1; overflow-y: auto;
  padding: var(--space-6);
  background-color: var(--bg-subtle);
}

/* ================================================================
   Transitions
   ================================================================ */
.fade-slide-enter-active {
  transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);
}
.fade-slide-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in), transform var(--duration-fast) var(--ease-in);
}
.fade-slide-enter-from { opacity: 0; transform: translateX(-6px); }
.fade-slide-leave-to  { opacity: 0; transform: translateX(-6px); }
</style>
