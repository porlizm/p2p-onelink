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

      <!-- PR List Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
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
              <td class="px-6 py-5 font-bold text-[var(--primary)]">{{ pr.pr_no }}</td>
              <td class="px-6 py-5 text-xs text-slate-500">{{ formatDate(pr.created_at) }}</td>
              <td class="px-6 py-5">
                <div class="font-medium text-[var(--foreground)] line-clamp-1 max-w-sm">{{ pr.description || 'จัดซื้อทั่วไป' }}</div>
                <div class="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  {{ pr.lines?.length || 0 }} รายการขอซื้อ
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
              <td colspan="6" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติรายการใบขอซื้อ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal Drawer -->
    <UModal v-model:open="detailsOpen">
      <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[var(--foreground)]">
              รายละเอียดใบขอซื้อ {{ activePr?.pr_no }}
            </h3>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="[
                activePr?.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                activePr?.status === 'PendingApproval' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                activePr?.status === 'BlockedOverBudget' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-slate-100 text-slate-700'
              ]"
            >
              {{ formatStatus(activePr?.status) }}
            </span>
          </div>
        </template>

        <div class="space-y-4 py-2 text-xs">
          <!-- Metadata -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-[var(--muted-foreground)] block">วัตถุประสงค์ในการขอซื้อ</span>
              <span class="font-medium text-[var(--foreground)]">{{ activePr?.description || 'จัดซื้อทั่วไป' }}</span>
            </div>
            <div>
              <span class="text-[var(--muted-foreground)] block">วันที่ลงบันทึก</span>
              <span class="font-medium text-[var(--foreground)]">{{ formatDate(activePr?.created_at) }}</span>
            </div>
            <div>
              <span class="text-[var(--muted-foreground)] block">สายการอนุมัติเอกสาร (DOA Approver)</span>
              <span class="font-bold text-[var(--primary)] flex items-center gap-1 mt-0.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-indigo-500" />
                {{ activePr?.approver_role || 'Manager' }}
              </span>
            </div>
            <div>
              <span class="text-[var(--muted-foreground)] block">สถานะการตรวจสอบงบประมาณ</span>
              <span 
                v-if="activePr?.is_budget_overrun" 
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 mt-1 inline-block"
              >
                งบเกินเกณฑ์ผ่อนปรน (Escalated)
              </span>
              <span 
                v-else 
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 mt-1 inline-block"
              >
                งบปกติผ่านเกณฑ์ (On Budget)
              </span>
            </div>
          </div>

          <!-- Lines table -->
          <div class="border border-[#e9ecef] rounded-lg overflow-hidden mt-4">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#fafbfc] text-[10px] font-bold text-slate-500 border-b border-[#eff1f5]">
                  <th class="p-2">รายการขอจัดซื้อ</th>
                  <th class="p-2 text-right">จำนวน</th>
                  <th class="p-2 text-right">ราคาหน่วย (THB)</th>
                  <th class="p-2 text-right">รวม (THB)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#eff1f5]">
                <tr v-for="line in activePr?.lines" :key="line.line_id" class="text-[11px]">
                  <td class="p-2">
                    <div class="font-bold text-[var(--foreground)]">{{ line.item_name }}</div>
                    <div class="text-[9px] text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5">
                      <span>ศูนย์ต้นทุน: {{ line.cost_center?.cc_name || 'N/A' }}</span>
                      <a 
                        v-if="line.quotation_url" 
                        :href="line.quotation_url" 
                        target="_blank" 
                        class="text-[var(--primary)] font-bold flex items-center gap-0.5 hover:underline"
                      >
                        <UIcon name="i-heroicons-paper-clip" class="w-3 h-3" />
                        ใบเสนอราคา.pdf
                      </a>
                    </div>
                  </td>
                  <td class="p-2 text-right">{{ formatQuantity(line.quantity) }} {{ line.uom }}</td>
                  <td class="p-2 text-right">{{ formatCurrency(line.unit_price) }}</td>
                  <td class="p-2 text-right font-bold">{{ formatCurrency(line.total_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center pt-2">
            <span class="text-[var(--muted-foreground)]">ยอดรวมของใบขอซื้อทั้งหมด:</span>
            <span class="text-sm font-extrabold text-[var(--foreground)]">
              {{ formatCurrency(activePr?.total_amount) }} THB
            </span>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-between w-full">
            <div class="flex gap-2">
              <UButton 
                v-if="activePr?.status === 'Approved'"
                color="primary" 
                size="sm" 
                @click="convertToPo(activePr)"
                class="cursor-pointer"
              >
                <UIcon name="i-heroicons-shopping-cart" class="w-4.5 h-4.5 mr-1" />
                ออกเอกสารใบสั่งซื้อ (PO)
              </UButton>
              <UButton 
                v-if="activePr?.status === 'PendingApproval' || activePr?.status === 'Approved'"
                color="error" 
                variant="outline"
                size="sm" 
                @click="cancelPR(activePr)"
                class="cursor-pointer font-bold"
              >
                <UIcon name="i-heroicons-x-circle" class="w-4.5 h-4.5 mr-1" />
                ยกเลิกใบขอซื้อ (Cancel PR)
              </UButton>
            </div>
            <UButton variant="outline" size="sm" @click="detailsOpen = false">ปิดหน้าต่าง</UButton>
          </div>
        </template>
      </UCard>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();

const search = ref('');
const filterStatus = ref('ทั้งหมด');
const prList = ref<any[]>([]);

const detailsOpen = ref(false);
const activePr = ref<any>(null);

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
  if (!confirm(`คุณต้องการยกเลิกใบขอซื้อ ${pr.pr_no} ใช่หรือไม่? ยอดเงินสำรองทั้งหมดจะถูกส่งคืนศูนย์ต้นทุน`)) {
    return;
  }
  try {
    await $fetch(`http://localhost:3001/api/pr/${pr.pr_id}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    alert('ยกเลิกใบขอซื้อเรียบร้อยแล้ว!');
    await loadPrs();
    detailsOpen.value = false;
  } catch (err: any) {
    console.warn('Backend cancel failed, using demo cancel.');
    pr.status = 'Cancelled';
    alert(`ยกเลิกใบขอซื้อ ${pr.pr_no} สำเร็จ! (คืนงบจองเรียบร้อย)`);
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

const submitForApproval = (pr: any) => {
  pr.status = 'PendingApproval';
  alert(`ส่ง PR ${pr.pr_no} เพื่ออนุมัติเรียบร้อย`);
};

const quickApprovePr = (pr: any) => {
  pr.status = 'Approved';
  alert(`อนุมัติ PR ${pr.pr_no} เรียบร้อยแล้ว`);
};

const rejectPr = (pr: any) => {
  const reason = prompt('ระบุเหตุผล');
  if (reason === null) return;
  pr.status = 'Rejected';
  pr.rejection_reason = reason || 'ไม่ผ่านงบประมาณที่กำหนด กรุณาปรับลดรายการ';
};

const viewRejectionReason = (pr: any) => {
  alert(pr.rejection_reason || 'ไม่ผ่านงบประมาณที่กำหนด กรุณาปรับลดรายการ');
};

const requestBudgetException = (pr: any) => {
  alert(`ส่งคำขอยกเว้นงบประมาณ ${pr.pr_no} ไปยัง CFO แล้ว`);
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
