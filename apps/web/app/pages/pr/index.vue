<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ติดตามสถานะใบขอซื้อ (PR Tracking)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ประวัติรายการใบขอซื้อและสถานะอนุมัติของท่าน</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/catalog" class="btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"/></svg>
          ค้นหาใน Catalog
        </NuxtLink>
        <NuxtLink to="/pr/create" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
          สร้างใบขอซื้อ (PR)
        </NuxtLink>
      </div>
    </div>

    <!-- Stats summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-[var(--primary)] flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ใบขอซื้อทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ prList.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รออนุมัติ</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ prList.filter(p => p.status === 'PendingApproval').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">เกินงบประมาณ/ติดบล็อก</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ prList.filter(p => p.status === 'BlockedOverBudget').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">อนุมัติแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ prList.filter(p => p.status === 'Approved').length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search & Filter Tab -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[#eff1f5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ PR หรือรายละเอียด..." 
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
          />
        </div>
        <div class="flex items-center gap-2">
          <select v-model="filterStatus" class="ds-select" style="width:160px">
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="PendingApproval">รออนุมัติ</option>
            <option value="BlockedOverBudget">งบเกิน</option>
            <option value="Approved">อนุมัติแล้ว</option>
            <option value="Rejected">ไม่อนุมัติ</option>
            <option value="Draft">ร่างเอกสาร</option>
          </select>
        </div>
      </div>

      <!-- PR Consolidation Toolbar (US-0309) -->
      <div v-if="selectedPrIds.length > 0" class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <span class="text-xs font-semibold text-indigo-800">เลือกแล้ว {{ selectedPrIds.length }} ใบขอซื้อ — รวมเข้าโครงการประกวดราคาเดียวกัน</span>
        <div class="flex items-center gap-2">
          <button class="action-btn action-btn--neutral" @click="selectedPrIds = []">ล้างการเลือก</button>
          <button class="action-btn action-btn--review" @click="consolidateToRfq">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
            รวมเป็น RFQ เดียว (Consolidate)
          </button>
        </div>
      </div>

      <!-- PR List Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-4 py-3.5"></th>
              <th class="px-6 py-3.5">เลขที่ใบขอซื้อ</th>
              <th class="px-6 py-3.5">วันที่ขอซื้อ</th>
              <th class="px-6 py-3.5">รายละเอียดการสั่งจัดหา</th>
              <th class="px-6 py-3.5 text-right">ยอดรวม (THB)</th>
              <th class="px-6 py-3.5 text-center">สถานะเอกสาร</th>
              <th class="px-6 py-3.5 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="pr in filteredPrs" :key="pr.pr_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-4 py-5 text-center">
                <input
                  v-if="pr.status === 'Approved'"
                  type="checkbox"
                  :value="pr.pr_id"
                  v-model="selectedPrIds"
                  class="w-3.5 h-3.5"
                />
              </td>
              <td class="px-6 py-5 font-bold text-[var(--primary)]">{{ pr.pr_no }}</td>
              <td class="px-6 py-5 text-xs text-slate-500">{{ formatDate(pr.created_at) }}</td>
              <td class="px-6 py-5">
                <div class="font-medium text-[var(--foreground)] line-clamp-1 max-w-sm">{{ pr.description || 'จัดซื้อทั่วไป' }}</div>
                <div class="text-[10px] text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1.5">
                  <span>{{ pr.lines?.length || 0 }} รายการขอซื้อ</span>
                  <span v-if="pr.is_unplanned" class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700">⚠️ นอกแผนงบประมาณ</span>
                </div>
              </td>
              <td class="px-6 py-5 text-right font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(pr.total_amount) }}
              </td>
              <td class="px-6 py-5 text-center">
                <StatusBadge :status="pr.status" />
              </td>
              <td class="px-6 py-5 text-center">
                <!-- Draft -->
                <button
                  v-if="pr.status === 'Draft'"
                  class="action-btn action-btn--review"
                  @click="submitForApproval(pr)"
                >ส่งอนุมัติ</button>

                <!-- PendingApproval -->
                <template v-else-if="pr.status === 'PendingApproval'">
                  <button class="action-btn action-btn--view mr-1" @click="quickApprovePr(pr)">อนุมัติด่วน</button>
                  <button class="action-btn action-btn--danger" @click="rejectPr(pr)">ปฏิเสธ</button>
                </template>

                <!-- ReviseRequired -->
                <button
                  v-else-if="pr.status === 'ReviseRequired'"
                  class="action-btn action-btn--compare"
                  @click="resubmitPr(pr)"
                >แก้ไขและส่งใหม่</button>

                <!-- Rejected -->
                <button
                  v-else-if="pr.status === 'Rejected'"
                  class="action-btn action-btn--neutral"
                  @click="viewRejectionReason(pr)"
                >ดูเหตุผล</button>

                <!-- BlockedOverBudget -->
                <button
                  v-else-if="pr.status === 'BlockedOverBudget'"
                  class="action-btn action-btn--compare"
                  @click="requestBudgetException(pr)"
                >ขอยกเว้นงบ</button>

                <!-- ConvertedToPO -->
                <NuxtLink
                  v-else-if="pr.status === 'ConvertedToPO'"
                  to="/po"
                  class="action-btn action-btn--view"
                >ดู PO</NuxtLink>

                <!-- Approved -->
                <button
                  v-else-if="pr.status === 'Approved'"
                  class="action-btn action-btn--view"
                  @click="openDetails(pr)"
                >ดูรายละเอียด</button>

                <!-- Cancelled -->
                <button
                  v-else-if="pr.status === 'Cancelled'"
                  class="action-btn action-btn--neutral"
                  disabled
                >ดูรายละเอียด</button>

                <!-- Fallback -->
                <button
                  v-else
                  class="action-btn action-btn--view"
                  @click="openDetails(pr)"
                >ดูรายละเอียด</button>
              </td>
            </tr>
            <tr v-if="filteredPrs.length === 0">
              <td colspan="7" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติรายการใบขอซื้อ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PR Detail Modal -->
    <AppModal
      v-model="detailsOpen"
      :title="`ใบขอซื้อ ${activePr?.pr_no}`"
      :subtitle="activePr?.description || 'จัดซื้อทั่วไป'"
      size="lg"
    >
      <template #icon>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </template>
      <template #badge>
        <StatusBadge :status="activePr?.status || 'Draft'" />
      </template>

      <div class="space-y-5">
        <!-- Meta info cards -->
        <div class="grid grid-cols-2 gap-3">
          <div class="info-cell">
            <span class="info-cell__label">วันที่บันทึก</span>
            <span class="info-cell__value">{{ formatDate(activePr?.created_at) }}</span>
          </div>
          <div class="info-cell">
            <span class="info-cell__label">สายอนุมัติ (DOA)</span>
            <span class="info-cell__value flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {{ activePr?.approver_role || 'Manager' }}
            </span>
          </div>
          <div class="info-cell col-span-2">
            <span class="info-cell__label">สถานะงบประมาณ</span>
            <span
              class="info-cell__pill mt-1"
              :class="activePr?.is_budget_overrun ? 'info-cell__pill--warn' : 'info-cell__pill--ok'"
            >
              {{ activePr?.is_budget_overrun ? '⚠ งบเกินเกณฑ์ผ่อนปรน (Escalated)' : '✓ งบปกติผ่านเกณฑ์ (On Budget)' }}
            </span>
          </div>
        </div>

        <!-- Section label -->
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รายการขอจัดซื้อ</span>
          <div class="flex-1 h-px bg-[#eff1f5]"></div>
          <span class="text-[11px] font-semibold text-slate-500">{{ activePr?.lines?.length || 0 }} รายการ</span>
        </div>

        <!-- Lines table -->
        <div class="border border-[#e9ecef] rounded-xl overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5]">
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">รายการ</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">จำนวน</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">ราคา/หน่วย</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">รวม (THB)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#f8f9fa]">
              <tr v-for="line in activePr?.lines" :key="line.line_id" class="hover:bg-[#f8fffe] transition-colors">
                <td class="px-4 py-3.5">
                  <div class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    {{ line.item_name }}
                    <span v-if="line.is_requirement_based" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">TOR</span>
                  </div>
                  <div v-if="line.is_requirement_based && line.scope_of_work" class="text-[10px] text-slate-500 mt-1 italic">
                    ขอบเขตงาน: {{ line.scope_of_work }}
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">{{ line.cost_center?.cc_name || 'N/A' }}</span>
                    <a v-if="line.quotation_url" :href="line.quotation_url" target="_blank"
                      class="text-[10px] text-[var(--primary)] font-semibold flex items-center gap-0.5 hover:underline">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      ใบเสนอราคา
                    </a>
                  </div>
                </td>
                <td class="px-4 py-3.5 text-right text-sm text-slate-600 tabular-nums">{{ formatQuantity(line.quantity) }} <span class="text-[10px] text-slate-400">{{ line.uom }}</span></td>
                <td class="px-4 py-3.5 text-right text-sm text-slate-600 tabular-nums">{{ formatCurrency(line.unit_price) }}</td>
                <td class="px-4 py-3.5 text-right text-sm font-bold text-slate-800 tabular-nums">{{ formatCurrency(line.total_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total row -->
        <div class="flex items-center justify-between bg-[#fafbfc] border border-[#e9ecef] rounded-xl px-5 py-4">
          <span class="text-sm text-slate-500 font-medium">ยอดรวมใบขอซื้อทั้งหมด</span>
          <div class="text-right">
            <span class="text-xl font-black text-slate-800 tabular-nums">{{ formatCurrency(activePr?.total_amount) }}</span>
            <span class="text-xs text-slate-400 ml-1">THB</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button
              v-if="activePr?.status === 'Approved'"
              class="modal-btn modal-btn--primary"
              @click="convertToPo(activePr)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h19l-1.68 8.39A2 2 0 0 1 18.34 16H7.66a2 2 0 0 1-1.97-1.61L4 6"/><path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M1 1h4l2.68 13.39"/></svg>
              ออกใบสั่งซื้อ (PO)
            </button>
            <button
              v-if="['PendingApproval','Approved'].includes(activePr?.status)"
              class="modal-btn modal-btn--danger"
              @click="cancelPR(activePr)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              ยกเลิก PR
            </button>
          </div>
          <button class="modal-btn modal-btn--ghost" @click="detailsOpen = false">ปิดหน้าต่าง</button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const dialog = useDialog();

const search = ref('');
const filterStatus = ref('ทั้งหมด');
const prList = ref<any[]>([]);

const detailsOpen = ref(false);
const activePr = ref<any>(null);

// PR Consolidation to RFQ (US-0309)
const selectedPrIds = ref<string[]>([]);
const consolidateToRfq = async () => {
  const selectedPrs = prList.value.filter((p) => selectedPrIds.value.includes(p.pr_id));
  const consolidatedItems = selectedPrs.flatMap((pr) =>
    (pr.lines || []).map((line: any) => ({
      item_name: line.item_name,
      item_type: line.item_id ? 'Goods' : 'Service',
      quantity: line.quantity,
      uom: line.uom,
      source_pr_no: pr.pr_no,
    }))
  );
  if (consolidatedItems.length === 0) {
    await dialog.alert('ใบขอซื้อที่เลือกไม่มีรายการสินค้า', { variant: 'danger' });
    return;
  }
  sessionStorage.setItem('consolidated_rfq_items', JSON.stringify(consolidatedItems));
  sessionStorage.setItem('consolidated_pr_nos', selectedPrs.map((p) => p.pr_no).join(', '));
  navigateTo('/bidding/create');
};

const loadPrs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/pr', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    prList.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Using mock PR data.');
    prList.value = [
      {
        pr_id: 'pr-17',
        pr_no: 'PR2606017',
        created_at: new Date(Date.now() - 3600000 * 1.5), // 1.5 hrs ago
        description: 'จัดซื้อเก้าอี้เพื่อสุขภาพ Ergonomic ประจำแผนกบริการลูกค้า',
        total_amount: 96000,
        status: 'Approved',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'l17-1',
            item_name: 'เก้าอี้สำนักงาน Steelcase Gesture',
            quantity: 8,
            uom: 'ตัว',
            unit_price: 12000,
            total_price: 96000,
            cost_center: { cc_name: 'ฝ่ายบริการลูกค้า B2B' },
          },
        ],
      },
      {
        pr_id: 'pr-16',
        pr_no: 'PR2606016',
        created_at: new Date(Date.now() - 3600000 * 3.5), // 3.5 hrs ago
        description: 'จัดหาคอมพิวเตอร์พกพา (Notebook) ประจำปีของทีมพัฒนาซอฟต์แวร์',
        total_amount: 105000,
        status: 'Approved',
        approver_role: 'SeniorManager',
        lines: [
          {
            line_id: 'l16-1',
            item_name: 'MacBook Air M3 (RAM 16GB, SSD 512GB)',
            quantity: 3,
            uom: 'เครื่อง',
            unit_price: 35000,
            total_price: 105000,
            cost_center: { cc_name: 'ฝ่ายเทคโนโลยีสารสนเทศ IT' },
          },
        ],
      },
      {
        pr_id: 'pr-15',
        pr_no: 'PR2606015',
        created_at: new Date(Date.now() - 3600000 * 8), // 8 hrs ago
        description: 'จัดหาจอมอนิเตอร์สำหรับพนักงานบริการลูกค้า',
        total_amount: 8000,
        status: 'ConvertedToPO',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'l15-1',
            item_name: 'จอมอนิเตอร์ Dell 24 นิ้ว FHD',
            quantity: 2,
            uom: 'จอ',
            unit_price: 4000,
            total_price: 8000,
            cost_center: { cc_name: 'ฝ่ายขายและการตลาด' },
          },
        ],
      },
      {
        pr_id: 'pr-14',
        pr_no: 'PR2606014',
        created_at: new Date(Date.now() - 86400000), // 1 day ago
        description: 'จัดซื้อเมาส์ออปติคัลและคีย์บอร์ดไร้สายสเปคมาตรฐาน',
        total_amount: 5000,
        status: 'PendingApproval',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'l14-1',
            item_name: 'ชุดเมาส์และคีย์บอร์ดไร้สาย Logitech',
            quantity: 10,
            uom: 'ชุด',
            unit_price: 500,
            total_price: 5000,
            cost_center: { cc_name: 'ฝ่ายจัดซื้อกลาง' },
          },
        ],
      },
      {
        pr_id: 'pr-13',
        pr_no: 'PR2606013',
        created_at: new Date(Date.now() - 86400000 * 2), // 2 days ago
        description: 'จัดหาเซิร์ฟเวอร์ระบบสำรองศูนย์ปฏิบัติการข้อมูล',
        total_amount: 45000,
        status: 'PendingApproval',
        is_budget_overrun: true,
        approver_role: 'CFO',
        lines: [
          {
            line_id: 'l13-1',
            item_name: 'เซิร์ฟเวอร์สำรองระบบ Operatings',
            quantity: 1,
            uom: 'เครื่อง',
            unit_price: 45000,
            total_price: 45000,
            cost_center: { cc_name: 'ฝ่ายเทคโนโลยีสารสนเทศ IT' },
          },
        ],
      },
      {
        pr_id: 'pr-12',
        pr_no: 'PR2606012',
        created_at: new Date(Date.now() - 86400000 * 3), // 3 days ago
        description: 'จัดซื้อวัสดุสำนักงานประจำเดือน (ยกเลิกแผนจัดซื้อด่วน)',
        total_amount: 15000,
        status: 'Cancelled',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'l12-1',
            item_name: 'กระดาษ A4 และแฟ้มจัดเก็บเอกสารสำนักงาน',
            quantity: 50,
            uom: 'กล่อง',
            unit_price: 300,
            total_price: 15000,
            cost_center: { cc_name: 'ฝ่ายบุคคลและบริหารทั่วไป' },
          },
        ],
      },
      {
        pr_id: 'pr-11',
        pr_no: 'PR2606011',
        created_at: new Date(Date.now() - 86400000 * 4), // 4 days ago
        description: 'จัดหาแท็บเล็ตสำหรับตรวจรับคลังสินค้าด่วนพิเศษ (เกินงบแผนปี)',
        total_amount: 20000,
        status: 'BlockedOverBudget',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'l11-1',
            item_name: 'iPad Pro 11 นิ้ว สำหรับคลังสินค้า',
            quantity: 1,
            uom: 'เครื่อง',
            unit_price: 20000,
            total_price: 20000,
            cost_center: { cc_name: 'ฝ่ายปฏิบัติการคลังสินค้า' },
          },
        ],
      },
      {
        pr_id: 'pr_mock_4',
        pr_no: 'PR2606018',
        created_at: new Date(Date.now() - 86400000),
        description: 'จัดซื้อกล้อง CCTV ระบบความปลอดภัยอาคาร A',
        total_amount: 85000,
        status: 'Draft',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'lmock4-1',
            item_name: 'กล้อง CCTV IP 4MP Night Vision',
            quantity: 10,
            uom: 'ตัว',
            unit_price: 8500,
            total_price: 85000,
            cost_center: { cc_name: 'ฝ่ายรักษาความปลอดภัย' },
          },
        ],
      },
      {
        pr_id: 'pr_mock_5',
        pr_no: 'PR2606019',
        created_at: new Date(Date.now() - 86400000 * 5),
        description: 'จัดหาอุปกรณ์สำนักงาน ปีงบประมาณ 2569 ไตรมาส 3',
        total_amount: 45000,
        status: 'Rejected',
        rejection_reason: 'ไม่ผ่านงบประมาณที่กำหนด กรุณาปรับลดรายการ',
        approver_role: 'Manager',
        lines: [
          {
            line_id: 'lmock5-1',
            item_name: 'อุปกรณ์สำนักงานทั่วไป',
            quantity: 1,
            uom: 'ชุด',
            unit_price: 45000,
            total_price: 45000,
            cost_center: { cc_name: 'ฝ่ายทรัพยากรบุคคล' },
          },
        ],
      },
    ];
  }
};

const convertToPo = async (pr: any) => {
  try {
    await $fetch(`http://localhost:3001/api/po/convert/${pr.pr_id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    await loadPrs();
    detailsOpen.value = false;
    await navigateTo('/po');
  } catch (err: any) {
    console.warn('Backend PO conversion failed, using demo conversion.');
    pr.status = 'ConvertedToPO';
    detailsOpen.value = false;
    await navigateTo('/po');
  }
};

const cancelPR = async (pr: any) => {
  if (!(await dialog.confirm(`คุณต้องการยกเลิกใบขอซื้อ ${pr.pr_no} ใช่หรือไม่? ยอดเงินสำรองทั้งหมดจะถูกส่งคืนศูนย์ต้นทุน`, { variant: 'danger' }))) {
    return;
  }
  try {
    await $fetch(`http://localhost:3001/api/pr/${pr.pr_id}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    await dialog.alert('ยกเลิกใบขอซื้อเรียบร้อยแล้ว!', { variant: 'success' });
    await loadPrs();
    detailsOpen.value = false;
  } catch (err: any) {
    console.warn('Backend cancel failed, using demo cancel.');
    pr.status = 'Cancelled';
    await dialog.alert(`ยกเลิกใบขอซื้อ ${pr.pr_no} สำเร็จ! (คืนงบจองเรียบร้อย)`, { variant: 'success' });
    detailsOpen.value = false;
  }
};

onMounted(() => {
  loadPrs();
});

const openDetails = (pr: any) => {
  activePr.value = pr;
  detailsOpen.value = true;
};

const submitForApproval = async (pr: any) => {
  pr.status = 'PendingApproval';
  await dialog.alert(`ส่ง PR ${pr.pr_no} เพื่ออนุมัติเรียบร้อย`, { variant: 'success' });
};

const quickApprovePr = async (pr: any) => {
  pr.status = 'Approved';
  await dialog.alert(`อนุมัติ PR ${pr.pr_no} เรียบร้อยแล้ว`, { variant: 'success' });
};

const rejectPr = async (pr: any) => {
  const ok = await dialog.confirm('ยืนยันการปฏิเสธใบขอซื้อนี้ใช่หรือไม่?', { variant: 'danger', title: 'ปฏิเสธใบขอซื้อ' });
  if (!ok) return;
  pr.status = 'Rejected';
  pr.rejection_reason = 'ไม่ผ่านงบประมาณที่กำหนด กรุณาปรับลดรายการ';
};

const viewRejectionReason = async (pr: any) => {
  await dialog.alert(pr.rejection_reason || 'ไม่ผ่านงบประมาณที่กำหนด กรุณาปรับลดรายการ', { variant: 'warning', title: 'เหตุผลที่ไม่ผ่านการอนุมัติ' });
};

const resubmitPr = async (pr: any) => {
  if (!(await dialog.confirm(`ยืนยันส่งใบขอซื้อ ${pr.pr_no} กลับเข้าสู่กระบวนการอนุมัติอีกครั้ง?`, { variant: 'warning' }))) {
    return;
  }
  try {
    await $fetch(`http://localhost:3001/api/pr/${pr.pr_id}/resubmit`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    await dialog.alert(`ส่งใบขอซื้อ ${pr.pr_no} เข้าสู่การอนุมัติใหม่เรียบร้อยแล้ว`, { variant: 'success' });
    await loadPrs();
  } catch (err) {
    console.warn('Backend resubmit failed, using demo resubmit.');
    pr.status = 'PendingApproval';
    await dialog.alert(`ส่งใบขอซื้อ ${pr.pr_no} เข้าสู่การอนุมัติใหม่เรียบร้อยแล้ว`, { variant: 'success' });
  }
};

const requestBudgetException = async (pr: any) => {
  await dialog.alert(`ส่งคำขอยกเว้นงบประมาณ ${pr.pr_no} ไปยัง CFO แล้ว`, { variant: 'success' });
};

const filteredPrs = computed(() => {
  return prList.value.filter((pr) => {
    if (filterStatus.value !== 'ทั้งหมด' && pr.status !== filterStatus.value) {
      return false;
    }
    if (search.value) {
      const q = search.value.toLowerCase();
      const prNoMatch = pr.pr_no?.toLowerCase().includes(q);
      const descMatch = pr.description?.toLowerCase().includes(q);
      return prNoMatch || descMatch;
    }
    return true;
  });
});

const formatStatus = (status?: string) => {
  switch (status) {
    case 'Draft': return 'ฉบับร่าง';
    case 'PendingApproval': return 'รอการอนุมัติ';
    case 'BlockedOverBudget': return 'ถูกบล็อก (เกินงบฯ)';
    case 'Approved': return 'อนุมัติแล้ว';
    case 'ConvertedToPO': return 'ออก PO แล้ว';
    case 'ReviseRequired': return 'ส่งกลับให้แก้ไข';
    case 'Resubmitted': return 'ส่งใหม่แล้ว';
    case 'Rejected': return 'ปฏิเสธ';
    case 'Cancelled': return 'ยกเลิก';
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
</script>
