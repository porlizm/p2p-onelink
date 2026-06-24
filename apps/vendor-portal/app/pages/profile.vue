<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ข้อมูลบริษัทคู่ค้า</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ข้อมูลสถานะนิติบุคคล เอกสารสำคัญ และการรับเงินโอน</p>
      </div>
      <div>
        <StatusBadge :status="vendorStatus" />
      </div>
    </div>

    <!-- Vendor Details Card Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Info Card (2/3 width) -->
      <UCard class="md:col-span-2 border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
        <template #header>
          <div class="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <UIcon name="i-heroicons-building-office-20-solid" class="w-5 h-5 text-[var(--primary)]" />
            <h3 class="font-semibold text-base text-[var(--foreground)]">รายละเอียดนิติบุคคล</h3>
          </div>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ชื่อบริษัทภาษาไทย</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ vendorDetail?.vendor_name || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ชื่อบริษัทภาษาอังกฤษ</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ vendorDetail?.vendor_name_en || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">เลขประจำตัวผู้เสียภาษี (Tax ID)</span>
            <p class="text-sm font-mono font-medium text-[var(--foreground)]">{{ vendorDetail?.tax_id || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ประเภทธุรกิจ / หมวดหมู่</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ vendorDetail?.vendor_type || '—' }} / {{ vendorDetail?.business_category || '—' }}</p>
          </div>
        </div>
      </UCard>

      <!-- Bank Details (1/3 width) -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
        <template #header>
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-credit-card-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-base text-[var(--foreground)]">ช่องทางการรับเงิน</h3>
            </div>
            <UButton 
              size="xs" 
              color="primary" 
              variant="soft" 
              icon="i-heroicons-pencil-square"
              @click="openEditModal"
            >
              แก้ไข
            </UButton>
          </div>
        </template>

        <div class="space-y-4 mt-4">
          <div class="flex items-center justify-between">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">สถานะการยืนยัน</span>
            <span 
              v-if="primaryBank" 
              class="px-2 py-0.5 text-[10px] font-semibold rounded-full"
              :class="primaryBank.verification_status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ primaryBank.verification_status === 'Active' ? 'ยืนยันแล้ว (Active)' : 'รออนุมัติ (Pending)' }}
            </span>
            <span v-else class="text-sm text-slate-400">—</span>
          </div>

          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ธนาคาร</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ primaryBank?.bank_name || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">สาขา</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ primaryBank?.bank_branch || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">เลขที่บัญชี</span>
            <p class="text-sm font-mono font-medium text-[var(--foreground)]">{{ primaryBank?.account_no || '—' }}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs text-[var(--muted-foreground)] uppercase">ชื่อบัญชี</span>
            <p class="text-sm font-medium text-[var(--foreground)]">{{ primaryBank?.account_name || '—' }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Edit Bank Modal -->
    <UModal v-model="isEditOpen">
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[var(--foreground)] border-b pb-3 flex items-center gap-2">
          <UIcon name="i-heroicons-credit-card" class="text-[var(--primary)]" />
          แก้ไขข้อมูลบัญชีธนาคาร
        </h3>
        
        <div class="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-xl flex items-start gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>นโยบายต่อต้านการทุจริต:</strong> การเปลี่ยนข้อมูลธนาคารจะส่งผลให้ระบบระงับการโอนเงิน (Hold) ชั่วคราว และต้องผ่านการตรวจสอบคู่จากหน่วยงานจัดซื้อและฝ่ายบัญชี (Dual-Authorization) ก่อนจึงจะสามารถรับโอนเงินได้อีกครั้ง
          </p>
        </div>

        <div class="space-y-3">
          <UFormField label="ธนาคาร" name="bankName" required>
            <UInput v-model="bankName" placeholder="เช่น ธนาคารกรุงไทย, ธนาคารกสิกรไทย" class="w-full mt-1" />
          </UFormField>
          
          <UFormField label="สาขาธนาคาร" name="bankBranch">
            <UInput v-model="bankBranch" placeholder="ระบุสาขา" class="w-full mt-1" />
          </UFormField>

          <UFormField label="เลขที่บัญชี" name="accountNo" required>
            <UInput v-model="accountNo" placeholder="ระบุเลขที่บัญชี (ไม่มีขีดกลาง)" class="w-full mt-1 font-mono" />
          </UFormField>

          <UFormField label="ชื่อบัญชี" name="accountName" required>
            <UInput v-model="accountName" placeholder="ระบุชื่อเจ้าของบัญชี" class="w-full mt-1" />
          </UFormField>
        </div>

        <div class="flex items-center justify-end gap-2 border-t pt-4">
          <UButton color="slate" variant="soft" @click="isEditOpen = false">ยกเลิก</UButton>
          <UButton 
            color="primary" 
            :loading="isSubmitting"
            class="font-semibold text-white bg-[var(--primary)] hover:bg-[#003BCC]"
            @click="handleSaveBank"
          >
            บันทึกข้อมูล
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useVendorAuthStore();
const vendorDetail = ref<any>(null);

const isEditOpen = ref(false);
const bankName = ref('');
const bankBranch = ref('');
const accountNo = ref('');
const accountName = ref('');
const isSubmitting = ref(false);

const vendorStatus = computed(() => vendorDetail.value?.status || 'PendingRegistration');
const primaryBank = computed(() => {
  if (!vendorDetail.value?.bank_accounts) return null;
  return vendorDetail.value.bank_accounts.find((b: any) => b.is_primary) || vendorDetail.value.bank_accounts[0];
});

const fetchVendorDetail = async () => {
  if (authStore.vendor?.vendorId) {
    try {
      const data = await $fetch<any>(`http://localhost:3001/api/vendor/${authStore.vendor.vendorId}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      vendorDetail.value = data;
    } catch (err) {
      console.error('Error fetching vendor detail:', err);
    }
  }
};

const openEditModal = () => {
  bankName.value = primaryBank.value?.bank_name || 'ธนาคารกรุงไทย';
  bankBranch.value = primaryBank.value?.bank_branch || '';
  accountNo.value = primaryBank.value?.account_no || '';
  accountName.value = primaryBank.value?.account_name || vendorDetail.value?.vendor_name || '';
  isEditOpen.value = true;
};

const handleSaveBank = async () => {
  if (!bankName.value || !accountNo.value || !accountName.value) return;
  isSubmitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/vendor/${authStore.vendor?.vendorId}/bank-account`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        bank_name: bankName.value,
        bank_branch: bankBranch.value,
        account_no: accountNo.value,
        account_name: accountName.value,
      },
    });
    isEditOpen.value = false;
    await fetchVendorDetail();
  } catch (err) {
    console.error('Error saving bank account:', err);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchVendorDetail();
});
</script>
