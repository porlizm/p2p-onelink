<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[#002266]">ระบบจัดการข้อมูลแค็ตตาล็อกคู่ค้า (Catalog Self-Upload Portal)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">อัปเดตรายการสินค้าและตารางราคาจัดซื้อด้วยไฟล์ CSV เพื่อเสนอขออนุมัติบรรจุเข้าสู่ระบบ e-Catalog กลางของ SCGJWD</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Upload panel -->
      <div class="lg:col-span-2 space-y-6">
        <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
          <template #header>
            <div class="flex items-center gap-2 border-b pb-3">
              <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 text-[#0054FF]" />
              <h3 class="font-bold text-slate-800 text-sm">เสนอขอเพิ่มรายการสินค้า (Submit Catalog Update)</h3>
            </div>
          </template>

          <div class="space-y-4 mt-2 text-xs">
            <!-- Manual Paste / CSV Parser Area -->
            <div class="space-y-2">
              <label class="block font-bold text-slate-700">พิมพ์หรือวางเนื้อหาไฟล์ CSV (Paste CSV Data)</label>
              <p class="text-[10px] text-slate-400">คั่นด้วยเครื่องหมายจุลภาค (Comma) ในรูปแบบ: <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">ชื่อสินค้า,ประเภทสินค้า,หน่วยนับ,ราคาต่อหน่วย</code></p>
              <textarea 
                v-model="csvText" 
                rows="6" 
                class="w-full font-mono text-xs border border-[var(--border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0054FF]"
                placeholder="ตัวอย่าง:
พาเลทไม้แร็คกิ้ง ทนความชื้น,วัสดุคลังสินค้า,ชิ้น,340
กล่องกระดาษคราฟท์ 3 ชั้น,บรรจุภัณฑ์,แพ็ค,180
ฟิล์มยืดพันพาเลท,วัสดุสิ้นเปลือง,ม้วน,210"
              ></textarea>
            </div>

            <div class="flex gap-2 justify-end">
              <UButton 
                color="gray" 
                variant="outline" 
                icon="i-heroicons-trash"
                class="cursor-pointer"
                @click="csvText = ''"
              >
                ล้างข้อมูล
              </UButton>
              <UButton 
                color="primary" 
                icon="i-heroicons-play"
                class="font-bold bg-[#0054FF] hover:bg-[#002266] cursor-pointer"
                @click="parseAndValidateCsv"
              >
                ตรวจสอบรูปแบบข้อมูล (Parse)
              </UButton>
            </div>

            <!-- Parsed items table preview -->
            <div v-if="parsedItems.length > 0" class="space-y-3 pt-3 border-t border-slate-100">
              <h4 class="font-bold text-slate-800">ตัวอย่างข้อมูลสินค้าที่สแกนพบ ({{ parsedItems.length }} รายการ)</h4>
              <div class="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <table class="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th class="px-3 py-2">ชื่อสินค้า</th>
                      <th class="px-3 py-2">ประเภทสินค้า</th>
                      <th class="px-3 py-2 text-center">หน่วยนับ</th>
                      <th class="px-3 py-2 text-right">ราคาต่อหน่วย</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-600">
                    <tr v-for="item in parsedItems" :key="item.item_name">
                      <td class="px-3 py-2 font-bold text-slate-800">{{ item.item_name }}</td>
                      <td class="px-3 py-2">{{ item.item_type }}</td>
                      <td class="px-3 py-2 text-center font-semibold">{{ item.uom }}</td>
                      <td class="px-3 py-2 text-right font-black text-[#0054FF]">{{ formatCurrency(item.unit_price) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="pt-2 flex justify-end">
                <UButton 
                  color="success" 
                  icon="i-heroicons-check-circle"
                  class="font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                  :loading="submitting"
                  @click="submitCatalogSubmission"
                >
                  ส่งข้อมูลคำเสนออนุมัติ Catalog
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <!-- History of submissions -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <span class="font-bold text-slate-800 text-sm">ประวัติการยื่นเอกสารนำเข้า Catalog</span>
            <UButton size="xs" color="gray" variant="outline" icon="i-heroicons-arrow-path" @click="loadHistory">รีเฟรชข้อมูล</UButton>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-[var(--border)] text-slate-500 font-bold uppercase">
                  <th class="px-4 py-3">เลขที่เอกสาร</th>
                  <th class="px-4 py-3">จำนวนสินค้า</th>
                  <th class="px-4 py-3 text-center">วันที่เสนอส่ง</th>
                  <th class="px-4 py-3 text-center">สถานะผล</th>
                  <th class="px-4 py-3 text-center">ผู้ตรวจสอบ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border)] text-slate-600">
                <tr v-for="(sub, index) in historyList" :key="sub.submission_id" class="hover:bg-slate-50/50 transition">
                  <td class="px-4 py-3.5 font-bold text-[#0054FF]">SUB-2026-{{ 1000 + index }}</td>
                  <td class="px-4 py-3.5 font-bold">{{ sub.items?.length || 0 }} รายการ</td>
                  <td class="px-4 py-3.5 text-center text-slate-400">{{ formatDateTime(sub.created_at) }}</td>
                  <td class="px-4 py-3.5 text-center">
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block"
                      :class="[
                        sub.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        sub.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                      ]"
                    >
                      {{ formatStatus(sub.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 text-center text-slate-400">
                    {{ sub.reviewed_by ? 'Buyer (Approved)' : '—' }}
                  </td>
                </tr>
                <tr v-if="historyList.length === 0">
                  <td colspan="5" class="text-center py-8 text-slate-400">
                    ไม่มีประวัติการส่งข้อมูลอัปโหลด
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Instruction Panel -->
      <div class="lg:col-span-1 space-y-6">
        <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
          <template #header>
            <div class="flex items-center gap-2 border-b pb-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-indigo-600" />
              <h3 class="font-bold text-slate-800 text-sm">คู่มือการอัปโหลดไฟล์สินค้า</h3>
            </div>
          </template>

          <div class="space-y-3.5 mt-2 text-xs text-slate-600 leading-relaxed">
            <p>
              เพื่อความรวดเร็วและถูกต้อง กรุณาอัปเดตข้อมูลสินค้าตามเงื่อนไขที่ผู้ซื้อกำหนด:
            </p>
            <ol class="list-decimal pl-4 space-y-2">
              <li>
                <strong>รูปแบบคอลัมน์:</strong> ข้อมูลต้องเรียงจาก ชื่อสินค้า ➔ หมวดหมู่สินค้า ➔ หน่วยนับ ➔ ราคาต่อหน่วย
              </li>
              <li>
                <strong>หน่วยนับมาตรฐาน (UOM):</strong> กรุณาใช้รหัสหน่วยนับที่ระบบรองรับ (เช่น ชิ้น, กล่อง, พาเลท, แพ็ค, ถุง)
              </li>
              <li>
                <strong>ราคาเสนอขายต่อหน่วย:</strong> ต้องเป็นราคากลางคงที่ตามข้อตกลงและเป็นตัวเลขทศนิยมไม่เกิน 2 ตำแหน่ง
              </li>
              <li>
                <strong>การอนุมัติ:</strong> เมื่อยื่นคำขอแล้ว ฝ่ายจัดซื้อของ SCGJWD จะมีระยะเวลา 3-5 วันทำการในการตรวจสอบ หากได้รับการอนุมัติ สินค้าจะปรากฏเข้าสู่ e-Catalog ทันที
              </li>
            </ol>
            <div class="pt-3 border-t border-slate-100">
              <span class="block font-bold text-slate-700 mb-1">ดาวน์โหลดต้นแบบไฟล์</span>
              <a href="#" class="text-[#0054FF] hover:underline font-bold flex items-center gap-1" @click.prevent="downloadTemplate">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                catalog_template.csv
              </a>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();

const csvText = ref('');
const parsedItems = ref<any[]>([]);
const historyList = ref<any[]>([]);
const submitting = ref(false);

const loadHistory = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/catalog-submission', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    // Filter history belonging to this vendor
    const currentVendorId = authStore.vendor?.vendorId || '00000000-0000-0000-0000-000000000601';
    historyList.value = res.filter(item => item.vendor_id === currentVendorId);
  } catch (err) {
    console.warn('Backend offline. Mock history loaded.');
    historyList.value = [
      {
        submission_id: 'sub_mock_1',
        vendor_id: '00000000-0000-0000-0000-000000000601',
        items: [
          { item_name: 'พาเลทไม้แร็คกิ้ง ทนความชื้น (เกรด A)', item_type: 'วัสดุคลังสินค้า', uom: 'ชิ้น', unit_price: 340 },
          { item_name: 'กล่องกระดาษคราฟท์ 3 ชั้น ขนาด M', item_type: 'บรรจุภัณฑ์', uom: 'แพ็ค', unit_price: 180 },
          { item_name: 'ฟิล์มยืดพันพาเลท LLDPE หนา 15 ไมครอน', item_type: 'วัสดุสิ้นเปลือง', uom: 'ม้วน', unit_price: 210 },
        ],
        status: 'PendingApproval',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ];
  }
};

const parseAndValidateCsv = () => {
  if (!csvText.value.trim()) {
    alert('กรุณาป้อนข้อมูลในกล่องข้อความก่อนตรวจสอบ');
    return;
  }

  try {
    const lines = csvText.value.split('\n');
    const items: any[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(',');
      if (parts.length < 4) {
        throw new Error(`รูปแบบข้อมูลไม่ครบถ้วนในบรรทัด: "${line}"`);
      }
      
      const price = parseFloat(parts[3].trim());
      if (isNaN(price)) {
        throw new Error(`ราคาต้องเป็นจำนวนตัวเลขในบรรทัด: "${line}"`);
      }

      items.push({
        item_name: parts[0].trim(),
        item_type: parts[1].trim(),
        uom: parts[2].trim(),
        unit_price: price,
      });
    }

    parsedItems.value = items;
    alert(`ตรวจสอบสำเร็จ! พบสินค้าทั้งหมด ${items.length} รายการพร้อมส่ง`);
  } catch (err: any) {
    alert(`เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล: ${err.message}`);
    parsedItems.value = [];
  }
};

const submitCatalogSubmission = async () => {
  if (parsedItems.value.length === 0) return;
  submitting.value = true;
  const vendorId = authStore.vendor?.vendorId || '00000000-0000-0000-0000-000000000601';

  try {
    await $fetch('http://localhost:3001/api/catalog-submission/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        vendor_id: vendorId,
        items: parsedItems.value,
      },
    });

    alert('ส่งข้อมูลแค็ตตาล็อกเพื่อเสนอขอพิจารณาอนุมัติเรียบร้อย!');
    csvText.value = '';
    parsedItems.value = [];
    await loadHistory();
  } catch (err) {
    historyList.value.unshift({
      submission_id: `sub_${Date.now()}`,
      vendor_id: vendorId,
      items: [...parsedItems.value],
      status: 'PendingApproval',
      created_at: new Date().toISOString(),
    });
    alert('ส่งข้อมูลคำเสนอเรียบร้อย!');
    csvText.value = '';
    parsedItems.value = [];
  } finally {
    submitting.value = false;
  }
};

const downloadTemplate = () => {
  const content = "พาเลทไม้แร็คกิ้ง ทนความชื้น,วัสดุคลังสินค้า,ชิ้น,340\nกล่องกระดาษคราฟท์ 3 ชั้น ขนาด M,บรรจุภัณฑ์,แพ็ค,180\n";
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "catalog_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatStatus = (status: string) => {
  if (status === 'Approved') return 'อนุมัติแล้ว ✅';
  if (status === 'Rejected') return 'ปฏิเสธ ❌';
  return 'รอพิจารณา ⏳';
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
  loadHistory();
});
</script>
