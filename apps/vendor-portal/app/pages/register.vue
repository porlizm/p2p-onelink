<template>
  <div class="flex items-center justify-center min-h-screen bg-[var(--background)] p-6">
    <UCard class="w-full max-w-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] rounded-[var(--radius-xl)] bg-white overflow-hidden">
      <template #header>
        <div class="flex flex-col items-center justify-center text-center py-2">
          <h2 class="text-xl font-bold text-[var(--foreground)] tracking-tight">ลงทะเบียนคู่ค้าใหม่ (Vendor Registration)</h2>
          <p class="text-xs text-[var(--muted-foreground)] mt-1">ขั้นตอนการสมัครเข้าร่วมเป็นคู่ค้าของกลุ่มบริษัท SCGJWD Logistics</p>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center justify-between mt-6 px-4">
          <div 
            v-for="i in 4" 
            :key="i"
            class="flex items-center"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300"
              :class="[
                step === i 
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white' 
                  : step > i 
                    ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success-soft-foreground)]'
                    : 'border-[var(--border)] bg-white text-[var(--muted-foreground)]'
              ]"
            >
              <UIcon v-if="step > i" name="i-heroicons-check-20-solid" class="w-4 h-4" />
              <span v-else>{{ i }}</span>
            </div>
            <div 
              v-if="i < 4"
              class="h-1 w-12 md:w-24 bg-[var(--border)] mx-2 rounded-full transition-all duration-300"
              :class="[step > i ? 'bg-[var(--success)]' : '']"
            ></div>
          </div>
        </div>
      </template>

      <!-- Step 1: General Info -->
      <div v-if="step === 1" class="space-y-4">
        <h3 class="font-medium text-base text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-4">ข้อมูลทั่วไปของบริษัท</h3>
        
        <UFormField label="เลขประจำตัวผู้เสียภาษี (Tax ID)" required>
          <UInput 
            v-model="form.tax_id" 
            placeholder="กรอกตัวเลข 13 หลัก" 
            maxlength="13"
            size="md"
          />
        </UFormField>

        <UFormField label="ชื่อบริษัทภาษาไทย (Vendor Name TH)" required>
          <UInput v-model="form.vendor_name" placeholder="บริษัท ตัวอย่าง จำกัด" size="md" />
        </UFormField>

        <UFormField label="ชื่อบริษัทภาษาอังกฤษ (Vendor Name EN)">
          <UInput v-model="form.vendor_name_en" placeholder="Example Company Co., Ltd." size="md" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="ประเภทธุรกิจ (Business Type)" required>
            <USelect 
              v-model="form.vendor_type" 
              :options="['ผู้ขาย', 'ผู้ให้บริการ']"
              size="md"
            />
          </UFormField>

          <UFormField label="หมวดหมู่สินค้า/บริการ" required>
            <USelect 
              v-model="form.business_category" 
              :options="['อุปกรณ์ไอที', 'เครื่องใช้สำนักงาน', 'เฟอร์นิเจอร์', 'วัสดุสิ้นเปลือง/เซฟตี้', 'บริการทำความสะอาด', 'บำรุงรักษา/วิศวกรรม']"
              size="md"
            />
          </UFormField>
        </div>
      </div>

      <!-- Step 2: Address & Contact -->
      <div v-if="step === 2" class="space-y-4">
        <h3 class="font-medium text-base text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-4">ที่อยู่บริษัทและผู้ติดต่อหลัก</h3>
        
        <div class="space-y-3">
          <UFormField label="ที่ตั้งสำนักงาน (เลขที่, อาคาร, ซอย, ถนน)" required>
            <UInput v-model="form.address.address_line1" placeholder="123/4 อาคาร A ชั้น 2 ถนนวิภาวดี" size="md" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="แขวง/ตำบล" required>
              <UInput v-model="form.address.subdistrict" placeholder="จอมพล" size="md" />
            </UFormField>
            <UFormField label="เขต/อำเภอ" required>
              <UInput v-model="form.address.district" placeholder="จตุจักร" size="md" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="จังหวัด" required>
              <UInput v-model="form.address.province" placeholder="กรุงเทพมหานคร" size="md" />
            </UFormField>
            <UFormField label="รหัสไปรษณีย์" required>
              <UInput v-model="form.address.postal_code" placeholder="10900" maxlength="5" size="md" />
            </UFormField>
          </div>
        </div>

        <h3 class="font-medium text-base text-[var(--foreground)] border-b border-[var(--border)] pb-2 pt-4 mb-4">ข้อมูลผู้ติดต่อหลัก</h3>
        <div class="space-y-3">
          <UFormField label="ชื่อผู้ติดต่อหลัก" required>
            <UInput v-model="form.contact.contact_name" placeholder="คุณสมชาย ใจดี" size="md" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="เบอร์โทรศัพท์" required>
              <UInput v-model="form.contact.phone" placeholder="0812345678" size="md" />
            </UFormField>
            <UFormField label="อีเมลผู้ติดต่อ" required>
              <UInput v-model="form.contact.email" type="email" placeholder="somchai@company.com" size="md" />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Step 3: Bank Account Info -->
      <div v-if="step === 3" class="space-y-4">
        <h3 class="font-medium text-base text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-4">ข้อมูลบัญชีธนาคารสำหรับการรับเงิน</h3>

        <div class="p-3 bg-[var(--accent)] text-[var(--accent-foreground)] text-xs rounded-[var(--radius)] flex gap-2 border border-[var(--border)] mb-4">
          <UIcon name="i-heroicons-information-circle-20-solid" class="w-5 h-5 flex-shrink-0" />
          <span>กรุณาตรวจสอบเลขบัญชีให้ตรงกับข้อมูลหน้าสมุดเงินฝากธนาคารที่จะแนบในขั้นตอนถัดไป</span>
        </div>

        <UFormField label="ธนาคาร (Bank)" required>
          <USelect 
            v-model="form.bank.bank_name" 
            :options="['ธนาคารกรุงไทย', 'ธนาคารไทยพาณิชย์', 'ธนาคารกสิกรไทย', 'ธนาคารกรุงเทพ', 'ธนาคารกรุงศรีอยุธยา']"
            size="md"
          />
        </UFormField>

        <UFormField label="สาขาธนาคาร (Branch)">
          <UInput v-model="form.bank.bank_branch" placeholder="สำนักงานใหญ่" size="md" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="เลขที่บัญชี (Account No.)" required>
            <UInput v-model="form.bank.account_no" placeholder="123-4-56789-0" size="md" />
          </UFormField>
          <UFormField label="ชื่อบัญชี (Account Name)" required>
            <UInput v-model="form.bank.account_name" placeholder="บริษัท ตัวอย่าง จำกัด" size="md" />
          </UFormField>
        </div>
      </div>

      <!-- Step 4: Documents Upload & Verification -->
      <div v-if="step === 4" class="space-y-6">
        <h3 class="font-medium text-base text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-4">อัปโหลดเอกสารประกอบการลงทะเบียน</h3>

        <!-- Error Alert from Register Response -->
        <div 
          v-if="errorMessage" 
          class="p-3 bg-[var(--destructive-soft)] text-[var(--destructive-soft-foreground)] text-xs rounded-[var(--radius)] border border-[var(--destructive-soft-foreground)]/10"
        >
          {{ errorMessage }}
        </div>

        <div class="space-y-4">
          <div 
            v-for="(doc, idx) in requiredDocs" 
            :key="doc.type"
            class="p-4 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-[var(--foreground)]">{{ doc.label }}</span>
              <span class="text-xs text-[var(--muted-foreground)] mt-0.5">{{ doc.desc }}</span>
              <a 
                v-if="form.documents[idx]?.file_url" 
                :href="'http://localhost:3001' + form.documents[idx].file_url" 
                target="_blank"
                class="text-xs text-[var(--primary)] font-medium hover:underline mt-1.5 flex items-center gap-1"
              >
                <UIcon name="i-heroicons-document-arrow-down-20-solid" class="w-4 h-4" />
                เปิดดูไฟล์แนบ
              </a>
            </div>

            <div>
              <input 
                type="file" 
                :id="'file-' + idx"
                class="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                @change="handleFileUpload($event, idx, doc.type)"
              />
              <UButton 
                type="button"
                color="primary"
                size="sm"
                variant="outline"
                :loading="uploadingIndex === idx"
                @click="triggerFileSelect(idx)"
              >
                {{ form.documents[idx]?.file_url ? 'อัปโหลดใหม่' : 'เลือกไฟล์' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Footer Actions -->
      <template #footer>
        <div class="flex justify-between items-center py-2">
          <UButton 
            v-if="step > 1" 
            color="gray" 
            variant="solid" 
            size="md"
            @click="prevStep"
          >
            ย้อนกลับ
          </UButton>
          <div v-else></div>

          <UButton 
            v-if="step < 4" 
            color="primary" 
            size="md"
            @click="nextStep"
          >
            ถัดไป
          </UButton>
          <UButton 
            v-else 
            color="success" 
            size="md"
            :loading="isSubmitting"
            @click="submitForm"
          >
            ส่งใบสมัครลงทะเบียน
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

definePageMeta({
  layout: false,
});

const step = ref(1);
const uploadingIndex = ref<number | null>(null);
const isSubmitting = ref(false);
const errorMessage = ref('');

const requiredDocs = [
  { type: 'หนังสือรับรองบริษัท', label: 'หนังสือรับรองบริษัท', desc: 'หนังสือรับรองมีอายุไม่เกิน 6 เดือน (ไฟล์ PDF / รูปภาพ)' },
  { type: 'ภ.พ.20', label: 'ภ.พ.20 (ถ้ามี)', desc: 'ใบทะเบียนภาษีมูลค่าเพิ่ม (ไฟล์ PDF / รูปภาพ)' },
  { type: 'หน้าสมุดบัญชีเงินฝาก', label: 'สำเนาหน้า Book Bank', desc: 'บัญชีธนาคารหลักที่ใช้รับชำระเงินของบริษัท (ไฟล์ PDF / รูปภาพ)' },
];

const form = reactive({
  tax_id: '',
  vendor_name: '',
  vendor_name_en: '',
  vendor_type: 'ผู้ขาย',
  business_category: 'อุปกรณ์ไอที',
  address: {
    address_line1: '',
    subdistrict: '',
    district: '',
    province: '',
    postal_code: '',
  },
  contact: {
    contact_name: '',
    phone: '',
    email: '',
  },
  bank: {
    bank_name: 'ธนาคารกรุงไทย',
    bank_branch: 'สำนักงานใหญ่',
    account_no: '',
    account_name: '',
  },
  documents: [] as any[],
});

// Pre-fill documents array structure
requiredDocs.forEach((doc) => {
  form.documents.push({
    document_type: doc.type,
    file_url: '',
  });
});

const triggerFileSelect = (index: number) => {
  const fileInput = document.getElementById('file-' + index);
  fileInput?.click();
};

const handleFileUpload = async (event: any, index: number, docType: string) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingIndex.value = index;
  errorMessage.value = '';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await $fetch<{ file_url: string }>('http://localhost:3001/api/vendor/upload', {
      method: 'POST',
      body: formData,
    });
    form.documents[index].file_url = res.file_url;
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'อัปโหลดไฟล์ไม่สำเร็จ';
  } finally {
    uploadingIndex.value = null;
  }
};

const nextStep = () => {
  if (step.value === 1) {
    if (!form.tax_id || form.tax_id.length !== 13 || !form.vendor_name) {
      alert('กรุณากรอกเลข Tax ID 13 หลัก และชื่อบริษัทภาษาไทยให้ครบถ้วน');
      return;
    }
  } else if (step.value === 2) {
    if (!form.address.address_line1 || !form.address.subdistrict || !form.address.district || !form.address.province || !form.address.postal_code || !form.contact.contact_name || !form.contact.phone || !form.contact.email) {
      alert('กรุณากรอกข้อมูลที่อยู่บริษัทและผู้ติดต่อให้ครบถ้วน');
      return;
    }
  } else if (step.value === 3) {
    if (!form.bank.bank_name || !form.bank.account_no || !form.bank.account_name) {
      alert('กรุณากรอกข้อมูลบัญชีธนาคารให้ครบถ้วน');
      return;
    }
  }
  step.value++;
};

const prevStep = () => {
  if (step.value > 1) {
    step.value--;
  }
};

const submitForm = async () => {
  // Check if primary documents are uploaded
  if (!form.documents[0].file_url || !form.documents[2].file_url) {
    alert('กรุณาอัปโหลดหนังสือรับรองบริษัท และหน้าสมุดบัญชีเงินฝากให้ครบถ้วน');
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  const payload = {
    tax_id: form.tax_id,
    vendor_name: form.vendor_name,
    vendor_name_en: form.vendor_name_en,
    vendor_type: form.vendor_type,
    business_category: form.business_category,
    contacts: [
      {
        contact_name: form.contact.contact_name,
        phone: form.contact.phone,
        email: form.contact.email,
        position: 'ผู้ประสานงานหลัก',
      },
    ],
    addresses: [
      {
        address_line1: form.address.address_line1,
        subdistrict: form.address.subdistrict,
        district: form.address.district,
        province: form.address.province,
        postal_code: form.address.postal_code,
      },
    ],
    bank_accounts: [
      {
        bank_name: form.bank.bank_name,
        bank_branch: form.bank.bank_branch,
        account_no: form.bank.account_no,
        account_name: form.bank.account_name,
      },
    ],
    // filter out empty documents if any (like optional PP20)
    documents: form.documents.filter((d) => d.file_url),
  };

  try {
    await $fetch('http://localhost:3001/api/vendor/register', {
      method: 'POST',
      body: payload,
    });
    alert('ส่งใบสมัครลงทะเบียนคู่ค้าสำเร็จแล้ว! ทางบริษัทจะดำเนินการตรวจสอบเอกสารภายใน 3-5 วันทำการ');
    navigateTo('/login');
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'ส่งข้อมูลลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูลซ้ำซ้อนหรือความยาวช่องกรอก';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
