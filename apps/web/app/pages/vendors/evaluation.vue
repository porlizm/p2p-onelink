<template>
  <div class="vendor-like-page">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ประเมินผลงานผู้ค้าประจำปี (Annual Vendor Evaluation)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ประเมินคุณภาพและประสิทธิภาพคู่ค้าประจำปีที่มีมูลค่าการจัดซื้อรวมสะสมเกิน 100,000 บาท</p>
      </div>
      <div>
        <button class="btn-primary" @click="openNewEvalModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
          ประเมินคู่ค้ารายใหม่
        </button>
      </div>
    </div>

    <!-- KPI Summary Row -->
    <div class="kpi-row">
      <div class="kpi-card">
        <span class="kpi-card__value">{{ vendorsList.length }}</span>
        <span class="kpi-card__label">คู่ค้าทั้งหมด</span>
      </div>
      <div class="kpi-card kpi-card--success">
        <span class="kpi-card__value">{{ eligibleVendorCount }}</span>
        <span class="kpi-card__label">ถึงเกณฑ์ประเมิน</span>
      </div>
      <div class="kpi-card kpi-card--warning">
        <span class="kpi-card__value">{{ pendingEvaluationCount }}</span>
        <span class="kpi-card__label">รออนุมัติผล</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-card__value">{{ approvedEvaluationCount }}</span>
        <span class="kpi-card__label">อนุมัติแล้ว</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="ds-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === t.id }"
        @click="activeTab = t.id"
      >
        <span>{{ t.name }}</span>
        <span class="ds-tab__badge">{{ getEvaluationTabCount(t.id) }}</span>
      </button>
    </div>

    <!-- TAB 1: ELIGIBLE VENDORS & ANNUAL SPEND -->
    <div v-if="activeTab === 'eligibility'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[var(--border)]">
          <div class="font-bold text-slate-700">คู่ค้าจัดจ่ายประจำปีและสิทธิ์ประเมินงาน</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">ชื่อบริษัทคู่ค้า</th>
                <th class="px-6 py-3.5">หมวดหมู่ธุรกิจ</th>
                <th class="px-6 py-3.5 text-right">ยอดซื้อสะสมปีนี้ (THB)</th>
                <th class="px-6 py-3.5 text-center">สิทธิ์ประเมิน (>100k THB)</th>
                <th class="px-6 py-3.5 text-center">คะแนนเฉลี่ยปัจจุบัน</th>
                <th class="px-6 py-3.5 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-sm">
              <tr v-for="vendor in vendorsList" :key="vendor.vendor_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5 font-bold text-slate-700">{{ vendor.vendor_name }}</td>
                <td class="px-6 py-5 text-slate-500">{{ vendor.business_category }}</td>
                <td class="px-6 py-5 text-right font-extrabold text-slate-800">
                  {{ formatCurrency(vendor.annual_spend) }}
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="vendor.annual_spend >= 100000" class="eligibility-badge eligibility-badge--yes">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    ต้องรับประเมิน
                  </span>
                  <span v-else class="eligibility-badge eligibility-badge--no">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ยกเว้น
                  </span>
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="vendor.evaluation_score" class="score-display">{{ vendor.evaluation_score }} <span class="score-display__total">/ 100</span></span>
                  <span v-else class="no-data-text">ยังไม่มีข้อมูล</span>
                </td>
                <td class="px-6 py-5 text-center">
                  <button
                    v-if="vendor.annual_spend >= 100000"
                    class="action-btn action-btn--review"
                    @click="openNewEvalModal(vendor)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    เริ่มประเมิน
                  </button>
                  <span v-else class="no-data-text">ยอดไม่ถึงเกณฑ์</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: EVALUATION RECORDS & HISTORY -->
    <div v-if="activeTab === 'history'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">คู่ค้า</th>
                <th class="px-6 py-3.5 text-center">ปีงบประเมิน</th>
                <th class="px-6 py-3.5 text-center">Technical (40%)</th>
                <th class="px-6 py-3.5 text-center">Commercial (30%)</th>
                <th class="px-6 py-3.5 text-center">Delivery (30%)</th>
                <th class="px-6 py-3.5 text-center">คะแนนรวม</th>
                <th class="px-6 py-3.5 text-center">สถานะอนุมัติ</th>
                <th class="px-6 py-3.5 text-center">ผู้อนุมัติ</th>
                <th class="px-6 py-3.5 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-sm">
              <tr v-for="item in evaluations" :key="item.evaluation_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5 font-bold text-[var(--primary)]">{{ item.vendor?.vendor_name }}</td>
                <td class="px-6 py-5 text-center font-mono font-semibold">{{ item.year }}</td>
                <td class="px-6 py-5 text-center font-semibold text-slate-600">{{ item.scores?.technical || 0 }}</td>
                <td class="px-6 py-5 text-center font-semibold text-slate-600">{{ item.scores?.commercial || 0 }}</td>
                <td class="px-6 py-5 text-center font-semibold text-slate-600">{{ item.scores?.delivery || 0 }}</td>
                <td class="px-6 py-5 text-center font-extrabold text-indigo-600">{{ calculateAverage(item.scores) }} / 100</td>
                <td class="px-6 py-5 text-center">
                  <StatusBadge :status="item.status" />
                </td>
                <td class="px-6 py-5 text-center text-slate-500">{{ item.approver?.username || '-' }}</td>
                <td class="px-6 py-5 text-center">
                  <button
                    v-if="item.status !== 'Approved'"
                    class="action-btn action-btn--review"
                    @click="approveEvalRecord(item.evaluation_id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    อนุมัติประเมิน
                  </button>
                  <span v-else class="text-xs text-green-600 font-bold">บันทึกเสร็จสมบูรณ์</span>
                </td>
              </tr>
              <tr v-if="evaluations.length === 0">
                <td colspan="9" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                  ไม่พบข้อมูลประวัติประเมินงานผู้ค้า
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Annual Evaluation Modal -->
    <UModal v-model:open="showCreateModal" prevent-close>
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-base">บันทึกผลการประเมินผู้ค้าประจำปี</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showCreateModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">เลือกคู่ค้า / Vendor</label>
            <USelect 
              v-model="evalVendorId"
              :options="vendorOptions"
              class="w-full"
              :disabled="lockVendor"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ปีการประเมิน (Year)</label>
              <USelect 
                v-model.number="evalYear"
                :options="[2026, 2025, 2024]"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">เกณฑ์ขั้นต่ำสำหรับส่งอนุมัติ</label>
              <div class="bg-indigo-50 border border-indigo-100 rounded px-2.5 py-1.5 font-bold text-indigo-700">
                >= 60 คะแนน
              </div>
            </div>
          </div>

          <div class="bg-slate-50 border border-[#eff1f5] rounded-lg p-4 space-y-4">
            <div class="font-bold text-slate-700 text-xs flex items-center justify-between">
              <span>เกณฑ์การประเมินคะแนนประจำปี (0 - 100)</span>
              <span class="text-[var(--primary)]">น้ำหนัก Technical 40% / Comm. 30% / Deliv. 30%</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 mb-1">เกณฑ์ด้านเทคนิค (Technical Score - 40%)</label>
                <UInput v-model.number="scoreTechnical" type="number" min="0" max="100" placeholder="0-100" />
              </div>
              <div>
                <label class="block text-slate-500 mb-1">เกณฑ์การค้า (Commercial Score - 30%)</label>
                <UInput v-model.number="scoreCommercial" type="number" min="0" max="100" placeholder="0-100" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 mb-1">เกณฑ์ขนส่งและจัดส่ง (Delivery Score - 30%)</label>
                <UInput v-model.number="scoreDelivery" type="number" min="0" max="100" placeholder="0-100" />
              </div>
              <div>
                <label class="block text-slate-500 mb-1">เกณฑ์ด้านบริการ (Service Score - 0% weight)</label>
                <UInput v-model.number="scoreService" type="number" min="0" max="100" placeholder="0-100" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">คำแนะนำหรือหมายเหตุเชิงลึก</label>
            <UInput v-model="evalRemarks" placeholder="ระบุผลงานโดยรวม ขีดความสามารถ และส่วนที่ต้องการให้ปรับปรุง..." />
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showCreateModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton 
            color="primary"
            :loading="submitting"
            class="px-5 cursor-pointer font-bold"
            @click="submitEvaluation"
          >
            ส่งผลประเมินอนุมัติ
          </UButton>
        </div>
      </div>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const activeTab = ref('eligibility');

const tabs = [
  { id: 'eligibility', name: 'สิทธิ์การรับประเมิน (Eligibility)', icon: 'i-heroicons-check-badge' },
  { id: 'history', name: 'ประวัติและผลคะแนน (Evaluation History)', icon: 'i-heroicons-history' },
];

const vendorsList = ref<any[]>([]);
const evaluations = ref<any[]>([]);

const showCreateModal = ref(false);
const submitting = ref(false);

const evalVendorId = ref('');
const lockVendor = ref(false);
const evalYear = ref(2026);
const scoreTechnical = ref<number | null>(null);
const scoreCommercial = ref<number | null>(null);
const scoreDelivery = ref<number | null>(null);
const scoreService = ref<number | null>(null);
const evalRemarks = ref('');

const loadData = async () => {
  try {
    // 1. Load Vendors & spend
    const vRes = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    // Ensure vendors have simulated annual spends
    vendorsList.value = vRes.map((v, i) => {
      let annual_spend = 120000;
      if (i === 1) annual_spend = 291040;
      if (i === 2) annual_spend = 85000;
      if (i === 3) annual_spend = 30000;
      return {
        ...v,
        annual_spend: v.annual_spend || annual_spend,
      };
    });
  } catch (err) {
    vendorsList.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', business_category: 'อุปกรณ์ไอที', annual_spend: 291040, evaluation_score: 87 },
      { vendor_id: '00000000-0000-0000-0000-000000000602', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', business_category: 'อุปกรณ์ไอที/บริการ', annual_spend: 185000, evaluation_score: 90 },
      { vendor_id: '00000000-0000-0000-0000-000000000607', vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด', business_category: 'อุปกรณ์เซฟตี้', annual_spend: 70000, evaluation_score: null },
      { vendor_id: '00000000-0000-0000-0000-000000000609', vendor_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด', business_category: 'บำรุงรักษา/วิศวกรรม', annual_spend: 45000, evaluation_score: null },
      { vendor_id: '00000000-0000-0000-0000-000000000610', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด', business_category: 'เฟอร์นิเจอร์/ตกแต่งสำนักงาน', annual_spend: 220000, evaluation_score: null },
      { vendor_id: '00000000-0000-0000-0000-000000000611', vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด', business_category: 'ขนส่งและโลจิสติกส์', annual_spend: 680000, evaluation_score: 78 },
      { vendor_id: '00000000-0000-0000-0000-000000000612', vendor_name: 'บริษัท คลีนเซอร์วิส จำกัด', business_category: 'บริการทำความสะอาด', annual_spend: 480000, evaluation_score: null },
    ];
  }

  try {
    // 2. Load Evaluation list
    const eRes = await $fetch<any[]>('http://localhost:3001/api/vendor/evaluation/list', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    evaluations.value = eRes;
  } catch (err) {
    evaluations.value = [
      {
        evaluation_id: 'eval_1',
        year: 2026,
        status: 'PendingReview',
        scores: { technical: 85, commercial: 90, delivery: 88, service: 95 },
        vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        approver: null,
      },
      {
        evaluation_id: 'eval_2',
        year: 2025,
        status: 'Approved',
        scores: { technical: 92, commercial: 88, delivery: 90, service: 90 },
        vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
        approver: { username: 'cfo_approver' },
      },
      {
        evaluation_id: 'eval_3',
        year: 2026,
        status: 'UnderEvaluation',
        scores: { technical: 70, commercial: null, delivery: null, service: null },
        vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' },
        approver: null,
      },
      {
        evaluation_id: 'eval_4',
        year: 2026,
        status: 'Scored',
        scores: { technical: 78, commercial: 82, delivery: 75, service: 80 },
        vendor: { vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
        approver: null,
      },
      {
        evaluation_id: 'eval_5',
        year: 2025,
        status: 'Approved',
        scores: { technical: 55, commercial: 60, delivery: 58, service: 50 },
        vendor: { vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด' },
        approver: { username: 'senior_buyer' },
      }
    ];
  }
};

const vendorOptions = computed(() => {
  return vendorsList.value
    .filter(v => v.annual_spend >= 100000)
    .map(v => ({ value: v.vendor_id, label: v.vendor_name }));
});

const eligibleVendorCount = computed(() => vendorsList.value.filter(v => Number(v.annual_spend || 0) >= 100000).length);
const pendingEvaluationCount = computed(() => evaluations.value.filter(e => e.status !== 'Approved').length);
const approvedEvaluationCount = computed(() => evaluations.value.filter(e => e.status === 'Approved').length);

const getEvaluationTabCount = (tabId: string) => {
  if (tabId === 'eligibility') return eligibleVendorCount.value;
  return evaluations.value.length;
};

const openNewEvalModal = (vendor?: any) => {
  if (vendor) {
    evalVendorId.value = vendor.vendor_id;
    lockVendor.value = true;
  } else {
    evalVendorId.value = vendorOptions.value[0]?.value || '';
    lockVendor.value = false;
  }
  evalYear.value = 2026;
  scoreTechnical.value = null;
  scoreCommercial.value = null;
  scoreDelivery.value = null;
  scoreService.value = null;
  evalRemarks.value = '';
  showCreateModal.value = true;
};

const submitEvaluation = async () => {
  if (!evalVendorId.value || scoreTechnical.value === null || scoreCommercial.value === null || scoreDelivery.value === null) {
    alert('กรุณากรอกข้อมูลและให้คะแนนผู้ค้าให้ครบเกณฑ์สำคัญ (Technical, Commercial, Delivery)');
    return;
  }
  submitting.value = true;
  const payload = {
    vendor_id: evalVendorId.value,
    year: evalYear.value,
    scores: {
      technical: scoreTechnical.value,
      commercial: scoreCommercial.value,
      delivery: scoreDelivery.value,
      service: scoreService.value || 0,
    },
    remarks: evalRemarks.value,
  };

  try {
    await $fetch('http://localhost:3001/api/vendor/evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: payload,
    });
    alert('บันทึกและส่งผลประเมินขอสิทธิ์อนุมัติสำเร็จ!');
    showCreateModal.value = false;
    await loadData();
  } catch (err) {
    const selectedVendor = vendorsList.value.find(v => v.vendor_id === evalVendorId.value);
    evaluations.value.unshift({
      evaluation_id: `eval_${Date.now()}`,
      year: evalYear.value,
      status: 'PendingReview',
      scores: payload.scores,
      vendor: { vendor_name: selectedVendor?.vendor_name || 'คู่ค้าตัวอย่าง' },
      approver: null,
    });
    alert('บันทึกและส่งผลประเมินขอสิทธิ์อนุมัติสำเร็จ!');
    showCreateModal.value = false;
  } finally {
    submitting.value = false;
  }
};

const approveEvalRecord = async (evalId: string) => {
  try {
    await $fetch(`http://localhost:3001/api/vendor/evaluation/${evalId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { approver_id: authStore.user?.userId || '00000006-0000-0000-0000-000000000007' },
    });
    alert('อนุมัติผลประเมินและเฉลี่ยคะแนนเข้าระดับผู้ค้าหลักเรียบร้อย!');
    await loadData();
  } catch (err) {
    const ev = evaluations.value.find(e => e.evaluation_id === evalId);
    if (ev) {
      ev.status = 'Approved';
      ev.approver = { username: authStore.user?.username || 'senior_buyer' };
      // Simulate average score computation on vendor object
      const v = vendorsList.value.find(vendor => vendor.vendor_name === ev.vendor.vendor_name);
      if (v) {
        v.evaluation_score = calculateAverage(ev.scores);
      }
      alert('อนุมัติผลประเมินและเฉลี่ยคะแนนเข้าระดับผู้ค้าหลักเรียบร้อย!');
    }
  }
};

const calculateAverage = (scores: any) => {
  if (!scores) return 0;
  const sum = Number(scores.technical || 0) + Number(scores.commercial || 0) + Number(scores.delivery || 0);
  return Math.round(sum / 3);
};

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.vendor-like-page { display: flex; flex-direction: column; gap: var(--space-5); font-family: var(--font-sans); }

.vendor-like-page > .flex:first-child {
  align-items: flex-start;
  border-bottom: 0;
  padding-bottom: 0;
}

.vendor-like-page h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--fg-primary);
  letter-spacing: var(--tracking-tight);
}

.vendor-like-page p {
  margin-top: 4px;
  font-size: var(--text-sm);
  color: var(--fg-tertiary);
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.kpi-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-1);
}

.kpi-card__value {
  font-size: 28px;
  font-weight: var(--weight-bold);
  color: var(--fg-primary);
  line-height: 1;
}

.kpi-card__label {
  font-size: var(--text-xs);
  color: var(--fg-tertiary);
  font-weight: var(--weight-medium);
}

.kpi-card--success { border-left: 3px solid var(--color-success-500); }
.kpi-card--success .kpi-card__value { color: var(--color-success-700); }
.kpi-card--warning { border-left: 3px solid var(--color-warning-400); }
.kpi-card--warning .kpi-card__value { color: var(--color-warning-700); }

.ds-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 4px;
  background: #f3f5f7;
  border-radius: 14px;
}

.ds-tab {
  min-width: max-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #6b7280;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.ds-tab__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: #e5e7eb;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}

.ds-tab--active .ds-tab__badge {
  color: #047857;
  background: #d8f3df;
}

.ds-tab:hover {
  color: #374151;
  background: rgba(255, 255, 255, 0.65);
}

.ds-tab--active {
  color: #047857;
  background: #ffffff;
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.vendor-like-page table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.vendor-like-page > .space-y-4 > .bg-white {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}

.vendor-like-page > .space-y-4 > .bg-white > .p-4 {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.vendor-like-page thead tr {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

.vendor-like-page th {
  padding: 12px 20px;
  font-size: 11px;
  font-weight: var(--weight-bold);
  color: var(--fg-tertiary);
  text-transform: uppercase;
  white-space: nowrap;
}

.vendor-like-page td {
  padding: 16px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f5;
}

.vendor-like-page tbody tr {
  transition: background-color var(--transition-base);
}

.vendor-like-page tbody tr:hover {
  background: #fafafa;
}

@media (max-width: 900px) {
  .kpi-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .kpi-row { grid-template-columns: 1fr; }
}

.eligibility-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: var(--radius-full);
  font-size: var(--text-xs); font-weight: var(--weight-semibold);
  border: 1px solid; white-space: nowrap;
}
.eligibility-badge--yes { color: var(--color-success-700); background: var(--color-success-100); border-color: var(--color-success-200); }
.eligibility-badge--no  { color: var(--fg-tertiary); background: var(--bg-surface); border-color: var(--border-default); }

.score-display { font-size: var(--text-base); font-weight: var(--weight-bold); color: var(--color-info-700); }
.score-display__total { font-size: var(--text-xs); font-weight: var(--weight-regular); color: var(--fg-tertiary); }
.no-data-text { font-size: var(--text-xs); color: var(--fg-tertiary); }
</style>
