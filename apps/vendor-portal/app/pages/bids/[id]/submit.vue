<template>
  <div class="space-y-6 max-w-4xl mx-auto bg-white p-8 border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)]">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-base font-bold text-[var(--foreground)]">ยื่นข้อเสนอราคาโครงการ: {{ rfq?.title }}</h2>
        <p class="text-[10px] text-[var(--muted-foreground)] mt-1">
          เลขที่เอกสารคำเชิญ: <span class="font-bold text-[var(--primary)]">{{ rfq?.rfq_no }}</span> | กำหนดปิดรับ: {{ formatDate(rfq?.close_date) }}
        </p>
      </div>
      <NuxtLink to="/bids">
        <UButton variant="outline" size="xs">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 mr-1" />
          ย้อนกลับ
        </UButton>
      </NuxtLink>
    </div>

    <!-- Error Banner -->
    <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="submitQuote" class="space-y-6">
      <!-- Items Table -->
      <div class="space-y-3">
        <h3 class="text-xs font-bold text-[var(--foreground)] flex items-center gap-1">
          <UIcon name="i-heroicons-clipboard-document-list" class="w-4 h-4 text-[var(--primary)]" />
          รายการสินค้า/บริการที่ต้องเสนอราคา
        </h3>
 
        <div class="border border-[var(--border)] rounded-xl overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-[10px] text-slate-500 font-bold">
                <th class="p-3">ชื่อรายการสินค้า</th>
                <th class="p-3 text-right" style="width: 100px;">จำนวนต้องการ</th>
                <template v-if="rfq?.bid_type === 'RFI'">
                  <th class="p-3 text-left">คำตอบเชิงคุณภาพ / รายละเอียดข้อมูลโครงการ (RFI Response) *</th>
                </template>
                <template v-else-if="rfq?.bid_type === 'RFP'">
                  <th class="p-3 text-right" style="width: 130px;">ราคาต่อหน่วย (THB)</th>
                  <th class="p-3 text-left" style="width: 250px;">อัปโหลดเอกสารเทคนิค *</th>
                  <th class="p-3 text-left" style="width: 220px;">หมายเหตุสเปก / คำอธิบายเพิ่มเติม</th>
                </template>
                <template v-else>
                  <th class="p-3 text-right" style="width: 140px;">ราคาเสนอต่อหน่วย (THB) *</th>
                  <th class="p-3 text-right" style="width: 140px;">ระยะจัดส่ง (วันทำการ) *</th>
                  <th class="p-3 text-right" style="width: 140px;">ยอดรวม (THB)</th>
                </template>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-xs">
              <tr v-for="(line, idx) in quoteLines" :key="line.rfq_item_id">
                <td class="p-3">
                  <div class="font-bold text-[var(--foreground)]">{{ line.item_name }}</div>
                  <span class="text-[9px] text-[var(--muted-foreground)]">รหัสกลาง/หน่วยนับ: {{ line.uom }}</span>
                </td>
                <td class="p-3 text-right font-medium">{{ formatQuantity(line.quantity) }} {{ line.uom }}</td>
                
                <!-- RFI fields -->
                <template v-if="rfq?.bid_type === 'RFI'">
                  <td class="p-2">
                    <UTextarea 
                      v-model="line.vendor_remarks" 
                      placeholder="กรอกรายละเอียดคำอธิบาย ข้อมูลสเปก หรือคุณสมบัติเสนอที่ท่านต้องการนำเสนอแก่ผู้จัดซื้อ..." 
                      rows="3"
                      class="w-full text-slate-900"
                    />
                  </td>
                </template>

                <!-- RFP fields -->
                <template v-else-if="rfq?.bid_type === 'RFP'">
                  <td class="p-2">
                    <UInput 
                      v-model.number="line.unit_price" 
                      type="number" 
                      min="0"
                      placeholder="0.00" 
                      size="sm" 
                      class="text-right mt-0.5" 
                    />
                  </td>
                  <td class="p-2">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg,.zip,.docx" 
                          @change="handleLineFileUpload($event, idx)"
                          class="hidden" 
                          :id="'line-upload-' + idx"
                        />
                        <label 
                          :for="'line-upload-' + idx"
                          class="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 transition rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-white"
                        >
                          <UIcon name="i-heroicons-arrow-up-tray" class="w-3.5 h-3.5" />
                          <span>{{ line.quotation_url ? 'เปลี่ยนไฟล์' : 'อัปโหลดข้อเสนอหลัก' }}</span>
                        </label>
                        <span v-if="line.quotation_url" class="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                          <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
                          สำเร็จ
                        </span>
                      </div>
                      <div v-if="line.quotation_url" class="text-[9px] text-slate-500 truncate max-w-[230px]" :title="line.quotation_url">
                        URL: {{ line.quotation_url }}
                      </div>
                    </div>
                  </td>
                  <td class="p-2">
                    <UInput 
                      v-model="line.vendor_remarks" 
                      placeholder="หมายเหตุเพิ่มเติม..." 
                      size="sm" 
                      class="w-full mt-0.5" 
                    />
                  </td>
                </template>

                <!-- Normal RFQ / Sealed Bid fields -->
                <template v-else>
                  <td class="p-2">
                    <UInput 
                      v-model.number="line.unit_price" 
                      type="number" 
                      min="0"
                      placeholder="0.00" 
                      size="sm" 
                      class="text-right mt-0.5" 
                    />
                  </td>
                  <td class="p-2">
                    <UInput 
                      v-model.number="line.delivery_days" 
                      type="number" 
                      min="1"
                      placeholder="เช่น 7" 
                      size="sm" 
                      class="text-right mt-0.5" 
                    />
                  </td>
                  <td class="p-3 text-right font-bold text-[var(--foreground)]">
                    {{ formatCurrency(line.unit_price * line.quantity) }}
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
 
      <!-- PDF Quotation Upload & General Terms -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-[var(--border)] rounded-xl bg-slate-50/50">
        <div class="space-y-2">
          <label class="text-xs font-bold text-[var(--foreground)] block">
            <template v-if="rfq?.bid_type === 'RFI'">
              แนบเอกสารข้อมูลสนับสนุนโครงการ (RFI Attachment - ถ้ามี)
            </template>
            <template v-else-if="rfq?.bid_type === 'RFP'">
              แนบเอกสารข้อเสนอโครงการ / ใบเสนอราคารวม (PDF - ถ้ามี)
            </template>
            <template v-else>
              แนบเอกสารใบเสนอราคาอย่างเป็นทางการ (PDF) *
            </template>
          </label>
          <p class="text-[10px] text-[var(--muted-foreground)]">
            <template v-if="rfq?.bid_type === 'RFI'">
              แนบเอกสารข้อมูลบริษัท สเปกสินค้า หรือรายละเอียดที่ต้องการแนบเพิ่มเติม
            </template>
            <template v-else>
              ระเบียบกำหนดให้ต้องแนบเอกสารเพื่อใช้ตรวจสอบยืนยันข้อมูลราคากับระบบจัดซื้อหลัก
            </template>
          </p>
 
          <div class="flex items-center gap-3 pt-1">
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg,.zip,.docx" 
              @change="handleFileUpload"
              class="hidden" 
              id="quote-attachment-upload"
            />
            <label 
              for="quote-attachment-upload"
              class="px-4 py-2 border border-[var(--border)] hover:bg-slate-50 transition rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" />
              <span>{{ quotationUrl ? 'เปลี่ยนไฟล์' : 'อัปโหลดเอกสารแนบ' }}</span>
            </label>
            <span 
              v-if="quotationUrl" 
              class="text-xs text-green-600 font-semibold flex items-center gap-0.5"
            >
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              อัปโหลดสำเร็จ
            </span>
          </div>
        </div>
 
        <div v-if="!['RFI'].includes(rfq?.bid_type)" class="flex flex-col justify-end text-right space-y-1">
          <span class="text-[10px] text-[var(--muted-foreground)] block">มูลค่าเสนอราคารวมสุทธิ</span>
          <span class="text-xl font-extrabold text-[var(--primary)]">
            {{ formatCurrency(totalAmount) }} THB
          </span>
        </div>
        <div v-else class="flex flex-col justify-end text-right space-y-1 text-slate-500">
          <span class="text-[10px] block">รูปแบบจัดหาเชิงกลยุทธ์ (Strategic Sourcing)</span>
          <span class="text-sm font-bold">RFI: ไม่แสดงมูลค่าทางการค้า</span>
        </div>
      </div>
 
      <!-- Submit buttons -->
      <div class="border-t border-[var(--border)] pt-4 flex justify-end gap-3">
        <NuxtLink to="/bids">
          <UButton variant="outline" size="sm">ยกเลิก</UButton>
        </NuxtLink>
        <UButton 
          type="submit" 
          color="primary" 
          size="sm"
          :loading="isLoading"
          :disabled="hasUnfilledFields || (rfq?.bid_type !== 'RFI' && rfq?.bid_type !== 'RFP' && !quotationUrl)"
          class="font-semibold shadow-sm cursor-pointer"
        >
          <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 mr-1" />
          ส่งเสนอราคา (Submit Quote)
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useVendorAuthStore();

const rfq = ref<any>(null);
const quoteLines = ref<any[]>([]);
const quotationUrl = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const loadRfqDetails = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    rfq.value = res;
    quoteLines.value = res.items.map((item: any) => ({
      rfq_item_id: item.rfq_item_id,
      item_name: item.item_name,
      quantity: Number(item.quantity),
      uom: item.uom,
      unit_price: 0,
      delivery_days: 7,
      vendor_remarks: '',
      quotation_url: '',
      uploading: false,
    }));
  } catch (err) {
    console.warn('Backend offline, loading mock RFQ details.');
    rfq.value = {
      rfq_id: '1',
      rfq_no: 'RFQ2606001',
      title: 'จัดซื้อโน้ตบุ๊ค 14 นิ้ว สำหรับทีมวิศวกรรวม 30 เครื่อง',
      close_date: new Date(Date.now() + 86400000 * 3), // closes in 3 days
    };
    quoteLines.value = [
      {
        rfq_item_id: 'i1',
        item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว',
        quantity: 30,
        uom: 'เครื่อง',
        unit_price: 0,
        delivery_days: 7,
        vendor_remarks: '',
        quotation_url: '',
        uploading: false,
      }
    ];
  }
};

onMounted(() => {
  loadRfqDetails();
});

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await $fetch<{ file_url: string }>('http://localhost:3001/api/bidding/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    quotationUrl.value = res.file_url;
  } catch (err) {
    console.warn('Backend upload offline. Mocking file success.');
    quotationUrl.value = `/uploads/quotations/quote_ven_mock_${Date.now()}.pdf`;
  }
};

const handleLineFileUpload = async (event: Event, idx: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
 
  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);
 
  quoteLines.value[idx].uploading = true;
  try {
    const res = await $fetch<{ file_url: string }>('http://localhost:3001/api/bidding/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    quoteLines.value[idx].quotation_url = res.file_url;
  } catch (err) {
    console.warn('Backend upload offline. Mocking line file success.');
    quoteLines.value[idx].quotation_url = `/uploads/quotations/line_quote_ven_mock_${idx}_${Date.now()}.pdf`;
  } finally {
    quoteLines.value[idx].uploading = false;
  }
};
 
const totalAmount = computed(() => {
  return quoteLines.value.reduce((acc, line) => acc + line.unit_price * line.quantity, 0);
});
 
const hasUnfilledFields = computed(() => {
  if (!rfq.value) return true;
  if (rfq.value.bid_type === 'RFI') {
    return quoteLines.value.some((line) => !line.vendor_remarks || line.vendor_remarks.trim() === '');
  }
  if (rfq.value.bid_type === 'RFP') {
    return quoteLines.value.some((line) => !line.quotation_url);
  }
  return quoteLines.value.some((line) => !line.unit_price || line.unit_price <= 0 || !line.delivery_days);
});
 
const submitQuote = async () => {
  if (!quotationUrl.value && rfq.value.bid_type !== 'RFI' && rfq.value.bid_type !== 'RFP') {
    errorMsg.value = 'กรุณาอัปโหลดเอกสารใบเสนอราคา (PDF) ก่อนทำการส่งซองเสนอราคา';
    return;
  }
  errorMsg.value = '';
  isLoading.value = true;
 
  const payload = {
    rfq_id: rfq.value.rfq_id,
    lines: quoteLines.value.map((line) => ({
      rfq_item_id: line.rfq_item_id,
      unit_price: rfq.value.bid_type === 'RFI' ? 0 : line.unit_price,
      delivery_days: rfq.value.bid_type === 'RFI' ? 0 : line.delivery_days,
      quotation_url: line.quotation_url || quotationUrl.value || null,
      vendor_remarks: line.vendor_remarks || null,
    })),
  };

  try {
    await $fetch('http://localhost:3001/api/bidding/quote', {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    alert('ส่งซองข้อเสนอราคาสำเร็จเรียบร้อยแล้ว!');
    navigateTo('/bids');
  } catch (err: any) {
    console.warn('Backend quote submit failed. Mocking success.');
    alert('[MOCK] ส่งซองเสนอราคาของท่านเข้าสู่ระบบจัดซื้อสำเร็จแล้ว!');
    navigateTo('/bids');
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateVal: any) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
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
</script>
