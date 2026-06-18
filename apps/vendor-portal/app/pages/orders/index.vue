<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รายการใบสั่งซื้อ (Purchase Orders)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบใบสั่งซื้อที่ส่งจากลูกค้า และยืนยันการรับสั่งซื้อหรือเสนอขอแก้ไข</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ใบสั่งซื้อทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ orders.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอยืนยัน</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ orders.filter(o => o.status === 'SentToVendor').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ยืนยันการรับสั่งซื้อแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ orders.filter(o => o.status === 'VendorConfirmed').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">อยู่ระหว่างขอแก้ไข</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ orders.filter(o => o.status === 'RevisionRequested').length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Filter and search -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ PO, ชื่อลูกค้า..." 
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
          />
        </div>
        <div class="flex items-center gap-2">
          <USelect 
            v-model="filterStatus"
            :options="['ทั้งหมด', 'SentToVendor', 'VendorConfirmed', 'RevisionRequested', 'FullyReceived']"
            size="md"
            class="w-44"
          />
        </div>
      </div>

      <!-- Table view -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ใบสั่งซื้อ</th>
              <th class="px-6 py-3">วันที่ออกเอกสาร</th>
              <th class="px-6 py-3">ลูกค้า / Company</th>
              <th class="px-6 py-3 text-right">ยอดรวม (THB)</th>
              <th class="px-6 py-3 text-center">แก้ไข (Rev.)</th>
              <th class="px-6 py-3 text-center">วันที่จัดส่งคาดการณ์</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="order in filteredOrders" :key="order.po_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ order.po_no }}</td>
              <td class="px-6 py-4 text-xs text-slate-500">{{ formatDate(order.created_at) }}</td>
              <td class="px-6 py-4 font-semibold text-slate-700">
                {{ order.company?.company_name || 'บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน)' }}
              </td>
              <td class="px-6 py-4 text-right font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(order.total_amount) }}
              </td>
              <td class="px-6 py-4 text-center font-medium text-slate-500">
                {{ order.revision_no }}
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="order.estimated_delivery_date" class="text-xs font-bold text-green-600">
                  {{ formatDateNoTime(order.estimated_delivery_date) }}
                </span>
                <span v-else class="text-xs text-slate-400 italic">ยังไม่ยืนยัน</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                  :class="[
                    order.status === 'VendorConfirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    order.status === 'SentToVendor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    order.status === 'RevisionRequested' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ formatStatus(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <UButton 
                  :to="`/orders/${order.po_id}`"
                  size="xs" 
                  variant="outline"
                  class="cursor-pointer"
                >
                  <UIcon name="i-heroicons-document-magnifying-glass" class="w-3.5 h-3.5 mr-1" />
                  เปิดดู & ดำเนินการ
                </UButton>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="8" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติรายการใบสั่งซื้อจากลูกค้า
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();
const search = ref('');
const filterStatus = ref('ทั้งหมด');
const orders = ref<any[]>([]);

const loadOrders = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/po/vendor/orders', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    orders.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Using mock vendor PO list.');
    // Populate mock data depending on logged in vendor
    orders.value = [
      {
        po_id: 'po_mock_1',
        po_no: 'PO2606001',
        created_at: new Date(Date.now() - 3600000 * 4),
        total_amount: 85500,
        revision_no: 0,
        status: 'SentToVendor',
        estimated_delivery_date: null,
        company: {
          company_name: 'บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน)',
        },
      },
      {
        po_id: 'po_mock_2',
        po_no: 'PO2606002',
        created_at: new Date(Date.now() - 86400000 * 2),
        total_amount: 28500,
        revision_no: 1,
        status: 'VendorConfirmed',
        estimated_delivery_date: new Date(Date.now() + 86400000 * 5),
        company: {
          company_name: 'บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน)',
        },
      },
    ];
  }
};

onMounted(() => {
  loadOrders();
});

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    if (filterStatus.value !== 'ทั้งหมด' && o.status !== filterStatus.value) {
      return false;
    }
    if (search.value) {
      const q = search.value.toLowerCase();
      const poNoMatch = o.po_no?.toLowerCase().includes(q);
      const companyMatch = o.company?.company_name?.toLowerCase().includes(q);
      return poNoMatch || companyMatch;
    }
    return true;
  });
});

const formatStatus = (status?: string) => {
  switch (status) {
    case 'SentToVendor': return 'รอยืนยัน';
    case 'VendorConfirmed': return 'ยืนยันการรับสั่งซื้อแล้ว';
    case 'RevisionRequested': return 'อยู่ระหว่างขอแก้ไข';
    case 'FullyReceived': return 'ส่งมอบสำเร็จ';
    default: return status || '—';
  }
};

const formatDate = (dateVal: any) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
};

const formatDateNoTime = (dateVal: any) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
