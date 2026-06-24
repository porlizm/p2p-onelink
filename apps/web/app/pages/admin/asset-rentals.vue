<template>
  <div class="space-y-6 max-w-6xl mx-auto bg-white p-8 border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)]">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[#002266] flex items-center gap-2">
          <UIcon name="i-heroicons-archive-box" class="w-6 h-6 text-amber-600" />
          การเช่าสินทรัพย์และคีย์ไลเซนส์ (Assets & Licenses Hub)
        </h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          บันทึกประวัติการเช่าครุภัณฑ์ข้ามหน่วยงาน (BU-to-BU Rentals) และติดตามซอฟต์แวร์สิทธิ์การใช้งาน (Software Subscriptions) ขององค์กรทั้งหมด
        </p>
      </div>
      <NuxtLink to="/admin">
        <UButton variant="outline" size="sm">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 mr-1" />
          ย้อนกลับ
        </UButton>
      </NuxtLink>
    </div>

    <!-- Error/Success Banner -->
    <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" class="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
      {{ successMsg }}
    </div>

    <!-- Tabs selector -->
    <div class="flex border-b border-[var(--border)] gap-6">
      <button 
        @click="activeTab = 'rentals'" 
        class="pb-3 text-sm font-bold transition-all relative"
        :class="activeTab === 'rentals' ? 'text-[#0054FF]' : 'text-slate-500 hover:text-slate-800'"
      >
        <span>การเช่าครุภัณฑ์ / สินทรัพย์ข้าม BU</span>
        <span v-if="activeTab === 'rentals'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0054FF]"></span>
      </button>
      <button 
        @click="activeTab = 'licenses'" 
        class="pb-3 text-sm font-bold transition-all relative"
        :class="activeTab === 'licenses' ? 'text-[#0054FF]' : 'text-slate-500 hover:text-slate-800'"
      >
        <span>สิทธิ์ซอฟต์แวร์ไลเซนส์ (Software Licenses)</span>
        <span v-if="activeTab === 'licenses'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0054FF]"></span>
      </button>
    </div>

    <!-- RENTALS TAB -->
    <div v-if="activeTab === 'rentals'" class="space-y-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Add Manual Log Form -->
        <div class="w-full lg:w-1/3 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 h-fit space-y-4">
          <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <UIcon name="i-heroicons-plus-circle" class="w-4 h-4 text-amber-600" />
            บันทึกการเช่าข้าม BU
          </h3>

          <form @submit.prevent="createRentalLog" class="space-y-3">
            <UFormField label="ชื่อครุภัณฑ์/สินทรัพย์ *" name="itemName" required>
              <UInput v-model="itemName" placeholder="เช่น โน้ตบุ๊ค Core i5 (2026)" size="sm" class="bg-white mt-1" />
            </UFormField>

            <UFormField label="หมายเลขครุภัณฑ์ (Asset Tag)" name="assetTag">
              <UInput v-model="assetTag" placeholder="เช่น AST-IT-9921" size="sm" class="bg-white mt-1" />
            </UFormField>

            <UFormField label="BU เจ้าของสินทรัพย์ *" name="ownerBu" required>
              <select v-model="ownerBuId" class="w-full px-3 py-1.5 text-xs border border-[var(--border)] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mt-1 h-8">
                <option v-for="bu in bus" :key="bu.bu_id" :value="bu.bu_id">{{ bu.bu_name }}</option>
              </select>
            </UFormField>

            <UFormField label="BU ที่ยืม/เช่าใช้งาน *" name="rentedToBu" required>
              <select v-model="rentedToBuId" class="w-full px-3 py-1.5 text-xs border border-[var(--border)] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mt-1 h-8">
                <option v-for="bu in bus" :key="bu.bu_id" :value="bu.bu_id">{{ bu.bu_name }}</option>
              </select>
            </UFormField>

            <UFormField label="ชื่อเจ้าของ/ผู้รับผิดชอบ" name="ownerName">
              <UInput v-model="ownerName" placeholder="เช่น นายสมบูรณ์ สุขใจ" size="sm" class="bg-white mt-1" />
            </UFormField>

            <UFormField label="ชื่อผู้ยืม/ใช้งาน" name="renterName">
              <UInput v-model="renterName" placeholder="เช่น นางสาววิภา รักงาน" size="sm" class="bg-white mt-1" />
            </UFormField>

            <div class="grid grid-cols-2 gap-2">
              <UFormField label="วันเริ่มเช่า" name="startDate">
                <UInput v-model="startDate" type="date" size="sm" class="bg-white mt-1" />
              </UFormField>
              <UFormField label="วันสิ้นสุดเช่า" name="endDate">
                <UInput v-model="endDate" type="date" size="sm" class="bg-white mt-1" />
              </UFormField>
            </div>

            <UButton type="submit" color="amber" size="sm" class="w-full font-semibold shadow-sm justify-center" :loading="isSubmitting">
              บันทึกการเช่าครุภัณฑ์
            </UButton>
          </form>
        </div>

        <!-- Rentals Logs List -->
        <div class="w-full lg:w-2/3 space-y-4">
          <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-blue-600" />
            ประวัติการเช่าครุภัณฑ์ข้ามหน่วยงาน
          </h3>

          <div class="border border-[var(--border)] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
            <table class="w-full text-left border-collapse bg-white">
              <thead>
                <tr class="bg-slate-50 border-b border-[var(--border)] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th class="p-3">รหัสสินทรัพย์</th>
                  <th class="p-3">ชื่อรายการ</th>
                  <th class="p-3">เจ้าของ (Owner BU)</th>
                  <th class="p-3">ผู้ยืม (Renting BU)</th>
                  <th class="p-3">ระยะเวลาการเช่า</th>
                  <th class="p-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border)] text-xs">
                <tr v-for="r in rentals" :key="r.log_id" class="hover:bg-slate-50 transition-colors">
                  <td class="p-3 font-semibold text-slate-700">
                    <span class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {{ r.asset_tag }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="font-bold text-slate-800 block">{{ r.item_name }}</span>
                    <span v-if="r.po" class="text-[10px] text-indigo-600 block mt-0.5">PO: {{ r.po.po_no }}</span>
                  </td>
                  <td class="p-3">
                    <span class="font-semibold text-slate-700 block">{{ r.owner_bu?.bu_name || 'IT' }}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">{{ r.owner_name || 'ส่วนกลาง' }}</span>
                  </td>
                  <td class="p-3">
                    <span class="font-semibold text-slate-700 block">{{ r.rented_to_bu?.bu_name || 'Procurement' }}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">{{ r.renter_name || 'N/A' }}</span>
                  </td>
                  <td class="p-3">
                    <span class="block">{{ formatDate(r.start_date) }} - {{ formatDate(r.end_date) }}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">เช่าซื้อ / บริการเช่า</span>
                  </td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
                      {{ r.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="rentals.length === 0">
                  <td colspan="6" class="text-center py-8 text-slate-400">
                    ไม่มีรายการเช่าสินทรัพย์ในระบบ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- LICENSES TAB -->
    <div v-if="activeTab === 'licenses'" class="space-y-4">
      <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
        <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-emerald-600" />
        รายการซื้อสิทธิ์ใช้งานซอฟต์แวร์ (License Subscriptions)
      </h3>

      <div class="border border-[var(--border)] rounded-xl overflow-hidden shadow-sm overflow-x-auto bg-white">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="p-3">ชื่อสิทธิ์ใช้งาน / ซอฟต์แวร์</th>
              <th class="p-3">รหัสสิทธิ์ (License Key)</th>
              <th class="p-3">ผู้จัดจำหน่าย (Vendor)</th>
              <th class="p-3 text-right">จำนวนเครื่อง (Seats)</th>
              <th class="p-3">วันหมดอายุ</th>
              <th class="p-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-xs">
            <tr v-for="l in licenses" :key="l.subscription_id" class="hover:bg-slate-50 transition-colors">
              <td class="p-3">
                <span class="font-bold text-slate-800 block">{{ l.license_name }}</span>
                <span v-if="l.po" class="text-[10px] text-indigo-600 block mt-0.5">สั่งซื้อผ่าน PO: {{ l.po.po_no }}</span>
              </td>
              <td class="p-3">
                <span class="font-mono bg-slate-50 px-2 py-0.5 border border-slate-200 rounded text-slate-600">
                  {{ l.license_key || 'N/A' }}
                </span>
              </td>
              <td class="p-3 font-semibold text-slate-700">
                {{ l.vendor?.vendor_name || 'N/A' }}
              </td>
              <td class="p-3 text-right font-bold text-slate-700">
                {{ l.seats_count }}
              </td>
              <td class="p-3">
                <span class="block">{{ formatDate(l.expiry_date) }}</span>
                <span 
                  class="text-[9px] font-semibold mt-0.5 inline-block"
                  :class="isExpired(l.expiry_date) ? 'text-red-600' : 'text-slate-400'"
                >
                  {{ isExpired(l.expiry_date) ? 'หมดอายุการใช้งานแล้ว' : 'ยังใช้งานได้ปกติ' }}
                </span>
              </td>
              <td class="p-3 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-[9px] font-bold"
                  :class="l.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'"
                >
                  {{ l.status }}
                </span>
              </td>
            </tr>
            <tr v-if="licenses.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-400">
                ไม่มีรายการสิทธิ์การใช้งานซอฟต์แวร์ในขณะนี้
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const activeTab = ref('rentals');

const rentals = ref<any[]>([]);
const licenses = ref<any[]>([]);
const bus = ref<any[]>([]);

// Form States
const itemName = ref('');
const assetTag = ref('');
const ownerBuId = ref('');
const rentedToBuId = ref('');
const ownerName = ref('');
const renterName = ref('');
const startDate = ref(new Date().toISOString().slice(0, 10));
const endDate = ref(new Date(Date.now() + 86400000 * 365).toISOString().slice(0, 10));

const errorMsg = ref('');
const successMsg = ref('');
const isSubmitting = ref(false);

const loadData = async () => {
  try {
    const resRentals = await $fetch<any[]>('http://localhost:3001/api/catalog/asset-rentals/rentals', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    rentals.value = resRentals;

    const resLicenses = await $fetch<any[]>('http://localhost:3001/api/catalog/asset-rentals/licenses', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    licenses.value = resLicenses;
  } catch (err: any) {
    console.error('Offline, loading mock rental/license data', err);
    errorMsg.value = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ใช้ข้อมูลจำลองชั่วคราว';
    
    // Set mock data
    rentals.value = [
      {
        log_id: '1',
        item_name: 'บริการเช่าโน้ตบุ๊ค Core i5 (รายปี)',
        asset_tag: 'AST-IT-0091',
        owner_bu_id: '1',
        owner_bu: { bu_name: 'ฝ่ายเทคโนโลยีสารสนเทศ' },
        rented_to_bu: { bu_name: 'ฝ่ายจัดซื้อกลาง' },
        owner_name: 'ฝ่าย IT กลาง',
        renter_name: 'นายสิทธิชัย อุตสาหะ',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        status: 'Active',
      }
    ];

    licenses.value = [
      {
        subscription_id: '1',
        license_name: 'Adobe Creative Cloud All Apps License (รายปี)',
        license_key: 'KEY-ADOBE-CC-9912X',
        vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        seats_count: 10,
        expiry_date: '2027-01-15',
        status: 'Active',
      },
      {
        subscription_id: '2',
        license_name: 'Antivirus Endpoint Protection (รายปี)',
        license_key: 'KEY-ANTIVIRUS-EPT-1102A',
        vendor: { vendor_name: 'บริษัท โทเทิ่ล ไอที โซลูชั่นส์ จำกัด' },
        seats_count: 50,
        expiry_date: '2026-06-30',
        status: 'Active',
      }
    ];
  }
};

const loadBusinessUnits = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    // Normally fetch BUs, but we can reuse vendor/mock lists or create custom ones
    bus.value = [
      { bu_id: '00000002-0000-0000-0000-000000000001', bu_name: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)' },
      { bu_id: '00000001-0000-0000-0000-000000000001', bu_name: 'ฝ่ายจัดซื้อกลาง (Procurement)' },
      { bu_id: '00000003-0000-0000-0000-000000000001', bu_name: 'ฝ่ายคลังสินค้า (Warehouse)' },
    ];
    ownerBuId.value = bus.value[0]?.bu_id || '';
    rentedToBuId.value = bus.value[1]?.bu_id || '';
  } catch (err) {
    bus.value = [
      { bu_id: '1', bu_name: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)' },
      { bu_id: '2', bu_name: 'ฝ่ายจัดซื้อกลาง (Procurement)' },
      { bu_id: '3', bu_name: 'ฝ่ายคลังสินค้า (Warehouse)' },
    ];
    ownerBuId.value = '1';
    rentedToBuId.value = '2';
  }
};

const createRentalLog = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  if (!itemName.value || !ownerBuId.value || !rentedToBuId.value) {
    errorMsg.value = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
    return;
  }

  isSubmitting.value = true;
  try {
    await $fetch('http://localhost:3001/api/catalog/asset-rentals/rentals', {
      method: 'POST',
      body: {
        item_name: itemName.value,
        asset_tag: assetTag.value,
        owner_bu_id: ownerBuId.value,
        rented_to_bu_id: rentedToBuId.value,
        owner_name: ownerName.value,
        renter_name: renterName.value,
        start_date: startDate.value,
        end_date: endDate.value,
      },
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    successMsg.value = 'บันทึกการเช่าข้ามหน่วยงานสำเร็จเรียบร้อยแล้ว';
    itemName.value = '';
    assetTag.value = '';
    ownerName.value = '';
    renterName.value = '';
    await loadData();
  } catch (err: any) {
    errorMsg.value = err.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isExpired = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

onMounted(() => {
  loadData();
  loadBusinessUnits();
});
</script>
