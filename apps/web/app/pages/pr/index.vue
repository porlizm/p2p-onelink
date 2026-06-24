<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ติดตามสถานะใบขอซื้อ (PR Tracking)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ประวัติรายการใบขอซื้อและสถานะอนุมัติของท่าน</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink to="/pr/create">
          <UButton color="primary" size="md">
            <UIcon name="i-heroicons-plus-20-solid" class="w-5 h-5 mr-1" />
            สร้างใบขอซื้อใหม่ (PR)
          </UButton>
        </NuxtLink>
        <NuxtLink to="/catalog">
          <UButton variant="outline" size="md">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 mr-1" />
            ค้นหาใน Catalog
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ใบขอซื้อทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ prList.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">เกินงบประมาณ (Blocked)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ prList.filter(p => p.status === 'BlockedOverBudget').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ PR หรือรายละเอียด..." 
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
          />
        </div>
        <div class="flex items-center gap-2">
          <USelect 
            v-model="filterStatus"
            :options="['ทั้งหมด', 'PendingApproval', 'BlockedOverBudget', 'Approved', 'Rejected', 'Draft']"
            size="md"
            class="w-40"
          />
        </div>
      </div>

      <!-- PR List Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่ใบขอซื้อ</th>
              <th class="px-6 py-3">วันที่ขอซื้อ</th>
              <th class="px-6 py-3">รายละเอียดการสั่งจัดหา</th>
              <th class="px-6 py-3 text-right">ยอดรวม (THB)</th>
              <th class="px-6 py-3 text-center">สถานะเอกสาร</th>
              <th class="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="pr in filteredPrs" :key="pr.pr_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ pr.pr_no }}</td>
              <td class="px-6 py-4 text-xs text-slate-500">{{ formatDate(pr.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-[var(--foreground)] line-clamp-1 max-w-sm">{{ pr.description || 'จัดซื้อทั่วไป' }}</div>
                <div class="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  {{ pr.lines?.length || 0 }} รายการขอซื้อ
                </div>
              </td>
              <td class="px-6 py-4 text-right font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(pr.total_amount) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                  :class="[
                    pr.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                    pr.status === 'PendingApproval' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    pr.status === 'BlockedOverBudget' ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
                    pr.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ formatStatus(pr.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <UButton 
                  @click="openDetails(pr)"
                  size="xs" 
                  variant="outline"
                  class="cursor-pointer"
                >
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5 mr-1" />
                  ดูรายละเอียด
                </UButton>
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
    <UModal v-model="detailsOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
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
          <div class="border border-[var(--border)] rounded-lg overflow-hidden mt-4">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-[var(--border)]">
                  <th class="p-2">รายการขอจัดซื้อ</th>
                  <th class="p-2 text-right">จำนวน</th>
                  <th class="p-2 text-right">ราคาหน่วย (THB)</th>
                  <th class="p-2 text-right">รวม (THB)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border)]">
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
                  <td class="p-2 text-right">{{ line.quantity }} {{ line.uom }}</td>
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
                color="red" 
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
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

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
        pr_id: '1',
        pr_no: 'PR2606001',
        created_at: new Date(Date.now() - 3600000 * 2), // 2 hrs ago
        description: 'จัดหาคอมพิวเตอร์พกพาสำหรับการดำเนินงานและขยายสาขา',
        total_amount: 28500,
        status: 'PendingApproval',
        lines: [
          {
            line_id: '101',
            item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว',
            quantity: 1,
            uom: 'เครื่อง',
            unit_price: 28500,
            total_price: 28500,
            cost_center: { cc_name: 'งบจัดซื้อกลาง' },
          },
        ],
      },
      {
        pr_id: '2',
        pr_no: 'PR2606002',
        created_at: new Date(Date.now() - 86400000), // 1 day ago
        description: 'จัดซื้ออุปกรณ์สำนักงานและเก้าอี้เพื่อสุขภาพประจำแผนก B2C',
        total_amount: 85500,
        status: 'Approved',
        lines: [
          {
            line_id: '201',
            item_name: 'เก้าอี้สำนักงานเบาะหนัง',
            quantity: 10,
            uom: 'ตัว',
            unit_price: 4800,
            total_price: 48000,
            cost_center: { cc_name: 'งบขาย B2C' },
          },
          {
            line_id: '202',
            item_name: 'โต๊ะทำงานเหล็ก',
            quantity: 10,
            uom: 'ตัว',
            unit_price: 3750,
            total_price: 37500,
            cost_center: { cc_name: 'งบขาย B2C' },
          },
        ],
      },
      {
        pr_id: '3',
        pr_no: 'PR2606003',
        created_at: new Date(Date.now() - 3600000 * 24 * 3), // 3 days ago
        description: 'จัดหาเซิร์ฟเวอร์สำรองระบบศูนย์บริการสารสนเทศหลัก',
        total_amount: 1500000,
        status: 'BlockedOverBudget',
        lines: [
          {
            line_id: '301',
            item_name: 'อุปกรณ์ Core Server HP Enterprise',
            quantity: 1,
            uom: 'เครื่อง',
            unit_price: 1500000,
            total_price: 1500000,
            cost_center: { cc_name: 'งบไอที' },
            quotation_url: '/uploads/quotations/quote_mock_301.pdf',
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
    console.warn('Backend PO conversion failed, using mock conversion.');
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
    console.warn('Backend cancel failed, using mock cancel.');
    pr.status = 'Cancelled';
    alert(`[MOCK] ยกเลิกใบขอซื้อ ${pr.pr_no} สำเร็จ! (คืนงบจองเรียบร้อย)`);
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

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
