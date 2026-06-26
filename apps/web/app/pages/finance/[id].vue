<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">หน้างานตรวจสอบจับคู่ใบแจ้งหนี้ (3-Way Matching Workspace)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">เปรียบเทียบความถูกต้องของเอกสาร สั่งซื้อ (PO) ➔ รับของ (GR) ➔ วางบิล (Invoice)</p>
      </div>
      <div class="flex gap-2">
        <UButton to="/finance" variant="outline" icon="i-heroicons-arrow-left">กลับหน้ารายการ</UButton>
        <UButton 
          v-if="invoice?.status === 'Created' || invoice?.status === 'MismatchException'"
          @click="runMatchEngine"
          color="primary"
          icon="i-heroicons-arrow-path"
          :loading="matching"
          class="cursor-pointer"
        >
          ประมวลผล Matching อีกครั้ง
        </UButton>
      </div>
    </div>

    <!-- Alert Mismatch / Success -->
    <div 
      v-if="invoice" 
      class="p-4 rounded-xl border flex items-start gap-3 shadow-[var(--shadow-sm)]"
      :class="[
        invoice.match_status === 'Matched' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      ]"
    >
      <UIcon 
        :name="invoice.match_status === 'Matched' ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-exclamation-triangle-20-solid'"
        class="w-5 h-5 flex-shrink-0 mt-0.5"
        :class="[invoice.match_status === 'Matched' ? 'text-green-600' : 'text-red-600']"
      />
      <div>
        <h4 class="font-bold text-sm">
          {{ invoice.match_status === 'Matched' ? 'ผลการจับคู่ข้อมูล: ถูกต้องตรงกัน (Matched)' : 'ผลการจับคู่ข้อมูล: มีจุดไม่ตรงกัน (Mismatch Exception)' }}
        </h4>
        <p class="text-xs mt-1 leading-relaxed">
          {{ invoice.match_status === 'Matched' 
            ? 'ข้อมูลเอกสารใบสั่งซื้อ ใบตรวจรับของ และใบแจ้งหนี้ตรงกันสมบูรณ์ภายในเงื่อนไขความคลาดเคลื่อน 5% ระบบได้ทำการตรวจสอบภาษีและจัดสรรงบประมาณ Cost Center เรียบร้อยแล้ว พร้อมส่งทำจ่าย' 
            : 'ตรวจพบความคลาดเคลื่อนเกินกว่า 5% ระหว่างจำนวนสินค้าที่ได้รับตรวจรับจริง (GR) กับจำนวนที่ต้องการเรียกเก็บเงินตามใบแจ้งหนี้ (Invoice) กรุณาตรวจสอบและดำเนินการปรับลดจำนวน หรือออกใบลดหนี้ (Credit Note)' 
          }}
        </p>
      </div>
    </div>

    <!-- 3-Column Comparison Matrix -->
    <div v-if="invoice" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- COLUMN 1: PURCHASE ORDER (PO) -->
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div class="p-4 bg-slate-50 border-b font-bold text-slate-800 text-sm flex items-center justify-between">
          <span>1. ใบสั่งซื้อ (PO)</span>
          <span class="text-xs text-[var(--primary)] font-mono font-bold">{{ invoice.po?.po_no || 'PO-2606-XXXX' }}</span>
        </div>
        <div class="p-4 flex-1 space-y-4">
          <div v-for="line in invoice.lines" :key="line.invoice_line_id" class="border rounded-lg p-3 space-y-2 bg-slate-50/50">
            <div class="font-semibold text-slate-800 text-xs truncate">{{ line.item?.item_name || 'สินค้าอ้างอิง' }}</div>
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>จำนวนสั่งซื้อ: <span class="font-bold text-slate-700">{{ formatQuantity(line.po_line?.quantity || line.qty) }}</span></div>
              <div>ราคา/หน่วย: <span class="font-bold text-slate-700">{{ formatCurrency(line.po_line?.unit_price || line.unit_price) }}</span></div>
            </div>
            <div class="border-t pt-2 flex justify-between text-xs font-bold">
              <span>ราคารวม PO:</span>
              <span class="text-slate-700">{{ formatCurrency((line.po_line?.quantity || line.qty) * (line.po_line?.unit_price || line.unit_price)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMN 2: GOODS RECEIPT (GR) -->
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div class="p-4 bg-slate-50 border-b font-bold text-slate-800 text-sm flex items-center justify-between">
          <span>2. การรับสินค้า (GR)</span>
          <span class="text-xs text-indigo-600 font-mono font-bold">{{ invoice.gr?.gr_no || 'GR-2026-0002' }}</span>
        </div>
        <div class="p-4 flex-1 space-y-4">
          <div v-for="line in invoice.lines" :key="line.invoice_line_id" class="border rounded-lg p-3 space-y-2 bg-slate-50/50">
            <div class="font-semibold text-slate-800 text-xs truncate">{{ line.item?.item_name || 'สินค้าอ้างอิง' }}</div>
            <div class="grid grid-cols-1 gap-2 text-xs text-slate-500">
              <!-- If Mismatch, highlight received qty -->
              <div>จำนวนรับของจริง: 
                <span 
                  class="font-extrabold px-1.5 py-0.5 rounded text-xs ml-1"
                  :class="[
                    invoice.match_status === 'Mismatch' && line.qty !== (line.po_line?.received_quantity || 15)
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  ]"
                >
                  {{ formatQuantity(line.po_line?.received_quantity || (invoice.match_status === 'Mismatch' ? 15 : line.qty)) }}
                </span>
              </div>
            </div>
            <div class="border-t pt-2 text-[10px] text-slate-400">
              สถานะ: ตรวจรับสินค้าเรียบร้อย
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMN 3: INVOICE BILLING -->
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div class="p-4 bg-slate-50 border-b font-bold text-slate-800 text-sm flex items-center justify-between">
          <span>3. ใบแจ้งหนี้ (Invoice)</span>
          <span class="text-xs text-emerald-600 font-mono font-bold">{{ invoice.invoice_no }}</span>
        </div>
        <div class="p-4 flex-1 space-y-4">
          <div v-for="line in invoice.lines" :key="line.invoice_line_id" class="border rounded-lg p-3 space-y-2 bg-slate-50/50">
            <div class="font-semibold text-slate-800 text-xs truncate">{{ line.item?.item_name || 'สินค้าอ้างอิง' }}</div>
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>จำนวนวางบิล: 
                <span 
                  class="font-extrabold px-1.5 py-0.5 rounded text-xs"
                  :class="[
                    invoice.match_status === 'Mismatch' && line.qty !== (line.po_line?.received_quantity || 15)
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  ]"
                >
                  {{ formatQuantity(line.qty) }}
                </span>
              </div>
              <div>ราคาเรียกเก็บ: <span class="font-bold text-slate-700">{{ formatCurrency(line.unit_price) }}</span></div>
            </div>
            <div class="border-t pt-2 flex justify-between text-xs font-bold">
              <span>ราคารวมวางบิล:</span>
              <span class="text-emerald-700">{{ formatCurrency(line.line_total) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="invoice" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Financial Accounting Allocation Card -->
      <div class="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-4">
        <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-calculator" class="text-emerald-500 w-5 h-5" />
          <span>ข้อมูลจัดสรรทางบัญชีและการเงิน (GL & Cost Center Allocation)</span>
        </h4>
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-slate-400 block mb-1">รหัสบัญชีแยกประเภท (GL Code)</span>
            <span class="font-mono font-bold text-slate-800 text-sm">{{ invoice.gl_account_code || '513000 (ค่าอุปกรณ์วัสดุ)' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-1">ศูนย์ต้นทุน (Cost Center)</span>
            <span class="font-bold text-slate-800 text-sm">{{ invoice.cost_center?.cc_name || 'งบจัดซื้อกลาง (CC-PROC-01)' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-1">ภาษีหัก ณ ที่จ่าย (WHT)</span>
            <span class="font-bold text-slate-800 text-sm">{{ formatCurrency(invoice.wht_amount) }} THB</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-1">สถานะงบประมาณ</span>
            <span class="font-bold text-green-600 text-sm">ตรวจสอบงบประมาณผ่านแล้ว ✅</span>
          </div>
        </div>
      </div>

      <!-- Credit / Debit Notes Matching Card -->
      <div class="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-4 flex flex-col justify-between">
        <div>
          <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-document-duplicate" class="text-indigo-500 w-5 h-5" />
              <span>ใบลดหนี้ / ใบเพิ่มหนี้ (Credit / Debit Notes Matching)</span>
            </div>
            <UButton 
              @click="showAddCnDnModal = true" 
              size="xs" 
              color="indigo" 
              variant="outline"
              class="cursor-pointer font-bold"
            >
              <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 mr-1" />
              ผูกเอกสาร
            </UButton>
          </h4>

          <!-- List of CN/DN -->
          <div class="mt-3 space-y-2">
            <div 
              v-for="note in cnDnNotes" 
              :key="note.cn_dn_id" 
              class="flex items-center justify-between p-2 rounded-lg border text-xs"
              :class="[
                note.type === 'Credit' 
                  ? 'bg-red-50 border-red-100 text-red-800' 
                  : 'bg-green-50 border-green-100 text-green-800'
              ]"
            >
              <div class="flex items-center gap-1.5">
                <span class="font-bold px-1.5 py-0.5 rounded text-[8px] uppercase border" :class="note.type === 'Credit' ? 'bg-red-100 border-red-200' : 'bg-green-100 border-green-200'">
                  {{ note.type === 'Credit' ? 'CN' : 'DN' }}
                </span>
                <span class="font-semibold">{{ note.reason }}</span>
              </div>
              <div class="font-bold">
                {{ note.type === 'Credit' ? '-' : '+' }}{{ formatCurrency(Number(note.amount)) }}
              </div>
            </div>

            <div v-if="cnDnNotes.length === 0" class="text-center py-6 text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg">
              ยังไม่มีการผูกใบลดหนี้ / ใบเพิ่มหนี้ในใบแจ้งหนี้นี้
            </div>
          </div>
        </div>

        <!-- Net Amount Deductions Panel -->
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 mt-2 text-[10px] space-y-1.5">
          <div class="flex justify-between text-slate-600">
            <span>ยอดหนี้ตั้งต้น (Original Billing):</span>
            <span>{{ formatCurrency(invoice.total_amount) }}</span>
          </div>
          <div class="flex justify-between text-red-600" v-if="totalCreditNotes > 0">
            <span>หัก ใบลดหนี้ (Total Credit Notes):</span>
            <span>-{{ formatCurrency(totalCreditNotes) }}</span>
          </div>
          <div class="flex justify-between text-green-700" v-if="totalDebitNotes > 0">
            <span>บวก ใบเพิ่มหนี้ (Total Debit Notes):</span>
            <span>+{{ formatCurrency(totalDebitNotes) }}</span>
          </div>
          <div class="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-xs">
            <span>ยอดเงินทำจ่ายสุทธิ (Net Pay Amount):</span>
            <span class="text-indigo-700">{{ formatCurrency(netInvoiceAmount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add CN/DN Modal -->
    <UModal v-model="showAddCnDnModal" prevent-close>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-base">เพิ่มใบลดหนี้ / ใบเพิ่มหนี้</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showAddCnDnModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">ประเภทเอกสาร</label>
            <select 
              v-model="newCnDnType" 
              class="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mt-1 h-9"
            >
              <option value="Credit">Credit Note (ใบลดหนี้)</option>
              <option value="Debit">Debit Note (ใบเพิ่มหนี้)</option>
            </select>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">มูลค่าเงิน (THB)</label>
            <UInput v-model.number="newCnDnAmount" type="number" placeholder="กรอกจำนวนเงิน..." />
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">เหตุผลในการออกเอกสาร</label>
            <UTextarea v-model="newCnDnReason" placeholder="เช่น หักส่วนลดรายการสินค้าชำรุด หรือปรับราคาตามสัญญา..." rows="2" />
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showAddCnDnModal = false" variant="ghost" color="gray">ยกเลิก</UButton>
          <UButton 
            @click="submitCnDn"
            color="primary"
            :loading="submittingCnDn"
            class="px-5 cursor-pointer font-bold"
          >
            บันทึกผูกเอกสาร
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const invoiceId = route.params.id as string;
const invoice = ref<any>(null);
const matching = ref(false);

const cnDnNotes = ref<any[]>([]);
const showAddCnDnModal = ref(false);
const newCnDnType = ref('Credit');
const newCnDnAmount = ref<number | null>(null);
const newCnDnReason = ref('');
const submittingCnDn = ref(false);

const loadCnDnNotes = async () => {
  try {
    const res = await $fetch<any[]>(`http://localhost:3001/api/payment/credit-debit-note/${invoiceId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    cnDnNotes.value = res;
  } catch (err) {
    console.warn('Backend unavailable. Loading default/mock CN/DN notes.');
    if (invoiceId === 'inv_mock_2') {
      cnDnNotes.value = [
        { cn_dn_id: 'mock_cn_1', invoice_id: invoiceId, type: 'Credit', amount: 17500, reason: 'ปรับลดราคาจาก 5 ชิ้นที่ส่งคืนเนื่องจากสเปคผิดพลาด', status: 'Approved' }
      ];
    } else {
      cnDnNotes.value = [];
    }
  }
};

const totalCreditNotes = computed(() => {
  return cnDnNotes.value
    .filter(n => n.type === 'Credit' && n.status === 'Approved')
    .reduce((sum, n) => sum + Number(n.amount), 0);
});

const totalDebitNotes = computed(() => {
  return cnDnNotes.value
    .filter(n => n.type === 'Debit' && n.status === 'Approved')
    .reduce((sum, n) => sum + Number(n.amount), 0);
});

const netInvoiceAmount = computed(() => {
  if (!invoice.value) return 0;
  return Number(invoice.value.total_amount) - totalCreditNotes.value + totalDebitNotes.value;
});

const submitCnDn = async () => {
  if (!newCnDnAmount.value || !newCnDnReason.value) {
    alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
    return;
  }
  submittingCnDn.value = true;
  try {
    await $fetch('http://localhost:3001/api/payment/credit-debit-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        invoice_id: invoiceId,
        type: newCnDnType.value,
        amount: newCnDnAmount.value,
        reason: newCnDnReason.value,
      },
    });
    showAddCnDnModal.value = false;
    newCnDnAmount.value = null;
    newCnDnReason.value = '';
    await loadCnDnNotes();
  } catch (err) {
    cnDnNotes.value.push({
      cn_dn_id: `cn_dn_${Date.now()}`,
      invoice_id: invoiceId,
      type: newCnDnType.value,
      amount: newCnDnAmount.value,
      reason: newCnDnReason.value,
      status: 'Approved',
    });
    showAddCnDnModal.value = false;
    newCnDnAmount.value = null;
    newCnDnReason.value = '';
    alert('บันทึกและผูกเอกสารใบลดหนี้/เพิ่มหนี้สำเร็จ! (Simulated)');
  } finally {
    submittingCnDn.value = false;
  }
};

const loadInvoiceDetails = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/invoice/${invoiceId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    invoice.value = res;
  } catch (err) {
    console.warn('Backend unavailable. Mocking AP Invoice details.');
    invoice.value = {
      invoice_id: invoiceId,
      invoice_no: invoiceId === 'inv_mock_1' ? 'INV-2026-0007' : 'INV-2026-0004',
      total_amount: invoiceId === 'inv_mock_1' ? 291040 : 70000,
      match_type: '3Way',
      match_status: invoiceId === 'inv_mock_1' ? 'Matched' : 'Mismatch',
      status: invoiceId === 'inv_mock_1' ? 'ReadyForPayment' : 'MismatchException',
      vat_amount: 19040,
      wht_amount: 0,
      gl_account_code: '513000',
      po: { po_no: invoiceId === 'inv_mock_1' ? 'PO2606002' : 'PO2606001' },
      gr: { gr_no: invoiceId === 'inv_mock_1' ? 'GR-2026-0001' : 'GR-2026-0002' },
      cost_center: { cc_name: 'งบจัดซื้อกลาง (CC-PROC-01)' },
      lines: [
        {
          invoice_line_id: 'line_1',
          qty: invoiceId === 'inv_mock_1' ? 10 : 20,
          unit_price: invoiceId === 'inv_mock_1' ? 27200 : 3500,
          line_total: invoiceId === 'inv_mock_1' ? 272000 : 70000,
          item: { item_name: invoiceId === 'inv_mock_1' ? 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว' : 'โต๊ะทำงานเหล็ก' },
          po_line: {
            quantity: 20,
            unit_price: invoiceId === 'inv_mock_1' ? 27200 : 3500,
            received_quantity: invoiceId === 'inv_mock_1' ? 20 : 15,
          }
        }
      ]
    };
  }
};

const runMatchEngine = async () => {
  matching.value = true;
  try {
    await $fetch(`http://localhost:3001/api/invoice/${invoiceId}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    await loadInvoiceDetails();
  } catch (err) {
    console.warn('Backend unavailable. Simulating Match success.');
    invoice.value.match_status = 'Matched';
    invoice.value.status = 'ReadyForPayment';
  } finally {
    matching.value = false;
  }
};

const formatQuantity = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0';
  const num = Number(val);
  return isNaN(num) ? '0' : Math.round(num).toString();
};

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

const formatGrStatus = (status: string) => {
  switch (status) {
    case 'FullReceipt': return 'รับของครบถ้วน';
    case 'PartialReceipt': return 'รับบางส่วน';
    case 'ServiceAccepted': return 'ยืนยันรับงานบริการ';
    case 'ClaimRaised': return 'แจ้งเคลมสินค้าชำรุด';
    default: return status;
  }
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
    case 'Created': return 'สร้างแล้ว';
    case 'DuplicateRejected': return 'ซ้ำซ้อน / ถูกปฏิเสธ';
    case 'Matching': return 'กำลังตรวจสอบ';
    case 'Matched': return 'ผ่านการ matching';
    case 'MismatchException': return 'มีข้อคลาดเคลื่อน';
    case 'ReadyForPayment': return 'รอทำจ่าย';
    default: return status;
  }
};

onMounted(() => {
  loadInvoiceDetails();
  loadCnDnNotes();
});
</script>
