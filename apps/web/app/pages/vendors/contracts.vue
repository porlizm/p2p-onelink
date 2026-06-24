<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">สัญญาสั่งซื้อ & ข้อตกลงราคากลาง (Blanket Agreements)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">บริหารสัญญาจัดซื้อระยะยาว กำหนดวงเงินงบประมาณ และจัดทำลายเซ็นดิจิทัลร่วมกับคู่ค้า</p>
      </div>
      <div>
        <UButton 
          color="primary"
          icon="i-heroicons-plus-circle"
          class="cursor-pointer font-bold"
          @click="showCreateModal = true"
        >
          สร้างสัญญาใหม่ (New Agreement)
        </UButton>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-[var(--primary)] flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">สัญญาทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ contracts.length }} ฉบับ</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ลงนามครบแล้ว</span>
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
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอลงนาม</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ contracts.filter(c => c.status === 'PendingSignature').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">มูลค่ารวมสัญญากลาง</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalContractsAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Contracts Table -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่สัญญา</th>
              <th class="px-6 py-3">ชื่อสัญญา / รายละเอียด</th>
              <th class="px-6 py-3">ผู้ขาย / Vendor</th>
              <th class="px-6 py-3 text-right">วงเงินสัญญา</th>
              <th class="px-6 py-3 text-right">คงเหลือคงคลัง</th>
              <th class="px-6 py-3 text-center">ระยะเวลาสัญญา</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="c in contracts" :key="c.contract_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ c.contract_no }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-700">{{ c.title }}</div>
              </td>
              <td class="px-6 py-4 text-slate-600 font-semibold">{{ c.vendor?.vendor_name }}</td>
              <td class="px-6 py-4 text-right font-bold text-slate-800">{{ formatCurrency(c.total_amount) }}</td>
              <td class="px-6 py-4 text-right font-extrabold text-indigo-600">{{ formatCurrency(c.remaining_amount) }}</td>
              <td class="px-6 py-4 text-center text-slate-500 text-xs">
                {{ formatDate(c.start_date) }} - {{ formatDate(c.end_date) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-xs font-bold inline-block border"
                  :class="[
                    c.status === 'Signed' ? 'bg-green-50 text-green-700 border-green-200' :
                    c.status === 'PendingSignature' ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  ]"
                >
                  {{ formatStatus(c.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <UButton 
                    v-if="c.status === 'PendingSignature' && !c.signatures?.buyer"
                    size="xs" 
                    color="primary"
                    icon="i-heroicons-pencil-square"
                    class="cursor-pointer font-bold"
                    @click="signAgreement(c.contract_id)"
                  >
                    ลงนามสัญญากลาง
                  </UButton>
                  <UButton 
                    v-else
                    size="xs" 
                    variant="outline"
                    color="gray"
                    icon="i-heroicons-eye"
                    class="cursor-pointer"
                    @click="viewAgreementDetail(c)"
                  >
                    เปิดดูสิทธิ์
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="contracts.length === 0">
              <td colspan="8" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบข้อมูลสัญญาสั่งซื้อในระบบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Agreement Modal -->
    <UModal v-model="showCreateModal" prevent-close>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-base">สร้าง Blanket Agreement ใหม่</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showCreateModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">คู่ค้าหลัก / Vendor</label>
            <USelect 
              v-model="newVendorId"
              :options="vendorOptions"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">ชื่อสัญญา / วัตถุประสงค์จัดหา</label>
            <UInput v-model="newTitle" placeholder="เช่น สัญญาจ้างบริการพัฒนาซอฟต์แวร์ ประจำปี 2026..." />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันเริ่มสัญญา (Start Date)</label>
              <UInput v-model="newStartDate" type="date" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันสิ้นสุดสัญญา (End Date)</label>
              <UInput v-model="newEndDate" type="date" />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">วงเงินสัญญารวมทั้งหมด (THB)</label>
            <UInput v-model.number="newAmount" type="number" placeholder="เช่น 1000000" />
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showCreateModal = false" variant="ghost" color="gray">ยกเลิก</UButton>
          <UButton 
            color="primary"
            :loading="submitting"
            class="px-5 cursor-pointer font-bold"
            @click="submitContract"
          >
            สร้างและเสนอลงนาม
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Contract Detail & Signatures Sheet -->
    <USlideover v-model="showDetailDrawer">
      <div class="p-6 h-full flex flex-col space-y-4 bg-white text-xs" v-if="activeContract">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="font-bold text-slate-800 text-sm">รายละเอียดสัญญาจัดซื้อ</div>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showDetailDrawer = false" />
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto">
          <!-- Card detail -->
          <div class="bg-slate-50 p-4 border rounded-xl space-y-3">
            <div class="flex justify-between font-bold text-slate-700">
              <span>เลขที่สัญญา:</span>
              <span class="text-[var(--primary)]">{{ activeContract.contract_no }}</span>
            </div>
            <div class="flex justify-between">
              <span>ชื่อสัญญา:</span>
              <span class="font-semibold text-slate-800">{{ activeContract.title }}</span>
            </div>
            <div class="flex justify-between">
              <span>ผู้ขาย / Vendor:</span>
              <span class="font-semibold text-slate-700">{{ activeContract.vendor?.vendor_name }}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span>วงเงินสัญญา:</span>
              <span class="font-bold text-slate-800">{{ formatCurrency(activeContract.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>คงเหลือในระบบ:</span>
              <span class="font-extrabold text-indigo-600">{{ formatCurrency(activeContract.remaining_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>ระยะเวลา:</span>
              <span>{{ formatDate(activeContract.start_date) }} - {{ formatDate(activeContract.end_date) }}</span>
            </div>
          </div>

          <!-- Digital Signature Details -->
          <div class="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-4">
            <div class="font-bold text-indigo-900 flex items-center gap-1">
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 text-indigo-600" />
              <span>การบันทึกขอบเขตลายเซ็นดิจิทัล (E-Signatures Status)</span>
            </div>

            <!-- Buyer signature -->
            <div class="border-b pb-3 border-indigo-100/50">
              <div class="font-bold text-slate-700">ตัวแทนสั่งซื้อ (SCGJWD Buyer)</div>
              <div v-if="activeContract.signatures?.buyer" class="mt-1.5 space-y-1 text-slate-600 bg-white p-2 rounded border border-slate-100">
                <div class="flex justify-between">
                  <span>ผู้ลงนาม:</span>
                  <span class="font-semibold text-slate-800">{{ activeContract.signatures.buyer.name }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>IP Address:</span>
                  <span class="font-mono text-slate-400">{{ activeContract.signatures.buyer.ip }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>เวลาลงนาม:</span>
                  <span>{{ formatDateTime(activeContract.signatures.buyer.signed_at) }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-orange-600 font-semibold mt-1">ยังไม่มีการลงนาม ⏳</div>
            </div>

            <!-- Vendor signature -->
            <div>
              <div class="font-bold text-slate-700">ตัวแทนผู้ขาย (Vendor Representative)</div>
              <div v-if="activeContract.signatures?.vendor" class="mt-1.5 space-y-1 text-slate-600 bg-white p-2 rounded border border-slate-100">
                <div class="flex justify-between">
                  <span>ผู้ลงนาม:</span>
                  <span class="font-semibold text-slate-800">{{ activeContract.signatures.vendor.name }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>IP Address:</span>
                  <span class="font-mono text-slate-400">{{ activeContract.signatures.vendor.ip }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>เวลาลงนาม:</span>
                  <span>{{ formatDateTime(activeContract.signatures.vendor.signed_at) }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-orange-600 font-semibold mt-1">ยังไม่ได้รับการลงนามจากฝั่งคู่ค้า ⏳</div>
            </div>
          </div>
        </div>

        <div class="border-t pt-4 flex gap-2 justify-end">
          <UButton @click="showDetailDrawer = false" color="gray" variant="ghost">ปิด</UButton>
          <UButton 
            v-if="activeContract.status === 'PendingSignature' && !activeContract.signatures?.buyer"
            color="primary"
            class="cursor-pointer font-bold px-4"
            @click="signAgreement(activeContract.contract_id)"
          >
            ลงนามสัญญากลาง
          </UButton>
        </div>
      </div>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const contracts = ref<any[]>([]);
const vendorsList = ref<any[]>([]);

const showCreateModal = ref(false);
const showDetailDrawer = ref(false);
const submitting = ref(false);
const activeContract = ref<any | null>(null);

// Form refs
const newVendorId = ref('');
const newTitle = ref('');
const newStartDate = ref(new Date().toISOString().split('T')[0]);
const newEndDate = ref(new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]);
const newAmount = ref<number | null>(null);

const loadData = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/contract', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    contracts.value = res;
  } catch (err) {
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
        status: 'Signed',
        signatures: {
          buyer: { name: 'คุณนันทพร ศิริวัฒน์', signed_at: '2026-01-02T09:30:00Z', ip: '192.168.1.55' },
          vendor: { name: 'สมชาย ดีเลิศ (CEO)', signed_at: '2026-01-03T11:15:00Z', ip: '202.14.88.92' },
        }
      },
      {
        contract_id: 'con_mock_2',
        contract_no: 'CNT-2026-0002',
        title: 'จัดจ้างที่ปรึกษาติดตั้งโครงสร้างเซิร์ฟเวอร์ระบบจัดซื้อ',
        vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
        total_amount: 800000,
        remaining_amount: 800000,
        start_date: '2026-06-01',
        end_date: '2026-12-31',
        status: 'PendingSignature',
        signatures: {
          vendor: { name: 'Innovative Admin', signed_at: '2026-06-20T10:00:00Z', ip: '110.45.2.14' }
        }
      }
    ];
  }

  try {
    const vRes = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    vendorsList.value = vRes;
  } catch (err) {
    vendorsList.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
      { vendor_id: '00000000-0000-0000-0000-000000000602', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' }
    ];
  }
};

const vendorOptions = computed(() => {
  return vendorsList.value.map(v => ({ value: v.vendor_id, label: v.vendor_name }));
});

const totalContractsAmount = computed(() => {
  return contracts.value.reduce((sum, c) => sum + Number(c.total_amount), 0);
});

const viewAgreementDetail = (c: any) => {
  activeContract.value = c;
  showDetailDrawer.value = true;
};

const submitContract = async () => {
  if (!newVendorId.value || !newTitle.value || !newAmount.value) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }
  submitting.value = true;
  const payload = {
    vendor_id: newVendorId.value,
    title: newTitle.value,
    start_date: newStartDate.value,
    end_date: newEndDate.value,
    total_amount: newAmount.value,
  };

  try {
    await $fetch('http://localhost:3001/api/contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: payload,
    });
    alert('สร้างข้อตกลงสัญญากลางเสนอลงนามเรียบร้อย!');
    showCreateModal.value = false;
    await loadData();
  } catch (err) {
    // Mock insert
    const v = vendorsList.value.find(vendor => vendor.vendor_id === newVendorId.value);
    contracts.value.unshift({
      contract_id: `con_${Date.now()}`,
      contract_no: `CNT-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newTitle.value,
      vendor: { vendor_name: v?.vendor_name || 'Mock Vendor' },
      total_amount: newAmount.value,
      remaining_amount: newAmount.value,
      start_date: newStartDate.value,
      end_date: newEndDate.value,
      status: 'PendingSignature',
      signatures: {},
    });
    alert('สร้างข้อตกลงสัญญากลางเสนอลงนามเรียบร้อย! (Simulated)');
    showCreateModal.value = false;
  } finally {
    submitting.value = false;
  }
};

const signAgreement = async (contractId: string) => {
  if (!confirm('ยืนยันประทับตราและลงลายมือชื่อดิจิทัลสำหรับผู้จัดซื้อใช่หรือไม่? การทำงานนี้จะบันทึกเลข IP ของเครื่องคุณ')) return;
  const name = authStore.user?.username || 'คุณนันทพร ศิริวัฒน์';
  try {
    await $fetch(`http://localhost:3001/api/contract/${contractId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { role: 'buyer', name },
    });
    alert('ลงนามสัญญากลางเรียบร้อย!');
    showDetailDrawer.value = false;
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === contractId);
    if (c) {
      c.signatures = c.signatures || {};
      c.signatures.buyer = {
        name,
        signed_at: new Date().toISOString(),
        ip: '192.168.1.100 (UAT-Network)',
      };
      if (c.signatures.vendor) {
        c.status = 'Signed';
      }
      alert('ลงนามสัญญากลางเรียบร้อย! (Simulated)');
      showDetailDrawer.value = false;
    }
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'Signed': return 'ประทับตราสมบูรณ์ ✅';
    case 'PendingSignature': return 'รอคู่ค้าลงนาม ⏳';
    default: return 'ร่างสัญญา';
  }
};

onMounted(() => {
  loadData();
});
</script>
