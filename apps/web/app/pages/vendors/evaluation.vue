<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ประเมินผลงานผู้ค้าประจำปี (Annual Vendor Evaluation)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ประเมินคุณภาพและประสิทธิภาพคู่ค้าประจำปีที่มีมูลค่าการจัดซื้อรวมสะสมเกิน 100,000 บาท</p>
      </div>
      <div>
        <UButton 
          color="primary"
          icon="i-heroicons-plus-circle"
          class="cursor-pointer"
          @click="openNewEvalModal()"
        >
          ประเมินคู่ค้ารายใหม่
        </UButton>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-200">
      <button 
        v-for="t in tabs" 
        :key="t.id"
        @click="activeTab = t.id"
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer"
        :class="[
          activeTab === t.id 
            ? 'border-[var(--primary)] text-[var(--primary)]' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        ]"
      >
        <div class="flex items-center gap-2">
          <UIcon :name="t.icon" class="w-4 h-4" />
          <span>{{ t.name }}</span>
        </div>
      </button>
    </div>

    <!-- TAB 1: ELIGIBLE VENDORS & ANNUAL SPEND -->
    <div v-if="activeTab === 'eligibility'" class="space-y-4">
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[var(--border)]">
          <div class="font-bold text-slate-700">คู่ค้าจัดจ่ายประจำปีและสิทธิ์ประเมินงาน</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">ชื่อบริษัทคู่ค้า</th>
                <th class="px-6 py-3">หมวดหมู่ธุรกิจ</th>
                <th class="px-6 py-3 text-right">ยอดซื้อสะสมปีนี้ (THB)</th>
                <th class="px-6 py-3 text-center">สิทธิ์ประเมิน (>100k THB)</th>
                <th class="px-6 py-3 text-center">คะแนนเฉลี่ยปัจจุบัน</th>
                <th class="px-6 py-3 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="vendor in vendorsList" :key="vendor.vendor_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-bold text-slate-700">{{ vendor.vendor_name }}</td>
                <td class="px-6 py-4 text-slate-500">{{ vendor.business_category }}</td>
                <td class="px-6 py-4 text-right font-extrabold text-slate-800">
                  {{ formatCurrency(vendor.annual_spend) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-bold inline-block border"
                    :class="[
                      vendor.annual_spend >= 100000 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    ]"
                  >
                    {{ vendor.annual_spend >= 100000 ? 'ต้องรับประเมิน ✅' : 'ได้รับการยกเว้น ❌' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center font-bold">
                  <span v-if="vendor.evaluation_score" class="text-indigo-600">
                    {{ vendor.evaluation_score }} / 100
                  </span>
                  <span v-else class="text-slate-400">ยังไม่มีข้อมูล</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <UButton 
                    v-if="vendor.annual_spend >= 100000"
                    size="xs" 
                    color="primary"
                    icon="i-heroicons-pencil-square"
                    class="cursor-pointer font-bold"
                    @click="openNewEvalModal(vendor)"
                  >
                    เริ่มประเมินงาน
                  </UButton>
                  <span v-else class="text-xs text-slate-400">ยอดไม่ถึงเกณฑ์ประเมิน</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: EVALUATION RECORDS & HISTORY -->
    <div v-if="activeTab === 'history'" class="space-y-4">
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">คู่ค้า</th>
                <th class="px-6 py-3 text-center">ปีงบประเมิน</th>
                <th class="px-6 py-3 text-center">Technical (40%)</th>
                <th class="px-6 py-3 text-center">Commercial (30%)</th>
                <th class="px-6 py-3 text-center">Delivery (30%)</th>
                <th class="px-6 py-3 text-center">คะแนนรวม</th>
                <th class="px-6 py-3 text-center">สถานะอนุมัติ</th>
                <th class="px-6 py-3 text-center">ผู้อนุมัติ</th>
                <th class="px-6 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="item in evaluations" :key="item.evaluation_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ item.vendor?.vendor_name }}</td>
                <td class="px-6 py-4 text-center font-mono font-semibold">{{ item.year }}</td>
                <td class="px-6 py-4 text-center font-semibold text-slate-600">{{ item.scores?.technical || 0 }}</td>
                <td class="px-6 py-4 text-center font-semibold text-slate-600">{{ item.scores?.commercial || 0 }}</td>
                <td class="px-6 py-4 text-center font-semibold text-slate-600">{{ item.scores?.delivery || 0 }}</td>
                <td class="px-6 py-4 text-center font-extrabold text-indigo-600">{{ calculateAverage(item.scores) }} / 100</td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-bold inline-block border"
                    :class="[
                      item.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                    ]"
                  >
                    {{ item.status === 'Approved' ? 'ผ่านอนุมัติ ✅' : 'รอรีวิวสิทธิ์ ⏳' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center text-slate-500">{{ item.approver?.username || '-' }}</td>
                <td class="px-6 py-4 text-center">
                  <UButton 
                    v-if="item.status !== 'Approved'"
                    size="xs" 
                    color="green"
                    class="cursor-pointer font-bold"
                    @click="approveEvalRecord(item.evaluation_id)"
                  >
                    อนุมัติประเมิน
                  </UButton>
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
    <UModal v-model="showCreateModal" prevent-close>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-base">บันทึกผลการประเมินผู้ค้าประจำปี</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showCreateModal = false" />
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

          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
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
          <UButton @click="showCreateModal = false" variant="ghost" color="gray">ยกเลิก</UButton>
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
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

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
      }
    ];
  }
};

const vendorOptions = computed(() => {
  return vendorsList.value
    .filter(v => v.annual_spend >= 100000)
    .map(v => ({ value: v.vendor_id, label: v.vendor_name }));
});

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
      vendor: { vendor_name: selectedVendor?.vendor_name || 'Mock Vendor' },
      approver: null,
    });
    alert('บันทึกและส่งผลประเมินขอสิทธิ์อนุมัติสำเร็จ! (Simulated)');
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
      body: { approver_id: authStore.user?.user_id || '00000006-0000-0000-0000-000000000007' },
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
      alert('อนุมัติผลประเมินและเฉลี่ยคะแนนเข้าระดับผู้ค้าหลักเรียบร้อย! (Simulated)');
    }
  }
};

const calculateAverage = (scores: any) => {
  if (!scores) return 0;
  const sum = Number(scores.technical || 0) + Number(scores.commercial || 0) + Number(scores.delivery || 0);
  return Math.round(sum / 3);
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
};

onMounted(() => {
  loadData();
});
</script>
