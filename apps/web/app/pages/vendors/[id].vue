<template>
  <div class="vendor-like-page max-w-4xl mx-auto pb-12">
    <!-- Header Back -->
    <div class="flex items-center gap-3">
      <UButton 
        to="/vendors" 
        color="neutral" 
        variant="ghost" 
        size="sm"
      >
        <UIcon name="i-heroicons-arrow-left-20-solid" class="w-5 h-5 mr-1" />
        ย้อนกลับไปหน้ารายชื่อ
      </UButton>
    </div>

    <!-- Vendor Title Area -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">{{ vendor?.vendor_name }}</h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          ลงข้อมูลเมื่อ: {{ formatDate(vendor?.registered_date) }} | เลขประจำตัวผู้เสียภาษี: {{ vendor?.tax_id }}
        </p>
      </div>
      <div>
        <StatusBadge :status="vendor?.status || 'PendingRegistration'" />
      </div>
    </div>

    <!-- Main Grid Details -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- General and Address Info (2/3 width) -->
      <div class="md:col-span-2 space-y-6">
        <!-- Details Card -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-3">
              <UIcon name="i-heroicons-building-office-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ข้อมูลที่ตั้งและประเภทธุรกิจ</h3>
            </div>
          </template>

          <div class="space-y-4 text-sm mt-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">ประเภทธุรกิจ</span>
                <span class="font-medium text-[var(--foreground)]">{{ vendor?.vendor_type }}</span>
              </div>
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">หมวดหมู่</span>
                <span class="font-medium text-[var(--foreground)]">{{ vendor?.business_category }}</span>
              </div>
            </div>

            <div v-if="address">
              <span class="text-xs text-[var(--muted-foreground)] block">ที่อยู่สำนักงานใหญ่</span>
              <span class="font-medium text-[var(--foreground)]">
                {{ address.address_line1 }} {{ address.address_line2 }} ต.{{ address.subdistrict }} อ.{{ address.district }} จ.{{ address.province }} {{ address.postal_code }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Contacts Card -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-3">
              <UIcon name="i-heroicons-user-group-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ผู้ติดต่อประสานงาน</h3>
            </div>
          </template>

          <div v-if="contact" class="space-y-3 mt-3 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ชื่อ-นามสกุล</span>
              <span class="font-medium text-[var(--foreground)]">{{ contact.contact_name }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">เบอร์โทรศัพท์</span>
                <span class="font-medium text-[var(--foreground)]">{{ contact.phone }}</span>
              </div>
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">อีเมล</span>
                <span class="font-medium text-[var(--foreground)]">{{ contact.email }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Financial & Documents Info (1/3 width) -->
      <div class="space-y-6">
        <!-- AI Vendor Sentiment & Insights Card -->
        <UCard class="border-2 border-green-600/30 shadow-md rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-b from-green-50/20 to-white">
          <template #header>
            <div class="flex items-center justify-between border-b border-[#eff1f5] pb-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--primary)] animate-pulse" />
                <h3 class="font-extrabold text-sm text-[var(--fg-primary)] uppercase tracking-wider">AI Smart Vendor Insights</h3>
              </div>
              <span class="text-[9px] bg-[var(--primary)] text-white px-2 py-0.5 rounded-full font-bold">LIVE AUDIT</span>
            </div>
          </template>

          <div class="space-y-4 mt-3 text-xs">
            <!-- Sentiment and Risk overview row -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Sentiment card -->
              <div class="bg-[#fafbfc] border border-[#eff1f5] rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">Sentiment Index</span>
                <div class="flex items-end gap-1.5 mt-1.5">
                  <span class="text-xl font-black text-slate-800">{{ aiInsights.sentimentScore }}%</span>
                  <span class="text-[10px] font-bold text-green-600 pb-0.5">{{ aiInsights.sentiment }}</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div class="bg-green-500 h-1.5 rounded-full transition-all duration-500" :style="`width: ${aiInsights.sentimentScore}%`"></div>
                </div>
              </div>

              <!-- Risk level card -->
              <div class="bg-[#fafbfc] border border-[#eff1f5] rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">AI Risk Level</span>
                <div class="flex items-end gap-1.5 mt-1.5">
                  <span class="text-xl font-black text-slate-800">{{ aiInsights.riskScore }}%</span>
                  <span class="text-[10px] font-bold pb-0.5" :class="aiInsights.riskLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'">
                    {{ aiInsights.riskLevel }}
                  </span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div class="h-1.5 rounded-full transition-all duration-500" :class="aiInsights.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'" :style="`width: ${aiInsights.riskScore}%`"></div>
                </div>
              </div>
            </div>

            <!-- Performance stats calculated by AI -->
            <div class="space-y-2 border-t pt-3 border-slate-100">
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500">อัตราการส่งมอบตรงเวลา (On-Time Delivery):</span>
                <span class="font-bold text-slate-800">{{ aiInsights.onTimeDelivery }}%</span>
              </div>
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500">คะแนนประเมินคุณภาพสินค้า (Quality Score):</span>
                <span class="font-bold text-slate-800">{{ aiInsights.qualityScore }}%</span>
              </div>
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500 font-medium">ดัชนีแนวโน้มราคา (Price Trend Index):</span>
                <span class="font-bold text-[var(--primary)]">{{ aiInsights.priceIndex }}</span>
              </div>
            </div>

            <!-- Warning and Alerts from AI if any -->
            <div v-if="aiInsights.warnings.length > 0" class="bg-red-50/80 border border-red-200 text-red-800 p-2.5 rounded-lg space-y-1">
              <div class="font-bold flex items-center gap-1 text-[10px]">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-600" />
                <span>AI Risk Warning Flags</span>
              </div>
              <ul class="list-disc list-inside text-[9px] text-red-700 pl-1 space-y-0.5">
                <li v-for="w in aiInsights.warnings" :key="w">{{ w }}</li>
              </ul>
            </div>

            <!-- AI Insight summary text -->
            <div class="bg-green-50/50 border border-green-100/50 rounded-xl p-3 space-y-1.5">
              <div class="font-bold text-green-900 flex items-center gap-1 text-[10px]">
                <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-4 h-4 text-[var(--primary)]" />
                <span>คำแนะนำเชิงกลยุทธ์จาก AI</span>
              </div>
              <p class="text-[10px] text-slate-600 leading-relaxed font-medium">
                {{ aiInsights.insight }}
              </p>
            </div>

            <!-- Analyze action button -->
            <div class="border-t pt-3 border-slate-100 flex justify-end">
              <UButton
                color="primary"
                icon="i-heroicons-sparkles"
                class="w-full text-xs font-bold text-white bg-[var(--primary)] hover:bg-green-700 justify-center cursor-pointer transition-all duration-200 shadow-sm"
                :loading="isAnalyzing"
                @click="triggerAiAnalysis"
              >
                {{ showDetailedReport ? 'วิเคราะห์ข้อมูลซ้ำด้วย AI' : 'วิเคราะห์ข้อมูลเชิงลึกด้วย AI' }}
              </UButton>
            </div>

            <!-- Mock detail report display after trigger -->
            <div v-if="showDetailedReport" class="border border-indigo-100 rounded-xl p-3 bg-indigo-50/30 animate-fadeIn space-y-2 mt-2">
              <div class="font-bold text-slate-800 text-[10px] flex items-center gap-1 border-b border-indigo-100 pb-1.5">
                <UIcon name="i-heroicons-document-magnifying-glass" class="w-4 h-4 text-indigo-600" />
                <span>รายงานพฤติกรรมคู่ค้าและการวิเคราะห์ข่าวสาร (Market Scan)</span>
              </div>
              <div class="text-[9px] text-slate-500 space-y-1">
                <div>• ค้นพบข้อมูล 42 รายการจาก Social Listening & ข่าวสารอุตสาหกรรมในรอบ 30 วัน</div>
                <div>• ดัชนีความมั่นคงทางการเงิน (Altman Z-Score): <span class="font-semibold text-green-600">3.12 (Safe Zone)</span></div>
                <div>• ความเสี่ยงด้านความจุการผลิต (Production Capacity Risk): <span class="font-semibold text-green-600">ต่ำมาก</span></div>
              </div>
            </div>

          </div>
        </UCard>

        <!-- Bank account -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-3">
              <UIcon name="i-heroicons-credit-card-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ข้อมูลการชำระเงิน</h3>
            </div>
          </template>

          <div v-if="bank" class="space-y-3 mt-3 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ธนาคาร</span>
              <span class="font-medium text-[var(--foreground)]">{{ bank.bank_name }}</span>
            </div>
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">เลขที่บัญชี</span>
              <span class="font-mono font-medium text-[var(--foreground)]">{{ bank.account_no }}</span>
            </div>
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ชื่อบัญชี</span>
              <span class="font-medium text-[var(--foreground)]">{{ bank.account_name }}</span>
            </div>
          </div>
        </UCard>

        <!-- Documents links -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-3">
              <UIcon name="i-heroicons-document-arrow-down-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">เอกสารแนบ</h3>
            </div>
          </template>

          <div class="space-y-3 mt-3">
            <div 
              v-for="doc in vendor?.documents" 
              :key="doc.document_id"
              class="flex flex-col p-2 bg-[var(--background)] rounded border border-[#e9ecef] text-xs"
            >
              <span class="font-semibold text-[var(--foreground)]">{{ doc.document_type }}</span>
              <a 
                :href="'http://localhost:3001' + doc.file_url" 
                target="_blank"
                class="text-[var(--primary)] hover:underline mt-1 font-medium flex items-center gap-1"
              >
                <UIcon name="i-heroicons-arrow-top-right-on-square-20-solid" class="w-3.5 h-3.5" />
                เปิดดูไฟล์แนบ
              </a>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Buyer Review and Verification Action Box -->
    <UCard 
      v-if="vendor?.status === 'PendingRegistration'"
      class="border-2 border-[var(--primary)]/20 shadow-[var(--shadow-md)] rounded-[var(--radius-xl)] bg-white"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-badge-20-solid" class="w-5 h-5 text-[var(--primary)]" />
          <h3 class="font-semibold text-sm text-[var(--foreground)]">ตรวจสอบและตัดสินใจอนุมัติคู่ค้า</h3>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-xs text-[var(--muted-foreground)]">
          กรุณาตรวจสอบเอกสารแนบและเลขประจำตัวผู้เสียภาษีให้ถูกต้องครบถ้วนก่อนทำการยืนยันเข้าสู่ระบบ
        </p>

        <!-- Reject comment box -->
        <div v-if="showRejectComment" class="space-y-2">
          <UFormField label="เหตุผลที่ปฏิเสธการลงทะเบียน (จะแจ้งกลับไปที่คู่ค้า)" required>
            <UTextarea 
              v-model="rejectReason" 
              placeholder="ระบุเหตุผล เช่น หนังสือรับรองหมดอายุ หรือ เอกสารหน้า Book Bank ไม่ตรงกับชื่อบริษัท..." 
              size="md"
            />
          </UFormField>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <template v-if="!showRejectComment">
            <button class="vnd-btn vnd-btn--reject" @click="showRejectComment = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              ปฏิเสธ
            </button>
            <button class="vnd-btn vnd-btn--approve" :disabled="isSubmitting" @click="handleApprove">
              <svg v-if="!isSubmitting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
              อนุมัติคู่ค้า
            </button>
          </template>
          <template v-else>
            <button class="vnd-btn vnd-btn--cancel" @click="showRejectComment = false">
              ยกเลิก
            </button>
            <button class="vnd-btn vnd-btn--confirm-reject" :disabled="isSubmitting" @click="handleReject">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              ยืนยันการปฏิเสธ
            </button>
          </template>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const route = useRoute();
const authStore = useAuthStore();
const vendor = ref<any>(null);
const isSubmitting = ref(false);
const showRejectComment = ref(false);
const rejectReason = ref('');

// AI Vendor Sentiment & Insights States
const isAnalyzing = ref(false);
const showDetailedReport = ref(false);

const aiInsights = computed(() => {
  const id = route.params.id as string;
  const data: Record<string, any> = {
    '00000000-0000-0000-0000-000000000607': {
      sentiment: 'Positive',
      sentimentScore: 82,
      riskLevel: 'Low',
      riskScore: 12,
      onTimeDelivery: 98,
      qualityScore: 95,
      priceIndex: 'Stable',
      warnings: [],
      insight: 'คู่ค้ามีผลการดำเนินงานโดดเด่นในด้านเวลาส่งมอบและความเสถียรของราคา มีความเสี่ยงในการคลาดเคลื่อนต่ำมาก'
    },
    '00000000-0000-0000-0000-000000000601': {
      sentiment: 'Excellent',
      sentimentScore: 94,
      riskLevel: 'Minimal',
      riskScore: 5,
      onTimeDelivery: 99.5,
      qualityScore: 98,
      priceIndex: 'Competitive',
      warnings: [],
      insight: 'จัดเป็นพันธมิตรระดับยุทธศาสตร์ (Strategic Partner) ข้อมูลตลาดและข่าวสารสะท้อนความพึงพอใจและการเงินอยู่ในเกณฑ์สูงสุด'
    }
  };
  return data[id] || {
    sentiment: 'Neutral',
    sentimentScore: 65,
    riskLevel: 'Medium',
    riskScore: 42,
    onTimeDelivery: 88,
    qualityScore: 85,
    priceIndex: 'Fluctuating',
    warnings: ['พบประวัติส่งมอบล่าช้าสะสมในไตรมาสล่าสุด', 'พบสัญญาณการผันผวนของราคาวัตถุดิบต้นน้ำ'],
    insight: 'ผลการส่งมอบเริ่มมีความล่าช้าสะสม แนะนำให้ผู้ซื้อพิจารณาสัญญาราคากลางระยะยาวเพื่อลดความเสี่ยงผันผวน'
  };
});

const triggerAiAnalysis = () => {
  isAnalyzing.value = true;
  setTimeout(() => {
    isAnalyzing.value = false;
    showDetailedReport.value = true;
  }, 1500);
};

const loadVendor = async () => {
  const id = route.params.id;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/vendor/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    vendor.value = res;
  } catch (err) {
    console.warn('Backend connection failed, loading mock detail...');
    // Mock detailed fallback mapping
    const mocks: any = {
      '00000000-0000-0000-0000-000000000607': {
        vendor_id: '00000000-0000-0000-0000-000000000607',
        tax_id: '0105567078901',
        vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด',
        vendor_type: 'ผู้ขาย',
        business_category: 'อุปกรณ์เซฟตี้',
        status: 'PendingRegistration',
        registered_date: '2026-06-18',
        contacts: [{ contact_name: 'คุณณัฐพล เกียรติทวี', email: 'nattaphol@safetygear.com', phone: '0854441234' }],
        addresses: [{ address_line1: '99/9 หมู่ 4 ถนนรามคำแหง', address_line2: 'อาคารบี ชั้น 1', subdistrict: 'หัวหมาก', district: 'บางกะปิ', province: 'กรุงเทพมหานคร', postal_code: '10240' }],
        bank_accounts: [{ bank_name: 'ธนาคารกรุงเทพ', account_no: '099-0-12345-6', account_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด' }],
        documents: [{ document_id: 'vdoc_006', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_6.pdf' }],
      },
      '00000000-0000-0000-0000-000000000601': {
        vendor_id: '00000000-0000-0000-0000-000000000601',
        tax_id: '0105561012345',
        vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
        vendor_type: 'ผู้ขาย',
        business_category: 'อุปกรณ์ไอที',
        status: 'Active',
        registered_date: '2026-06-10',
        contacts: [{ contact_name: 'คุณสมศักดิ์ แสนสุข', email: 'somsak@digital.com', phone: '0812345678' }],
        addresses: [{ address_line1: '123/4 อาคาร A ชั้น 2', subdistrict: 'จอมพล', district: 'จตุจักร', province: 'กรุงเทพมหานคร', postal_code: '10900' }],
        bank_accounts: [{ bank_name: 'ธนาคารกรุงไทย', account_no: '123-4-56789-0', account_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }],
        documents: [{ document_id: 'vdoc_001', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_1.pdf' }],
      }
    };
    vendor.value = mocks[id as string] || mocks['00000000-0000-0000-0000-000000000607'];
  }
};

onMounted(() => {
  loadVendor();
});

const address = computed(() => vendor.value?.addresses?.[0] || null);
const contact = computed(() => vendor.value?.contacts?.[0] || null);
const bank = computed(() => vendor.value?.bank_accounts?.[0] || null);

const handleApprove = async () => {
  isSubmitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/vendor/${vendor.value.vendor_id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { status: 'Active' },
    });
    alert('อนุมัติคู่ค้าเข้าสู่ระบบเรียบร้อยแล้ว!');
    navigateTo('/vendors');
  } catch (err) {
    alert('ดำเนินการอนุมัติไม่สำเร็จ');
  } finally {
    isSubmitting.value = false;
  }
};

const handleReject = async () => {
  if (!rejectReason.value) {
    alert('กรุณากรอกเหตุผลที่ปฏิเสธ');
    return;
  }
  isSubmitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/vendor/${vendor.value.vendor_id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { status: 'Rejected', reason: rejectReason.value },
    });
    alert('ปฏิเสธการลงทะเบียนคู่ค้านี้แล้ว!');
    navigateTo('/vendors');
  } catch (err) {
    alert('ดำเนินการปฏิเสธไม่สำเร็จ');
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
.vendor-like-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  font-family: var(--font-sans);
}

.vendor-like-page > .flex:first-child {
  margin-bottom: -4px;
}

.vendor-like-page > .flex:nth-child(2) {
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

.vendor-like-page :deep(.rounded-xl),
.vendor-like-page :deep(.rounded-lg) {
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-1);
}

.vendor-like-page h3 {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--fg-primary);
  letter-spacing: 0;
}

/* ── Approval action buttons ── */
.vnd-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 20px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-semibold);
  font-family: var(--font-sans); cursor: pointer; border: 1px solid;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}
.vnd-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
.vnd-btn:not(:disabled):hover { transform: translateY(-1px); }

/* Approve — green gradient */
.vnd-btn--approve {
  background: var(--gradient-brand-diagonal);
  color: white; border-color: transparent;
  box-shadow: 0 2px 8px rgba(0,146,69,0.28);
}
.vnd-btn--approve:not(:disabled):hover { box-shadow: 0 4px 14px rgba(0,146,69,0.38); }

/* Reject — red outline (destructive, but not alarming) */
.vnd-btn--reject {
  background: transparent;
  color: var(--color-error-600);
  border-color: var(--color-error-300);
}
.vnd-btn--reject:hover { background: var(--color-error-50); }

/* Cancel — neutral */
.vnd-btn--cancel {
  background: var(--bg-surface);
  color: var(--fg-secondary);
  border-color: var(--border-default);
}
.vnd-btn--cancel:hover { background: var(--bg-subtle); }

/* Confirm reject — red solid */
.vnd-btn--confirm-reject {
  background: var(--color-error-600);
  color: white; border-color: transparent;
  box-shadow: 0 2px 6px rgba(239,68,68,0.25);
}
.vnd-btn--confirm-reject:not(:disabled):hover { background: var(--color-error-700); }
</style>
