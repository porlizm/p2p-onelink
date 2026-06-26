<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รายการส่งใบแจ้งหนี้ / วางบิล (Invoices)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ส่งใบแจ้งหนี้เพื่อเรียกเก็บเงินตามประวัติการรับสินค้า และตรวจสอบสถานะการวางบิล</p>
      </div>
      <div class="flex gap-2">
        <UButton 
          to="/invoices/create"
          color="primary"
          icon="i-heroicons-plus-circle"
          class="cursor-pointer"
        >
          ยื่นวางบิล (Submit Invoice)
        </UButton>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ Invoice, PO..." 
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
          />
        </div>
        <div class="flex items-center gap-2">
          <USelect 
            v-model="filterStatus"
            :options="['สถานะทั้งหมด', 'Created', 'Matched', 'MismatchException', 'ReadyForPayment']"
            size="md"
            class="w-48"
          />
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ Invoice</th>
              <th class="px-6 py-3">อ้างอิง PO / GR</th>
              <th class="px-6 py-3">วันที่ส่งเอกสาร</th>
              <th class="px-6 py-3">วันครบกำหนดชำระ</th>
              <th class="px-6 py-3 text-right">ยอดเรียกเก็บ (THB)</th>
              <th class="px-6 py-3 text-center">สถานะ matching</th>
              <th class="px-6 py-3 text-center">สถานะวางบิล</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="inv in filteredInvoices" :key="inv.invoice_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ inv.invoice_no }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700">PO: {{ inv.po?.po_no || 'N/A' }}</div>
                <div class="text-[10px] text-slate-400">GR: {{ inv.gr?.gr_no || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 text-slate-500">{{ formatDate(inv.invoice_date) }}</td>
              <td class="px-6 py-4 text-slate-500 font-bold">{{ formatDate(inv.due_date) }}</td>
              <td class="px-6 py-4 text-right font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(inv.total_amount) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-xs font-bold inline-block border"
                  :class="[
                    inv.match_status === 'Matched' ? 'bg-green-50 text-green-700 border-green-200' :
                    inv.match_status === 'Mismatch' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                    'bg-orange-50 text-orange-700 border-orange-200'
                  ]"
                >
                  {{ formatMatchStatus(inv.match_status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                  :class="[
                    inv.status === 'ReadyForPayment' ? 'bg-green-50 text-green-700 border-green-200' :
                    inv.status === 'GLAllocated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    inv.status === 'MismatchException' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  ]"
                >
                  {{ formatInvoiceStatus(inv.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="7" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติใบแจ้งหนี้วางบิล
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
const filterStatus = ref('สถานะทั้งหมด');
const invoicesList = ref<any[]>([]);

const loadInvoices = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/invoice', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    invoicesList.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Mocking vendor AP invoice list.');
    invoicesList.value = [
      {
        invoice_id: 'inv_1',
        invoice_no: 'INV-2026-0007',
        invoice_date: new Date(Date.now() - 3600000 * 24),
        due_date: new Date(Date.now() + 86400000 * 29),
        total_amount: 291040,
        match_status: 'Matched',
        status: 'ReadyForPayment',
        po: { po_no: 'PO2606002' },
        gr: { gr_no: 'GR-2026-0001' }
      }
    ];
  }
};

const filteredInvoices = computed(() => {
  return invoicesList.value.filter(inv => {
    const matchesSearch = inv.invoice_no.toLowerCase().includes(search.value.toLowerCase()) ||
      (inv.po?.po_no || '').toLowerCase().includes(search.value.toLowerCase());
    
    const matchesStatus = filterStatus.value === 'สถานะทั้งหมด' || inv.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatMatchStatus = (status: string) => {
  switch (status) {
    case 'Matched': return 'จับคู่ตรงกัน ✅';
    case 'Mismatch': return 'ข้อมูลไม่ตรงกัน ❌';
    default: return 'รอเปรียบเทียบ ⏳';
  }
};

const formatInvoiceStatus = (status: string) => {
  switch (status) {
    case 'Created': return 'ยื่นวางบิลแล้ว';
    case 'Matching': return 'กำลังตรวจสอบ';
    case 'Matched': return 'ผ่านการ matching';
    case 'MismatchException': return 'มีข้อคลาดเคลื่อน';
    case 'ReadyForPayment': return 'รอจ่ายเงิน';
    default: return status;
  }
};

onMounted(() => {
  loadInvoices();
});
</script>
