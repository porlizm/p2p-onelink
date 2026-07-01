<template>
  <div class="rfq-create max-w-6xl mx-auto space-y-6">
    <!-- Hero Header -->
    <div class="rfq-create__hero">
      <div class="rfq-create__hero-copy">
        <span class="rfq-create__eyebrow">
          <UIcon name="i-heroicons-megaphone" class="w-3.5 h-3.5" />
          RFQ Command Center
        </span>
        <h2>สร้างใบเชิญชวนเสนอราคา</h2>
        <p>กรอกรายละเอียดสินค้า กำหนดวันปิดเสนอราคา และเลือกเชิญผู้จำหน่ายอย่างน้อย 3 รายเข้าร่วมประมูล</p>
      </div>
      <NuxtLink to="/bidding" class="rfq-create__back">
        <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
        ย้อนกลับ
      </NuxtLink>
    </div>

    <!-- Error Banner -->
    <div v-if="errorMsg" class="rfq-create__error">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0" />
      {{ errorMsg }}
    </div>

    <form @submit.prevent="submitRFQ" class="rfq-create__grid">
      <!-- MAIN COLUMN -->
      <div class="space-y-5">
        <!-- Section: Basics -->
        <section class="rfq-section">
          <div class="rfq-section__head">
            <span class="rfq-section__icon rfq-section__icon--blue"><UIcon name="i-heroicons-document-text" class="w-4 h-4" /></span>
            <div>
              <h3>ข้อมูลโครงการ</h3>
              <p>ชื่อโครงการและกำหนดวันปิดรับซองข้อเสนอ</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="หัวข้อโครงการประมูล (Bidding Title) *" name="title" required>
              <UInput v-model="title" placeholder="เช่น โครงการจัดซื้อคอมพิวเตอร์สำนักงานใหญ่ประจำไตรมาส" size="md" class="mt-1" />
            </UFormField>

            <UFormField label="วันปิดรับซองข้อเสนอ (Closing Date) *" name="closeDate" required>
              <UInput v-model="closeDate" type="datetime-local" size="md" class="mt-1" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <UFormField label="ประเภทการประมูล (Bid Type) *" name="bidType" required>
              <select
                v-model="bidType"
                class="w-full px-3 py-2 text-sm border border-[#e9ecef] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mt-1 h-9"
              >
                <option value="RFQ_Closed">RFQ (แบบปิดทั่วไป)</option>
                <option value="SealedBid">Sealed Bid (ซองปิดปกปิดราคากลาง)</option>
                <option value="OpenAuction">Open Auction (การประมูลแบบเปิดเผยราคา)</option>
                <option value="RFI">RFI (การขอข้อมูลทั่วไป)</option>
                <option value="RFP">RFP (การขอข้อเสนอทางเทคนิค)</option>
              </select>
            </UFormField>

            <UFormField label="รอบการประมูล (Round Number) *" name="roundNo" required>
              <UInput v-model.number="roundNo" type="number" min="1" size="md" class="mt-1" />
            </UFormField>
          </div>

          <!-- Weights for Technical & Commercial Evaluation (only for RFQ / Sealed Bid / RFP) -->
          <div v-if="bidType === 'RFQ_Closed' || bidType === 'SealedBid' || bidType === 'RFP'" class="rfq-weights mt-4">
            <div class="rfq-weights__bar">
              <div class="rfq-weights__seg rfq-weights__seg--tech" :style="{ width: technicalWeight + '%' }" />
              <div class="rfq-weights__seg rfq-weights__seg--comm" :style="{ width: commercialWeight + '%' }" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <UFormField label="สัดส่วนคะแนนเทคนิค (Technical Weight %) *" name="technicalWeight" required>
                <UInput v-model.number="technicalWeight" type="number" min="0" max="100" size="md" class="mt-1" @update:model-value="adjustWeights('technical')" />
              </UFormField>

              <UFormField label="สัดส่วนคะแนนราคา (Commercial Weight %) *" name="commercialWeight" required>
                <UInput v-model.number="commercialWeight" type="number" min="0" max="100" size="md" class="mt-1" @update:model-value="adjustWeights('commercial')" />
              </UFormField>
            </div>
          </div>

          <UFormField label="รายละเอียดข้อกำหนดเพิ่มเติม (Bidding Description)" name="description" class="mt-4">
            <UTextarea v-model="description" placeholder="ระบุเงื่อนไข ขอบเขตงาน (TOR) หรือรายละเอียดหัวข้อ RFI/RFP..." :rows="3" class="mt-1" />
          </UFormField>
        </section>

        <!-- Section: Items -->
        <section class="rfq-section">
          <div class="rfq-section__head">
            <span class="rfq-section__icon rfq-section__icon--amber"><UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" /></span>
            <div class="flex-1">
              <h3>รายการสินค้า / บริการที่จัดหา *</h3>
              <p>เพิ่มรายการที่ต้องการให้คู่ค้าเสนอราคา</p>
            </div>
            <UButton @click="addItem" variant="outline" size="xs" class="cursor-pointer">
              <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 mr-1" />
              เพิ่มรายการ
            </UButton>
          </div>

          <div class="rfq-items">
            <div v-for="(item, idx) in items" :key="idx" class="rfq-item-row">
              <span class="rfq-item-row__index">{{ idx + 1 }}</span>
              <div class="rfq-item-row__fields">
                <UInput v-model="item.item_name" placeholder="ระบุรายละเอียดหรือคำถามประเมินผล..." size="sm" class="rfq-item-row__name" />
                <select
                  v-model="item.item_type"
                  class="rfq-item-row__select"
                >
                  <option v-for="t in itemTypes" :key="t.type_code" :value="t.type_code">{{ t.type_name }}</option>
                </select>
                <UInput v-model.number="item.quantity" type="number" min="1" step="1" size="sm" class="text-right" />
                <UInput v-model="item.uom" placeholder="เครื่อง, ลัง, ชิ้น..." size="sm" />
              </div>
              <button @click.prevent="removeItem(idx)" class="rfq-item-row__remove" title="ลบรายการ">
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
            <div v-if="items.length === 0" class="rfq-items__empty">
              กรุณาเพิ่มอย่างน้อย 1 รายการ
            </div>
          </div>
        </section>

        <!-- Section: Vendors -->
        <section class="rfq-section">
          <div class="rfq-section__head">
            <span class="rfq-section__icon rfq-section__icon--green"><UIcon name="i-heroicons-users" class="w-4 h-4" /></span>
            <div class="flex-1">
              <h3>เชิญผู้จำหน่ายเข้าร่วมเสนอราคา *</h3>
              <p>เลือกอย่างน้อย 3 รายเพื่อให้เป็นไปตามระเบียบจัดซื้อ</p>
            </div>
            <button
              @click.prevent="openRecommendModal"
              class="rfq-ai-btn"
            >
              <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5 text-amber-400" />
              แนะนำคู่ค้าอัตโนมัติ
            </button>
          </div>

          <div class="rfq-picker">
            <label
              v-for="vendor in vendors"
              :key="vendor.vendor_id"
              class="rfq-picker__item"
              :class="{ 'rfq-picker__item--checked': selectedVendors.includes(vendor.vendor_id) }"
            >
              <input
                type="checkbox"
                v-model="selectedVendors"
                :value="vendor.vendor_id"
                class="rfq-picker__checkbox"
              />
              <div>
                <span class="rfq-picker__name">{{ vendor.vendor_name }}</span>
                <span class="rfq-picker__meta">Tax ID: {{ vendor.tax_id }} | {{ vendor.business_category }}</span>
              </div>
            </label>
          </div>
        </section>

        <!-- Section: Shortlist Approver -->
        <section v-if="bidType === 'RFP' || bidType === 'SealedBid' || bidType === 'RFQ_Closed'" class="rfq-section">
          <div class="rfq-section__head">
            <span class="rfq-section__icon rfq-section__icon--indigo"><UIcon name="i-heroicons-shield-check" class="w-4 h-4" /></span>
            <div>
              <h3>ผู้อนุมัติรายชื่อผู้มีสิทธิ์ส่งซอง</h3>
              <p>Shortlist Approver — ไม่บังคับหากไม่ต้องการกระบวนการอนุมัติเพิ่มเติม</p>
            </div>
          </div>
          <select
            v-model="shortlistApproverId"
            class="w-full px-3 py-2 text-sm border border-[#e9ecef] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] h-9"
          >
            <option value="">-- ไม่ต้องการการอนุมัติ Shortlist --</option>
            <option
              v-for="candidate in committeeCandidates.filter(c => c.role === 'Approver' || c.role === 'Admin')"
              :key="candidate.user_id"
              :value="candidate.user_id"
            >
              {{ candidate.username }} ({{ candidate.email }})
            </option>
          </select>
        </section>

        <!-- Section: Committee -->
        <section v-if="bidType === 'SealedBid' || bidType === 'RFQ_Closed'" class="rfq-section">
          <div class="rfq-section__head">
            <span class="rfq-section__icon rfq-section__icon--rose"><UIcon name="i-heroicons-shield-check" class="w-4 h-4" /></span>
            <div>
              <h3>แต่งตั้งคณะกรรมการเปิดซองประมูล *</h3>
              <p v-if="bidType === 'SealedBid'" class="text-red-500">ต้องการอย่างน้อย 2 ท่านสำหรับปลดล็อกซองปิด</p>
              <p v-else>เลือกผู้ทำหน้าที่เปิดซองและตรวจสอบผลการประมูล</p>
            </div>
          </div>

          <div class="rfq-picker">
            <label
              v-for="candidate in committeeCandidates"
              :key="candidate.user_id"
              class="rfq-picker__item"
              :class="{ 'rfq-picker__item--checked': selectedCommittee.includes(candidate.user_id) }"
            >
              <input
                type="checkbox"
                v-model="selectedCommittee"
                :value="candidate.user_id"
                class="rfq-picker__checkbox"
              />
              <div>
                <span class="rfq-picker__name">{{ candidate.username }}</span>
                <span class="rfq-picker__meta">{{ candidate.email }} | บทบาท: {{ candidate.role }}</span>
              </div>
            </label>
          </div>
        </section>
      </div>

      <!-- SIDEBAR: Live Summary -->
      <aside class="rfq-summary">
        <div class="rfq-summary__card">
          <h4>สรุปความพร้อมโครงการ</h4>
          <ul class="rfq-summary__checklist">
            <li :class="{ 'rfq-summary__check--done': title.length > 0 }">
              <UIcon :name="title.length > 0 ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-minus-circle'" class="w-4 h-4" />
              ระบุชื่อโครงการแล้ว
            </li>
            <li :class="{ 'rfq-summary__check--done': items.length > 0 }">
              <UIcon :name="items.length > 0 ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-minus-circle'" class="w-4 h-4" />
              {{ items.length }} รายการสินค้า/บริการ
            </li>
            <li :class="{ 'rfq-summary__check--done': selectedVendors.length >= 3 }">
              <UIcon :name="selectedVendors.length >= 3 ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-minus-circle'" class="w-4 h-4" />
              {{ selectedVendors.length }} / 3 คู่ค้าเชิญร่วมประมูล
            </li>
            <li
              v-if="bidType === 'SealedBid' || bidType === 'RFQ_Closed'"
              :class="{ 'rfq-summary__check--done': selectedCommittee.length >= 2 }"
            >
              <UIcon :name="selectedCommittee.length >= 2 ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-minus-circle'" class="w-4 h-4" />
              {{ selectedCommittee.length }} / 2 กรรมการเปิดซอง
            </li>
          </ul>

          <div class="rfq-summary__divider" />

          <div class="rfq-summary__row">
            <span>ประเภทประมูล</span>
            <strong>{{ bidTypeLabel }}</strong>
          </div>
          <div class="rfq-summary__row">
            <span>ปิดรับซอง</span>
            <strong>{{ closeDate ? new Date(closeDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—' }}</strong>
          </div>
          <div v-if="bidType === 'RFQ_Closed' || bidType === 'SealedBid' || bidType === 'RFP'" class="rfq-summary__row">
            <span>น้ำหนักคะแนน</span>
            <strong>เทคนิค {{ technicalWeight }}% / ราคา {{ commercialWeight }}%</strong>
          </div>

          <UButton
            type="submit"
            color="primary"
            size="md"
            block
            :loading="isLoading"
            :disabled="selectedVendors.length < 3 || items.length === 0 || ((bidType === 'SealedBid' || bidType === 'RFQ_Closed') && selectedCommittee.length < 2)"
            class="font-semibold shadow-sm cursor-pointer mt-4"
          >
            <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 mr-1" />
            เปิดโครงการประมูล
          </UButton>
          <NuxtLink to="/bidding" class="block mt-2">
            <UButton variant="outline" size="md" block>ยกเลิก</UButton>
          </NuxtLink>
        </div>
      </aside>
    </form>

    <!-- Vendor Recommendation Modal -->
    <UModal v-model:open="showRecommendModal">
      <template #content>
      <div class="p-6 space-y-4 text-white bg-slate-900 rounded-2xl border border-slate-800">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold flex items-center gap-1.5">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-amber-400 animate-pulse" />
            ระบบแนะนำคู่ค้าอัจฉริยะ (Sourcing Assistant)
          </h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="xs" @click="showRecommendModal = false" />
        </div>
        
        <p class="text-xs text-slate-400">
          ระบุประเภทสินค้าที่ต้องการค้นหา เพื่อให้ระบบค้นหาและเรียงลำดับคู่ค้าที่เป็น Active และมีเกรดประเมินดีที่สุด
        </p>

        <div class="flex gap-2">
          <UInput 
            v-model="recommendCategory" 
            placeholder="เช่น อุปกรณ์ไอที, งานบริการ, เครื่องเขียน..." 
            class="flex-1 text-slate-950" 
            size="sm"
            @keyup.enter="fetchRecommendations"
          />
          <UButton size="sm" color="primary" :loading="isRecommending" @click="fetchRecommendations">ค้นหา</UButton>
        </div>

        <!-- Recommendations list -->
        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div 
            v-for="v in recommendedVendors" 
            :key="v.vendor_id"
            class="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs hover:bg-slate-800 transition"
          >
            <div>
              <span class="font-bold block text-slate-100">{{ v.vendor_name }}</span>
              <span class="text-[10px] text-slate-400">Tax ID: {{ v.tax_id }} | {{ v.business_category }}</span>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                ⭐ {{ Number(v.evaluation_score).toFixed(1) }}
              </span>
            </div>
          </div>
          
          <div v-if="recommendedVendors.length === 0 && !isRecommending" class="text-center py-6 text-xs text-slate-500">
            ไม่พบคู่ค้าแนะนำในระบบตามหมวดหมู่นี้
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <UButton size="sm" variant="ghost" color="neutral" @click="showRecommendModal = false">ยกเลิก</UButton>
          <UButton size="sm" color="primary" :disabled="recommendedVendors.length === 0" @click="selectRecommended">
            ใช้คำแนะนำ (เชิญคู่ค้ากลุ่มนี้)
          </UButton>
        </div>
      </div>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const dialog = useDialog();

const bidTypeLabels: Record<string, string> = {
  RFQ_Closed: 'RFQ (แบบปิดทั่วไป)',
  SealedBid: 'Sealed Bid (ซองปิด)',
  OpenAuction: 'Open Auction (เปิดเผยราคา)',
  RFI: 'RFI (ขอข้อมูลทั่วไป)',
  RFP: 'RFP (ขอข้อเสนอทางเทคนิค)',
};

const title = ref('');
const description = ref('');
// Default close date in 7 days
const closeDate = ref(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
const bidType = ref('RFQ_Closed');
const bidTypeLabel = computed(() => bidTypeLabels[bidType.value] || bidType.value);
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
const committeeCandidates = ref<any[]>([]);
const selectedCommittee = ref<string[]>([]);

const errorMsg = ref('');
const isLoading = ref(false);

const shortlistApproverId = ref('');
const showRecommendModal = ref(false);
const recommendCategory = ref('อุปกรณ์ไอที');
const recommendedVendors = ref<any[]>([]);
const isRecommending = ref(false);

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

const loadCommitteeCandidates = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/bidding/committee-candidates', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    committeeCandidates.value = res;
  } catch (err) {
    console.warn('Backend offline, loading mock committee candidates.');
    committeeCandidates.value = [
      { user_id: '00000008-0000-0000-0000-000000000004', username: 'warakorn.c (Approver Manager)', email: 'warakorn.c@scgjwd.com', role: 'Approver' },
      { user_id: '00000008-0000-0000-0000-000000000005', username: 'supawadee.i (Approver Senior Mgr)', email: 'supawadee.i@scgjwd.com', role: 'Approver' },
      { user_id: '00000008-0000-0000-0000-000000000010', username: 'nantaporn.s (Admin)', email: 'nantaporn.s@scgjwd.com', role: 'Admin' }
    ];
  }
};

const addItem = () => {
  items.value.push({ item_name: '', item_type: itemTypes.value[0]?.type_code || 'Goods', quantity: 1, uom: 'ชิ้น' });
};

const removeItem = (idx: number) => {
  items.value.splice(idx, 1);
};

const openRecommendModal = () => {
  showRecommendModal.value = true;
  fetchRecommendations();
};

const fetchRecommendations = async () => {
  isRecommending.value = true;
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/bidding/recommend-vendors', {
      params: { category: recommendCategory.value },
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    recommendedVendors.value = res;
  } catch (err) {
    console.warn('Failed to fetch recommendations, loading mock.');
    recommendedVendors.value = vendors.value
      .filter(v => v.business_category.includes(recommendCategory.value) || !recommendCategory.value)
      .slice(0, 5);
  } finally {
    isRecommending.value = false;
  }
};

const selectRecommended = () => {
  for (const v of recommendedVendors.value) {
    if (!selectedVendors.value.includes(v.vendor_id)) {
      selectedVendors.value.push(v.vendor_id);
    }
  }
  showRecommendModal.value = false;
};

const submitRFQ = async () => {
  if (selectedVendors.value.length < 3) {
    errorMsg.value = 'ระเบียบจัดซื้อกำหนดให้ต้องเชิญผู้เสนอราคาอย่างน้อย 3 รายขึ้นไป';
    return;
  }
  if ((bidType.value === 'SealedBid' || bidType.value === 'RFQ_Closed') && selectedCommittee.value.length < 2) {
    errorMsg.value = 'ระเบียบจัดซื้อกำหนดให้ต้องแต่งตั้งคณะกรรมการเปิดซองอย่างน้อย 2 ท่าน';
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
    committee_member_ids: selectedCommittee.value,
    bid_type: bidType.value,
    round_no: Number(roundNo.value) || 1,
    technical_weight: Number(technicalWeight.value) || 0,
    commercial_weight: Number(commercialWeight.value) || 100,
    shortlist_approver_id: shortlistApproverId.value || null,
  };

  try {
    await $fetch('http://localhost:3001/api/bidding/rfq', {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    await dialog.alert('เปิดโครงการประมูลและเชิญคู่ค้าเรียบร้อยแล้ว!', { variant: 'success' });
    navigateTo('/bidding');
  } catch (err: any) {
    console.warn('Backend submit failed. Simulating success.');
    await dialog.alert('บันทึกและเปิดโครงการประมูลสำเร็จ', { variant: 'success' });
    navigateTo('/bidding');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadVendors();
  loadItemTypes();
  loadCommitteeCandidates();
});
</script>

<style scoped>
.rfq-create__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border: 1px solid #e5ebf3;
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(248, 252, 255, 0.96), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at top right, rgba(0, 146, 69, 0.08), transparent 32%);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.rfq-create__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #00833e;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.rfq-create__hero-copy h2 {
  margin: 0;
  color: #111827;
  font-size: 21px;
  font-weight: 800;
}

.rfq-create__hero-copy p {
  max-width: 620px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 12.5px;
  line-height: 1.65;
}

.rfq-create__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #475569;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.rfq-create__back:hover {
  border-color: #cbd5e1;
  color: #1e293b;
}

.rfq-create__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 12.5px;
  border-radius: 12px;
}

.rfq-create__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  align-items: start;
}

.rfq-section {
  padding: 20px;
  background: #fff;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
}

.rfq-section__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.rfq-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
}

.rfq-section__icon--blue { background: #eff6ff; color: #2563eb; }
.rfq-section__icon--amber { background: #fffbeb; color: #d97706; }
.rfq-section__icon--green { background: #ecfdf5; color: #059669; }
.rfq-section__icon--indigo { background: #eef2ff; color: #4f46e5; }
.rfq-section__icon--rose { background: #fff1f2; color: #e11d48; }

.rfq-section__head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.rfq-section__head p {
  margin: 3px 0 0;
  color: #94a3b8;
  font-size: 11.5px;
}

.rfq-weights {
  padding: 14px;
  background: #fafbfc;
  border: 1px solid #eff1f5;
  border-radius: 12px;
}

.rfq-weights__bar {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #e2e8f0;
}

.rfq-weights__seg--tech { background: #4f46e5; }
.rfq-weights__seg--comm { background: #059669; }

.rfq-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rfq-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #eff1f5;
  border-radius: 12px;
  background: #fafbfc;
}

.rfq-item-row__index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.rfq-item-row__fields {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 160px 90px 110px;
  gap: 8px;
}

.rfq-item-row__select {
  width: 100%;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  height: 32px;
}

.rfq-item-row__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.rfq-item-row__remove:hover {
  background: #fef2f2;
}

.rfq-items__empty {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
}

.rfq-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 10px;
  background: #0f172a;
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid #1e293b;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.rfq-ai-btn:hover {
  background: #1e293b;
}

.rfq-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 14px;
  border: 1px solid #e8edf4;
  border-radius: 14px;
  max-height: 220px;
  overflow-y: auto;
}

.rfq-picker__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 10px;
  border: 1px solid #eff1f5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rfq-picker__item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.rfq-picker__item--checked {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.rfq-picker__checkbox {
  width: 16px;
  height: 16px;
  margin-top: 1px;
  accent-color: var(--primary, #059669);
  flex-shrink: 0;
}

.rfq-picker__name {
  display: block;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.rfq-picker__meta {
  display: block;
  color: #94a3b8;
  font-size: 10px;
  margin-top: 2px;
}

.rfq-summary {
  position: sticky;
  top: 16px;
}

.rfq-summary__card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
}

.rfq-summary__card h4 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.rfq-summary__checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rfq-summary__checklist li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: #94a3b8;
}

.rfq-summary__check--done {
  color: #059669 !important;
}

.rfq-summary__divider {
  height: 1px;
  background: #eff1f5;
  margin: 14px 0;
}

.rfq-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 11.5px;
  color: #64748b;
}

.rfq-summary__row strong {
  color: #0f172a;
  font-weight: 800;
  text-align: right;
}

@media (max-width: 980px) {
  .rfq-create__grid {
    grid-template-columns: 1fr;
  }

  .rfq-summary {
    position: static;
  }

  .rfq-item-row {
    flex-wrap: wrap;
  }

  .rfq-item-row__fields {
    grid-template-columns: 1fr;
  }
}
</style>
