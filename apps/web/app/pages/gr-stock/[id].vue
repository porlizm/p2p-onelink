<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="border-b border-[#eff1f5] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รายละเอียดใบรับสินค้า (Goods Receipt)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">เลขที่เอกสาร: <span class="font-bold text-slate-800">{{ grDetails?.gr_no || '-' }}</span></p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/gr-stock"><button class="btn-outline">← กลับหน้ารายการ</button></NuxtLink>
        <button
          v-if="grDetails?.status !== 'ClaimRaised'"
          class="btn-outline"
          style="border-color: var(--destructive); color: var(--destructive);"
          @click="showClaimModal = true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
          แจ้งเคลมสินค้าชำรุด
        </button>
      </div>
    </div>

    <!-- GR Info Cards -->
    <div v-if="grDetails" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- General Info -->
      <div class="bg-white border border-[#e9ecef] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-3">
        <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
          <span class="text-[var(--primary)]">ℹ</span>
          <span>ข้อมูลทั่วไป</span>
        </h4>
        <div class="text-xs space-y-2.5">
          <div class="flex justify-between">
            <span class="text-slate-400">สถานะเอกสาร:</span>
            <span class="font-bold text-blue-600">{{ formatGrStatus(grDetails.status) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">วันที่รับสินค้า:</span>
            <span class="font-bold text-slate-700">{{ formatDate(grDetails.receive_date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">ตรวจรับโดย:</span>
            <span class="font-bold text-slate-700">{{ grDetails.receiver?.username || 'kittichai.w' }}</span>
          </div>
        </div>
      </div>

      <!-- PO & Vendor Info -->
      <div class="bg-white border border-[#e9ecef] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-3">
        <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
          <span class="text-[var(--primary)]">🛍</span>
          <span>อ้างอิงใบสั่งซื้อ (PO)</span>
        </h4>
        <div class="text-xs space-y-2.5">
          <div class="flex justify-between">
            <span class="text-slate-400">เลขที่ PO:</span>
            <span class="font-bold text-[var(--primary)]">{{ grDetails.po?.po_no || 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">ชื่อผู้ขาย:</span>
            <span class="font-bold text-slate-700 truncate max-w-[150px]" :title="grDetails.po?.vendor?.vendor_name">{{ grDetails.po?.vendor?.vendor_name || 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Tax ID ผู้ขาย:</span>
            <span class="font-bold text-slate-700">{{ grDetails.po?.vendor?.tax_id || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Scoring & Attachments -->
      <div class="bg-white border border-[#e9ecef] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-3">
        <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
          <span class="text-[var(--primary)]">★</span>
          <span>การประเมินและการแนบไฟล์</span>
        </h4>
        <div class="text-xs space-y-2.5">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">คะแนนบริการ:</span>
            <span class="font-bold text-amber-500 flex items-center gap-0.5">
              ★ {{ Number(grDetails.quality_score) > 5 ? (Number(grDetails.quality_score) / 2).toFixed(2) : Number(grDetails.quality_score).toFixed(2) }} / 5.0
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">ภาพหลักฐาน:</span>
            <span class="font-bold text-slate-700">{{ grDetails.attachments?.length || 0 }} รูปภาพ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Items List Table -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-800 text-sm">
        รายการจัดส่งสินค้าตรวจรับ
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3.5">รหัสสินค้า</th>
              <th class="px-6 py-3.5">รายการสินค้า</th>
              <th class="px-6 py-3.5 text-right">จำนวนสั่งซื้อ (Ordered)</th>
              <th class="px-6 py-3.5 text-right">จำนวนที่รับจริง (Received)</th>
              <th class="px-6 py-3.5 text-right">ผลต่าง (Variance)</th>
              <th class="px-6 py-3.5 class-center">หน่วยนับ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5]">
            <tr v-for="line in grDetails?.lines" :key="line.gr_line_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-5font-mono font-bold text-slate-500 text-xs">{{ line.item?.central_item_code || 'N/A' }}</td>
              <td class="px-6 py-5font-semibold text-slate-800">{{ line.item?.item_name || 'N/A' }}</td>
              <td class="px-6 py-5text-right font-semibold text-slate-600">{{ formatQuantity(line.qty_ordered) }}</td>
              <td class="px-6 py-5text-right font-extrabold text-blue-600">{{ formatQuantity(line.qty_received) }}</td>
              <td class="px-6 py-5text-right font-extrabold" :class="[line.variance_qty < 0 ? 'text-red-500' : 'text-slate-400']">
                {{ line.variance_qty > 0 ? '+' : '' }}{{ formatQuantity(line.variance_qty) }}
              </td>
              <td class="px-6 py-5text-center text-slate-500">{{ line.item?.uom || 'ชิ้น' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Evidence photo view -->
    <div v-if="grDetails?.attachments && grDetails.attachments.length > 0" class="bg-white border border-[#e9ecef] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-3">
      <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
        <span class="text-blue-500">🖼</span>
        <span>รูปภาพหลักฐานการตรวจรับ</span>
      </h4>
      <div class="flex flex-wrap gap-4 pt-2">
        <div v-for="att in grDetails.attachments" :key="att.attachment_id" class="relative group border border-[#eff1f5] rounded-lg overflow-hidden w-40 h-28 bg-[#fafbfc] flex items-center justify-center">
          <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
          <div class="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-[10px] text-white font-semibold">ดูไฟล์หลักฐาน</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Claim Registration Modal -->
    <UModal v-model:open="showClaimModal">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3 border-b pb-3">
          <div class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">
            ⚠
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">แจ้งรายละเอียดการเคลมสินค้าชำรุด</h3>
            <p class="text-xs text-slate-500">กรอกข้อมูลปัญหาสินค้าชำรุดเพื่อร้องเรียนผู้ขายและส่งคืน</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">ประเภทการเคลม</label>
            <USelect 
              v-model="claimType"
              :options="['Claim', 'Complaint', 'CorrectiveAction']"
              size="sm"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">รายละเอียดปัญหา / เหตุผลที่แจ้งเคลม</label>
            <UTextarea 
              v-model="claimDescription"
              placeholder="กรุณากรอกข้อมูลปัญหา เช่น พบการชำรุดของเก้าอี้ขณะขนส่ง แขนเบาะฉีกขาด..."
              :rows="3"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">จำนวนที่ส่งเคลม/คืน</label>
              <UInput 
                v-model.number="claimReturnQty"
                type="number"
                min="1"
                placeholder="ระบุจำนวน"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">สถานะเคลมเบื้องต้น</label>
              <UInput value="Open" disabled />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4 mt-2">
          <button class="btn-outline" @click="showClaimModal = false">ยกเลิก</button>
          <button
            class="btn-outline"
            style="border-color: var(--destructive); color: var(--destructive); background: var(--destructive); color: white;"
            :disabled="submittingClaim"
            @click="submitClaim"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
            ยืนยันแจ้งเคลม
          </button>
        </div>
      </div>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const dialog = useDialog();

const grId = route.params.id as string;
const grDetails = ref<any>(null);

const showClaimModal = ref(false);
const claimType = ref('Claim');
const claimDescription = ref('');
const claimReturnQty = ref(1);
const submittingClaim = ref(false);

const loadGrDetails = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/gr/${grId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    grDetails.value = res;
  } catch (err) {
    console.warn('Backend unavailable. Using mock GR details.');
    grDetails.value = {
      gr_id: grId,
      gr_no: grId === 'gr_mock_1' ? 'GR-2026-0001' : 'GR-2026-0002',
      receive_date: new Date(Date.now() - 3600000 * 24),
      quality_score: grId === 'gr_mock_1' ? 4.5 : 4.0,
      status: grId === 'gr_mock_1' ? 'FullReceipt' : 'PartialReceipt',
      po: { po_no: 'PO2606001', vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด', tax_id: '0105565056789' } },
      receiver: { username: 'kittichai.w' },
      lines: [
        {
          gr_line_id: 'line_1',
          qty_ordered: 20,
          qty_received: grId === 'gr_mock_1' ? 20 : 15,
          variance_qty: grId === 'gr_mock_1' ? 0 : -5,
          item: { central_item_code: 'ITM-00008', item_name: 'โต๊ะทำงานเหล็ก', uom: 'ตัว' }
        }
      ],
      attachments: [
        { attachment_id: 'att_1', file_url: '/uploads/gr/receipt_photo_1.png', file_type: 'image/png' }
      ]
    };
  }
};

const submitClaim = async () => {
  if (!claimDescription.value.trim()) {
    await dialog.alert('กรุณากรอกเหตุผลหรือรายละเอียดการแจ้งเคลม', { variant: 'danger' });
    return;
  }

  submittingClaim.value = true;
  try {
    await $fetch(`http://localhost:3001/api/gr/${grId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        claim_type: claimType.value,
        description: claimDescription.value,
        return_qty: claimReturnQty.value,
        return_reason: claimDescription.value,
      },
    });

    showClaimModal.value = false;
    await loadGrDetails();
  } catch (err) {
    console.warn('Backend unavailable. Simulating claim submission.');
    grDetails.value.status = 'ClaimRaised';
    showClaimModal.value = false;
  } finally {
    submittingClaim.value = false;
  }
};

const formatGrStatus = (status: string) => {
  switch (status) {
    case 'FullReceipt': return 'รับของครบถ้วน';
    case 'PartialReceipt': return 'รับบางส่วน';
    case 'ServiceAccepted': return 'ยืนยันรับงานบริการ';
    case 'ClaimRaised': return 'แจ้งเคลมสินค้าชำรุด';
    default: return status;
  }
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadGrDetails();
});
const formatQuantity = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0';
  const num = Number(val);
  return isNaN(num) ? '0' : Math.round(num).toString();
};
</script>
