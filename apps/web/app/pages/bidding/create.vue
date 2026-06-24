<template>
  <div class="space-y-6 max-w-4xl mx-auto bg-white p-8 border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)]">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">สร้างใบเชิญชวนเสนอราคา (Create RFQ Bidding)</h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          กรอกรายละเอียดสินค้า กำหนดวันปิดเสนอราคา และเลือกเชิญผู้จำหน่ายอย่างน้อย 3 รายเข้าร่วม
        </p>
      </div>
      <NuxtLink to="/bidding">
        <UButton variant="outline" size="sm">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 mr-1" />
          ย้อนกลับ
        </UButton>
      </NuxtLink>
    </div>

    <!-- Error Banner -->
    <div v-if="errorMsg" class="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="submitRFQ" class="space-y-6">
      <!-- Info Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="หัวข้อโครงการประมูล (Bidding Title) *" name="title" required>
          <UInput v-model="title" placeholder="เช่น โครงการจัดซื้อคอมพิวเตอร์สำนักงานใหญ่ประจำไตรมาส" size="md" class="mt-1" />
        </UFormField>

        <UFormField label="วันปิดรับซองข้อเสนอ (Closing Date) *" name="closeDate" required>
          <UInput v-model="closeDate" type="datetime-local" size="md" class="mt-1" />
        </UFormField>
      </div>

      <!-- Bid Type & Round Number -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="ประเภทการประมูล (Bid Type) *" name="bidType" required>
          <select 
            v-model="bidType" 
            class="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mt-1 h-9"
          >
            <option value="RFQ_Closed">RFQ (แบบปิดทั่วไป)</option>
            <option value="SealedBid">Sealed Bid (ซองปิดปกปิดราคากลาง)</option>
            <option value="OpenAuction">Open Auction (การประมูลแบบเปิดเผยราคา)</option>
          </select>
        </UFormField>

        <UFormField label="รอบการประมูล (Round Number) *" name="roundNo" required>
          <UInput v-model.number="roundNo" type="number" min="1" size="md" class="mt-1" />
        </UFormField>
      </div>

      <!-- Weights for Technical & Commercial Evaluation (only for RFQ / Sealed Bid) -->
      <div v-if="bidType === 'RFQ_Closed' || bidType === 'SealedBid'" class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
        <UFormField label="สัดส่วนคะแนนเทคนิค (Technical Weight %) *" name="technicalWeight" required>
          <UInput v-model.number="technicalWeight" type="number" min="0" max="100" size="md" class="mt-1" @update:model-value="adjustWeights('technical')" />
        </UFormField>

        <UFormField label="สัดส่วนคะแนนราคา (Commercial Weight %) *" name="commercialWeight" required>
          <UInput v-model.number="commercialWeight" type="number" min="0" max="100" size="md" class="mt-1" @update:model-value="adjustWeights('commercial')" />
        </UFormField>
      </div>

      <UFormField label="รายละเอียดข้อกำหนดเพิ่มเติม (Bidding Description)" name="description">
        <UTextarea v-model="description" placeholder="ระบุเงื่อนไข ขอบเขตงาน (TOR) หรือวิธีการพิจารณา..." rows="3" class="mt-1" />
      </UFormField>

      <!-- Bid Items Table -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-[var(--foreground)] flex items-center gap-1">
            <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-[var(--primary)]" />
            รายการสินค้า/บริการที่จัดหา *
          </h3>
          <UButton @click="addItem" variant="outline" size="xs">
            <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 mr-1" />
            เพิ่มรายการ
          </UButton>
        </div>

        <div class="border border-[var(--border)] rounded-xl overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)]">
                <th class="p-3">ชื่อสินค้า / บริการ</th>
                <th class="p-3" style="width: 180px;">ประเภทรูปแบบ</th>
                <th class="p-3 text-right" style="width: 100px;">จำนวน</th>
                <th class="p-3" style="width: 110px;">หน่วยนับ</th>
                <th class="p-3 text-center" style="width: 60px;"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="(item, idx) in items" :key="idx">
                <td class="p-2">
                  <UInput v-model="item.item_name" placeholder="ระบุชื่อรายละเอียดสินค้า..." size="sm" />
                </td>
                <td class="p-2">
                  <select 
                    v-model="item.item_type" 
                    class="w-full px-2 py-1.5 text-xs border border-[var(--border)] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] h-8"
                  >
                    <option v-for="t in itemTypes" :key="t.type_code" :value="t.type_code">{{ t.type_name }}</option>
                  </select>
                </td>
                <td class="p-2">
                  <UInput v-model.number="item.quantity" type="number" min="0.01" size="sm" class="text-right" />
                </td>
                <td class="p-2">
                  <UInput v-model="item.uom" placeholder="เครื่อง, ลัง, ชิ้น..." size="sm" />
                </td>
                <td class="p-2 text-center">
                  <button @click.prevent="removeItem(idx)" class="text-[var(--destructive)] hover:text-red-700 transition">
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="5" class="text-center py-6 text-xs text-[var(--muted-foreground)]">
                  กรุณาเพิ่มอย่างน้อย 1 รายการ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Invited Vendors -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-[var(--foreground)] flex items-center gap-1">
          <UIcon name="i-heroicons-users" class="w-4 h-4 text-[var(--primary)]" />
          เชิญผู้จำหน่ายเข้าร่วมเสนอราคา (เลือกอย่างน้อย 3 ราย) *
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-[var(--border)] rounded-xl max-h-56 overflow-y-auto">
          <label 
            v-for="vendor in vendors" 
            :key="vendor.vendor_id"
            class="flex items-start gap-2.5 p-2 hover:bg-slate-50 transition rounded-lg border border-slate-100 cursor-pointer text-xs"
          >
            <input 
              type="checkbox" 
              v-model="selectedVendors" 
              :value="vendor.vendor_id"
              class="w-4 h-4 rounded text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)] mt-0.5 cursor-pointer"
            />
            <div>
              <span class="font-bold text-[var(--foreground)] block">{{ vendor.vendor_name }}</span>
              <span class="text-[10px] text-[var(--muted-foreground)]">Tax ID: {{ vendor.tax_id }} | {{ vendor.business_category }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Submit button -->
      <div class="border-t border-[var(--border)] pt-4 flex justify-end gap-3">
        <NuxtLink to="/bidding">
          <UButton variant="outline" size="md">ยกเลิก</UButton>
        </NuxtLink>
        <UButton 
          type="submit" 
          color="primary" 
          size="md"
          :loading="isLoading"
          :disabled="selectedVendors.length < 3 || items.length === 0"
          class="font-semibold shadow-sm cursor-pointer"
        >
          เปิดโครงการประมูล (Save & Open)
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const title = ref('');
const description = ref('');
// Default close date in 7 days
const closeDate = ref(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
const bidType = ref('RFQ_Closed');
const roundNo = ref(1);
const technicalWeight = ref(40);
const commercialWeight = ref(60);

const adjustWeights = (source: string) => {
  if (source === 'technical') {
    commercialWeight.value = Math.max(0, 100 - Number(technicalWeight.value || 0));
  } else {
    technicalWeight.value = Math.max(0, 100 - Number(commercialWeight.value || 0));
  }
};
const itemTypes = ref<any[]>([]);
const items = ref<any[]>([
  { item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', item_type: 'Goods', quantity: 30, uom: 'เครื่อง' }
]);
const vendors = ref<any[]>([]);
const selectedVendors = ref<string[]>([]);

const errorMsg = ref('');
const isLoading = ref(false);

const loadItemTypes = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/catalog/item-types', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    itemTypes.value = res;
  } catch (err) {
    console.warn('Backend offline, loading mock item types.');
    itemTypes.value = [
      { type_code: 'Goods', type_name: 'สินค้า / ครุภัณฑ์' },
      { type_code: 'Service', type_name: 'งานบริการ' },
      { type_code: 'Rental', type_name: 'การเช่าสินทรัพย์ (Rental)' },
      { type_code: 'License', type_name: 'สิทธิ์การใช้งาน (License)' },
    ];
  }
};

const loadVendors = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/vendor?status=Active', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    vendors.value = res;
  } catch (err) {
    console.warn('Backend offline, loading mock active vendors.');
    vendors.value = [
      { vendor_id: '00000008-0000-0000-0000-000000000001', tax_id: '0105561012345', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', business_category: 'อุปกรณ์ไอที' },
      { vendor_id: '00000008-0000-0000-0000-000000000002', tax_id: '0105562023456', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', business_category: 'อุปกรณ์ไอที/บริการ' },
      { vendor_id: '00000008-0000-0000-0000-000000000003', tax_id: '0105563034567', vendor_name: 'บริษัท ออฟฟิศ เทค จำกัด', business_category: 'เครื่องใช้สำนักงาน' },
      { vendor_id: '00000008-0000-0000-0000-000000000004', tax_id: '0105564045678', vendor_name: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด', business_category: 'วัสดุสิ้นเปลือง/เซฟตี้' },
      { vendor_id: '00000008-0000-0000-0000-000000000005', tax_id: '0105565056789', vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด', business_category: 'เฟอร์นิเจอร์' },
      { vendor_id: '00000008-0000-0000-0000-000000000013', tax_id: '0105563134567', vendor_name: 'บริษัท เทคโนโลยี เน็กซ์ จำกัด', business_category: 'อุปกรณ์ไอที' },
    ];
  }
};

const addItem = () => {
  items.value.push({ item_name: '', item_type: itemTypes.value[0]?.type_code || 'Goods', quantity: 1, uom: 'ชิ้น' });
};

const removeItem = (idx: number) => {
  items.value.splice(idx, 1);
};

const submitRFQ = async () => {
  if (selectedVendors.value.length < 3) {
    errorMsg.value = 'ระเบียบจัดซื้อกำหนดให้ต้องเชิญผู้เสนอราคาอย่างน้อย 3 รายขึ้นไป';
    return;
  }
  errorMsg.value = '';
  isLoading.value = true;

  const payload = {
    title: title.value,
    description: description.value,
    close_date: new Date(closeDate.value).toISOString(),
    items: items.value,
    vendor_ids: selectedVendors.value,
    bid_type: bidType.value,
    round_no: Number(roundNo.value) || 1,
    technical_weight: Number(technicalWeight.value) || 0,
    commercial_weight: Number(commercialWeight.value) || 100,
  };

  try {
    await $fetch('http://localhost:3001/api/bidding/rfq', {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    alert('เปิดโครงการประมูลและเชิญคู่ค้าเรียบร้อยแล้ว!');
    navigateTo('/bidding');
  } catch (err: any) {
    console.warn('Backend submit failed. Simulating success.');
    alert('[MOCK] บันทึกและเปิดโครงการประมูลสำเร็จ (Simulated)');
    navigateTo('/bidding');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadVendors();
  loadItemTypes();
});
</script>
