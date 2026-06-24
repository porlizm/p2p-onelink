<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ระบบบริหารจัดการงบประมาณ (Budget & Cost Center Management)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบศูนย์ต้นทุน, อนุมัติคำขอเพิ่มงบประมาณ, และทำรายการโอนงบประมาณระหว่างฝ่าย</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton 
          @click="showResetConfirm = true"
          color="red"
          variant="outline"
          icon="i-heroicons-arrow-path"
          class="cursor-pointer font-bold text-xs"
        >
          จำลองปีงบประมาณถัดไป (Year-End Reset)
        </UButton>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">งบประมาณประจำปีทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalAnnualBudget) }} THB</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-lock-closed" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">งบประมาณที่จองไว้ (Reserved)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalReservedBudget) }} THB</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <UIcon name="i-heroicons-shopping-cart" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">งบประมาณที่ใช้ไปแล้ว (Used)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalUsedBudget) }} THB</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">งบคงเหลือจ่ายได้จริง</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalRemainingBudget) }} THB</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="flex border-b border-slate-200">
      <button 
        v-for="t in budgetTabs" 
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
          <span 
            v-if="t.id === 'requests' && pendingRequestsCount > 0" 
            class="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-600 font-bold"
          >
            {{ pendingRequestsCount }}
          </span>
        </div>
      </button>
    </div>

    <!-- TAB 1: BUDGET REQUESTS QUEUE -->
    <div v-if="activeTab === 'requests'" class="space-y-4">
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div class="font-bold text-slate-700">รายการคำขอเพิ่มงบประมาณจากหน่วยงานธุรกิจ (BU)</div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">ศูนย์ต้นทุน</th>
                <th class="px-6 py-3">หน่วยงานธุรกิจ (BU)</th>
                <th class="px-6 py-3 text-right">ยอดที่ยื่นขอ (THB)</th>
                <th class="px-6 py-3">เหตุผลความจำเป็น</th>
                <th class="px-6 py-3">ผู้ยื่นขอ</th>
                <th class="px-6 py-3 text-center">วันที่ส่งคำขอ</th>
                <th class="px-6 py-3 text-center">สถานะ</th>
                <th class="px-6 py-3 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)]">
              <tr v-for="req in budgetRequests" :key="req.request_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-bold text-slate-800">
                  {{ req.cost_center?.cc_name }}
                  <span class="block text-[10px] text-slate-400 font-mono">{{ req.cost_center?.cc_code }}</span>
                </td>
                <td class="px-6 py-4 text-slate-600">
                  {{ req.cost_center?.business_unit?.bu_name || 'SCG JWD BU' }}
                </td>
                <td class="px-6 py-4 text-right font-extrabold text-indigo-600">
                  {{ formatCurrency(req.requested_amount) }}
                </td>
                <td class="px-6 py-4 text-slate-500 max-w-xs truncate" :title="req.reason">
                  {{ req.reason }}
                </td>
                <td class="px-6 py-4 text-slate-600">{{ req.created_by }}</td>
                <td class="px-6 py-4 text-center text-slate-500">{{ formatDate(req.created_at) }}</td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                    :class="[
                      req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                    ]"
                  >
                    {{ formatRequestStatus(req.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div v-if="req.status === 'Pending'" class="flex items-center justify-center gap-1.5">
                    <UButton 
                      @click="approveRequest(req.request_id)"
                      size="xs" 
                      color="green"
                      icon="i-heroicons-check"
                      class="cursor-pointer font-bold"
                    >
                      อนุมัติ
                    </UButton>
                    <UButton 
                      @click="rejectRequest(req.request_id)"
                      size="xs" 
                      color="red"
                      variant="outline"
                      icon="i-heroicons-x-mark"
                      class="cursor-pointer"
                    >
                      ปฏิเสธ
                    </UButton>
                  </div>
                  <span v-else class="text-xs text-slate-400 font-semibold">-</span>
                </td>
              </tr>
              <tr v-if="budgetRequests.length === 0">
                <td colspan="8" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                  ไม่พบรายการยื่นขอคำอนุมัติเพิ่มงบประมาณ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: BUDGET TRANSFER FORM -->
    <div v-if="activeTab === 'transfer'" class="space-y-4 max-w-2xl">
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6 space-y-4">
        <h3 class="font-bold text-sm text-[var(--foreground)] border-b pb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-[var(--primary)]" />
          ทำรายการโอนงบประมาณระหว่างศูนย์ต้นทุน (Budget Transfer)
        </h3>

        <div class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">โอนออกจากศูนย์ต้นทุน (Source Cc) *</label>
              <select 
                v-model="transferFromCc"
                class="w-full px-2.5 py-1.5 text-xs border border-[var(--border)] rounded bg-white focus:outline-none"
              >
                <option value="" disabled>-- เลือกศูนย์ต้นทุนต้นทาง --</option>
                <option 
                  v-for="cc in costCenters" 
                  :key="cc.cost_center_id" 
                  :value="cc.cost_center_id"
                >
                  {{ cc.cc_name }} ({{ cc.cc_code }}) - เหลือ {{ formatCurrency(Number(cc.annual_budget_amount) - Number(cc.budget_used_amount) - Number(cc.budget_reserved_amount)) }} THB
                </option>
              </select>
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">โอนเข้าศูนย์ต้นทุน (Destination Cc) *</label>
              <select 
                v-model="transferToCc"
                class="w-full px-2.5 py-1.5 text-xs border border-[var(--border)] rounded bg-white focus:outline-none"
              >
                <option value="" disabled>-- เลือกศูนย์ต้นทุนปลายทาง --</option>
                <option 
                  v-for="cc in costCenters.filter(c => c.cost_center_id !== transferFromCc)" 
                  :key="cc.cost_center_id" 
                  :value="cc.cost_center_id"
                >
                  {{ cc.cc_name }} ({{ cc.cc_code }}) - ปัจจุบัน {{ formatCurrency(cc.annual_budget_amount) }} THB
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">จำนวนเงินที่โอน (THB) *</label>
            <UInput v-model.number="transferAmount" type="number" placeholder="0.00" />
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">เหตุผลความจำเป็นในการโอนงบประมาณ *</label>
            <UTextarea 
              v-model="transferReason" 
              placeholder="ระบุเหตุผลในการโอนย้ายงบประมาณจัดสรร เช่น ปรับสัดส่วนโครงการไอทีปลายปี..." 
              rows="3"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton 
            @click="submitTransfer"
            color="primary"
            :loading="isSubmittingTransfer"
            :disabled="!transferFromCc || !transferToCc || !transferAmount || transferAmount <= 0"
            class="px-5 cursor-pointer font-bold bg-indigo-600 hover:bg-indigo-700"
          >
            โอนย้ายงบประมาณ
          </UButton>
        </div>
      </div>
    </div>

    <!-- TAB 3: COST CENTERS DIRECTORY -->
    <div v-if="activeTab === 'centers'" class="space-y-4">
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">รหัสศูนย์ต้นทุน</th>
                <th class="px-6 py-3">ชื่อศูนย์ต้นทุน (Cost Center)</th>
                <th class="px-6 py-3 text-right">งบประมาณประจำปี (THB)</th>
                <th class="px-6 py-3 text-right">จองไว้ (Reserved)</th>
                <th class="px-6 py-3 text-right">ใช้จริง (Used)</th>
                <th class="px-6 py-3 text-right">งบคงเหลือใช้งาน</th>
                <th class="px-6 py-3 text-center">เกณฑ์งบเกิน (%)</th>
                <th class="px-6 py-3 text-right">เกณฑ์งบเกิน (บาท)</th>
                <th class="px-6 py-3 text-center">ความครอบคลุมงบประมาณ</th>
                <th class="px-6 py-3 text-center">ปีงบประมาณ</th>
                <th class="px-6 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)]">
              <tr v-for="cc in costCenters" :key="cc.cost_center_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-bold text-slate-700">{{ cc.cc_code }}</td>
                <td class="px-6 py-4 font-bold text-slate-800">{{ cc.cc_name }}</td>
                <td class="px-6 py-4 text-right font-semibold">{{ formatCurrency(cc.annual_budget_amount) }}</td>
                <td class="px-6 py-4 text-right text-orange-600">{{ formatCurrency(cc.budget_reserved_amount) }}</td>
                <td class="px-6 py-4 text-right text-red-600 font-semibold">{{ formatCurrency(cc.budget_used_amount) }}</td>
                <td 
                  class="px-6 py-4 text-right font-extrabold"
                  :class="(Number(cc.annual_budget_amount) - Number(cc.budget_used_amount) - Number(cc.budget_reserved_amount) < 0) ? 'text-red-600' : 'text-green-600'"
                >
                  {{ formatCurrency(Number(cc.annual_budget_amount) - Number(cc.budget_used_amount) - Number(cc.budget_reserved_amount)) }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-slate-600">
                  {{ cc.budget_overrun_tolerance_pct !== undefined && cc.budget_overrun_tolerance_pct !== null ? cc.budget_overrun_tolerance_pct : '5.0' }}%
                </td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">
                  {{ formatCurrency(cc.budget_overrun_tolerance_amount !== undefined && cc.budget_overrun_tolerance_amount !== null ? cc.budget_overrun_tolerance_amount : 20000.0) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="h-2 w-28 bg-slate-200 rounded-full overflow-hidden relative">
                      <div 
                        class="h-full rounded-full transition-all duration-300"
                        :class="[getUsageRatio(cc) > 90 ? 'bg-red-500' : getUsageRatio(cc) > 70 ? 'bg-orange-500' : 'bg-green-500']"
                        :style="{ width: Math.min(100, getUsageRatio(cc)) + '%' }"
                      ></div>
                    </div>
                    <span class="text-[10px] font-bold text-slate-500">{{ getUsageRatio(cc).toFixed(1) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center font-bold text-slate-500">{{ cc.fiscal_year || '2026' }}</td>
                <td class="px-6 py-4 text-center">
                  <UButton
                    @click="openToleranceModal(cc)"
                    size="xs"
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                    class="cursor-pointer"
                    title="แก้ไขเกณฑ์การควบคุมงบเกิน"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Year-End Reset Confirmation Modal -->
    <UModal v-model="showResetConfirm" prevent-close>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3 text-red-600">
          <h3 class="font-bold text-base flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 animate-bounce" />
            <span>ยืนยันจำลองการรีเซ็ตปีงบประมาณประจำปี</span>
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showResetConfirm = false" />
        </div>

        <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p class="font-bold text-red-700">คำเตือน: การกระทำนี้จะมีผลต่อข้อมูลศูนย์ต้นทุนทั้งหมด!</p>
          <p>ระบบจะทำการล้างยอดเงินงบประมาณประจำปี, ยอดเงินที่ใช้จริง และยอดเงินที่จองไว้ทั้งหมดของทุกศูนย์ต้นทุนเป็น 0 และทำการขยับปีงบประมาณ (Fiscal Year) ถัดไป เพื่อเตรียมความพร้อมสำหรับการตั้งค่างบประมาณของปีใหม่</p>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showResetConfirm = false" variant="ghost" color="gray">ยกเลิก</UButton>
          <UButton 
            @click="submitReset"
            color="red"
            :loading="isSubmittingReset"
            class="px-5 cursor-pointer font-bold bg-red-600 hover:bg-red-700 text-white"
          >
            ยืนยันรีเซ็ตและขึ้นปีใหม่
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Edit Tolerance Modal -->
    <UModal v-model="showToleranceModal" prevent-close>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3 text-indigo-600">
          <h3 class="font-bold text-base flex items-center gap-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
            <span>แก้ไขเกณฑ์การควบคุมงบเกิน (Edit Overrun Tolerance)</span>
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showToleranceModal = false" />
        </div>

        <div class="text-xs text-slate-600 space-y-4 leading-relaxed">
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <div class="font-semibold text-slate-700">ศูนย์ต้นทุน: {{ selectedCc?.cc_name }} ({{ selectedCc?.cc_code }})</div>
            <div class="text-slate-500">งบประมาณประจำปี: {{ formatCurrency(selectedCc?.annual_budget_amount || 0) }} THB</div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">เกณฑ์งบเกินสูงสุดเป็นเปอร์เซ็นต์ (%) *</label>
              <UInput 
                v-model.number="tolerancePct" 
                type="number" 
                step="0.1" 
                min="0"
                placeholder="5.0" 
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">หากใบขอซื้อ (PR) เกินงบที่เหลือไม่เกินเปอร์เซ็นต์นี้ จะเปลี่ยนสายอนุมัติไปหา CFO หรือ VP แทนการบล็อกทันที</span>
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">เกณฑ์งบเกินสูงสุดเป็นจำนวนเงิน (THB) *</label>
              <UInput 
                v-model.number="toleranceAmt" 
                type="number" 
                min="0"
                placeholder="20000.00" 
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">หากใบขอซื้อ (PR) เกินงบที่เหลือไม่เกินจำนวนเงินนี้ จะเปลี่ยนสายอนุมัติไปหา CFO หรือ VP แทนการบล็อกทันที</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showToleranceModal = false" variant="ghost" color="gray">ยกเลิก</UButton>
          <UButton 
            @click="saveTolerance"
            color="primary"
            :loading="isSavingTolerance"
            class="px-5 cursor-pointer font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            บันทึกการตั้งค่า
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

const budgetTabs = [
  { id: 'requests', name: 'คำขออนุมัติเพิ่มงบประมาณ', icon: 'i-heroicons-clipboard-document-check' },
  { id: 'transfer', name: 'โอนงบประมาณระหว่างแผนก', icon: 'i-heroicons-arrows-right-left' },
  { id: 'centers', name: 'สรุปงบทุกศูนย์ต้นทุน (Cost Centers)', icon: 'i-heroicons-building-office' },
];

const activeTab = ref('requests');
const costCenters = ref<any[]>([]);
const budgetRequests = ref<any[]>([]);

// Transfer Form Refs
const transferFromCc = ref('');
const transferToCc = ref('');
const transferAmount = ref(0);
const transferReason = ref('');
const isSubmittingTransfer = ref(false);

// Reset Refs
const showResetConfirm = ref(false);
const isSubmittingReset = ref(false);

// Tolerance Refs
const showToleranceModal = ref(false);
const selectedCc = ref<any>(null);
const tolerancePct = ref(5.0);
const toleranceAmt = ref(20000.0);
const isSavingTolerance = ref(false);

const loadCostCenters = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/pr/cost-centers', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    costCenters.value = res;
  } catch (err) {
    costCenters.value = [
      { cost_center_id: 'cc_1', cc_code: 'CC-PROC-01', cc_name: 'งบจัดซื้อกลาง', annual_budget_amount: 2000000, budget_reserved_amount: 85500, budget_used_amount: 950000, fiscal_year: '2026', budget_overrun_tolerance_pct: 5.0, budget_overrun_tolerance_amount: 20000.0 },
      { cost_center_id: 'cc_2', cc_code: 'CC-IT-01', cc_name: 'งบไอที', annual_budget_amount: 1200000, budget_reserved_amount: 0, budget_used_amount: 1098000, fiscal_year: '2026', budget_overrun_tolerance_pct: 5.0, budget_overrun_tolerance_amount: 20000.0 },
      { cost_center_id: 'cc_3', cc_code: 'CC-WH-01', cc_name: 'งบคลังสินค้า', annual_budget_amount: 3000000, budget_reserved_amount: 0, budget_used_amount: 1250000, fiscal_year: '2026', budget_overrun_tolerance_pct: 5.0, budget_overrun_tolerance_amount: 20000.0 },
    ];
  }
};

const loadBudgetRequests = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/budget/requests', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    budgetRequests.value = res;
  } catch (err) {
    budgetRequests.value = [
      { request_id: 'req_1', cost_center: { cc_name: 'งบไอที', cc_code: 'CC-IT-01', business_unit: { bu_name: 'ไอทีซัพพอร์ต' } }, requested_amount: 500000, reason: 'จัดเตรียมซื้อ Macbook Pro เพิ่มให้พนักงานใหม่', created_by: 'pr.requester', created_at: new Date(), status: 'Pending' }
    ];
  }
};

// Approval actions
const approveRequest = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/budget/request/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert('อนุมัติการเพิ่มงบประมาณสำเร็จ!');
    await loadCostCenters();
    await loadBudgetRequests();
  } catch (err) {
    const req = budgetRequests.value.find(r => r.request_id === id);
    if (req) {
      req.status = 'Approved';
      const cc = costCenters.value.find(c => c.cc_name === req.cost_center.cc_name);
      if (cc) {
        cc.annual_budget_amount = Number(cc.annual_budget_amount) + Number(req.requested_amount);
      }
      alert('อนุมัติเพิ่มงบประมาณเรียบร้อย! (Simulated)');
    }
  }
};

const rejectRequest = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/budget/request/${id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert('ปฏิเสธการเพิ่มงบประมาณเรียบร้อย!');
    await loadCostCenters();
    await loadBudgetRequests();
  } catch (err) {
    const req = budgetRequests.value.find(r => r.request_id === id);
    if (req) {
      req.status = 'Rejected';
      alert('ปฏิเสธการเพิ่มงบประมาณเรียบร้อย! (Simulated)');
    }
  }
};

// Transfer
const submitTransfer = async () => {
  if (!transferFromCc.value || !transferToCc.value || !transferAmount.value) return;
  isSubmittingTransfer.value = true;

  try {
    await $fetch('http://localhost:3001/api/budget/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        from_cost_center_id: transferFromCc.value,
        to_cost_center_id: transferToCc.value,
        amount: transferAmount.value,
      },
    });
    alert('โอนย้ายงบประมาณระหว่างศูนย์ต้นทุนสำเร็จ!');
    transferFromCc.value = '';
    transferToCc.value = '';
    transferAmount.value = 0;
    transferReason.value = '';
    await loadCostCenters();
  } catch (err: any) {
    console.warn(err);
    const from = costCenters.value.find(c => c.cost_center_id === transferFromCc.value);
    const to = costCenters.value.find(c => c.cost_center_id === transferToCc.value);
    if (from && to) {
      from.annual_budget_amount = Number(from.annual_budget_amount) - transferAmount.value;
      to.annual_budget_amount = Number(to.annual_budget_amount) + transferAmount.value;
      alert(`[MOCK] โอนย้ายงบประมาณสำเร็จ!\nโอนออก: ${from.cc_name}\nโอนเข้า: ${to.cc_name}\nจำนวน: ${formatCurrency(transferAmount.value)} THB`);
    }
    transferFromCc.value = '';
    transferToCc.value = '';
    transferAmount.value = 0;
    transferReason.value = '';
  } finally {
    isSubmittingTransfer.value = false;
  }
};

// Year-End Reset
const submitReset = async () => {
  isSubmittingReset.value = true;
  try {
    await $fetch('http://localhost:3001/api/budget/reset', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert('รีเซ็ตปีงบประมาณและล้างงบประจำปีเข้าสู่ปีถัดไปสำเร็จ!');
    showResetConfirm.value = false;
    await loadCostCenters();
  } catch (err) {
    costCenters.value.forEach(cc => {
      cc.fiscal_year = (parseInt(cc.fiscal_year || '2026') + 1).toString();
      cc.annual_budget_amount = 0;
      cc.budget_reserved_amount = 0;
      cc.budget_used_amount = 0;
    });
    alert('[MOCK] รีเซ็ตปีงบประมาณและขยับปีถัดไปเรียบร้อย! (Simulated)');
    showResetConfirm.value = false;
  } finally {
    isSubmittingReset.value = false;
  }
};

// Tolerance Methods
const openToleranceModal = (cc: any) => {
  selectedCc.value = cc;
  tolerancePct.value = cc.budget_overrun_tolerance_pct !== undefined && cc.budget_overrun_tolerance_pct !== null ? Number(cc.budget_overrun_tolerance_pct) : 5.0;
  toleranceAmt.value = cc.budget_overrun_tolerance_amount !== undefined && cc.budget_overrun_tolerance_amount !== null ? Number(cc.budget_overrun_tolerance_amount) : 20000.0;
  showToleranceModal.value = true;
};

const saveTolerance = async () => {
  if (!selectedCc.value) return;
  isSavingTolerance.value = true;
  try {
    await $fetch(`http://localhost:3001/api/budget/cost-center/${selectedCc.value.cost_center_id}/tolerance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        budget_overrun_tolerance_pct: Number(tolerancePct.value),
        budget_overrun_tolerance_amount: Number(toleranceAmt.value),
      },
    });
    alert('บันทึกเกณฑ์การควบคุมงบเกินสำเร็จ!');
    showToleranceModal.value = false;
    await loadCostCenters();
  } catch (err: any) {
    console.error(err);
    // Simulated update in case backend API is not running or mock is used
    const cc = costCenters.value.find(c => c.cost_center_id === selectedCc.value.cost_center_id);
    if (cc) {
      cc.budget_overrun_tolerance_pct = Number(tolerancePct.value);
      cc.budget_overrun_tolerance_amount = Number(toleranceAmt.value);
      alert('บันทึกเกณฑ์การควบคุมงบเกินสำเร็จ! (Simulated)');
      showToleranceModal.value = false;
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกเกณฑ์การควบคุมงบเกิน');
    }
  } finally {
    isSavingTolerance.value = false;
  }
};

// Calculations
const totalAnnualBudget = computed(() => {
  return costCenters.value.reduce((sum, cc) => sum + Number(cc.annual_budget_amount), 0);
});

const totalReservedBudget = computed(() => {
  return costCenters.value.reduce((sum, cc) => sum + Number(cc.budget_reserved_amount), 0);
});

const totalUsedBudget = computed(() => {
  return costCenters.value.reduce((sum, cc) => sum + Number(cc.budget_used_amount), 0);
});

const totalRemainingBudget = computed(() => {
  return costCenters.value.reduce((sum, cc) => {
    const remain = Number(cc.annual_budget_amount) - Number(cc.budget_used_amount) - Number(cc.budget_reserved_amount);
    return sum + remain;
  }, 0);
});

const pendingRequestsCount = computed(() => {
  return budgetRequests.value.filter(r => r.status === 'Pending').length;
});

const getUsageRatio = (cc: any) => {
  const annual = Number(cc.annual_budget_amount);
  if (annual <= 0) return 0;
  const used = Number(cc.budget_used_amount) + Number(cc.budget_reserved_amount);
  return (used / annual) * 100;
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatRequestStatus = (status: string) => {
  switch (status) {
    case 'Approved': return 'อนุมัติแล้ว ✅';
    case 'Rejected': return 'ปฏิเสธ ❌';
    default: return 'รอพิจารณา ⏳';
  }
};

onMounted(() => {
  loadCostCenters();
  loadBudgetRequests();
});
</script>
