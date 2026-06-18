<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ข้อมูลบริษัทคู่ค้า</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ข้อมูลสถานะนิติบุคคล เอกสารสำคัญ และการรับเงินโอน</p>
      </div>
      <div>
        <!-- Profile status badge -->
        <StatusBadge :status="vendorStatus" />
      </div>
    </div>

    <!-- Vendor Details Card Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Info Card (2/3 width) -->
      <UCard class="md:col-span-2 border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
        <template #header>
          <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <UIcon name="i-heroicons-building-office-20-solid" class="w-5 h-5 text-[var(--primary)]" />
            <h3 class="font-semibold text-base text-[var(--foreground)]">รายละเอียดนิติบุคคล</h3>
          </div>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ชื่อบริษัทภาษาไทย</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ vendor?.vendorName || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ชื่อบริษัทภาษาอังกฤษ</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ vendor?.vendorNameEn || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">เลขประจำตัวผู้เสียภาษี (Tax ID)</span>
            <p class="text-sm font-mono font-medium text-[var(--foreground)]">{{ vendor?.taxId || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ประเภทธุรกิจ / หมวดหมู่</span>
            <p class="text-sm font-medium text-[var(--foreground)]">ผู้ขาย / อุปกรณ์ไอที</p>
          </div>
        </div>
      </UCard>

      <!-- Bank Details (1/3 width) -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
        <template #header>
          <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <UIcon name="i-heroicons-credit-card-20-solid" class="w-5 h-5 text-[var(--primary)]" />
            <h3 class="font-semibold text-base text-[var(--foreground)]">ช่องทางการชำระเงิน</h3>
          </div>
        </template>

        <div class="space-y-4 mt-4">
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ธนาคาร</span>
            <p class="text-sm font-medium text-[var(--foreground)]">ธนาคารกรุงไทย</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">เลขที่บัญชี</span>
            <p class="text-sm font-mono font-medium text-[var(--foreground)]">123-4-56789-0</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ชื่อบัญชี</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ vendor?.vendorName || '—' }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useVendorAuthStore();
const vendor = computed(() => authStore.vendor);
const vendorStatus = computed(() => vendor.value?.status || 'PendingRegistration');
</script>
