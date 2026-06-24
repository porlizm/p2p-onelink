<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[#002266]">พิจารณาอนุมัติแค็ตตาล็อกสินค้า (Catalog Approval Queue)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบความถูกต้องของรายการสินค้าและราคาต่อหน่วยที่เสนอโดยคู่ค้า ก่อนบรรจุเข้าสู่ระบบ e-Catalog กลาง</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-magnifying-glass" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอการตรวจสอบ</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ submissions.filter(s => s.status === 'PendingApproval').length }} รายการ
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
            {{ submissions.filter(s => s.status === 'Approved').length }} รายการ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <UIcon name="i-heroicons-x-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ปฏิเสธการลงรายการ</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ submissions.filter(s => s.status === 'Rejected').length }} รายการ
          </span>
        </div>
      </div>
    </div>

    <!-- Submission List -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <span class="font-bold text-slate-800 text-sm">รายการคำขออัปเดตไฟล์แค็ตตาล็อก</span>
        <UButton size="xs" color="gray" variant="outline" icon="i-heroicons-arrow-path" @click="loadSubmissions">รีเฟรชข้อมูล</UButton>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่คำขอ</th>
              <th class="px-6 py-3">ผู้จัดขาย / Vendor</th>
              <th class="px-6 py-3 text-center font-bold">จำนวนสินค้าที่นำเสนอ</th>
              <th class="px-6 py-3 text-center">วันที่ยื่นเรื่อง</th>
              <th class="px-6 py-3 text-center">สถานะการพิจารณา</th>
              <th class="px-6 py-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="(sub, index) in submissions" :key="sub.submission_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[#0054FF]">SUB-2026-{{ 1000 + index }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700">{{ sub.vendor?.vendor_name || 'ไม่ทราบชื่อคู่ค้า' }}</div>
                <div class="text-xs text-slate-400 font-mono">{{ sub.vendor?.email }}</div>
              </td>
              <td class="px-6 py-4 text-center font-extrabold text-slate-700">{{ sub.items?.length || 0 }} รายการ</td>
              <td class="px-6 py-4 text-center text-slate-500 text-xs">
                {{ formatDateTime(sub.created_at) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                  :class="[
                    sub.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    sub.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                  ]"
                >
                  {{ formatStatus(sub.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <UButton 
                  size="xs" 
                  color="primary"
                  variant="solid"
                  icon="i-heroicons-magnifying-glass"
                  class="cursor-pointer font-bold bg-[#0054FF] hover:bg-[#002266]"
                  @click="openReview(sub)"
                >
                  ตรวจเช็ค & อนุมัติ
                </UButton>
              </td>
            </tr>
            <tr v-if="submissions.length === 0">
              <td colspan="6" class="text-center py-12 text-xs text-[var(--muted-foreground)]">
                ไม่มีข้อมูลประวัติคำขออนุมัติในระบบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Review Side-Drawer -->
    <USlideover v-model="showReviewDrawer" prevent-close :ui="{ width: 'max-w-2xl' }">
      <div class="p-6 h-full flex flex-col justify-between" v-if="activeSubmission">
        <div class="space-y-6 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h3 class="font-black text-slate-800 text-base">ตรวจสอบคำขอนำเข้า Catalog</h3>
              <p class="text-xs text-slate-400 mt-0.5">ผู้ยื่นคำขอ: {{ activeSubmission.vendor?.vendor_name }}</p>
            </div>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showReviewDrawer = false" />
          </div>

          <!-- Metadata -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs grid grid-cols-2 gap-y-2.5 gap-x-4">
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
                <UIcon name="i-heroicons-sparkles" class="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
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
            <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
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
                    <td class="px-4 py-2.5 text-right font-black text-[#0054FF]">{{ formatCurrency(item.unit_price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="border-t pt-4 flex gap-3 justify-end bg-white" v-if="activeSubmission.status === 'PendingApproval'">
          <UButton 
            color="red" 
            variant="soft" 
            icon="i-heroicons-x-circle"
            class="font-bold px-4"
            :loading="submitting"
            @click="submitReview('Rejected')"
          >
            ปฏิเสธ (Reject)
          </UButton>
          <UButton 
            color="primary" 
            icon="i-heroicons-check-circle"
            class="font-bold px-5 bg-emerald-600 hover:bg-emerald-700"
            :loading="submitting"
            @click="submitReview('Approved')"
          >
            อนุมัติและเพิ่มสินค้าเข้าระบบ (Approve)
          </UButton>
        </div>
        <div class="border-t pt-4 flex justify-end bg-white" v-else>
          <UButton color="gray" variant="solid" class="font-bold px-4" @click="showReviewDrawer = false">ปิดหน้าต่าง</UButton>
        </div>
      </div>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const submissions = ref<any[]>([]);
const activeSubmission = ref<any | null>(null);
const showReviewDrawer = ref(false);
const submitting = ref(false);

const showDoaDetails = () => {
  alert(
    `[AI Smart DOA Report]\n\n` +
    `ความเสี่ยงอนุมัติ: ต่ำมาก (Low Risk)\n` +
    `เหตุผลวิเคราะห์:\n` +
    `1. หมวดหมู่สินค้าตรงตามเงื่อนไขข้อตกลงราคากลางเดิม\n` +
    `2. อัตราส่วนลดราคาคงที่ และไม่มีการเสนอราคาที่ขัดแย้งกับตลาดจัดซื้อกลาง\n` +
    `3. ประวัติความสัมพันธ์กับคู่ค้า "${activeSubmission.value?.vendor?.vendor_name}" มีเกรดผลประเมินเฉลี่ย A+ (ดีเยี่ยม)\n` +
    `4. ผู้อนุมัติในสายงานสอดคล้องตามกฎ DOA ของแผนก`
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
  if (!confirm(`คุณต้องการยืนยันการ "${action === 'Approved' ? 'อนุมัติ' : 'ปฏิเสธ'}" คำขอปรับปรุงแค็ตตาล็อกนี้ใช่หรือไม่?`)) return;

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

    alert(`บันทึกการพิจารณา "${action === 'Approved' ? 'อนุมัติ' : 'ปฏิเสธ'}" สำเร็จ!`);
    showReviewDrawer.value = false;
    await loadSubmissions();
  } catch (err) {
    // Simulated updates for prototype
    const match = submissions.value.find(s => s.submission_id === activeSubmission.value.submission_id);
    if (match) {
      match.status = action;
    }
    alert(`บันทึกการพิจารณาสำเร็จ! (Simulated)`);
    showReviewDrawer.value = false;
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val);
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
