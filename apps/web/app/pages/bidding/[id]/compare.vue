<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">เปรียบเทียบซองเสนอราคาโครงการ: {{ rfq?.title }}</h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          เลขที่โครงการประมูล: <span class="font-bold text-[var(--primary)]">{{ rfq?.rfq_no }}</span> | วันปิดเสนอราคา: {{ formatDate(rfq?.close_date) }}
        </p>
      </div>
      <NuxtLink to="/bidding">
        <UButton variant="outline" size="sm">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 mr-1" />
          ย้อนกลับ
        </UButton>
      </NuxtLink>
    </div>

    <!-- Sealed Bid Active Warning -->
    <div v-if="peekingForbidden" class="p-8 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
      <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-amber-500 mx-auto" />
      <h3 class="font-bold text-base text-amber-900">ระเบียบซองปิด (Sealed Bidding Active)</h3>
      <p class="text-xs text-amber-800 max-w-lg mx-auto">
        ตามข้อบังคับการจัดซื้อจัดจ้าง พนักงานจัดซื้อไม่ได้รับอนุญาตให้เปิดซองเสนอราคาเพื่อดูราคากลางเปรียบเทียบก่อนถึงกำหนดวันปิดเสนอราคา ({{ formatDate(rfq?.close_date) }}) เพื่อความโปร่งใสสูงสุดของระบบประมูล
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6">
      <!-- Side-by-side comparison card -->
      <div class="bg-white border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)] p-6 overflow-hidden">
        <h3 class="font-bold text-sm text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-2 mb-4">
          <UIcon name="i-heroicons-presentation-chart-bar" class="w-4 h-4 text-[var(--primary)]" />
          เปรียบเทียบใบเสนอราคา (Price & Terms Comparison)
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs text-slate-500 font-bold">
                <th class="p-3">สินค้า / ข้อกำหนดประมูล</th>
                <!-- Loop vendors headers -->
                <th 
                  v-for="quote in rfq?.quotations" 
                  :key="quote.quote_id" 
                  class="p-3 text-center border-l border-[var(--border)]"
                  :class="{'bg-green-50/50': quote.status === 'Selected'}"
                >
                  <div class="font-extrabold text-[var(--foreground)] truncate max-w-[200px]" :title="quote.vendor?.vendor_name">
                    {{ quote.vendor?.vendor_name }}
                  </div>
                  <span class="text-[9px] text-[var(--muted-foreground)] block mt-0.5">Tax ID: {{ quote.vendor?.tax_id }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <!-- Loop items -->
              <tr v-for="item in rfq?.items" :key="item.rfq_item_id">
                <td class="p-3">
                  <div class="font-bold text-[var(--foreground)]">{{ item.item_name }}</div>
                  <span class="text-[10px] text-[var(--muted-foreground)]">ความต้องการ: {{ item.quantity }} {{ item.uom }}</span>
                </td>
                
                <!-- Pricing entries for each vendor quote -->
                <td 
                  v-for="quote in rfq?.quotations" 
                  :key="quote.quote_id"
                  class="p-3 text-center border-l border-[var(--border)]"
                  :class="{'bg-green-50/20': quote.status === 'Selected', 'font-bold text-green-600': isLowestForLine(item.rfq_item_id, quote)}"
                >
                  <div>{{ formatCurrency(getLinePrice(item.rfq_item_id, quote)) }} THB</div>
                  <span class="text-[9px] text-[var(--muted-foreground)]">ราคารวม: {{ formatCurrency(getLinePrice(item.rfq_item_id, quote) * item.quantity) }} THB</span>
                </td>
              </tr>

              <!-- Total Row -->
              <tr class="bg-slate-50/50 font-bold border-t border-[var(--border)]">
                <td class="p-3 text-xs text-[var(--muted-foreground)] uppercase">ยอดรวมราคาจัดจัดซื้อ (Total Cost)</td>
                <td 
                  v-for="quote in rfq?.quotations" 
                  :key="quote.quote_id"
                  class="p-3 text-center border-l border-[var(--border)] text-base font-extrabold"
                  :class="{'bg-green-50/50': quote.status === 'Selected', 'text-green-600': isLowestTotal(quote)}"
                >
                  {{ formatCurrency(getQuoteTotal(quote)) }} THB
                </td>
              </tr>

              <!-- Delivery Lead Time -->
              <tr>
                <td class="p-3 text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                  <UIcon name="i-heroicons-truck" class="w-3.5 h-3.5" />
                  ระยะเวลาจัดส่ง (Delivery Term)
                </td>
                <td 
                  v-for="quote in rfq?.quotations" 
                  :key="quote.quote_id"
                  class="p-3 text-center border-l border-[var(--border)] text-xs font-semibold text-[var(--foreground)]"
                  :class="{'bg-green-50/20': quote.status === 'Selected'}"
                >
                  {{ getMaxLeadTime(quote) }} วันทำการ
                </td>
              </tr>

              <!-- Quotation Attachments -->
              <tr>
                <td class="p-3 text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                  <UIcon name="i-heroicons-paper-clip" class="w-3.5 h-3.5" />
                  เอกสารข้อเสนอ (Documents)
                </td>
                <td 
                  v-for="quote in rfq?.quotations" 
                  :key="quote.quote_id"
                  class="p-3 text-center border-l border-[var(--border)]"
                  :class="{'bg-green-50/20': quote.status === 'Selected'}"
                >
                  <a 
                    v-if="quote.lines?.[0]?.quotation_url" 
                    :href="quote.lines[0].quotation_url" 
                    target="_blank"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[var(--primary)] text-[var(--primary)] rounded-lg font-semibold hover:bg-slate-50 transition"
                  >
                    <UIcon name="i-heroicons-document-arrow-down" class="w-3.5 h-3.5" />
                    ดาวน์โหลด PDF
                  </a>
                  <span v-else class="text-xs text-[var(--muted-foreground)]">ไม่ได้แนบเอกสาร</span>
                </td>
              </tr>

              <!-- Action/Decision -->
              <tr class="bg-slate-100/30">
                <td class="p-3"></td>
                <td 
                  v-for="quote in rfq?.quotations" 
                  :key="quote.quote_id"
                  class="p-4 text-center border-l border-[var(--border)]"
                  :class="{'bg-green-50/50': quote.status === 'Selected'}"
                >
                  <span 
                    v-if="quote.status === 'Selected' || rfq?.status === 'Awarded'" 
                    class="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200"
                  >
                    {{ quote.status === 'Selected' ? '🏆 ได้รับคัดเลือก (Selected)' : 'ไม่ได้รับคัดเลือก' }}
                  </span>
                  
                  <UButton 
                    v-else
                    @click="awardQuote(quote.quote_id)"
                    color="primary"
                    size="sm"
                    :loading="isAwarding"
                    class="font-semibold shadow-sm cursor-pointer"
                  >
                    <UIcon name="i-heroicons-check-badge" class="w-4 h-4 mr-1" />
                    เลือกผู้ขายรายนี้
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const rfq = ref<any>(null);
const peekingForbidden = ref(false);
const isAwarding = ref(false);

const loadComparison = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}/comparison`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    rfq.value = res;
    peekingForbidden.value = false;
  } catch (err: any) {
    if (err.status === 403) {
      peekingForbidden.value = true;
      // Fetch details only to show close date
      try {
        const details = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        rfq.value = details;
      } catch (dErr) {}
    } else {
      console.warn('Backend connection offline, using mock comparison.');
      peekingForbidden.value = false;
      rfq.value = {
        rfq_id: '1',
        rfq_no: 'RFQ2606001',
        title: 'จัดซื้อโน้ตบุ๊ค 14 นิ้ว สำหรับทีมวิศวกรรวม 30 เครื่อง',
        close_date: new Date(Date.now() - 3600000), // closed
        status: 'OpenForQuotation',
        items: [
          { rfq_item_id: 'i1', item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', quantity: 30, uom: 'เครื่อง' }
        ],
        quotations: [
          {
            quote_id: 'q1',
            status: 'Submitted',
            vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', tax_id: '0105561012345' },
            lines: [
              { rfq_item_id: 'i1', unit_price: 28500, delivery_days: 10, quotation_url: '/uploads/quotations/quote_mock_1.pdf' }
            ]
          },
          {
            quote_id: 'q2',
            status: 'Submitted',
            vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', tax_id: '0105562023456' },
            lines: [
              { rfq_item_id: 'i1', unit_price: 27900, delivery_days: 14, quotation_url: '/uploads/quotations/quote_mock_2.pdf' }
            ]
          },
          {
            quote_id: 'q3',
            status: 'Submitted',
            vendor: { vendor_name: 'บริษัท เทคโนโลยี เน็กซ์ จำกัด', tax_id: '0105563134567' },
            lines: [
              { rfq_item_id: 'i1', unit_price: 27500, delivery_days: 7, quotation_url: '/uploads/quotations/quote_mock_3.pdf' }
            ]
          }
        ]
      };
    }
  }
};

onMounted(() => {
  loadComparison();
});

const getLinePrice = (itemId: string, quote: any) => {
  const line = quote.lines?.find((l: any) => l.rfq_item_id === itemId || l.rfq_item?.rfq_item_id === itemId);
  return line ? Number(line.unit_price) : 0;
};

const getQuoteTotal = (quote: any) => {
  return quote.lines?.reduce((acc: number, line: any) => {
    const rfqItem = rfq.value?.items?.find((i: any) => i.rfq_item_id === line.rfq_item_id || i.rfq_item_id === line.rfq_item?.rfq_item_id);
    const qty = rfqItem ? Number(rfqItem.quantity) : 1;
    return acc + qty * Number(line.unit_price);
  }, 0) || 0;
};

const getMaxLeadTime = (quote: any) => {
  return quote.lines?.reduce((max: number, line: any) => Math.max(max, Number(line.delivery_days)), 0) || 0;
};

const isLowestForLine = (itemId: string, quote: any) => {
  const currentPrice = getLinePrice(itemId, quote);
  if (currentPrice === 0) return false;
  
  const allPrices = rfq.value?.quotations?.map((q: any) => getLinePrice(itemId, q)).filter((p: number) => p > 0) || [];
  const minPrice = Math.min(...allPrices);
  return currentPrice === minPrice;
};

const isLowestTotal = (quote: any) => {
  const currentTotal = getQuoteTotal(quote);
  if (currentTotal === 0) return false;

  const allTotals = rfq.value?.quotations?.map((q: any) => getQuoteTotal(q)).filter((t: number) => t > 0) || [];
  const minTotal = Math.min(...allTotals);
  return currentTotal === minTotal;
};

const awardQuote = async (quoteId: string) => {
  if (!confirm('คุณยืนยันต้องการตัดสินและคัดเลือกผู้จำหน่ายรายนี้ในการจัดซื้อใช่หรือไม่?')) return;
  isAwarding.value = true;
  
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${rfq.value.rfq_id}/award/${quoteId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    alert(`ตัดสินประมูลสำเร็จ!\nสร้างใบขอซื้ออัตโนมัติเรียบร้อยแล้ว: เลขที่ ${res.pr_no}\nสถานะ PR: PendingApproval (กันยอดงบประมาณแล้ว)`);
    navigateTo('/pr');
  } catch (err: any) {
    console.warn('Backend award failed, using mock success action.');
    alert(`[MOCK] ตัดสินข้อเสนอประมูลเรียบร้อย!\nระบบสร้างใบขอซื้ออัตโนมัติ: PR2606888\nสถานะ PR: PendingApproval`);
    navigateTo('/pr');
  } finally {
    isAwarding.value = false;
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

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
