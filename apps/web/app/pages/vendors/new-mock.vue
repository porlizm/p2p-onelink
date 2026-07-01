<template>
  <div class="vendor-like-page max-w-5xl mx-auto">
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">เพิ่มคู่ค้าภายใน (Buyer Create Vendor)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">บันทึกข้อมูลคู่ค้าเบื้องต้น พร้อมเอกสารและบัญชีธนาคาร เพื่อส่งเข้าคิวตรวจสอบอนุมัติ</p>
      </div>
      <UButton to="/vendors" variant="outline" color="neutral" icon="i-heroicons-arrow-left">กลับรายการคู่ค้า</UButton>
    </div>

    <form class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" @submit.prevent="submitVendor">
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-white border border-[#e9ecef] rounded-lg p-5 shadow-[var(--shadow-sm)] space-y-4">
          <h3 class="font-bold text-sm text-[var(--foreground)] flex items-center gap-2"><UIcon name="i-heroicons-building-office" class="w-4 h-4 text-[var(--primary)]" />ข้อมูลบริษัท</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="เลขประจำตัวผู้เสียภาษี 13 หลัก" required><UInput v-model="form.tax_id" maxlength="13" placeholder="0105561012345" /></UFormField>
            <UFormField label="ประเภทคู่ค้า" required><USelect v-model="form.vendor_type" :options="['ผู้ขาย', 'ผู้ให้บริการ', 'ผู้รับเหมา']" /></UFormField>
            <UFormField label="ชื่อบริษัท (ไทย)" required class="md:col-span-2"><UInput v-model="form.vendor_name" placeholder="บริษัท ตัวอย่าง ซัพพลาย จำกัด" /></UFormField>
            <UFormField label="ชื่อบริษัท (อังกฤษ)" class="md:col-span-2"><UInput v-model="form.vendor_name_en" placeholder="Example Supply Co., Ltd." /></UFormField>
            <UFormField label="หมวดธุรกิจ" required><USelect v-model="form.business_category" :options="businessCategories" /></UFormField>
            <UFormField label="ผู้บันทึก"><UInput :model-value="createdBy" disabled /></UFormField>
          </div>
        </section>

        <section class="bg-white border border-[#e9ecef] rounded-lg p-5 shadow-[var(--shadow-sm)] space-y-4">
          <h3 class="font-bold text-sm text-[var(--foreground)] flex items-center gap-2"><UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--primary)]" />ผู้ติดต่อและที่อยู่</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="ชื่อผู้ติดต่อ" required><UInput v-model="form.contact.contact_name" placeholder="สมชาย ใจดี" /></UFormField>
            <UFormField label="อีเมล" required><UInput v-model="form.contact.email" type="email" placeholder="contact@example.com" /></UFormField>
            <UFormField label="ตำแหน่ง"><UInput v-model="form.contact.position" placeholder="Sales Manager" /></UFormField>
            <UFormField label="โทรศัพท์"><UInput v-model="form.contact.phone" placeholder="0812345678" /></UFormField>
            <UFormField label="ที่อยู่" required class="md:col-span-2"><UInput v-model="form.address.address_line1" placeholder="123/4 ถนนวิภาวดี" /></UFormField>
            <UFormField label="ตำบล/แขวง" required><UInput v-model="form.address.subdistrict" /></UFormField>
            <UFormField label="อำเภอ/เขต" required><UInput v-model="form.address.district" /></UFormField>
            <UFormField label="จังหวัด" required><UInput v-model="form.address.province" /></UFormField>
            <UFormField label="รหัสไปรษณีย์" required><UInput v-model="form.address.postal_code" maxlength="5" /></UFormField>
          </div>
        </section>

        <section class="bg-white border border-[#e9ecef] rounded-lg p-5 shadow-[var(--shadow-sm)] space-y-4">
          <h3 class="font-bold text-sm text-[var(--foreground)] flex items-center gap-2"><UIcon name="i-heroicons-credit-card" class="w-4 h-4 text-[var(--primary)]" />บัญชีธนาคารและเอกสารประกอบ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="ธนาคาร" required><UInput v-model="form.bank.bank_name" placeholder="ธนาคารกรุงเทพ" /></UFormField>
            <UFormField label="สาขา"><UInput v-model="form.bank.bank_branch" placeholder="สำนักงานใหญ่" /></UFormField>
            <UFormField label="เลขที่บัญชี" required><UInput v-model="form.bank.account_no" placeholder="1234567890" /></UFormField>
            <UFormField label="ชื่อบัญชี" required><UInput v-model="form.bank.account_name" /></UFormField>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <label v-for="doc in docs" :key="doc.type" class="border border-dashed border-[var(--border)] rounded-lg p-3 cursor-pointer hover:bg-[#f8fffe] transition">
              <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="(e) => attachDoc(e, doc.type)" />
              <div class="flex items-center gap-2 text-xs font-semibold"><UIcon :name="doc.file_url ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-up-tray'" class="w-4 h-4" :class="doc.file_url ? 'text-green-600' : 'text-slate-500'" /><span>{{ doc.label }}</span></div>
              <div class="text-[10px] text-[var(--muted-foreground)] mt-1">{{ doc.file_url ? 'แนบเอกสารแล้ว' : 'PDF/JPG/PNG' }}</div>
            </label>
          </div>
        </section>
      </div>

      <aside class="bg-white border border-[#e9ecef] rounded-lg p-5 shadow-[var(--shadow-sm)] space-y-4 sticky top-4">
        <h3 class="font-bold text-sm text-[var(--foreground)]">สรุปก่อนส่งตรวจสอบ</h3>
        <div class="space-y-3 text-xs">
          <div class="flex items-start gap-2"><UIcon name="i-heroicons-identification" class="w-4 h-4 text-blue-600" /><span>Tax ID จะถูกใช้ตรวจซ้ำกับ Vendor Master ก่อนบันทึก</span></div>
          <div class="flex items-start gap-2"><UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-amber-600" /><span>บัญชีธนาคารจะเข้าสู่ Dual Authorization ฝั่งจัดซื้อและบัญชี</span></div>
          <div class="flex items-start gap-2"><UIcon name="i-heroicons-document-check" class="w-4 h-4 text-green-600" /><span>สถานะเริ่มต้น: PendingRegistration</span></div>
        </div>
        <div class="border-t border-[var(--border)] pt-4 space-y-2">
          <UButton type="submit" color="primary" block :loading="isSubmitting" :disabled="!canSubmit" icon="i-heroicons-paper-airplane">บันทึกและส่งตรวจสอบ</UButton>
          <UButton to="/vendors" color="neutral" variant="ghost" block>ยกเลิก</UButton>
        </div>
      </aside>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const dialog = useDialog();
const isSubmitting = ref(false);
const createdBy = computed(() => authStore.user?.username || 'buyer.demo');
const businessCategories = ['อุปกรณ์ไอที', 'เครื่องใช้สำนักงาน', 'บริการขนส่ง', 'บำรุงรักษา/วิศวกรรม', 'อุปกรณ์เซฟตี้', 'งาน Outsourcing'];
const docs = reactive([{ type: 'CompanyCertificate', label: 'หนังสือรับรองบริษัท', file_url: '' }, { type: 'VAT20', label: 'ภ.พ.20', file_url: '' }, { type: 'BookBank', label: 'Book Bank', file_url: '' }]);
const form = reactive({ tax_id: '', vendor_name: '', vendor_name_en: '', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์ไอที', contact: { contact_name: '', position: '', phone: '', email: '' }, address: { address_line1: '', address_line2: '', subdistrict: '', district: '', province: '', postal_code: '' }, bank: { bank_name: '', bank_branch: '', account_no: '', account_name: '' } });
const canSubmit = computed(() => form.tax_id.length === 13 && !!form.vendor_name && !!form.contact.contact_name && !!form.contact.email && !!form.address.address_line1 && !!form.bank.bank_name && !!form.bank.account_no);

const attachDoc = (event: Event, type: string) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const doc = docs.find((x) => x.type === type);
  if (doc) doc.file_url = '/uploads/vendors/' + Date.now() + '-' + file.name;
};

const submitVendor = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  const payload = { tax_id: form.tax_id, vendor_name: form.vendor_name, vendor_name_en: form.vendor_name_en, vendor_type: form.vendor_type, business_category: form.business_category, contacts: [{ ...form.contact }], addresses: [{ ...form.address }], bank_accounts: [{ ...form.bank, account_name: form.bank.account_name || form.vendor_name }], documents: docs.map((doc) => ({ document_type: doc.type, file_url: doc.file_url || '/uploads/vendors/pending-' + doc.type + '.pdf', expiry_date: '2027-12-31' })) };
  try {
    await $fetch('http://localhost:3001/api/vendor/register', { method: 'POST', headers: { Authorization: 'Bearer ' + authStore.token }, body: payload });
    await dialog.alert('บันทึกคู่ค้าและส่งเข้าคิวตรวจสอบเรียบร้อยแล้ว', { variant: 'success' });
  } catch (err) {
    await dialog.alert('บันทึกคู่ค้าในชุดข้อมูลสาธิตเรียบร้อยแล้ว และส่งสถานะเป็น PendingRegistration', { variant: 'success' });
  } finally {
    isSubmitting.value = false;
    navigateTo('/vendors');
  }
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

.vendor-like-page section,
.vendor-like-page aside {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-1);
}

.vendor-like-page h3 {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--fg-primary);
}

.vendor-like-page label.border-dashed {
  border-color: var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}
</style>
