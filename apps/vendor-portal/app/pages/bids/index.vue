<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4">
      <h2 class="text-lg font-bold text-[var(--foreground)]">คำเชิญประกวดราคา (RFQ Bidding Invitations)</h2>
      <p class="text-xs text-[var(--muted-foreground)] mt-1">
        รายการโครงการประกวดราคาจัดซื้อจัดจ้างที่บริษัทของท่านได้รับเชิญร่วมยื่นข้อเสนอราคา
      </p>
    </div>

    <!-- RFQ Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="rfq in rfqs" 
        :key="rfq.rfq_id"
        class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-5 flex flex-col justify-between hover:shadow-md transition space-y-4"
      >
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[var(--primary)] bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
              {{ rfq.rfq_no }}
            </span>
            <span 
              class="px-2 py-0.5 rounded text-[10px] font-extrabold"
              :class="[
                isClosed(rfq.close_date) || rfq.status === 'Awarded' 
                  ? 'bg-slate-100 text-slate-700' 
                  : 'bg-green-50 text-green-700 border border-green-200 animate-pulse'
              ]"
            >
              {{ isClosed(rfq.close_date) || rfq.status === 'Awarded' ? 'ปิดรับเสนอราคาแล้ว' : 'เปิดให้เสนอราคาอยู่' }}
            </span>
          </div>

          <h3 class="font-bold text-sm text-[var(--foreground)] line-clamp-1">
            {{ rfq.title }}
          </h3>
          <p class="text-xs text-[var(--muted-foreground)] line-clamp-2">
            {{ rfq.description || 'ไม่มีรายละเอียดโครงการเพิ่มเติม' }}
          </p>

          <div class="text-xs border-t border-[var(--border)] pt-2 space-y-1 text-slate-500">
            <div class="flex justify-between">
              <span>รายการสินค้าประมูล:</span>
              <span class="font-semibold text-[var(--foreground)]">{{ rfq.items?.length || 0 }} รายการ</span>
            </div>
            <div class="flex justify-between">
              <span>กำหนดปิดรับข้อเสนอ:</span>
              <span class="font-semibold text-[var(--foreground)]">{{ formatDate(rfq.close_date) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <!-- Submission Action -->
          <NuxtLink :to="`/bids/${rfq.rfq_id}/submit`" v-if="!isClosed(rfq.close_date) && rfq.status !== 'Awarded'">
            <UButton color="primary" size="sm" class="font-semibold">
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 mr-1" />
              ยื่นซองเสนอราคา (Submit Quote)
            </UButton>
          </NuxtLink>
          <UButton v-else variant="outline" size="sm" disabled>
            <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 mr-1" />
            สิ้นสุดการเสนอราคา
          </UButton>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-if="rfqs.length === 0" 
        class="col-span-2 text-center py-16 bg-white border border-[var(--border)] rounded-xl"
      >
        <UIcon name="i-heroicons-envelope" class="w-12 h-12 text-slate-300 mx-auto" />
        <h4 class="font-bold text-sm text-[var(--foreground)] mt-2">ไม่พบคำเชิญเสนอราคา</h4>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">ขณะนี้ยังไม่มีโครงการเชิญประมูลราคาถึงท่าน</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const authStore = useVendorAuthStore();
const rfqs = ref<any[]>([]);

const loadRfqs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/bidding/vendor/rfq', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    rfqs.value = res;
  } catch (err) {
    console.warn('Backend offline, using mock invited RFQs.');
    rfqs.value = [
      {
        rfq_id: '1',
        rfq_no: 'RFQ2606001',
        title: 'จัดซื้อโน้ตบุ๊ค 14 นิ้ว สำหรับทีมวิศวกรรวม 30 เครื่อง',
        description: 'จัดทำโครงการประกวดราคาจัดซื้อโน้ตบุ๊คประสิทธิภาพสูงพร้อมเงื่อนไขรับประกัน 3 ปี',
        close_date: new Date(Date.now() - 3600000), // closed 1 hr ago
        status: 'OpenForQuotation',
        items: [
          { item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', quantity: 30, uom: 'เครื่อง' }
        ],
      },
      {
        rfq_id: '2',
        rfq_no: 'RFQ2606002',
        title: 'จัดหาเก้าอี้สำนักงานและโต๊ะทำงานสำนักงาน B2C',
        description: 'ประมูลราคาโต๊ะทำงานและเก้าอี้ทำงานสำนักงานใหญ่ปทุมธานี',
        close_date: new Date(Date.now() + 86400000 * 5), // closes in 5 days
        status: 'OpenForQuotation',
        items: [
          { item_name: 'โต๊ะทำงานเหล็ก', quantity: 10, uom: 'ตัว' },
          { item_name: 'เก้าอี้สำนักงานเบาะหนัง', quantity: 10, uom: 'ตัว' }
        ],
      }
    ];
  }
};

const isClosed = (closeDate: any) => {
  return new Date() > new Date(closeDate);
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

onMounted(() => {
  loadRfqs();
});
</script>
