<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-[var(--foreground)]">สวัสดีครับ, {{ vendorName }}</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ยินดีต้อนรับสู่ระบบข้อมูลคู่ค้า e-Procurement Portal</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton color="primary" size="md" class="shadow-[var(--shadow-sm)]">
          <UIcon name="i-heroicons-arrow-up-tray-20-solid" class="w-4 h-4 mr-2" />
          ส่งใบเสนอราคา
        </UButton>
      </div>
    </div>

    <!-- Vendor KPI Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard 
        v-for="kpi in kpis" 
        :key="kpi.title"
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white"
        :body="{ class: 'p-6' }"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-[var(--muted-foreground)] font-medium">{{ kpi.title }}</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--secondary)] text-[var(--primary)]">
            <UIcon :name="kpi.icon" class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-2xl font-bold text-[var(--foreground)]">{{ kpi.value }}</span>
        </div>
      </UCard>
    </div>

    <!-- Active PO / Invoices List -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Active Purchase Orders (2/3 width) -->
      <UCard 
        class="lg:col-span-2 border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white"
        :body="{ class: 'p-0' }"
      >
        <template #header>
          <div class="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h3 class="font-medium text-base text-[var(--foreground)]">ใบสั่งซื้อสินค้าล่าสุด (Recent Purchase Orders)</h3>
            <UButton to="/orders" variant="link" size="xs" class="font-semibold p-0">ดูทั้งหมด</UButton>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[var(--muted)] border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="p-4">เลขที่ใบสั่งซื้อ</th>
                <th class="p-4">วันที่สั่ง</th>
                <th class="p-4">มูลค่า</th>
                <th class="p-4">สถานะ</th>
                <th class="p-4">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr 
                v-for="po in pos" 
                :key="po.no" 
                class="hover:bg-[var(--secondary)]/40 transition-colors"
              >
                <td class="p-4 font-mono font-medium text-[var(--foreground)]">{{ po.no }}</td>
                <td class="p-4 text-[var(--muted-foreground)]">{{ po.date }}</td>
                <td class="p-4 text-[var(--foreground)] font-semibold">{{ po.amount }}</td>
                <td class="p-4">
                  <StatusBadge :status="po.status" />
                </td>
                <td class="p-4">
                  <UButton 
                    v-if="po.status === 'SentToVendor'" 
                    size="xs" 
                    color="primary"
                    class="font-medium"
                  >
                    ยืนยันรับคำสั่งซื้อ
                  </UButton>
                  <span v-else class="text-xs text-[var(--muted-foreground)]">เรียบร้อย</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Document Compliance (1/3 width) -->
      <UCard 
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white"
      >
        <template #header>
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h3 class="font-medium text-base text-[var(--foreground)]">สถานะเอกสารบริษัท (Compliance)</h3>
          </div>
        </template>

        <div class="space-y-4 mt-4">
          <div 
            v-for="doc in docs" 
            :key="doc.name"
            class="flex items-center justify-between p-3 bg-[var(--secondary)]/50 rounded-[var(--radius)] border border-[var(--border)]"
          >
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-[var(--foreground)]">{{ doc.name }}</span>
              <span class="text-[10px] text-[var(--muted-foreground)] mt-0.5">หมดอายุ: {{ doc.expiry }}</span>
            </div>
            <StatusBadge :status="doc.status" />
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
const vendorName = computed(() => authStore.vendor?.vendorName || 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด');

const kpis = [
  { title: 'ใบสั่งซื้อรอยืนยัน', value: '1 รายการ', icon: 'i-heroicons-shopping-bag' },
  { title: 'เสนอราคาเข้าร่วมประมูล', value: '3 รายการ', icon: 'i-heroicons-document-text' },
  { title: 'ใบแจ้งหนี้รอการชำระเงิน', value: '2 รายการ', icon: 'i-heroicons-banknotes' },
  { title: 'ยอดรับชำระเดือนนี้', value: '185,400 ฿', icon: 'i-heroicons-check-circle' },
];

const pos = [
  { no: 'PO-2026-0001', date: '2026-06-10', amount: '85,500 บาท', status: 'SentToVendor' },
  { no: 'PO-2026-0002', date: '2026-06-15', amount: '12,900 บาท', status: 'VendorConfirmed' },
  { no: 'PO-2026-0003', date: '2026-06-18', amount: '350,000 บาท', status: 'FullyReceived' },
];

const docs = [
  { name: 'หนังสือรับรองบริษัท', expiry: '2027-03-01', status: 'Valid' },
  { name: 'ภ.พ.20', expiry: '2027-03-01', status: 'Valid' },
];
</script>
