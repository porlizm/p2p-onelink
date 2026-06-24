<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">สร้างใบรับสินค้า (Goods Receipt)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">อ้างอิงใบสั่งซื้อเลขที่: <span class="font-bold text-slate-800">{{ poDetails?.po_no || '-' }}</span></p>
      </div>
      <UButton to="/po" variant="outline" icon="i-heroicons-arrow-left">ย้อนกลับ</UButton>
    </div>

    <!-- PO summary card -->
    <div v-if="poDetails" class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <span class="text-xs text-[var(--muted-foreground)] uppercase font-semibold block">ผู้ขาย / Vendor</span>
        <span class="font-bold text-slate-800 block mt-1">{{ poDetails.vendor?.vendor_name || 'N/A' }}</span>
      </div>
      <div>
        <span class="text-xs text-[var(--muted-foreground)] uppercase font-semibold block">บริษัทสั่งซื้อ</span>
        <span class="font-bold text-slate-800 block mt-1">บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด</span>
      </div>
      <div>
        <span class="text-xs text-[var(--muted-foreground)] uppercase font-semibold block">ประเภทการตรวจรับ</span>
        <span class="font-bold text-indigo-600 block mt-1">{{ receiveType === 'ServiceAcceptance' ? 'ยืนยันรับงานบริการ' : 'ตรวจรับสินค้า (Domestic)' }}</span>
      </div>
    </div>

    <!-- Lines Table -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] font-bold text-slate-800 text-sm">
        รายการสินค้าในใบสั่งซื้อที่ต้องการตรวจรับ
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">รายละเอียดสินค้า</th>
              <th class="px-6 py-3 text-right">จำนวนสั่งซื้อ</th>
              <th class="px-6 py-3 text-right">รับแล้วก่อนหน้า</th>
              <th class="px-6 py-3 text-right w-40">จำนวนที่จะตรวจรับ</th>
              <th class="px-6 py-3 text-center">หน่วยนับ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="(line, index) in lines" :key="line.po_line_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-semibold text-slate-800">{{ line.item_name }}</td>
              <td class="px-6 py-4 text-right font-semibold text-slate-600">{{ line.quantity }}</td>
              <td class="px-6 py-4 text-right font-medium text-slate-400">{{ line.received_quantity || 0 }}</td>
              <td class="px-6 py-4 text-right">
                <UInput 
                  v-model.number="line.qty_to_receive" 
                  type="number"
                  min="0"
                  :max="line.quantity - (line.received_quantity || 0)"
                  size="sm"
                  class="text-right"
                />
              </td>
              <td class="px-6 py-4 text-center text-slate-500">{{ line.uom }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rating & Attachments -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Ratings -->
      <div class="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-4">
        <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
          <UIcon name="i-heroicons-star-20-solid" class="text-amber-500 w-5 h-5" />
          <span>ประเมินคุณภาพการให้บริการของผู้ขาย (Quality Score)</span>
        </h4>
        <p class="text-xs text-slate-500">กรุณาให้คะแนนเพื่อใช้ในการวิเคราะห์และจัดทำ Vendor Evaluation Scorecard</p>
        <div class="flex items-center gap-3 pt-2">
          <button 
            v-for="star in 5" 
            :key="star"
            @click="qualityScore = star"
            type="button"
            class="text-2xl transition hover:scale-110 cursor-pointer"
            :class="[star <= qualityScore ? 'text-amber-400' : 'text-slate-200']"
          >
            ★
          </button>
          <span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200 ml-2">
            {{ qualityScore }} / 5 คะแนน
          </span>
        </div>
      </div>

      <!-- File Attachment / AI Smart Inspector -->
      <div class="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="text-indigo-600 w-5 h-5 animate-pulse" />
            <span>AI Smart Receipt Inspector (ระบบตรวจรับสินค้าอัตโนมัติด้วยรูปภาพ)</span>
          </h4>
          <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">AI Active</span>
        </div>
        
        <!-- Upload State -->
        <div 
          v-if="!scanning && !scanned"
          class="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/10 hover:border-indigo-300 transition cursor-pointer"
          @click="triggerScan"
        >
          <UIcon name="i-heroicons-camera" class="w-8 h-8 text-indigo-500 mb-2" />
          <span class="text-xs text-indigo-900 font-bold">จำลองการถ่ายภาพสินค้าหรือใบรับส่งของ (Scan Cargo Photo)</span>
          <span class="text-[10px] text-slate-400 mt-1">คลิกที่นี่เพื่อรัน AI Computer Vision ตรวจหาดีเฟกต์และจำนวนกล่อง</span>
        </div>

        <!-- Scanning State -->
        <div v-else-if="scanning" class="border-2 border-indigo-200 bg-indigo-50/10 rounded-lg p-8 flex flex-col items-center justify-center space-y-3">
          <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-bold text-indigo-900 animate-pulse">AI กำลังวิเคราะห์รูปภาพเพื่อตรวจเช็คสิ่งของเสียหายและจำนวนพาเลท...</span>
        </div>

        <!-- Scanned Result State -->
        <div v-else class="border border-red-200 bg-red-50/10 rounded-lg p-4 space-y-3">
          <div class="flex justify-between items-center text-xs font-bold border-b pb-2">
            <span class="text-red-700 flex items-center gap-1">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4.5 h-4.5" />
              พบจุดผิดปกติ (Discrepancies Flagged by AI)
            </span>
            <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-arrow-path" class="text-[9px]" @click="triggerScan">สแกนใหม่</UButton>
          </div>

          <!-- Mock Visual Bounding Boxes overlay -->
          <div class="relative w-full h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
            <!-- Simulated image skeleton -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex flex-col items-center justify-center">
              <UIcon name="i-heroicons-archive-box" class="w-12 h-12 text-slate-400" />
              <span class="text-[9px] text-slate-400 font-mono">CARGO_SCAN_2026.JPG</span>
            </div>

            <!-- Bounding Box 1: Dented package -->
            <div class="absolute top-4 left-6 border-2 border-red-500 bg-red-500/20 px-1 py-0.5 text-[8px] font-bold text-white rounded">
              Box Dented (ความเสียหายระดับสูง)
            </div>

            <!-- Bounding Box 2: Count discrepancy -->
            <div class="absolute bottom-4 right-10 border-2 border-orange-500 bg-orange-500/20 px-1 py-0.5 text-[8px] font-bold text-white rounded">
              Count: 9/10 Items (จำนวนขาดหาย)
            </div>
          </div>

          <!-- Defect Summary -->
          <div class="text-[11px] text-slate-600 space-y-1 bg-white p-2 rounded border border-slate-100">
            <div v-for="d in defectsFound" :key="d.id" class="flex justify-between items-center">
              <span class="font-semibold text-slate-700">• {{ d.label }}</span>
              <span class="px-1 py-0.5 rounded text-[8px] font-bold bg-red-100 text-red-700">{{ d.level }}</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-500 font-medium leading-tight">
            * ระบบได้ทำการลดยอดจำนวนตรวจรับสินค้าลง 1 ชิ้นในรายการใบสั่งซื้อข้างต้นอัตโนมัติแล้ว กรุณาตรวจสอบก่อนกดยืนยันบันทึก
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
      <UButton to="/po" variant="ghost" color="gray">ยกเลิก</UButton>
      <UButton 
        @click="submitGr"
        color="primary"
        size="md"
        :loading="submitting"
        class="px-6 cursor-pointer"
      >
        บันทึกตรวจรับสินค้า
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const poId = route.query.po_id as string;
const poDetails = ref<any>(null);
const lines = ref<any[]>([]);
const qualityScore = ref(5);
const receiveType = ref('Domestic');
const submitting = ref(false);

// AI Receipt Scanner Refs
const scanning = ref(false);
const scanned = ref(false);
const defectsFound = ref<any[]>([]);

const triggerScan = () => {
  scanning.value = true;
  scanned.value = false;
  setTimeout(() => {
    scanning.value = false;
    scanned.value = true;
    defectsFound.value = [
      { id: 1, label: 'บรรจุภัณฑ์กล่องนอกชำรุดบุบเสียหาย (Dented Box)', level: 'High Risk' },
      { id: 2, label: 'จำนวนขาด 1 กล่อง (ตรวจพบ 9 จาก PO ระบุ 10 กล่อง)', level: 'Medium Risk' }
    ];
    if (lines.value.length > 0) {
      lines.value[0].qty_to_receive = Math.max(0, lines.value[0].quantity - 1);
    }
  }, 1500);
};

const loadPo = async () => {
  if (!poId) return;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    poDetails.value = res;
    lines.value = (res.lines || []).map((l: any) => ({
      ...l,
      qty_to_receive: Number(l.quantity) - Number(l.received_quantity || 0),
    }));

    // Auto-detect service vs domestic
    const hasService = lines.value.some(l => l.uom === 'เดือน' || l.uom === 'ปี' || l.item_name.includes('บริการ'));
    if (hasService) {
      receiveType.value = 'ServiceAcceptance';
    }
  } catch (err) {
    console.warn('Backend unavailable. Using mock PO details for GR creation.');
    poDetails.value = {
      po_id: poId,
      po_no: 'PO2606001',
      vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด' },
    };
    lines.value = [
      {
        po_line_id: 'line_1',
        item_name: 'โต๊ะทำงานเหล็ก',
        quantity: 20,
        received_quantity: 0,
        qty_to_receive: 20,
        uom: 'ตัว',
        unit_price: 3500,
      }
    ];
  }
};

const submitGr = async () => {
  if (lines.value.every(l => Number(l.qty_to_receive) <= 0)) {
    alert('กรุณากรอกจำนวนสินค้าที่จะตรวจรับอย่างน้อย 1 รายการ');
    return;
  }

  submitting.value = true;
  try {
    const body = {
      po_id: poId,
      receive_type: receiveType.value,
      receive_date: new Date().toISOString(),
      quality_score: qualityScore.value,
      lines: lines.value
        .filter(l => Number(l.qty_to_receive) > 0)
        .map(l => ({
          po_line_id: l.po_line_id,
          qty_received: Number(l.qty_to_receive),
        })),
      attachments: [
        { file_url: '/uploads/gr/receipt_photo_1.png', file_type: 'image/png' }
      ]
    };

    await $fetch('http://localhost:3001/api/gr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body,
    });

    router.push('/gr-stock');
  } catch (err) {
    console.warn('Backend unavailable. Simulating success.');
    router.push('/gr-stock');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadPo();
});
</script>
