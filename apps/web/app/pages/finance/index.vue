<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ส่งชำระเงิน e-Payment (e-Payment Bridge)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">คิวส่งส่งจ่ายเงินสำหรับเอกสารใบสั่งซื้อ (PO) ที่ได้รับความเห็นชอบแล้ว ไปยังระบบภายนอก e-Payment</p>
      </div>
      <div>
        <span class="px-3 py-1 bg-slate-100 border text-slate-700 text-xs rounded-lg font-mono">
          บทบาทปัจจุบัน: {{ authStore.user?.role || 'Accounting' }}
        </span>
      </div>
    </div>

    <!-- Error Alert Modal -->
    <UModal v-model="isErrorAlertOpen">
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3 text-red-600 border-b pb-3">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 shrink-0" />
          <h3 class="text-lg font-bold">ธุรกรรมถูกระงับ (Security Block)</h3>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed">{{ alertErrorMessage }}</p>
        <div class="flex justify-end pt-2">
          <UButton color="red" class="text-white font-semibold" @click="isErrorAlertOpen = false">รับทราบ</UButton>
        </div>
      </div>
    </UModal>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอส่งจ่ายเงิน</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ pendingPaymentCount }} รายการ</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">กำลังดำเนินการ (Processing)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ processingPaymentCount }} รายการ</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ชำระสำเร็จแล้ว (Paid)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ paidPaymentCount }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- Dual-Authorization: Bank account verification list -->
    <div class="bg-white border border-amber-200 rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 bg-amber-50/50 border-b border-amber-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shield-check" class="text-amber-600 w-5 h-5" />
          <span class="font-bold text-amber-900">ตรวจสอบและอนุมัติบัญชีธนาคารคู่ค้า (Bank Account Audits)</span>
        </div>
        <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">ความปลอดภัยสูงสุด (Dual-Authorization)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-[var(--muted-foreground)] font-semibold uppercase">
              <th class="px-6 py-3">บริษัทคู่ค้า (Vendor)</th>
              <th class="px-6 py-3">รายละเอียดธนาคาร</th>
              <th class="px-6 py-3">เลขที่บัญชี / ชื่อบัญชี</th>
              <th class="px-6 py-3 text-center">จัดซื้อยืนยัน (Buyer)</th>
              <th class="px-6 py-3 text-center">บัญชียืนยัน (Accounting)</th>
              <th class="px-6 py-3 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="bank in pendingBanks" :key="bank.bank_account_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-slate-800">
                {{ bank.vendor?.vendor_name || 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }}
              </td>
              <td class="px-6 py-4 text-slate-600">
                <p class="font-semibold">{{ bank.bank_name }}</p>
                <p class="text-[10px] text-slate-400">สาขา: {{ bank.bank_branch || '—' }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="font-mono font-bold text-slate-800">{{ bank.account_no }}</p>
                <p class="text-[10px] text-slate-500">{{ bank.account_name }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="bank.verified_by_buyer ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-400'"
                >
                  {{ bank.verified_by_buyer ? `ยืนยันโดย ${bank.verified_by_buyer}` : 'รอตรวจสอบ' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="bank.verified_by_accounting ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-400'"
                >
                  {{ bank.verified_by_accounting ? `ยืนยันโดย ${bank.verified_by_accounting}` : 'รอตรวจสอบ' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <UButton
                    size="xs"
                    color="primary"
                    variant="soft"
                    :disabled="!!bank.verified_by_buyer"
                    icon="i-heroicons-user-check"
                    @click="verifyBank(bank.bank_account_id, 'buyer')"
                  >
                    ยืนยัน (จัดซื้อ)
                  </UButton>
                  <UButton
                    size="xs"
                    color="emerald"
                    variant="soft"
                    :disabled="!!bank.verified_by_accounting"
                    icon="i-heroicons-shield-check"
                    @click="verifyBank(bank.bank_account_id, 'accounting')"
                  >
                    ยืนยัน (บัญชี)
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="pendingBanks.length === 0">
              <td colspan="6" class="text-center py-6 text-xs text-[var(--muted-foreground)]">
                ไม่มีข้อมูลบัญชีธนาคารที่อยู่ระหว่างรอตรวจสอบยืนยัน
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PO Queue Table -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] font-bold text-slate-700">คิวเอกสารส่งจ่าย (Payment Bridge Queue)</div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ PO</th>
              <th class="px-6 py-3">ผู้ค้า / Vendor</th>
              <th class="px-6 py-3 text-right">ยอดเงินรวม (THB)</th>
              <th class="px-6 py-3 text-center">วันที่ออก PO</th>
              <th class="px-6 py-3 text-center">สถานะชำระเงิน</th>
              <th class="px-6 py-3 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <template v-for="po in posList" :key="po.po_id">
              <tr class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-bold text-[var(--primary)]">
                  {{ po.po_no }}
                </td>
                <td class="px-6 py-4 font-semibold text-slate-700">
                  {{ po.vendor?.vendor_name || 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }}
                </td>
                <td class="px-6 py-4 text-right font-extrabold text-slate-800">
                  {{ formatCurrency(po.total_amount) }}
                </td>
                <td class="px-6 py-4 text-center text-slate-500">
                  {{ formatDate(po.created_at) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex flex-col items-center gap-1">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                      :class="[
                        po.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        po.status === 'ProcessingPayment' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
                        po.payment_error_code ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        po.status === 'VendorConfirmed' || po.status === 'Approved' || po.status === 'SentToVendor' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      ]"
                    >
                      {{ po.payment_error_code ? 'การจ่ายเงินล้มเหลว ❌' : formatPoPaymentStatus(po.status) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <!-- Standard Trigger -->
                    <UButton
                      v-if="(po.status === 'VendorConfirmed' || po.status === 'Approved' || po.status === 'SentToVendor') && !po.payment_error_code"
                      @click="triggerPayment(po.po_id)"
                      size="xs"
                      color="indigo"
                      icon="i-heroicons-paper-airplane"
                      class="cursor-pointer font-bold"
                    >
                      ส่งจ่าย e-Payment
                    </UButton>

                    <!-- Retry Trigger for Failed Payments -->
                    <UButton
                      v-if="po.payment_error_code"
                      @click="triggerPayment(po.po_id)"
                      size="xs"
                      color="orange"
                      icon="i-heroicons-arrow-path"
                      class="cursor-pointer font-bold"
                    >
                      ลองใหม่อีกครั้ง (Retry)
                    </UButton>
                    
                    <!-- Simulation Webhooks callbacks -->
                    <UButton
                      v-if="po.status === 'ProcessingPayment'"
                      @click="mockCallback(po.po_no, 'Success')"
                      size="xs"
                      color="green"
                      icon="i-heroicons-check-circle"
                      class="cursor-pointer font-bold"
                    >
                      จำลองจ่ายสำเร็จ
                    </UButton>
                    <UButton
                      v-if="po.status === 'ProcessingPayment'"
                      @click="mockCallback(po.po_no, 'Failed')"
                      size="xs"
                      color="red"
                      variant="outline"
                      icon="i-heroicons-x-circle"
                      class="cursor-pointer"
                    >
                      จำลองจ่ายล้มเหลว
                    </UButton>
                    
                    <span v-if="po.status === 'Paid'" class="text-xs text-green-600 font-bold flex items-center gap-0.5">
                      <UIcon name="i-heroicons-check" class="w-4 h-4" />
                      ชำระเงินเรียบร้อย
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Expandable diagnostic details on error rows -->
              <tr v-if="po.payment_error_code" :key="po.po_id + '-error'" class="bg-rose-50/30">
                <td colspan="6" class="px-6 py-2 text-xs border-b border-[var(--border)]">
                  <div class="flex items-center gap-2 text-rose-800">
                    <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 text-rose-500 shrink-0" />
                    <span>
                      <strong>ข้อผิดพลาด [{{ po.payment_error_code }}]:</strong> {{ po.payment_error_message }}
                    </span>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="posList.length === 0">
              <td colspan="6" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบเอกสารใบสั่งซื้อในระบบ
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
const posList = ref<any[]>([]);
const pendingBanks = ref<any[]>([]);

// Security Warning modal data
const isErrorAlertOpen = ref(false);
const alertErrorMessage = ref('');

const loadPOs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/po', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    posList.value = res;
  } catch (err) {
    posList.value = [
      { po_id: 'po_1', po_no: 'PO2606001', total_amount: 120000, created_at: new Date(), status: 'VendorConfirmed', vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
      { po_id: 'po_2', po_no: 'PO2606002', total_amount: 85500, created_at: new Date(), status: 'ProcessingPayment', vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' } },
      { po_id: 'po_3', po_no: 'PO2606003', total_amount: 950000, created_at: new Date(), status: 'Paid', vendor: { vendor_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด' } },
    ];
  }
};

const loadPendingBanks = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/vendor/bank-accounts/pending', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    pendingBanks.value = res;
  } catch (err) {
    pendingBanks.value = [
      {
        bank_account_id: 'mock-bank-1',
        vendor_id: 'mock-vendor-1',
        bank_name: 'ธนาคารไทยพาณิชย์',
        bank_branch: 'รัชดาภิเษก',
        account_no: '045-2-89912-3',
        account_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
        verification_status: 'PendingVerification',
        verified_by_buyer: null,
        verified_by_accounting: null,
        vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }
      }
    ];
  }
};

const triggerPayment = async (poId: string) => {
  try {
    await $fetch('http://localhost:3001/api/payment/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { po_id: poId },
    });
    alert('ส่งเรื่องไปยังระบบ e-Payment สำเร็จแล้ว! สถานะถูกเปลี่ยนเป็น ProcessingPayment');
    await loadPOs();
  } catch (err: any) {
    const backendMessage = err.data?.message;
    if (backendMessage && backendMessage.includes('ระงับ')) {
      alertErrorMessage.value = backendMessage;
      isErrorAlertOpen.value = true;
    } else {
      alert('ส่งเรื่องไปยังระบบ e-Payment สำเร็จแล้ว! (Simulated)');
      const po = posList.value.find(p => p.po_id === poId);
      if (po) {
        po.status = 'ProcessingPayment';
        po.payment_error_code = null;
        po.payment_error_message = null;
      }
    }
  }
};

const mockCallback = async (poNo: string, status: 'Success' | 'Failed') => {
  let bodyPayload: any = { po_no: poNo, status };
  if (status === 'Failed') {
    bodyPayload.error_code = 'INSUFFICIENT_FUNDS';
    bodyPayload.error_message = 'ยอดเงินในบัญชีหลักของบริษัท SCGJWD มีเงินคงเหลือไม่เพียงพอต่อการทำจ่ายในคิวนี้';
  }

  try {
    await $fetch('http://localhost:3001/api/payment/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: bodyPayload,
    });
    alert(`รับผล Webhook Callback จาก e-Payment เรียบร้อย! PO เลขที่ ${poNo} ปรับปรุงสถานะแล้ว`);
    await loadPOs();
  } catch (err) {
    const po = posList.value.find(p => p.po_no === poNo);
    if (po) {
      if (status === 'Success') {
        po.status = 'Paid';
        po.payment_error_code = null;
        po.payment_error_message = null;
      } else {
        po.status = 'VendorConfirmed';
        po.payment_error_code = 'INSUFFICIENT_FUNDS';
        po.payment_error_message = 'ยอดเงินในบัญชีหลักของบริษัท SCGJWD มีเงินคงเหลือไม่เพียงพอต่อการทำจ่ายในคิวนี้ (Simulated)';
      }
      alert(`รับผล Callback จาก e-Payment เรียบร้อย! (Simulated)`);
    }
  }
};

const verifyBank = async (accountId: string, roleType: 'buyer' | 'accounting') => {
  try {
    const endpoint = `http://localhost:3001/api/vendor/bank-account/${accountId}/verify-${roleType}`;
    await $fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert(`กดยืนยันฝั่ง ${roleType === 'buyer' ? 'จัดซื้อ' : 'บัญชี'} สำเร็จ!`);
    await loadPendingBanks();
    await loadPOs();
  } catch (err) {
    const bank = pendingBanks.value.find(b => b.bank_account_id === accountId);
    if (bank) {
      if (roleType === 'buyer') {
        bank.verified_by_buyer = authStore.user?.username || 'Buyer';
      } else {
        bank.verified_by_accounting = authStore.user?.username || 'Accounting';
      }
      
      if (bank.verified_by_buyer && bank.verified_by_accounting) {
        bank.verification_status = 'Active';
        pendingBanks.value = pendingBanks.value.filter(b => b.bank_account_id !== accountId);
      }
      alert(`กดยืนยันฝั่ง ${roleType === 'buyer' ? 'จัดซื้อ' : 'บัญชี'} สำเร็จ! (Simulated)`);
    }
  }
};

const pendingPaymentCount = computed(() => {
  return posList.value.filter(p => (p.status === 'VendorConfirmed' || p.status === 'Approved' || p.status === 'SentToVendor') && !p.payment_error_code).length;
});

const processingPaymentCount = computed(() => {
  return posList.value.filter(p => p.status === 'ProcessingPayment').length;
});

const paidPaymentCount = computed(() => {
  return posList.value.filter(p => p.status === 'Paid').length;
});

const formatPoPaymentStatus = (status: string) => {
  switch (status) {
    case 'Paid': return 'ชำระเงินเสร็จสิ้น ✅';
    case 'ProcessingPayment': return 'กำลังทำจ่าย (Processing) ⏳';
    case 'VendorConfirmed': return 'รอส่งเรื่องโอนเงิน 📥';
    case 'Approved': return 'ผ่านการอนุมัติ 📥';
    case 'SentToVendor': return 'ส่งถึงคู่ค้าแล้ว';
    default: return status;
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => {
  loadPOs();
  loadPendingBanks();
});
</script>
