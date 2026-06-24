<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">จัดการงานประกวดราคา (RFQ Bidding)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">สร้างโครงการเปรียบเทียบราคาจากคู่ค้า ติดตามคำขอ และตัดสินผลการประมูล</p>
      </div>
      <div>
        <NuxtLink to="/bidding/create">
          <UButton color="primary" size="md">
            <UIcon name="i-heroicons-plus-20-solid" class="w-5 h-5 mr-1" />
            เปิดประมูลราคา (Create RFQ)
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-trophy" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">โครงการทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ rfqList.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-paper-airplane" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">เปิดเสนอราคาอยู่</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ rfqList.filter(r => r.status === 'OpenForQuotation').length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-envelope-open" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอเปิดซอง/ตัดสินผล</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ rfqList.filter(r => r.status === 'UnderEvaluation' || isClosedButNotAwarded(r)).length }}
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ตัดสินผลแล้ว</span>
          <span class="text-lg font-bold text-[var(--foreground)]">
            {{ rfqList.filter(r => r.status === 'Awarded').length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search & Filter Tab -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ RFQ หรือหัวข้อโครงการ..." 
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
          />
        </div>
        <div class="flex items-center gap-2">
          <USelect 
            v-model="filterStatus"
            :options="['ทั้งหมด', 'OpenForQuotation', 'UnderEvaluation', 'Awarded', 'Draft']"
            size="md"
            class="w-44"
          />
        </div>
      </div>

      <!-- RFQ Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่โครงการ</th>
              <th class="px-6 py-3">หัวข้อประกวดราคา</th>
              <th class="px-6 py-3">ปิดรับซองเสนอราคา</th>
              <th class="px-6 py-3 text-center">จำนวนคู่ค้าที่เชิญ</th>
              <th class="px-6 py-3 text-center">ยื่นเสนอแล้ว</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="rfq in filteredRfqs" :key="rfq.rfq_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ rfq.rfq_no }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-[var(--foreground)]">{{ rfq.title }}</div>
                <div class="text-[10px] text-[var(--muted-foreground)] mt-0.5 line-clamp-1 max-w-sm">
                  {{ rfq.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}
                </div>
              </td>
              <td class="px-6 py-4 text-xs">
                <div class="text-[var(--foreground)] font-medium">{{ formatDate(rfq.close_date) }}</div>
                <span 
                  v-if="isExpired(rfq.close_date) && rfq.status === 'OpenForQuotation'"
                  class="text-[9px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5"
                >
                  <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                  ปิดรับซองแล้ว
                </span>
              </td>
              <td class="px-6 py-4 text-center font-medium">{{ rfq.vendors?.length || 0 }} ราย</td>
              <td class="px-6 py-4 text-center font-bold text-slate-700">
                {{ rfq.quotations?.length || 0 }} ราย
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                  :class="[
                    rfq.status === 'Awarded' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    rfq.status === 'OpenForQuotation' && !isExpired(rfq.close_date) ? 'bg-green-50 text-green-700 border border-green-200' :
                    rfq.status === 'OpenForQuotation' && isExpired(rfq.close_date) ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ formatStatus(rfq) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" v-if="rfq.status === 'Awarded' || isExpired(rfq.close_date) || rfq.status !== 'OpenForQuotation'">
                  <UButton 
                    size="xs" 
                    color="primary"
                    variant="solid"
                  >
                    <UIcon name="i-heroicons-presentation-chart-bar" class="w-3.5 h-3.5 mr-1" />
                    เปรียบเทียบและตัดสินผล
                  </UButton>
                </NuxtLink>
                <UButton 
                  v-else
                  size="xs" 
                  variant="outline"
                  disabled
                  title="เปิดเปรียบเทียบได้หลังจากปิดการรับเสนอราคาแล้วเท่านั้น"
                >
                  <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 mr-1" />
                  ซองยังไม่เปิด
                </UButton>
              </td>
            </tr>
            <tr v-if="filteredRfqs.length === 0">
              <td colspan="7" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติรายการโครงการจัดซื้อเปรียบเทียบราคา
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- AI Sourcing Assistant & Market Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <!-- Suggested Vendors -->
      <UCard class="lg:col-span-2 border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <template #header>
          <div class="flex items-center justify-between border-b pb-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 class="font-bold text-slate-800 text-sm">AI Sourcing Recommendation (ผู้ขายเสนอแนะโดยระบบ AI)</h3>
            </div>
            <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">Scraped Live</span>
          </div>
        </template>

        <div class="space-y-4 text-xs mt-2">
          <p class="text-slate-500">
            ระบบ AI ทำการสืบค้นข้อมูลคู่จัดซื้อรายใหม่จากฐานข้อมูลสารบัญบริการและ YellowPages สาธารณะ เพื่อเสนอแนะบริษัทที่ตรงกับประเภทความต้องการในระบบของคุณ:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="vendor in aiScrapedVendors" :key="vendor.name" class="p-3 border border-indigo-100 bg-indigo-50/10 rounded-xl hover:border-indigo-200 transition space-y-2">
              <div class="flex justify-between items-start">
                <span class="font-bold text-slate-800 line-clamp-1 max-w-[120px]">{{ vendor.name }}</span>
                <span class="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-black">{{ vendor.matchScore }} match</span>
              </div>
              <div class="text-[10px] text-slate-400 font-medium">{{ vendor.category }}</div>
              <div class="text-[10px] text-indigo-700 font-bold bg-indigo-50 p-1.5 rounded">{{ vendor.highlight }}</div>
              <div class="flex items-center justify-between text-[8px] text-slate-400 pt-1.5 border-t border-slate-100">
                <span>แหล่ง: {{ vendor.source }}</span>
                <UButton size="xs" color="primary" variant="link" class="p-0 font-bold text-[9px] text-[#0054FF]" @click="inviteVendor(vendor.name)">ชวนร่วมประมูล</UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Price Index Benchmark -->
      <UCard class="lg:col-span-1 border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <template #header>
          <div class="flex items-center gap-2 border-b pb-3">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-[#0054FF]" />
            <h3 class="font-bold text-slate-800 text-sm">AI Price Benchmarking (เปรียบเทียบตลาด)</h3>
          </div>
        </template>

        <div class="space-y-3.5 text-xs mt-2">
          <p class="text-slate-500 text-[10px] leading-relaxed">
            วิเคราะห์แนวโน้มราคาตลาดจาก Social Listening และประกาศราคาวัสดุก่อสร้างกลางของราชการ เปรียบเทียบกับราคาสัญญากลางปัจจุบัน:
          </p>

          <div class="space-y-2.5">
            <div v-for="trend in marketPriceTrends" :key="trend.item" class="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
              <div>
                <span class="font-bold text-slate-800 block text-[11px]">{{ trend.item }}</span>
                <span class="text-[9px] text-slate-400 font-mono">ราคากลางตลาด: {{ trend.benchmark }}</span>
              </div>
              <div class="text-right">
                <span class="font-extrabold text-[#0054FF] block">{{ trend.ourAvg }} <span class="text-[8px] text-slate-400 font-normal">(สัญญา)</span></span>
                <span 
                  class="text-[9px] font-black"
                  :class="trend.change.startsWith('+') ? 'text-red-500' : 'text-green-500'"
                >
                  {{ trend.change }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const search = ref('');
const filterStatus = ref('ทั้งหมด');
const rfqList = ref<any[]>([]);

const aiScrapedVendors = ref([
  { name: 'บริษัท ซีเมนต์เจริญรุ่งเรือง จำกัด', category: 'วัสดุก่อสร้าง / ปูนซีเมนต์', matchScore: '98%', source: 'YellowPages', highlight: 'ราคาส่งปูนปอร์ตแลนด์ต่ำกว่าตลาด 2.5%' },
  { name: 'บริษัท เหล็กกล้าบูรพา โลหะการ จำกัด', category: 'งานเหล็กเส้น / เหล็กรูปพรรณ', matchScore: '94%', source: 'TIS Database', highlight: 'ได้รับการรับรอง มอก. ล่าสุด จัดส่งรวดเร็ว' },
  { name: 'บริษัท สมาร์ท คอนสตรัคชั่น ซัพพลายส์ จำกัด', category: 'เครื่องมือและอุปกรณ์ช่าง', matchScore: '89%', source: 'Google Maps Business', highlight: 'บริการเช่าเครื่องมือขนาดใหญ่ในนิคมปทุมธานี' }
]);

const marketPriceTrends = ref([
  { item: 'ปูนซีเมนต์ถุงปอร์ตแลนด์ (ตลาด)', change: '+1.2%', benchmark: '150 ฿', ourAvg: '145 ฿' },
  { item: 'เหล็กเส้นกลม SR24 (ตลาด)', change: '-0.8%', benchmark: '218 ฿', ourAvg: '214 ฿' },
  { item: 'น้ำมันดีเซลหมุนเร็ว B7 (ลิตร)', change: '+4.5%', benchmark: '33.5 ฿', ourAvg: '32.8 ฿' }
]);

const inviteVendor = (name: string) => {
  alert(`ส่งจดหมายและเชิญคู่ค้า "${name}" เข้าร่วมโครงการ RFQ จัดซื้อผ่านอีเมลสำเร็จ!`);
};

const loadRfqs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/bidding/rfq', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    rfqList.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Loading mock RFQs.');
    rfqList.value = [
      {
        rfq_id: '1',
        rfq_no: 'RFQ2606001',
        title: 'จัดซื้อโน้ตบุ๊ค 14 นิ้ว สำหรับทีมวิศวกรรวม 30 เครื่อง',
        description: 'จัดทำโครงการประกวดราคาจัดซื้อโน้ตบุ๊คประสิทธิภาพสูงพร้อมเงื่อนไขรับประกัน 3 ปี',
        close_date: new Date(Date.now() - 3600000), // closed 1 hr ago
        status: 'OpenForQuotation',
        vendors: [{}, {}, {}],
        quotations: [
          { vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
          { vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' } },
          { vendor: { vendor_name: 'บริษัท เทคโนโลยี เน็กซ์ จำกัด' } }
        ],
      },
      {
        rfq_id: '2',
        rfq_no: 'RFQ2606002',
        title: 'จัดหาเก้าอี้สำนักงานและโต๊ะทำงานสำนักงาน B2C',
        description: 'ประมูลราคาโต๊ะทำงานและเก้าอี้ทำงานสำนักงานใหญ่ปทุมธานี',
        close_date: new Date(Date.now() + 86400000 * 5), // closes in 5 days
        status: 'OpenForQuotation',
        vendors: [{}, {}, {}],
        quotations: [
          { vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด' } }
        ],
      },
      {
        rfq_id: '3',
        rfq_no: 'RFQ2606003',
        title: 'บำรุงรักษาเครื่องปรับอากาศคลังสินค้าใหญ่ ประจำปี 2026',
        description: 'จัดจ้างผู้รับเหมาบริการทำความสะอาดและบำรุงรักษาเครื่องปรับอากาศ',
        close_date: new Date(Date.now() - 86400000 * 2), // closed 2 days ago
        status: 'Awarded',
        vendors: [{}, {}, {}],
        quotations: [
          { status: 'Selected', vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' } },
          { status: 'NotSelected', vendor: { vendor_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด' } },
          { status: 'NotSelected', vendor: { vendor_name: 'บริษัท คลีนโปร เซอร์วิส จำกัด' } }
        ],
      }
    ];
  }
};

const isExpired = (closeDate: any) => {
  return new Date() > new Date(closeDate);
};

const isClosedButNotAwarded = (rfq: any) => {
  return isExpired(rfq.close_date) && rfq.status === 'OpenForQuotation';
};

const filteredRfqs = computed(() => {
  return rfqList.value.filter((r) => {
    if (filterStatus.value !== 'ทั้งหมด') {
      if (filterStatus.value === 'OpenForQuotation' && isExpired(r.close_date)) {
        return false;
      }
      if (r.status !== filterStatus.value) {
        return false;
      }
    }
    if (search.value) {
      const q = search.value.toLowerCase();
      return r.rfq_no?.toLowerCase().includes(q) || r.title?.toLowerCase().includes(q);
    }
    return true;
  });
});

const formatStatus = (rfq: any) => {
  if (rfq.status === 'Awarded') return 'ตัดสินผลแล้ว (Awarded)';
  if (isExpired(rfq.close_date)) return 'ปิดรับเสนอราคา (Closed)';
  if (rfq.status === 'OpenForQuotation') return 'เปิดรับราคา (Active)';
  return rfq.status;
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
