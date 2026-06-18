<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">จัดการใบสั่งซื้อ (Purchase Orders)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ติดตามสถานะการยืนยันและการส่งมอบสินค้าจากผู้ขาย</p>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ใบสั่งซื้อทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ poList.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-paper-airplane" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ส่งให้ผู้ขายแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ poList.filter(p => p.status === 'SentToVendor').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ผู้ขายยืนยันแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ poList.filter(p => p.status === 'VendorConfirmed').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ขอแก้ไขราคา/จำนวน</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ poList.filter(p => p.status === 'RevisionRequested').length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ PO, ชื่อผู้ขาย..." 
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

      <!-- PO Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ใบสั่งซื้อ</th>
              <th class="px-6 py-3">วันที่ออกเอกสาร</th>
              <th class="px-6 py-3">ผู้ขาย / Vendor</th>
              <th class="px-6 py-3 text-right">ยอดรวม (THB)</th>
              <th class="px-6 py-3 text-center">ครั้งที่แก้ไข (Rev.)</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="po in filteredPos" :key="po.po_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">
                {{ po.po_no }}
                <div v-if="po.pr" class="text-[10px] text-slate-400 font-normal">อ้างอิง PR: {{ po.pr.pr_no }}</div>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500">{{ formatDate(po.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700">{{ po.vendor?.vendor_name || 'N/A' }}</div>
                <div class="text-[10px] text-slate-400">Tax ID: {{ po.vendor?.tax_id || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 text-right font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(po.total_amount) }}
              </td>
              <td class="px-6 py-4 text-center font-semibold text-slate-600">
                {{ po.revision_no }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                  :class="[
                    po.status === 'VendorConfirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    po.status === 'SentToVendor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    po.status === 'RevisionRequested' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ formatStatus(po.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <UButton 
                  :to="`/po/${po.po_id}`"
                  size="xs" 
                  variant="outline"
                  class="cursor-pointer"
                >
                  <UIcon name="i-heroicons-magnifying-glass" class="w-3.5 h-3.5 mr-1" />
                  จัดการสั่งซื้อ
                </UButton>
              </td>
            </tr>
            <tr v-if="filteredPos.length === 0">
              <td colspan="7" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติรายการใบสั่งซื้อ (PO)
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
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const search = ref('');
const filterStatus = ref('ทั้งหมด');
const poList = ref<any[]>([]);

const loadPos = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/po', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    poList.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Using mock PO list data.');
    poList.value = [
      {
        po_id: 'po_mock_1',
        po_no: 'PO2606001',
        created_at: new Date(Date.now() - 3600000 * 4),
        total_amount: 85500,
        revision_no: 0,
        status: 'SentToVendor',
        vendor: {
          vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด',
          tax_id: '0105565056789',
        },
        pr: {
          pr_no: 'PR2606002',
        },
      },
      {
        po_id: 'po_mock_2',
        po_no: 'PO2606002',
        created_at: new Date(Date.now() - 86400000 * 2),
        total_amount: 28500,
        revision_no: 1,
        status: 'VendorConfirmed',
        vendor: {
          vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
          tax_id: '0105561012345',
        },
        pr: {
          pr_no: 'PR2606001',
        },
      },
    ];
  }
};

onMounted(() => {
  loadPos();
});

const filteredPos = computed(() => {
  return poList.value.filter((po) => {
    if (filterStatus.value !== 'ทั้งหมด' && po.status !== filterStatus.value) {
      return false;
    }
    if (search.value) {
      const q = search.value.toLowerCase();
      const poNoMatch = po.po_no?.toLowerCase().includes(q);
      const venMatch = po.vendor?.vendor_name?.toLowerCase().includes(q);
      return poNoMatch || venMatch;
    }
    return true;
  });
});

const formatStatus = (status?: string) => {
  switch (status) {
    case 'SentToVendor': return 'ส่งให้ผู้ขายแล้ว';
    case 'VendorConfirmed': return 'ผู้ขายยืนยันการรับสั่งซื้อ';
    case 'RevisionRequested': return 'ขอแก้ไขรายการ';
    case 'FullyReceived': return 'รับสินค้าครบถ้วน';
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

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
