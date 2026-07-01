<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รายงานข้อยกเว้น & เอกสารคงค้าง (Exception Reports)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบรายการเอกสารที่ติดขัดในกระบวนการจัดซื้อและการเงินเพื่อดำเนินการแก้ไข</p>
      </div>
      <div>
        <UButton 
          @click="exportCsv"
          color="primary"
          icon="i-heroicons-arrow-down-tray"
          class="cursor-pointer"
        >
          ส่งออกรายงาน (CSV)
        </UButton>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="ds-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <UIcon :name="tab.icon" class="ds-tab__icon" />
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <!-- 1. Pending Approvals -->
      <div v-if="activeTab === 'approvals'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่เอกสาร</th>
              <th class="px-6 py-3">ประเภทเอกสาร</th>
              <th class="px-6 py-3">ผู้ขอ / ผู้สร้าง</th>
              <th class="px-6 py-3 text-right">ยอดเงิน (THB)</th>
              <th class="px-6 py-3 text-center">ค้างอยู่ที่ผู้อนุมัติ</th>
              <th class="px-6 py-3 text-center">ระยะเวลาคงค้าง</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="item in pendingApprovals" :key="item.id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ item.no }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-0.5 rounded text-xs font-semibold" :class="item.type === 'PR' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'">
                  {{ item.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-700">{{ item.creator }}</td>
              <td class="px-6 py-4 text-right font-semibold text-slate-700">{{ formatCurrency(item.amount) }}</td>
              <td class="px-6 py-4 text-center font-medium text-slate-700">{{ item.approver }}</td>
              <td class="px-6 py-4 text-center font-bold text-red-600 animate-pulse">{{ item.days }} วัน</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. Pending GR -->
      <div v-if="activeTab === 'gr'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ PO</th>
              <th class="px-6 py-3">คู่ค้า / Vendor</th>
              <th class="px-6 py-3">วันที่อนุมัติ PO</th>
              <th class="px-6 py-3 text-right">ยอดเงินรวม (THB)</th>
              <th class="px-6 py-3 text-center">แผนกที่สั่งซื้อ</th>
              <th class="px-6 py-3 text-center">ระยะเวลาค้างส่งมอบ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="item in pendingGr" :key="item.id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ item.po_no }}</td>
              <td class="px-6 py-4 text-slate-700 font-semibold">{{ item.vendor }}</td>
              <td class="px-6 py-4 text-slate-500">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 text-right font-semibold text-slate-700">{{ formatCurrency(item.amount) }}</td>
              <td class="px-6 py-4 text-center text-slate-600">{{ item.dept }}</td>
              <td class="px-6 py-4 text-center font-bold text-orange-600">{{ item.days }} วัน</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. Pending Invoice -->
      <div v-if="activeTab === 'invoices'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ GR (ตรวจรับแล้ว)</th>
              <th class="px-6 py-3">เลขที่ PO อ้างอิง</th>
              <th class="px-6 py-3">คู่ค้า / Vendor</th>
              <th class="px-6 py-3">วันที่ตรวจรับสินค้า</th>
              <th class="px-6 py-3 text-right">มูลค่ารับของ (THB)</th>
              <th class="px-6 py-3 text-center">ผู้ตรวจรับ</th>
              <th class="px-6 py-3 text-center">ค้างคอยการวางบิล</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="item in pendingInvoices" :key="item.id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ item.gr_no }}</td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ item.po_no }}</td>
              <td class="px-6 py-4 text-slate-700 font-semibold">{{ item.vendor }}</td>
              <td class="px-6 py-4 text-slate-500">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 text-right font-semibold text-slate-700">{{ formatCurrency(item.amount) }}</td>
              <td class="px-6 py-4 text-center text-slate-600">{{ item.receiver }}</td>
              <td class="px-6 py-4 text-center font-bold text-indigo-600">{{ item.days }} วัน</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. Overdue Payments -->
      <div v-if="activeTab === 'payments'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ใบแจ้งหนี้</th>
              <th class="px-6 py-3">คู่ค้า / Vendor</th>
              <th class="px-6 py-3">วันครบกำหนด (Due Date)</th>
              <th class="px-6 py-3 text-right">ยอดเงินค้างชำระ (THB)</th>
              <th class="px-6 py-3 text-center">ระดับความเร่งด่วน</th>
              <th class="px-6 py-3 text-center">เกินกำหนดชำระ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="item in overduePayments" :key="item.id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-4 font-bold text-red-600">{{ item.inv_no }}</td>
              <td class="px-6 py-4 text-slate-700 font-semibold">{{ item.vendor }}</td>
              <td class="px-6 py-4 text-red-600 font-semibold">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 text-right font-extrabold text-red-600">{{ formatCurrency(item.amount) }}</td>
              <td class="px-6 py-4 text-center">
                <span class="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold animate-pulse">
                  {{ item.priority }}
                </span>
              </td>
              <td class="px-6 py-4 text-center font-bold text-red-600 animate-bounce">{{ item.days }} วัน</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('approvals');

const tabs = [
  { id: 'approvals', name: 'เอกสารค้างอนุมัติ (Pending Approvals)', icon: 'i-heroicons-clock' },
  { id: 'gr', name: 'ค้างรับสินค้า (Pending GR)', icon: 'i-heroicons-shopping-cart' },
  { id: 'invoices', name: 'ค้างวางบิล (Pending Invoice)', icon: 'i-heroicons-document-text' },
  { id: 'payments', name: 'ค้างจ่ายเงิน (Overdue Payments)', icon: 'i-heroicons-banknotes' },
];

const pendingApprovals = ref([
  { id: 1, no: 'PR2606-0004', type: 'PR', creator: 'นภัส สุขดี', amount: 152000, approver: 'สุภาวดี อัครเดชา', days: 5 },
  { id: 2, no: 'PR2606-0008', type: 'PR', creator: 'นภัส สุขดี', amount: 4800, approver: 'วรากร เจริญชัย', days: 3 },
  { id: 3, no: 'PO2606-0005', type: 'PO', creator: 'ธีรภัทร ชาญเจริญ', amount: 350000, approver: 'คณะกรรมการจัดซื้อ', days: 4 },
]);

const pendingGr = ref([
  { id: 1, po_no: 'PO2606-0003', vendor: 'บริษัท ออฟฟิศ เทค จำกัด', date: '2026-06-15', amount: 12900, dept: 'ฝ่ายจัดซื้อกลาง', days: 8 },
  { id: 2, po_no: 'PO2606-0007', vendor: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด', date: '2026-06-18', amount: 650, dept: 'คลังสินค้าและปฏิบัติการ', days: 5 },
]);

const pendingInvoices = ref([
  { id: 1, gr_no: 'GR-2026-0001', po_no: 'PO2606-0002', vendor: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', date: '2026-06-20', amount: 291040, receiver: 'กิตติชัย วงศ์กุล', days: 3 },
]);

const overduePayments = ref([
  { id: 1, inv_no: 'INV-2026-0004', vendor: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด', date: '2026-06-10', amount: 70000, priority: 'สูงมาก', days: 13 },
]);

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

const exportCsv = () => {
  // Simple simulated CSV download trigger
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  if (activeTab.value === 'approvals') {
    csvContent += 'DocNo,Type,Creator,Amount,PendingApprover,DaysOverdue\n';
    pendingApprovals.value.forEach(x => {
      csvContent += `${x.no},${x.type},${x.creator},${x.amount},${x.approver},${x.days}\n`;
    });
  } else if (activeTab.value === 'gr') {
    csvContent += 'PONo,Vendor,DateApproved,Amount,Dept,DaysOverdue\n';
    pendingGr.value.forEach(x => {
      csvContent += `${x.po_no},"${x.vendor}",${x.date},${x.amount},${x.dept},${x.days}\n`;
    });
  } else if (activeTab.value === 'invoices') {
    csvContent += 'GRNo,PONo,Vendor,DateReceived,Amount,Receiver,DaysOverdue\n';
    pendingInvoices.value.forEach(x => {
      csvContent += `${x.gr_no},${x.po_no},"${x.vendor}",${x.date},${x.amount},${x.receiver},${x.days}\n`;
    });
  } else {
    csvContent += 'InvoiceNo,Vendor,DueDate,Amount,Priority,DaysOverdue\n';
    overduePayments.value.forEach(x => {
      csvContent += `${x.inv_no},"${x.vendor}",${x.date},${x.amount},${x.priority},${x.days}\n`;
    });
  }
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `EXCEPTION_REPORT_${activeTab.value.toUpperCase()}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
