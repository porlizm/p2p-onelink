<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[#002266]">สัญญาสั่งซื้อร่วม & ข้อตกลงราคา (Contracts & Blanket Agreements)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบรายละเอียดข้อตกลงราคา สัญญากลาง และจัดทำลายมือชื่อดิจิทัล (Digital Signatures) เพื่อเปิดการสั่งซื้อ</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-[var(--primary)] flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ข้อตกลงทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ contracts.length }} ฉบับ</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ลงนามร่วมกันแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ contracts.filter(c => c.status === 'Signed').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอคุณลงนาม</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ contracts.filter(c => c.status === 'PendingSignature' && !c.signatures?.vendor).length }} ฉบับ
          </span>
        </div>
      </div>
    </div>

    <!-- Contracts Table -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <span class="font-bold text-slate-800 text-sm">สัญญาและบันทึกข้อตกลงซื้อขาย</span>
        <UButton size="xs" color="gray" variant="outline" icon="i-heroicons-arrow-path" @click="loadContracts">รีเฟรช</UButton>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-slate-500 font-bold uppercase">
              <th class="px-6 py-3">เลขที่สัญญา</th>
              <th class="px-6 py-3">ชื่อรายละเอียดสัญญา</th>
              <th class="px-6 py-3 text-right">มูลค่ารวมสัญญากลาง</th>
              <th class="px-6 py-3 text-right">วงเงินคงเหลือ</th>
              <th class="px-6 py-3 text-center">ระยะเวลาบังคับใช้</th>
              <th class="px-6 py-3 text-center">ประเภท / Class</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-slate-600">
            <tr v-for="c in contracts" :key="c.contract_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[#0054FF]">
                {{ c.contract_no }}
                <span v-if="c.version_no > 1" class="text-[9px] text-slate-400 font-normal block">เวอร์ชัน {{ c.version_no }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-slate-700">{{ c.title }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">ประเภท: {{ formatContractType(c.contract_type) }} ({{ c.contract_period }})</div>
              </td>
              <td class="px-6 py-4 text-right font-bold text-slate-800">{{ formatCurrency(c.total_amount) }}</td>
              <td class="px-6 py-4 text-right font-extrabold text-indigo-600">{{ formatCurrency(c.remaining_amount) }}</td>
              <td class="px-6 py-4 text-center text-slate-400">
                {{ formatDate(c.start_date) }} - {{ formatDate(c.end_date) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[9px] font-bold border"
                  :class="[
                    c.contract_class === 'Amendment' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    c.contract_class === 'Addendum' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  ]"
                >
                  {{ c.contract_class || 'Original' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block"
                  :class="[
                    c.status === 'Signed' ? 'bg-green-50 text-green-700 border-green-200' :
                    c.status === 'PendingSignature' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    c.status === 'PendingApproval' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    c.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    c.status === 'Superceded' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  ]"
                >
                  {{ formatStatus(c.status, c.signatures?.vendor) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <UButton 
                    v-if="c.status === 'PendingSignature' && !c.signatures?.vendor"
                    size="xs" 
                    color="primary"
                    icon="i-heroicons-pencil-square"
                    class="cursor-pointer font-bold bg-[#0054FF] hover:bg-[#002266]"
                    @click="openSignDrawer(c)"
                  >
                    เปิดอ่าน & ลงนามดิจิทัล
                  </UButton>
                  <UButton 
                    v-else
                    size="xs" 
                    variant="outline"
                    color="gray"
                    icon="i-heroicons-eye"
                    class="cursor-pointer"
                    @click="openSignDrawer(c)"
                  >
                    เปิดตรวจดูรายละเอียด
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="contracts.length === 0">
              <td colspan="8" class="text-center py-10 text-slate-400">
                ไม่พบข้อมูลสัญญากับบริษัทของคุณในระบบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Signing Drawer -->
    <USlideover v-model="showSignDrawer" prevent-close :ui="{ width: 'max-w-2xl' }">
      <div class="p-6 h-full flex flex-col justify-between" v-if="activeContract">
        <div class="space-y-6 flex-1 overflow-y-auto pr-1">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h3 class="font-black text-slate-800 text-base">สัญญาสั่งซื้อและราคากลาง</h3>
              <p class="text-xs text-slate-400 mt-0.5">เลขที่สัญญา: {{ activeContract.contract_no }} | Class: {{ activeContract.contract_class || 'Original' }}</p>
            </div>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showSignDrawer = false" />
          </div>

          <!-- Document Viewer Mockup -->
          <div class="border border-slate-200 rounded-xl p-6 bg-slate-50 text-slate-700 space-y-4 max-h-[300px] overflow-y-auto">
            <div class="text-center font-extrabold text-slate-900 border-b pb-3 uppercase text-xs">
              สัญญาข้อตกลงซื้อขายพัสดุและจัดหาบริการ (Blanket Purchase Agreement)
            </div>
            <div class="text-[11px] space-y-3 leading-relaxed">
              <p>สัญญาฉบับนี้ทำขึ้นระหว่าง **บริษัท เจดับเบิ้ลยูดี อินโฟโลจิสติกส์ จำกัด (มหาชน)** (ฝ่ายผู้ซื้อ) และ **{{ authStore.vendor?.vendorName || 'บริษัทผู้ขายจำลอง' }}** (ฝ่ายผู้ขาย)</p>
              <p><strong>ชื่อบันทึกข้อตกลง:</strong> {{ activeContract.title }}</p>
              <p><strong>ประเภทสัญญา:</strong> {{ formatContractType(activeContract.contract_type) }} ({{ activeContract.contract_period }})</p>
              <p><strong>วงเงินค้ำประกันสัญญากลาง:</strong> {{ formatCurrency(activeContract.total_amount) }}</p>
              <p><strong>ระยะเวลากำหนด:</strong> เริ่มมีผลตั้งแต่วันที่ {{ formatDate(activeContract.start_date) }} ถึงวันที่ {{ formatDate(activeContract.end_date) }}</p>

              <!-- TYPE-SPECIFIC DETAIL DISPLAY -->
              <div v-if="activeContract.contract_type === 'Outsourcing' && activeContract.resources" class="border border-slate-200 rounded-lg p-3 bg-white space-y-2 mt-3">
                <div class="font-bold text-slate-800 border-b pb-1">รายละเอียดรายชื่อ/อัตราจ้างพนักงาน Outsource (US-141)</div>
                <div class="divide-y divide-slate-100 text-[10px]">
                  <div v-for="(r, idx) in activeContract.resources" :key="idx" class="flex justify-between py-1">
                    <span>ตำแหน่ง: {{ r.role }}</span>
                    <span>อัตรา: {{ formatCurrency(r.rate) }} / {{ r.unit === 'hour' ? 'ชม.' : r.unit === 'day' ? 'วัน' : 'เดือน' }} (จำนวน {{ formatQuantity(r.quantity) }} ราย)</span>
                  </div>
                </div>
              </div>

              <div v-if="activeContract.contract_type === 'Rental' && activeContract.rental_details" class="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5 mt-3">
                <div class="font-bold text-slate-800 border-b pb-1">รายละเอียดการเช่ารายงวด (US-142)</div>
                <div class="flex justify-between text-[10px]">
                  <span>รอบบิลเช่า: {{ activeContract.rental_details.billing_cycle }}</span>
                  <span>ค่าเช่างวดละ: {{ formatCurrency(activeContract.rental_details.installment_amount) }}</span>
                </div>
                <div v-if="activeContract.rental_details.return_conditions" class="text-[9px] text-slate-500 mt-1">
                  <strong>เงื่อนไขคืนทรัพย์สิน:</strong> {{ activeContract.rental_details.return_conditions }}
                </div>
              </div>

              <div v-if="(activeContract.contract_type === 'Warranty' || activeContract.contract_type === 'Service') && activeContract.warranty_details" class="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5 mt-3">
                <div class="font-bold text-slate-800 border-b pb-1">ขอบเขตประกันภัย & SLA (US-142)</div>
                <div class="flex justify-between text-[10px]">
                  <span>มาตรฐานการบริการ (SLA): {{ activeContract.warranty_details.sla_level || '-' }}</span>
                  <span>ผู้ประสานงาน Support: {{ activeContract.warranty_details.contact_person || '-' }}</span>
                </div>
              </div>

              <p class="pt-3 border-t">คู่สัญญาทั้งสองฝ่ายได้อ่านและรับทราบเงื่อนไขสัญญากลางฉบับนี้ครบถ้วนเป็นที่เรียบร้อย จึงได้ร่วมประทับตราและลงนามผ่านระบบความคุ้มครองทางอิเล็กทรอนิกส์</p>
            </div>
          </div>

          <!-- Signature Status Track -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Buyer signature -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
              <span class="block font-bold text-slate-500 uppercase">ฝ่ายผู้จัดซื้อ (Buyer Representative)</span>
              <div v-if="activeContract.signatures?.buyer" class="text-slate-600 bg-white p-2 rounded border border-slate-100 space-y-0.5">
                <div>ผู้ลงนาม: <strong class="text-slate-800">{{ activeContract.signatures.buyer.name }}</strong></div>
                <div>IP: <span class="font-mono text-slate-400">{{ activeContract.signatures.buyer.ip }}</span></div>
                <div class="text-[9px] text-slate-400">วันที่: {{ formatDateTime(activeContract.signatures.buyer.signed_at) }}</div>
              </div>
              <div v-else class="text-slate-400 italic">รอตัวแทนผู้จัดซื้อลงนามร่วม ⏳</div>
            </div>

            <!-- Vendor signature -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
              <span class="block font-bold text-slate-500 uppercase">ฝ่ายคู่ขาย (Vendor Representative)</span>
              <div v-if="activeContract.signatures?.vendor" class="text-slate-600 bg-white p-2 rounded border border-slate-100 space-y-0.5">
                <div>ผู้ลงนาม: <strong class="text-slate-800">{{ activeContract.signatures.vendor.name }}</strong></div>
                <div>IP: <span class="font-mono text-slate-400">{{ activeContract.signatures.vendor.ip }}</span></div>
                <div class="text-[9px] text-slate-400">วันที่: {{ formatDateTime(activeContract.signatures.vendor.signed_at) }}</div>
              </div>
              <div v-else class="text-slate-400 italic">รอการลงนามของคุณ ⏳</div>
            </div>
          </div>

          <!-- Signature Form Input -->
          <div v-if="activeContract.status === 'PendingSignature' && !activeContract.signatures?.vendor" class="space-y-4 pt-3 border-t border-slate-100">
            <h4 class="font-extrabold text-slate-800 text-xs">ระบุข้อมูลเพื่อลงนามอิเล็กทรอนิกส์</h4>
            
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">ชื่อผู้ลงลายมือชื่อ</label>
                <UInput v-model="signerName" placeholder="เช่น นายสมชาย ดีเลิศ (CEO)" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">รหัสยืนยัน PIN (Security PIN)</label>
                <UInput v-model="signPin" type="password" placeholder="ใส่รหัสผ่าน หรือ 123456" />
              </div>
            </div>

            <!-- Draw Signature Mock Canvas -->
            <div class="space-y-1.5 text-xs">
              <label class="block font-bold text-slate-700">ลากวาดลายเซ็นของคุณ (Touch Signature)</label>
              <div 
                class="border border-dashed border-slate-300 bg-slate-50 rounded-lg h-24 flex items-center justify-center relative cursor-crosshair overflow-hidden"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
              >
                <svg class="absolute inset-0 w-full h-full pointer-events-none">
                  <path :d="signaturePath" fill="none" stroke="#002266" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-if="!signaturePath" class="text-[10px] text-slate-400 pointer-events-none">ลากเมาส์/ใช้นิ้ว เพื่อวาดลายมือชื่อจำลองในกรอบนี้</span>
                <button 
                  v-else 
                  class="absolute bottom-1 right-1 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                  @click.stop="clearSignature"
                >
                  ล้างลายเซ็น
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="border-t pt-4 flex gap-3 justify-end bg-white" v-if="activeContract.status === 'PendingSignature' && !activeContract.signatures?.vendor">
          <UButton color="gray" variant="ghost" class="text-xs font-bold" @click="showSignDrawer = false">ยกเลิก</UButton>
          <UButton 
            color="primary" 
            icon="i-heroicons-pencil-square"
            class="text-xs font-bold bg-[#0054FF] hover:bg-[#002266] px-5 cursor-pointer"
            :loading="submitting"
            @click="submitSignature"
          >
            ยืนยันลงนามอิเล็กทรอนิกส์ (Sign Contract)
          </UButton>
        </div>
        <div class="border-t pt-4 flex justify-end bg-white" v-else>
          <UButton color="gray" variant="solid" class="text-xs font-bold px-4" @click="showSignDrawer = false">ปิดหน้าต่าง</UButton>
        </div>
      </div>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();

const contracts = ref<any[]>([]);
const activeContract = ref<any | null>(null);
const showSignDrawer = ref(false);
const submitting = ref(false);

// Form
const signerName = ref('');
const signPin = ref('');
const signaturePath = ref('');
const isDrawing = ref(false);

const loadContracts = async () => {
  try {
    const vendorId = authStore.vendor?.vendorId || '00000000-0000-0000-0000-000000000601';
    const res = await $fetch<any[]>(`http://localhost:3001/api/contract/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    contracts.value = res;
  } catch (err) {
    console.warn('Backend API connection failed. Using mock vendor agreements.');
    contracts.value = [
      {
        contract_id: 'con_mock_1',
        contract_no: 'CNT-2026-0001',
        title: 'สัญญาจัดหาอะไหล่และชุดซ่อมบำรุงรถบรรทุก ประจำปี 2026',
        vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        total_amount: 1500000,
        remaining_amount: 1250000,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        contract_type: 'Sales',
        contract_period: '1 Year',
        status: 'Signed',
        contract_class: 'Original',
        version_no: 1,
        signatures: {
          buyer: { name: 'คุณนันทพร ศิริวัฒน์', signed_at: '2026-01-02T09:30:00Z', ip: '192.168.1.55' },
          vendor: { name: 'สมชาย ดีเลิศ (CEO)', signed_at: '2026-01-03T11:15:00Z', ip: '202.14.88.92' },
        }
      },
      {
        contract_id: 'con_mock_2',
        contract_no: 'CNT-2026-0002',
        title: 'จัดจ้างที่ปรึกษาติดตั้งโครงสร้างเซิร์ฟเวอร์ระบบจัดซื้อ',
        vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        total_amount: 800000,
        remaining_amount: 800000,
        start_date: '2026-06-01',
        end_date: '2026-12-31',
        contract_type: 'Outsourcing',
        contract_period: '6 Months',
        resources: [
          { role: 'Senior Systems Architect', rate: 100000, unit: 'month', quantity: 1 },
          { role: 'DevOps Engineer', rate: 60000, unit: 'month', quantity: 1 }
        ],
        status: 'PendingSignature',
        contract_class: 'Original',
        version_no: 1,
        signatures: {
          buyer: { name: 'คุณนันทพร ศิริวัฒน์', signed_at: '2026-06-20T10:00:00Z', ip: '192.168.1.55' }
        }
      }
    ];
  }
};

const openSignDrawer = (c: any) => {
  activeContract.value = c;
  showSignDrawer.value = true;
  signerName.value = authStore.vendor?.vendorName ? `${authStore.vendor.vendorName} Admin` : 'ตัวแทนคู่ค้า';
  signPin.value = '';
  signaturePath.value = '';
};

// Signature Drawing Actions
const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  signaturePath.value = `M ${x} ${y}`;
};

const draw = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  signaturePath.value += ` L ${x} ${y}`;
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const clearSignature = () => {
  signaturePath.value = '';
};

const submitSignature = async () => {
  if (!signerName.value || !signPin.value || !signaturePath.value) {
    alert('กรุณากรอกชื่อคู่ค้า ยืนยันรหัส PIN และวาดลายมือชื่อดิจิทัลให้ครบถ้วน');
    return;
  }
  submitting.value = true;

  try {
    await $fetch(`http://localhost:3001/api/contract/${activeContract.value.contract_id}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        role: 'vendor',
        name: signerName.value,
        ip: '127.0.0.1'
      },
    });

    alert('ลงนามและทำข้อตกลงสัญญารูปแบบดิจิทัลเสร็จสิ้น!');
    showSignDrawer.value = false;
    await loadContracts();
  } catch (err) {
    // Simulated UAT updates
    const match = contracts.value.find(c => c.contract_id === activeContract.value.contract_id);
    if (match) {
      match.signatures = match.signatures || {};
      match.signatures.vendor = {
        name: signerName.value,
        signed_at: new Date().toISOString(),
        ip: '127.0.0.1 (UAT-VendorNetwork)',
      };
      if (match.signatures.buyer) {
        match.status = 'Signed';
        if (match.contract_class === 'Amendment' && match.parent_contract_id) {
          const parent = contracts.value.find(p => p.contract_id === match.parent_contract_id);
          if (parent) parent.status = 'Superceded';
        }
      }
    }
    alert('ลงนามดิจิทัลสำเร็จ! (Simulated)');
    showSignDrawer.value = false;
  } finally {
    submitting.value = false;
  }
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

const formatStatus = (status: string, vendorSigned: any) => {
  if (status === 'Signed') return 'ลงนามร่วมกันแล้ว ✅';
  if (status === 'PendingApproval') return 'รออนุมัติภายใน ⏳';
  if (status === 'Rejected') return 'ปฏิเสธคำขอ ❌';
  if (status === 'Superceded') return 'สัญญาสิ้นสุด/ปรับปรุงแล้ว ⛔';
  if (vendorSigned) return 'คุณลงนามแล้ว (รอผู้ซื้อ) ⏳';
  return 'รอลงนามจากคุณ ⏳';
};

const formatDate = (val: string) => {
  if (!val) return '';
  return new Date(val).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
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

const formatContractType = (t: string) => {
  switch (t) {
    case 'Sales': return 'การขายพัสดุ';
    case 'Rental': return 'เช่าสินทรัพย์/ครุภัณฑ์';
    case 'Service': return 'จ้างบริการ';
    case 'Warranty': return 'บำรุงรักษา/SLA';
    case 'Outsourcing': return 'Outsourcing พนักงาน';
    default: return t || 'ทั่วไป';
  }
};

onMounted(() => {
  loadContracts();
});
</script>
