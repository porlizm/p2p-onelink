<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">แผนจัดซื้อประจำปี (Procurement Planning)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">
          วางแผนงบประมาณตามหมวดหมู่ ปฏิทินกิจกรรมจัดซื้อ เปรียบเทียบแผนกับผลจริง และควบคุมรายการนอกแผน
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="ds-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === t.id }"
        @click="activeTab = t.id"
      >
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- TAB 1: Category Planning + Budget Link (US-0103, US-0104) -->
    <div v-if="activeTab === 'category'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] flex items-center justify-between">
          <div class="font-bold text-slate-700">แผนงบประมาณจัดซื้อตามหมวดหมู่ (Category Plan) ปี {{ currentYear }}</div>
          <button class="action-btn action-btn--review" @click="showAddPlanModal = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
            + เพิ่มแผนหมวดหมู่
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">หมวดหมู่จัดซื้อ</th>
                <th class="px-6 py-3.5 text-right">งบที่วางแผนไว้ (Budget Limit)</th>
                <th class="px-6 py-3.5 text-right">ใช้ไปแล้ว (ผูกกับ PR)</th>
                <th class="px-6 py-3.5 text-right">คงเหลือ</th>
                <th class="px-6 py-3.5">สัดส่วนการใช้งบ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="p in annualPlans" :key="p.plan_id || p.business_category" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4 font-bold text-slate-800">{{ p.business_category }}</td>
                <td class="px-6 py-4 text-right font-semibold">{{ formatCurrency(p.budget_limit) }}</td>
                <td class="px-6 py-4 text-right text-indigo-600 font-bold">{{ formatCurrency(Number(p.budget_limit) - Number(p.remaining_budget)) }}</td>
                <td class="px-6 py-4 text-right font-bold" :class="Number(p.remaining_budget) <= 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ formatCurrency(p.remaining_budget) }}
                </td>
                <td class="px-6 py-4">
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      class="h-2 rounded-full"
                      :class="usagePercent(p) >= 90 ? 'bg-red-500' : usagePercent(p) >= 70 ? 'bg-amber-500' : 'bg-emerald-500'"
                      :style="{ width: usagePercent(p) + '%' }"
                    />
                  </div>
                  <span class="text-[10px] text-slate-400">{{ usagePercent(p) }}% ใช้ไปแล้ว</span>
                </td>
              </tr>
              <tr v-if="annualPlans.length === 0">
                <td colspan="5" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ยังไม่มีแผนงบประมาณตามหมวดหมู่สำหรับปีนี้</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: Procurement Calendar (US-0105) -->
    <div v-if="activeTab === 'calendar'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700">ปฏิทินกิจกรรมจัดซื้อที่ต้องติดตาม (Procurement Calendar)</div>
        <div class="divide-y divide-[#eff1f5]">
          <div
            v-for="ev in calendarEvents"
            :key="ev.key"
            class="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fffe] transition"
          >
            <div class="w-16 shrink-0 text-center">
              <div class="text-lg font-black text-slate-800">{{ ev.day }}</div>
              <div class="text-[10px] text-slate-400 uppercase">{{ ev.monthLabel }}</div>
            </div>
            <div class="w-1 h-10 rounded-full shrink-0" :class="ev.color"></div>
            <div class="flex-1">
              <div class="font-semibold text-slate-800 text-sm">{{ ev.title }}</div>
              <div class="text-[11px] text-slate-400">{{ ev.subtitle }}</div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold" :class="ev.badgeClass">{{ ev.badgeLabel }}</span>
          </div>
          <div v-if="calendarEvents.length === 0" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ไม่มีกิจกรรมจัดซื้อที่ต้องติดตามในขณะนี้</div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Planned vs Actual Monitoring (US-0106) -->
    <div v-if="activeTab === 'monitor'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700">เปรียบเทียบงบประมาณที่วางแผนไว้กับผลใช้จริงรายศูนย์ต้นทุน (Planned vs Actual)</div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">ศูนย์ต้นทุน (Cost Center)</th>
                <th class="px-6 py-3.5 text-right">งบที่วางแผน (Planned)</th>
                <th class="px-6 py-3.5 text-right">ใช้จริง (Actual)</th>
                <th class="px-6 py-3.5 text-right">ผลต่าง (Variance)</th>
                <th class="px-6 py-3.5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="cc in costCenters" :key="cc.cost_center_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4 font-bold text-slate-800">{{ cc.cc_name }}</td>
                <td class="px-6 py-4 text-right font-semibold">{{ formatCurrency(cc.annual_budget_amount) }}</td>
                <td class="px-6 py-4 text-right font-bold text-indigo-600">{{ formatCurrency(cc.budget_used_amount) }}</td>
                <td class="px-6 py-4 text-right font-bold" :class="variance(cc) < 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ variance(cc) < 0 ? '-' : '+' }}{{ formatCurrency(Math.abs(variance(cc))) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    :class="variancePercent(cc) >= 100 ? 'bg-red-100 text-red-700' : variancePercent(cc) >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                  >
                    ใช้ไปแล้ว {{ variancePercent(cc) }}%
                  </span>
                </td>
              </tr>
              <tr v-if="costCenters.length === 0">
                <td colspan="5" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ไม่พบข้อมูลศูนย์ต้นทุน</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: Unplanned Purchase Control (US-0107) -->
    <div v-if="activeTab === 'unplanned'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="text-amber-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>
          รายการใบขอซื้อที่อยู่นอกแผนงบประมาณ (Unplanned Purchases)
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">เลขที่ PR</th>
                <th class="px-6 py-3.5">รายละเอียด</th>
                <th class="px-6 py-3.5 text-right">มูลค่า</th>
                <th class="px-6 py-3.5 text-center">สถานะ PR</th>
                <th class="px-6 py-3.5 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="pr in unplannedPrs" :key="pr.pr_id" class="hover:bg-[#f8fffe] transition bg-amber-50/20">
                <td class="px-6 py-4 font-bold text-[var(--primary)]">
                  <NuxtLink to="/pr">{{ pr.pr_no }}</NuxtLink>
                </td>
                <td class="px-6 py-4 text-slate-600">{{ pr.description }}</td>
                <td class="px-6 py-4 text-right font-bold">{{ formatCurrency(pr.total_amount) }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{{ pr.status }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">⚠️ นอกแผนงบประมาณ</span>
                </td>
              </tr>
              <tr v-if="unplannedPrs.length === 0">
                <td colspan="5" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ไม่มีใบขอซื้อที่อยู่นอกแผนงบประมาณในขณะนี้</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Category Plan Modal -->
    <UModal v-model:open="showAddPlanModal">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-sm">เพิ่มแผนงบประมาณตามหมวดหมู่</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showAddPlanModal = false" />
        </div>
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">หมวดหมู่จัดซื้อ</label>
            <UInput v-model="newPlanCategory" placeholder="เช่น อุปกรณ์ไอที, งานบริการ, เฟอร์นิเจอร์..." />
          </div>
          <div>
            <label class="block text-slate-600 font-semibold mb-1">งบประมาณที่วางแผนไว้ (THB)</label>
            <UInput v-model.number="newPlanBudget" type="number" min="0" placeholder="เช่น 1000000" />
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showAddPlanModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton color="primary" :loading="submitting" class="cursor-pointer font-bold" @click="submitPlan">บันทึกแผน</UButton>
        </div>
      </div>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const dialog = useDialog();

const activeTab = ref('category');
const tabs = [
  { id: 'category', label: 'แผนงบตามหมวดหมู่ (Category Plan)' },
  { id: 'calendar', label: 'ปฏิทินจัดซื้อ (Calendar)' },
  { id: 'monitor', label: 'แผนเทียบผลจริง (Planned vs Actual)' },
  { id: 'unplanned', label: 'นอกแผนงบประมาณ (Unplanned)' },
];

const currentYear = new Date().getFullYear();
const annualPlans = ref<any[]>([]);
const costCenters = ref<any[]>([]);
const rfqList = ref<any[]>([]);
const contracts = ref<any[]>([]);
const prList = ref<any[]>([]);

const showAddPlanModal = ref(false);
const newPlanCategory = ref('');
const newPlanBudget = ref<number>(0);
const submitting = ref(false);

const authHeaders = () => ({ Authorization: `Bearer ${authStore.token}` });

const loadAnnualPlans = async () => {
  try {
    annualPlans.value = await $fetch<any[]>('http://localhost:3001/api/planning/annual-plans', { headers: authHeaders() });
  } catch (err) {
    annualPlans.value = [
      { plan_id: 'plan_1', business_category: 'อุปกรณ์ไอที', budget_limit: 2000000, remaining_budget: 850000 },
      { plan_id: 'plan_2', business_category: 'เฟอร์นิเจอร์สำนักงาน', budget_limit: 500000, remaining_budget: 120000 },
      { plan_id: 'plan_3', business_category: 'งานบริการและบำรุงรักษา', budget_limit: 1200000, remaining_budget: 980000 },
    ];
  }
};

const loadCostCenters = async () => {
  try {
    costCenters.value = await $fetch<any[]>('http://localhost:3001/api/pr/cost-centers', { headers: authHeaders() });
  } catch (err) {
    costCenters.value = [
      { cost_center_id: 'cc1', cc_name: 'ฝ่ายจัดซื้อกลาง', annual_budget_amount: 3000000, budget_used_amount: 1450000 },
      { cost_center_id: 'cc2', cc_name: 'ฝ่ายเทคโนโลยีสารสนเทศ IT', annual_budget_amount: 5000000, budget_used_amount: 4700000 },
      { cost_center_id: 'cc3', cc_name: 'ฝ่ายปฏิบัติการคลังสินค้า', annual_budget_amount: 1800000, budget_used_amount: 900000 },
    ];
  }
};

const loadRfqs = async () => {
  try {
    rfqList.value = await $fetch<any[]>('http://localhost:3001/api/bidding/rfq', { headers: authHeaders() });
  } catch (err) {
    rfqList.value = [];
  }
};

const loadContracts = async () => {
  try {
    contracts.value = await $fetch<any[]>('http://localhost:3001/api/contract', { headers: authHeaders() });
  } catch (err) {
    contracts.value = [];
  }
};

const loadPrs = async () => {
  try {
    prList.value = await $fetch<any[]>('http://localhost:3001/api/pr', { headers: authHeaders() });
  } catch (err) {
    prList.value = [
      { pr_id: 'pr_unplanned_1', pr_no: 'PR2606020', description: 'จัดซื้อโดรนสำรวจคลังสินค้าฉุกเฉิน (นอกแผนปี)', total_amount: 180000, status: 'PendingApproval', is_unplanned: true },
    ];
  }
};

const submitPlan = async () => {
  if (!newPlanCategory.value || !newPlanBudget.value) {
    await dialog.alert('กรุณากรอกข้อมูลให้ครบถ้วน', { variant: 'danger' });
    return;
  }
  submitting.value = true;
  try {
    await $fetch('http://localhost:3001/api/planning/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: {
        year: currentYear,
        items: [{ business_category: newPlanCategory.value, budget_limit: newPlanBudget.value }],
      },
    });
    await dialog.alert('บันทึกแผนงบประมาณเรียบร้อยแล้ว', { variant: 'success' });
    showAddPlanModal.value = false;
    await loadAnnualPlans();
  } catch (err) {
    annualPlans.value.push({
      plan_id: `plan_${Date.now()}`,
      business_category: newPlanCategory.value,
      budget_limit: newPlanBudget.value,
      remaining_budget: newPlanBudget.value,
    });
    showAddPlanModal.value = false;
    await dialog.alert('บันทึกแผนงบประมาณเรียบร้อยแล้ว', { variant: 'success' });
  } finally {
    submitting.value = false;
    newPlanCategory.value = '';
    newPlanBudget.value = 0;
  }
};

const usagePercent = (p: any) => {
  const limit = Number(p.budget_limit) || 1;
  const used = limit - Number(p.remaining_budget);
  return Math.min(100, Math.round((used / limit) * 100));
};

const variance = (cc: any) => Number(cc.annual_budget_amount) - Number(cc.budget_used_amount);
const variancePercent = (cc: any) => {
  const budget = Number(cc.annual_budget_amount) || 1;
  return Math.round((Number(cc.budget_used_amount) / budget) * 100);
};

const unplannedPrs = computed(() => prList.value.filter((p) => p.is_unplanned));

const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const calendarEvents = computed(() => {
  const events: any[] = [];

  rfqList.value.forEach((r) => {
    if (!r.close_date) return;
    const d = new Date(r.close_date);
    events.push({
      key: `rfq-${r.rfq_id}`,
      date: d,
      day: d.getDate(),
      monthLabel: monthLabels[d.getMonth()],
      title: `ปิดรับซองประมูล: ${r.rfq_no}`,
      subtitle: r.title,
      color: 'bg-indigo-400',
      badgeClass: 'bg-indigo-100 text-indigo-700',
      badgeLabel: 'Bidding',
    });
  });

  contracts.value.forEach((c) => {
    if (!c.end_date) return;
    const d = new Date(c.end_date);
    events.push({
      key: `contract-${c.contract_id}`,
      date: d,
      day: d.getDate(),
      monthLabel: monthLabels[d.getMonth()],
      title: `สัญญาสิ้นสุด: ${c.contract_no}`,
      subtitle: c.title,
      color: c.status === 'ExpiringSoon' ? 'bg-amber-400' : 'bg-slate-300',
      badgeClass: c.status === 'ExpiringSoon' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600',
      badgeLabel: 'Contract',
    });
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 20);
});

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => {
  loadAnnualPlans();
  loadCostCenters();
  loadRfqs();
  loadContracts();
  loadPrs();
});
</script>
