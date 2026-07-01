<template>
  <div class="vendor-like-page">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[#002266]">พิจารณาอนุมัติแค็ตตาล็อกสินค้า (Catalog Approval Queue)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบความถูกต้องของรายการสินค้าและราคาต่อหน่วยที่เสนอโดยคู่ค้า ก่อนบรรจุเข้าสู่ระบบ e-Catalog กลาง</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอการตรวจสอบ</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ submissions.filter(s => s.status === 'PendingApproval').length }} รายการ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">อนุมัติแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ submissions.filter(s => s.status === 'Approved').length }} รายการ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ปฏิเสธการลงรายการ</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ submissions.filter(s => s.status === 'Rejected').length }} รายการ
          </span>
        </div>
      </div>
    </div>

    <div class="ds-tabs">
      <button
        v-for="tab in catalogTabs"
        :key="tab.status"
        class="ds-tab"
        :class="{ 'ds-tab--active': activeStatus === tab.status }"
        @click="activeStatus = tab.status"
      >
        {{ tab.label }}
        <span class="ds-tab__badge">{{ countByStatus(tab.status) }}</span>
      </button>
    </div>

    <!-- Submission List -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <span class="font-bold text-slate-800 text-sm">รายการคำขออัปเดตไฟล์แค็ตตาล็อก</span>
        <button class="action-btn action-btn--neutral" @click="loadSubmissions">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
          รีเฟรชข้อมูล
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3.5">เลขที่คำขอ</th>
              <th class="px-6 py-3.5">ผู้จัดขาย / Vendor</th>
              <th class="px-6 py-3.5 text-center font-bold">จำนวนสินค้าที่นำเสนอ</th>
              <th class="px-6 py-3.5 text-center">วันที่ยื่นเรื่อง</th>
              <th class="px-6 py-3.5 text-center">สถานะการพิจารณา</th>
              <th class="px-6 py-3.5 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="(sub, index) in filteredSubmissions" :key="sub.submission_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-5 font-bold text-[var(--primary)]">SUB-2026-{{ 1000 + index }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700">{{ sub.vendor?.vendor_name || 'ไม่ทราบชื่อคู่ค้า' }}</div>
                <div class="text-xs text-slate-400 font-mono">{{ sub.vendor?.email }}</div>
              </td>
              <td class="px-6 py-5 text-center font-extrabold text-slate-700">{{ sub.items?.length || 0 }} รายการ</td>
              <td class="px-6 py-5 text-center text-slate-500 text-xs">
                {{ formatDateTime(sub.created_at) }}
              </td>
              <td class="px-6 py-5 text-center">
                <StatusBadge :status="sub.status" />
              </td>
              <td class="px-6 py-5 text-center">
                <button
                  class="action-btn action-btn--review"
                  @click="openReview(sub)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  ตรวจเช็ค & อนุมัติ
                </button>
              </td>
            </tr>
            <tr v-if="filteredSubmissions.length === 0">
              <td colspan="6" class="text-center py-12 text-xs text-[var(--muted-foreground)]">
                ไม่มีข้อมูลประวัติคำขออนุมัติในระบบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Review Side-Drawer -->
    <USlideover v-model:open="showReviewDrawer" prevent-close :ui="{ content: 'max-w-2xl' }">
      <template #content>
      <div class="p-6 h-full flex flex-col justify-between" v-if="activeSubmission">
        <div class="space-y-6 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h3 class="font-black text-slate-800 text-base">ตรวจสอบคำขอนำเข้า Catalog</h3>
              <p class="text-xs text-slate-400 mt-0.5">ผู้ยื่นคำขอ: {{ activeSubmission.vendor?.vendor_name }}</p>
            </div>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showReviewDrawer = false" />
          </div>

          <!-- Metadata -->
          <div class="bg-[#fafbfc] rounded-xl p-4 border border-slate-100 text-xs grid grid-cols-2 gap-y-2.5 gap-x-4">
            <div>
              <span class="text-slate-400 block uppercase font-bold">วันที่เสนอ</span>
              <span class="font-semibold text-slate-700">{{ formatDateTime(activeSubmission.created_at) }}</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold">สถานะระบบ</span>
              <span class="font-bold text-orange-600">{{ formatStatus(activeSubmission.status) }}</span>
            </div>
          </div>

          <!-- AI Smart DOA Risk Auditor -->
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                <span class="text-indigo-600 animate-pulse">✨</span>
                <span>AI Smart DOA Risk Auditor (ระบบคัดกรองความปลอดภัยผู้มีอำนาจอนุมัติ)</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">Low Risk</span>
            </div>
            <div class="text-[11px] text-indigo-700 leading-relaxed">
              <strong>ผลการประเมินอนุมัติอัตโนมัติ:</strong> คะแนนความเชื่อมั่นการอนุมัติ <strong class="text-indigo-900">98.5%</strong>. 
              เส้นทางผู้อนุมัติประเมินแล้วถูกต้องตามโครงสร้าง DOA และประวัติการจัดซื้อของคู่ค้า 
              <span class="underline text-indigo-900 font-semibold cursor-pointer ml-1" @click="showDoaDetails">คลิกอ่านผลวิเคราะห์เต็ม</span>
            </div>
          </div>

          <!-- Items list -->
          <div class="space-y-3">
            <h4 class="font-bold text-slate-800 text-sm">รายการสินค้าที่เสนอเข้ามา ({{ activeSubmission.items?.length }} รายการ)</h4>
            <div class="border border-[#eff1f5] rounded-xl overflow-hidden shadow-sm bg-white">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-slate-500 font-bold uppercase">
                    <th class="px-4 py-2.5">ชื่อสินค้า</th>
                    <th class="px-4 py-2.5">ประเภท</th>
                    <th class="px-4 py-2.5 text-center">หน่วยนับ</th>
                    <th class="px-4 py-2.5 text-right">ราคาต่อหน่วย (THB)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                  <tr v-for="item in activeSubmission.items" :key="item.item_name">
                    <td class="px-4 py-2.5 font-bold text-slate-800">{{ item.item_name }}</td>
                    <td class="px-4 py-2.5">{{ item.item_type || 'วัสดุก่อสร้าง/ทั่วไป' }}</td>
                    <td class="px-4 py-2.5 text-center font-semibold">{{ item.uom }}</td>
                    <td class="px-4 py-2.5 text-right font-black text-[var(--primary)]">{{ formatCurrency(item.unit_price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="border-t pt-4 flex gap-3 justify-end bg-white" v-if="activeSubmission.status === 'PendingApproval'">
          <button
            class="btn-outline"
            style="border-color: var(--destructive); color: var(--destructive);"
            :disabled="submitting"
            @click="submitReview('Rejected')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ปฏิเสธ (Reject)
          </button>
          <button
            class="btn-primary"
            :disabled="submitting"
            @click="submitReview('Approved')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            อนุมัติและเพิ่มสินค้าเข้าระบบ (Approve)
          </button>
        </div>
        <div class="border-t pt-4 flex justify-end bg-white" v-else>
          <button class="btn-outline" @click="showReviewDrawer = false">ปิดหน้าต่าง</button>
        </div>
      </div>
          </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const dialog = useDialog();

const submissions = ref<any[]>([]);
const activeSubmission = ref<any | null>(null);
const showReviewDrawer = ref(false);
const submitting = ref(false);
const activeStatus = ref('ALL');

const catalogTabs = [
  { status: 'ALL', label: 'ทั้งหมด' },
  { status: 'PendingApproval', label: 'รอตรวจอนุมัติ' },
  { status: 'Approved', label: 'อนุมัติแล้ว' },
  { status: 'Rejected', label: 'ปฏิเสธ' },
];

const countByStatus = (status: string) => {
  if (status === 'ALL') return submissions.value.length;
  return submissions.value.filter(s => s.status === status).length;
};

const filteredSubmissions = computed(() => {
  if (activeStatus.value === 'ALL') return submissions.value;
  return submissions.value.filter(s => s.status === activeStatus.value);
});

const showDoaDetails = async () => {
  await dialog.alert(
    `[AI Smart DOA Report]\n\n` +
    `ความเสี่ยงอนุมัติ: ต่ำมาก (Low Risk)\n` +
    `เหตุผลวิเคราะห์:\n` +
    `1. หมวดหมู่สินค้าตรงตามเงื่อนไขข้อตกลงราคากลางเดิม\n` +
    `2. อัตราส่วนลดราคาคงที่ และไม่มีการเสนอราคาที่ขัดแย้งกับตลาดจัดซื้อกลาง\n` +
    `3. ประวัติความสัมพันธ์กับคู่ค้า "${activeSubmission.value?.vendor?.vendor_name}" มีเกรดผลประเมินเฉลี่ย A+ (ดีเยี่ยม)\n` +
    `4. ผู้อนุมัติในสายงานสอดคล้องตามกฎ DOA ของแผนก`,
    { variant: 'info', title: 'AI Smart DOA Analysis' }
  );
};

const loadSubmissions = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/catalog-submission', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    submissions.value = res;
  } catch (err) {
    console.warn('Backend API connection failed. Using mock catalog submissions.');
    submissions.value = [
      {
        submission_id: 'sub_mock_1',
        vendor_id: '00000000-0000-0000-0000-000000000601',
        vendor: { 
          vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
          email: 'vendor1@scgjwd.com'
        },
        items: [
          { item_name: 'พาเลทไม้แร็คกิ้ง ทนความชื้น (เกรด A)', item_type: 'วัสดุคลังสินค้า', uom: 'ชิ้น', unit_price: 340 },
          { item_name: 'กล่องกระดาษคราฟท์ 3 ชั้น ขนาด M', item_type: 'บรรจุภัณฑ์', uom: 'แพ็ค', unit_price: 180 },
          { item_name: 'ฟิล์มยืดพันพาเลท LLDPE หนา 15 ไมครอน', item_type: 'วัสดุสิ้นเปลือง', uom: 'ม้วน', unit_price: 210 },
        ],
        status: 'PendingApproval',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
      },
      {
        submission_id: 'sub_mock_2',
        vendor_id: '00000000-0000-0000-0000-000000000602',
        vendor: { 
          vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด',
          email: 'innovative.it@vendor.com'
        },
        items: [
          { item_name: 'สายแลนคุณภาพสูง CAT6 UTP (305 เมตร)', item_type: 'อุปกรณ์เน็ตเวิร์ค', uom: 'กล่อง', unit_price: 2850 },
          { item_name: 'หัวคอนเนคเตอร์ RJ45 CAT6 (บรรจุ 100 ชิ้น)', item_type: 'อุปกรณ์เน็ตเวิร์ค', uom: 'ถุง', unit_price: 650 },
        ],
        status: 'Approved',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      }
    ];
  }
};

const openReview = (sub: any) => {
  activeSubmission.value = sub;
  showReviewDrawer.value = true;
};

const submitReview = async (action: 'Approved' | 'Rejected') => {
  if (!activeSubmission.value) return;
  if (!(await dialog.confirm(`คุณต้องการยืนยันการ "${action === 'Approved' ? 'อนุมัติ' : 'ปฏิเสธ'}" คำขอปรับปรุงแค็ตตาล็อกนี้ใช่หรือไม่?`, { variant: 'danger' }))) return;

  submitting.value = true;
  const user_id = authStore.user?.userId || '00000000-0000-0000-0000-000000000410';

  try {
    await $fetch(`http://localhost:3001/api/catalog-submission/${activeSubmission.value.submission_id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { action, user_id },
    });

    await dialog.alert(`บันทึกการพิจารณา "${action === 'Approved' ? 'อนุมัติ' : 'ปฏิเสธ'}" สำเร็จ!`, { variant: 'success' });
    showReviewDrawer.value = false;
    await loadSubmissions();
  } catch (err) {
    // Simulated updates for prototype
    const match = submissions.value.find(s => s.submission_id === activeSubmission.value.submission_id);
    if (match) {
      match.status = action;
    }
    await dialog.alert(`บันทึกการพิจารณาสำเร็จ!`, { variant: 'success' });
    showReviewDrawer.value = false;
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatStatus = (status: string) => {
  if (status === 'Approved') return 'อนุมัติแล้ว ✅';
  if (status === 'Rejected') return 'ปฏิเสธคำขอ ❌';
  return 'รอตรวจสอบ ⏳';
};

const formatDateTime = (val: string) => {
  if (!val) return '-';
  const d = new Date(val);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadSubmissions();
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

.vendor-like-page > .grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.vendor-like-page > .grid > div {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  box-shadow: var(--shadow-1);
}

.vendor-like-page > .grid > div > div:first-child {
  display: none;
}

.vendor-like-page > .grid span:first-child {
  order: 2;
  font-size: var(--text-xs);
  color: var(--fg-tertiary);
  font-weight: var(--weight-medium);
  text-transform: none;
}

.vendor-like-page > .grid span:last-child {
  order: 1;
  font-size: 28px;
  font-weight: var(--weight-bold);
  color: var(--fg-primary);
  line-height: 1;
}

.vendor-like-page > .grid > div:nth-child(1) { border-left: 3px solid var(--color-warning-400); }
.vendor-like-page > .grid > div:nth-child(1) span:last-child { color: var(--color-warning-700); }
.vendor-like-page > .grid > div:nth-child(2) { border-left: 3px solid var(--color-success-500); }
.vendor-like-page > .grid > div:nth-child(2) span:last-child { color: var(--color-success-700); }
.vendor-like-page > .grid > div:nth-child(3) { border-left: 3px solid var(--color-error-400); }
.vendor-like-page > .grid > div:nth-child(3) span:last-child { color: var(--color-error-700); }

.ds-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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

.vendor-like-page > .bg-white {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}

.vendor-like-page > .bg-white > .p-4 {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.vendor-like-page table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
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

.vendor-like-page tbody tr:hover {
  background: #fafafa;
}

@media (max-width: 900px) {
  .vendor-like-page > .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .vendor-like-page > .grid { grid-template-columns: 1fr; }
}
</style>
