<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <!-- Header Back -->
    <div class="flex items-center gap-3">
      <UButton 
        to="/vendors" 
        color="gray" 
        variant="ghost" 
        size="sm"
      >
        <UIcon name="i-heroicons-arrow-left-20-solid" class="w-5 h-5 mr-1" />
        ย้อนกลับไปหน้ารายชื่อ
      </UButton>
    </div>

    <!-- Vendor Title Area -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
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
        <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
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
        <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
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
        <!-- Bank account -->
        <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
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
        <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <UIcon name="i-heroicons-document-arrow-down-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">เอกสารแนบ</h3>
            </div>
          </template>

          <div class="space-y-3 mt-3">
            <div 
              v-for="doc in vendor?.documents" 
              :key="doc.document_id"
              class="flex flex-col p-2 bg-[var(--background)] rounded border border-[var(--border)] text-xs"
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
            <UButton 
              color="red" 
              variant="soft" 
              size="md"
              @click="showRejectComment = true"
            >
              ปฏิเสธ (Reject)
            </UButton>
            <UButton 
              color="primary" 
              size="md"
              :loading="isSubmitting"
              @click="handleApprove"
            >
              อนุมัติคู่ค้า (Approve)
            </UButton>
          </template>
          <template v-else>
            <UButton 
              color="gray" 
              variant="solid" 
              size="md"
              @click="showRejectComment = false"
            >
              ยกเลิก
            </UButton>
            <UButton 
              color="red" 
              size="md"
              :loading="isSubmitting"
              @click="handleReject"
            >
              ยืนยันการปฏิเสธ
            </UButton>
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
