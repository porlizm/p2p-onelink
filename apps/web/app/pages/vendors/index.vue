<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ทะเบียนคู่ค้า (Vendor Master)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">จัดการผู้ค้า ตรวจสอบใบสมัครลงทะเบียนใหม่ และควบคุมสถานะพัทธมิตร</p>
      </div>
      <div>
        <UButton 
          to="/vendors/new-mock"
          color="primary"
          size="md"
        >
          <UIcon name="i-heroicons-plus-20-solid" class="w-4 h-4 mr-2" />
          เพิ่มคู่ค้าภายใน
        </UButton>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white p-4 border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-sm)]">
      <div class="relative w-full sm:max-w-xs">
        <UInput 
          v-model="search" 
          placeholder="ค้นหาชื่อผู้ค้า หรือ Tax ID..." 
          icon="i-heroicons-magnifying-glass-20-solid"
          size="md"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <USelect 
          v-model="filterType"
          :options="['ทั้งหมด', 'ผู้ขาย', 'ผู้ให้บริการ']"
          size="md"
          class="w-full sm:w-40"
        />
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="border-b border-[var(--border)]">
      <nav class="flex gap-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.status"
          @click="activeStatus = tab.status"
          class="pb-3 text-sm font-medium border-b-2 transition-colors relative"
          :class="[
            activeStatus === tab.status 
              ? 'border-[var(--primary)] text-[var(--primary)] font-semibold' 
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          ]"
        >
          {{ tab.label }}
          <span 
            v-if="countByStatus(tab.status) > 0"
            class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] font-semibold"
          >
            {{ countByStatus(tab.status) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Vendor Table -->
    <UCard 
      class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white overflow-hidden"
      :body="{ class: 'p-0' }"
    >
      <div v-if="filteredVendors.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
        <UIcon name="i-heroicons-users-20-solid" class="w-12 h-12 text-[var(--muted-foreground)] mb-2" />
        <p class="text-sm font-medium text-[var(--foreground)]">ไม่พบรายการคู่ค้า</p>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">ยังไม่มีผู้ค้าที่ตรงตามสถานะหรือคำค้นหาของคุณ</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[var(--muted)] border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="p-4">ชื่อบริษัทคู่ค้า</th>
              <th class="p-4">ประเภท</th>
              <th class="p-4">เลขประจำตัวผู้เสียภาษี</th>
              <th class="p-4">หมวดหมู่</th>
              <th class="p-4">วันที่ลงทะเบียน</th>
              <th class="p-4">สถานะ</th>
              <th class="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr 
              v-for="v in filteredVendors" 
              :key="v.vendor_id"
              class="hover:bg-[var(--secondary)]/40 transition-colors"
            >
              <td class="p-4">
                <div class="font-medium text-[var(--foreground)]">{{ v.vendor_name }}</div>
              </td>
              <td class="p-4 text-[var(--muted-foreground)]">{{ v.vendor_type }}</td>
              <td class="p-4 font-mono text-[var(--muted-foreground)]">{{ v.tax_id }}</td>
              <td class="p-4 text-[var(--muted-foreground)]">{{ v.business_category }}</td>
              <td class="p-4 text-[var(--muted-foreground)]">{{ formatDate(v.registered_date) }}</td>
              <td class="p-4">
                <StatusBadge :status="v.status" />
              </td>
              <td class="p-4 text-center">
                <UButton 
                  :to="`/vendors/${v.vendor_id}`"
                  color="gray"
                  size="xs"
                  variant="solid"
                  class="font-medium shadow-[var(--shadow-sm)] border border-[var(--border)]"
                >
                  <UIcon name="i-heroicons-eye-20-solid" class="w-4 h-4 mr-1.5" />
                  {{ v.status === 'PendingRegistration' ? 'ตรวจอนุมัติ' : 'เปิดดู' }}
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import StatusBadge from '~/components/StatusBadge.vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const search = ref('');
const filterType = ref('ทั้งหมด');
const activeStatus = ref('ALL');
const vendors = ref<any[]>([]);

const tabs = [
  { status: 'ALL', label: 'ทั้งหมด' },
  { status: 'PendingRegistration', label: 'รอตรวจอนุมัติ' },
  { status: 'Active', label: 'อนุมัติแล้ว (Active)' },
  { status: 'Suspended', label: 'ระงับชั่วคราว (Suspended)' },
  { status: 'Blocked', label: 'บล็อก (Blocked)' },
  { status: 'Blacklisted', label: 'แบล็คลิสต์ (Blacklist)' },
];

const loadVendors = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    vendors.value = res;
  } catch (err) {
    console.warn('Backend connection failed, loading mock seeder data...');
    // Mock database load if offline
    vendors.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', tax_id: '0105561012345', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์ไอที', status: 'Active', registered_date: '2026-06-10', score: 4.6 },
      { vendor_id: '00000000-0000-0000-0000-000000000602', tax_id: '0105562023456', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์ไอที/บริการ', status: 'Active', registered_date: '2026-06-15', score: 4.3 },
      { vendor_id: '00000000-0000-0000-0000-000000000607', tax_id: '0105567078901', vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์เซฟตี้', status: 'PendingRegistration', registered_date: '2026-06-18', score: 0 },
      { vendor_id: '00000000-0000-0000-0000-000000000609', tax_id: '0105569090123', vendor_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด', vendor_type: 'ผู้ให้บริการ', business_category: 'บำรุงรักษา/วิศวกรรม', status: 'Suspended', registered_date: '2026-06-12', score: 3.5 },
      { vendor_id: '00000000-0000-0000-0000-000000000611', tax_id: '0105561112345', vendor_name: 'บริษัท สมาร์ท ปริ้นติ้ง จำกัด', vendor_type: 'ผู้ขาย', business_category: 'บริการสิ่งพิมพ์', status: 'Blacklisted', registered_date: '2026-06-14', score: 1.2 },
    ];
  }
};

onMounted(() => {
  loadVendors();
});

const countByStatus = (status: string) => {
  if (status === 'ALL') return vendors.value.length;
  return vendors.value.filter((v) => v.status === status).length;
};

const filteredVendors = computed(() => {
  return vendors.value.filter((v) => {
    // 1. Filter by status tab
    if (activeStatus.value !== 'ALL' && v.status !== activeStatus.value) {
      return false;
    }
    // 2. Filter by search
    if (search.value) {
      const q = search.value.toLowerCase();
      if (!v.vendor_name.toLowerCase().includes(q) && !v.tax_id.includes(q)) {
        return false;
      }
    }
    // 3. Filter by type
    if (filterType.value !== 'ทั้งหมด' && v.vendor_type !== filterType.value) {
      return false;
    }
    return true;
  });
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>
