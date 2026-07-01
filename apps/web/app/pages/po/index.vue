<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">จัดการใบสั่งซื้อ (Purchase Orders)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ติดตามสถานะการยืนยันและการส่งมอบสินค้าจากผู้ขาย</p>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-[var(--primary)] flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ใบสั่งซื้อทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ poList.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[#eff1f5] flex flex-col sm:flex-row items-center justify-between gap-4">
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
            :options="[
              { label: 'ทั้งหมด', value: '' },
              { label: 'ส่งให้ผู้ขายแล้ว', value: 'SentToVendor' },
              { label: 'ผู้ขายยืนยัน PO', value: 'VendorConfirmed' },
              { label: 'ขอแก้ไขรายการ', value: 'RevisionRequested' },
              { label: 'รับสินค้าครบถ้วน', value: 'FullyReceived' },
            ]"
            size="md"
            class="w-44"
          />
        </div>
      </div>

      <!-- PO Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3.5">เลขที่ใบสั่งซื้อ</th>
              <th class="px-6 py-3.5">วันที่ออกเอกสาร</th>
              <th class="px-6 py-3.5">ผู้ขาย / Vendor</th>
              <th class="px-6 py-3.5 text-right">ยอดรวม (THB)</th>
              <th class="px-6 py-3.5 text-center">ครั้งที่แก้ไข (Rev.)</th>
              <th class="px-6 py-3.5 text-center">สถานะ</th>
              <th class="px-6 py-3.5 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="po in filteredPos" :key="po.po_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-5 font-bold text-[var(--primary)]">
                {{ po.po_no }}
                <div v-if="po.pr" class="text-[10px] text-slate-400 font-normal">อ้างอิง PR: {{ po.pr.pr_no }}</div>
              </td>
              <td class="px-6 py-5 text-xs text-slate-500">{{ formatDate(po.created_at) }}</td>
              <td class="px-6 py-5">
                <div class="font-semibold text-slate-700">{{ po.vendor?.vendor_name || 'N/A' }}</div>
                <div class="text-[10px] text-slate-400">Tax ID: {{ po.vendor?.tax_id || 'N/A' }}</div>
              </td>
              <td class="px-6 py-5 text-right font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(po.total_amount) }}
              </td>
              <td class="px-6 py-5 text-center font-semibold text-slate-600">
                {{ po.revision_no }}
              </td>
              <td class="px-6 py-5 text-center">
                <StatusBadge :status="po.status" />
              </td>
              <td class="px-6 py-5 text-center">
                <!-- Draft -->
                <button
                  v-if="po.status === 'Draft'"
                  class="action-btn action-btn--neutral"
                  @click="handlePoAction(po, 'edit')"
                >แก้ไข</button>

                <!-- PendingApproval -->
                <template v-else-if="po.status === 'PendingApproval'">
                  <button class="action-btn action-btn--review mr-1" @click="handlePoAction(po, 'approve')">อนุมัติ</button>
                  <button class="action-btn action-btn--danger" @click="handlePoAction(po, 'reject')">ปฏิเสธ</button>
                </template>

                <!-- AutoGenerated or Approved -->
                <button
                  v-else-if="po.status === 'AutoGenerated' || po.status === 'Approved'"
                  class="action-btn action-btn--compare"
                  @click="handlePoAction(po, 'send')"
                >ส่งให้ผู้ขาย</button>

                <!-- SentToVendor -->
                <button
                  v-else-if="po.status === 'SentToVendor'"
                  class="action-btn action-btn--view"
                  @click="handlePoAction(po, 'confirm')"
                >ยืนยันผู้ขายรับ</button>

                <!-- VendorConfirmed or PartiallyReceived -->
                <NuxtLink
                  v-else-if="po.status === 'VendorConfirmed' || po.status === 'PartiallyReceived'"
                  :to="`/po/${po.po_id}`"
                  class="action-btn action-btn--view"
                >ดูรายละเอียด</NuxtLink>

                <!-- FullyReceived -->
                <NuxtLink
                  v-else-if="po.status === 'FullyReceived'"
                  :to="`/po/${po.po_id}`"
                  class="action-btn action-btn--view"
                  style="background:#16a34a;color:#fff;border-color:#16a34a;"
                >ดูรายละเอียด</NuxtLink>

                <!-- Cancelled or Rejected -->
                <NuxtLink
                  v-else-if="po.status === 'Cancelled' || po.status === 'Rejected'"
                  :to="`/po/${po.po_id}`"
                  class="action-btn action-btn--neutral"
                >ดูรายละเอียด</NuxtLink>

                <!-- Fallback -->
                <NuxtLink
                  v-else
                  :to="`/po/${po.po_id}`"
                  class="action-btn action-btn--neutral"
                >ดูรายละเอียด</NuxtLink>
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
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const dialog = useDialog();
const search = ref('');
const filterStatus = ref('');
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
        po_id: 'po_mock_5',
        po_no: 'PO2606005',
        created_at: new Date(Date.now() - 3600000 * 0.5), // 30 mins ago
        total_amount: 15000,
        revision_no: 0,
        status: 'Draft',
        vendor: {
          vendor_name: 'บริษัท สยามเปเปอร์ ซัพพลาย จำกัด',
          tax_id: '0105562002345',
        },
        pr: {
          pr_no: 'PR2606012',
        },
      },
      {
        po_id: 'po_mock_4',
        po_no: 'PO2606004',
        created_at: new Date(Date.now() - 3600000 * 2), // 2 hrs ago
        total_amount: 680000,
        revision_no: 0,
        status: 'AutoGenerated',
        vendor: {
          vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด',
          tax_id: '0105561001122',
        },
        pr: {
          pr_no: 'PR2606010',
        },
      },
      {
        po_id: 'po_mock_3',
        po_no: 'PO2606003',
        created_at: new Date(Date.now() - 3600000 * 20), // 20 hrs ago
        total_amount: 96000,
        revision_no: 0,
        status: 'SentToVendor',
        vendor: {
          vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด',
          tax_id: '0105565056789',
        },
        pr: {
          pr_no: 'PR2606017',
        },
      },
      {
        po_id: 'po_mock_2',
        po_no: 'PO2606002',
        created_at: new Date(Date.now() - 86400000 * 2), // 2 days ago
        total_amount: 105000,
        revision_no: 1,
        status: 'VendorConfirmed',
        vendor: {
          vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด',
          tax_id: '0105561012345',
        },
        pr: {
          pr_no: 'PR2606016',
        },
      },
      {
        po_id: 'po_mock_1',
        po_no: 'PO2606001',
        created_at: new Date(Date.now() - 86400000 * 5), // 5 days ago
        total_amount: 8000,
        revision_no: 0,
        status: 'FullyReceived',
        vendor: {
          vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด',
          tax_id: '0105561012345',
        },
        pr: {
          pr_no: 'PR2606015',
        },
      },
      {
        po_id: 'po_mock_6',
        po_no: 'PO2606006',
        created_at: new Date(Date.now() - 86400000),
        total_amount: 95000,
        revision_no: 0,
        status: 'PendingApproval',
        vendor: {
          vendor_name: 'บริษัท อินโนเวทีฟ ไอที จำกัด',
          tax_id: '0105562009988',
        },
        pr: {
          pr_no: 'PR2606018',
        },
      },
      {
        po_id: 'po_mock_7',
        po_no: 'PO2606007',
        created_at: new Date(Date.now() - 86400000 * 8),
        total_amount: 220000,
        revision_no: 0,
        status: 'PartiallyReceived',
        vendor: {
          vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด',
          tax_id: '0105565056789',
        },
        pr: {
          pr_no: 'PR2606010',
        },
      },
      {
        po_id: 'po_mock_8',
        po_no: 'PO2606008',
        created_at: new Date(Date.now() - 86400000 * 14),
        total_amount: 12000,
        revision_no: 0,
        status: 'Cancelled',
        vendor: {
          vendor_name: 'บริษัท เคเทอริ่ง โปร จำกัด',
          tax_id: '0105563011234',
        },
        pr: {
          pr_no: 'PR2606020',
        },
      },
    ];
  }
};

const handlePoAction = async (po: any, action: string) => {
  try {
    await $fetch(`http://localhost:3001/api/po/${po.po_id}/${action}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + authStore.token },
    });
  } catch {
    // mock
    if (action === 'edit') {
      await dialog.alert(`เปิดแบบร่าง ${po.po_no}`, { variant: 'info' });
    } else if (action === 'approve') {
      po.status = 'Approved';
      await dialog.alert(`อนุมัติ ${po.po_no} เรียบร้อย`, { variant: 'success' });
    } else if (action === 'reject') {
      const ok = await dialog.confirm('ยืนยันการปฏิเสธ ' + po.po_no + ' ใช่หรือไม่?', { variant: 'danger' });
      if (!ok) return;
      po.status = 'Rejected';
    } else if (action === 'send') {
      po.status = 'SentToVendor';
      await dialog.alert(`ส่ง ${po.po_no} ให้ผู้ขายแล้ว`, { variant: 'success' });
    } else if (action === 'confirm') {
      po.status = 'VendorConfirmed';
      await dialog.alert(`ยืนยันผู้ขายรับ ${po.po_no} แล้ว`, { variant: 'success' });
    }
  }
};

onMounted(() => {
  loadPos();
});

const filteredPos = computed(() => {
  return poList.value.filter((po) => {
    if (filterStatus.value && po.status !== filterStatus.value) {
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

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
