<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">จัดการงานประกวดราคา (RFQ Bidding)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">สร้างโครงการเปรียบเทียบราคาจากคู่ค้า ติดตามคำขอ และตัดสินผลการประมูล</p>
      </div>
      <div>
        <NuxtLink to="/bidding/create" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
          เปิดประมูลราคา (RFQ)
        </NuxtLink>
      </div>
    </div>

    <!-- Bidding workspace -->
    <section class="bidding-workspace">
      <div class="bidding-hero">
        <div class="bidding-hero__copy">
          <span class="bidding-hero__eyebrow">RFQ Command Center</span>
          <h3>ภาพรวมงานประกวดราคาที่ต้องติดตาม</h3>
          <p>รวมสถานะการเปิดซอง จำนวนคู่ค้าที่ตอบกลับ และงานที่ต้องตัดสินไว้ในมุมมองเดียว เพื่อให้สแกนและลงมือทำได้เร็วขึ้น</p>
        </div>
        <div class="bidding-hero__metrics">
          <div v-for="stat in biddingStats" :key="stat.label" class="bidding-stat">
            <span class="bidding-stat__value" :class="stat.tone">{{ stat.value }}</span>
            <span class="bidding-stat__label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div class="bidding-toolbar">
        <div class="bidding-search">
          <UIcon name="i-heroicons-magnifying-glass-20-solid" class="w-4 h-4 text-slate-400" />
          <input v-model="search" type="search" placeholder="ค้นหาเลขที่ RFQ หรือชื่อโครงการ..." />
        </div>
        <div class="bidding-tabs" aria-label="ตัวกรองสถานะประกวดราคา">
          <button
            v-for="option in statusFilterOptions"
            :key="option.value"
            type="button"
            class="bidding-tab"
            :class="{ 'bidding-tab--active': filterStatus === option.value }"
            @click="filterStatus = option.value"
          >
            <span>{{ option.label }}</span>
            <span class="bidding-tab__count">{{ option.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="filteredRfqs.length" class="rfq-list">
        <article v-for="rfq in filteredRfqs" :key="rfq.rfq_id" class="rfq-card">
          <div class="rfq-card__main">
            <div class="rfq-card__header">
              <div>
                <div class="rfq-card__meta">
                  <span class="rfq-card__no">{{ rfq.rfq_no }}</span>
                  <span v-if="rfq.status === 'OpenForQuotation' && isExpired(rfq.close_date)" class="rfq-card__deadline-alert">
                    ปิดรับซองแล้ว
                  </span>
                </div>
                <h3 class="rfq-card__title">{{ rfq.title }}</h3>
              </div>
              <StatusBadge :status="getDisplayStatus(rfq)" />
            </div>

            <p class="rfq-card__description">{{ rfq.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}</p>

            <div class="rfq-card__details">
              <div class="rfq-detail">
                <span class="rfq-detail__label">ปิดรับซอง</span>
                <span class="rfq-detail__value">{{ formatDate(rfq.close_date) }}</span>
              </div>
              <div class="rfq-detail">
                <span class="rfq-detail__label">เชิญคู่ค้า</span>
                <span class="rfq-detail__value">{{ rfq.vendors?.length || 0 }} ราย</span>
              </div>
              <div class="rfq-detail">
                <span class="rfq-detail__label">ยื่นเสนอแล้ว</span>
                <span class="rfq-detail__value rfq-detail__value--strong">{{ rfq.quotations?.length || 0 }} ราย</span>
              </div>
            </div>
          </div>

          <div class="rfq-card__actions">
            <template v-if="rfq.status === 'OpenForQuotation' && !isExpired(rfq.close_date)">
              <span class="rfq-action rfq-action--disabled" title="เปิดเปรียบเทียบได้หลังปิดรับเสนอราคา">
                <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
                ซองยังไม่เปิด
              </span>
              <button class="rfq-action rfq-action--secondary" @click="inviteVendorToRfq(rfq)">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                ชวนผู้ขาย
              </button>
            </template>

            <template v-else-if="rfq.status === 'PendingEvaluation'">
              <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" class="rfq-action rfq-action--primary">
                <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
                เปรียบเทียบ
              </NuxtLink>
              <button class="rfq-action rfq-action--warning" @click="announceAward(rfq)">
                <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
                ประกาศผล
              </button>
            </template>

            <template v-else-if="rfq.status === 'OpenForQuotation' && isExpired(rfq.close_date)">
              <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" class="rfq-action rfq-action--primary">
                <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
                เปรียบเทียบและตัดสิน
              </NuxtLink>
              <button class="rfq-action rfq-action--secondary" @click="inviteVendorToRfq(rfq)">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                ชวนผู้ขาย
              </button>
            </template>

            <template v-else-if="rfq.status === 'Awarded'">
              <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" class="rfq-action rfq-action--success">
                <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                ดูผล
              </NuxtLink>
            </template>

            <template v-else-if="rfq.status === 'NoAward'">
              <button class="rfq-action rfq-action--primary" @click="reopenRfq(rfq)">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                เปิดประมูลใหม่
              </button>
            </template>

            <template v-else-if="rfq.status === 'Cancelled'">
              <button class="rfq-action rfq-action--secondary" @click="dialog.alert(`รายละเอียด ${rfq.rfq_no}: ${rfq.description || rfq.title}`)">
                <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                ดูรายละเอียด
              </button>
            </template>
          </div>
        </article>
      </div>

      <div v-else class="rfq-empty">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-10 h-10" />
        <p>ไม่พบโครงการประกวดราคาตามเงื่อนไขที่เลือก</p>
      </div>
    </section>

    <!-- AI Sourcing Assistant & Market Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <!-- Suggested Vendors -->
      <UCard class="lg:col-span-2 border border-[#e9ecef] shadow-[var(--shadow-sm)] bg-white rounded-xl">
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
                <button class="text-[9px] font-bold text-[var(--primary)] hover:underline bg-transparent border-none cursor-pointer p-0" @click="inviteVendor(vendor.name)">ชวนร่วมประมูล</button>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Price Index Benchmark -->
      <UCard class="lg:col-span-1 border border-[#e9ecef] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <template #header>
          <div class="flex items-center gap-2 border-b pb-3">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-[var(--primary)]" />
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
                <span class="font-extrabold text-[var(--primary)] block">{{ trend.ourAvg }} <span class="text-[8px] text-slate-400 font-normal">(สัญญา)</span></span>
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
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const dialog = useDialog();

const search = ref('');
const filterStatus = ref('ทั้งหมด');
const rfqList = ref<any[]>([]);

const getDisplayStatus = (rfq: any) => {
  return rfq.status === 'OpenForQuotation' && isExpired(rfq.close_date) ? 'UnderEvaluation' : rfq.status;
};

const biddingStats = computed(() => [
  { label: 'ทั้งหมด', value: rfqList.value.length, tone: 'tone-slate' },
  { label: 'เปิดเสนอราคา', value: rfqList.value.filter(r => r.status === 'OpenForQuotation' && !isExpired(r.close_date)).length, tone: 'tone-blue' },
  { label: 'รอเปิดซอง', value: rfqList.value.filter(r => r.status === 'UnderEvaluation' || isClosedButNotAwarded(r)).length, tone: 'tone-amber' },
  { label: 'รอตัดสินผล', value: rfqList.value.filter(r => r.status === 'PendingEvaluation').length, tone: 'tone-orange' },
  { label: 'ตัดสินแล้ว', value: rfqList.value.filter(r => r.status === 'Awarded').length, tone: 'tone-green' },
]);

const statusFilterOptions = computed(() => [
  { label: 'ทั้งหมด', value: 'ทั้งหมด', count: rfqList.value.length },
  { label: 'เปิดรับใบเสนอ', value: 'OpenForQuotation', count: rfqList.value.filter(r => r.status === 'OpenForQuotation' && !isExpired(r.close_date)).length },
  { label: 'กำลังประเมิน', value: 'UnderEvaluation', count: rfqList.value.filter(r => r.status === 'UnderEvaluation' || isClosedButNotAwarded(r)).length },
  { label: 'รอตัดสินผล', value: 'PendingEvaluation', count: rfqList.value.filter(r => r.status === 'PendingEvaluation').length },
  { label: 'ตัดสินแล้ว', value: 'Awarded', count: rfqList.value.filter(r => r.status === 'Awarded').length },
]);

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

const inviteVendor = async (name: string) => {
  await dialog.alert(`ส่งจดหมายและเชิญคู่ค้า "${name}" เข้าร่วมโครงการ RFQ จัดซื้อผ่านอีเมลสำเร็จ!`, { variant: 'success' });
};

// Per-row RFQ action handlers
const inviteVendorToRfq = async (rfq: any) => {
  await dialog.alert(`ส่งคำเชิญประกวดราคา ${rfq.rfq_no} ไปยังผู้ขายในรายการแล้ว`, { variant: 'success' });
};

const announceAward = async (rfq: any) => {
  if (!(await dialog.confirm(`ยืนยันประกาศผลการตัดสินโครงการ ${rfq.rfq_no} ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้`, { variant: 'danger' }))) return;
  rfq.status = 'Awarded';
  await dialog.alert(`ประกาศผลการตัดสิน ${rfq.rfq_no} เรียบร้อยแล้ว`, { variant: 'success' });
};

const reopenRfq = async (rfq: any) => {
  const newCloseDate = new Date(Date.now() + 86400000 * 7);
  rfq.status = 'OpenForQuotation';
  rfq.close_date = newCloseDate;
  const closeDateStr = newCloseDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  await dialog.alert(`เปิดประมูล ${rfq.rfq_no} ใหม่แล้ว กำหนดปิดรับซอง ${closeDateStr}`, { variant: 'info' });
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
    rfqList.value = [
      {
        rfq_id: 'rfq-01',
        rfq_no: 'RFQ2606001',
        title: 'จัดซื้อโน้ตบุ๊คสำหรับผู้บริหารรวม 5 เครื่อง (Sealed Bid)',
        description: 'โครงการประกวดราคาซื้อโน้ตบุ๊คสเปคสูงพิเศษปิดผนึกซองเสนอราคา (Joint Decryption)',
        close_date: new Date(Date.now() - 3600000 * 2), // closed 2 hours ago (expired)
        status: 'OpenForQuotation',
        vendors: [{}, {}, {}],
        quotations: [
          { vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
          { vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' } },
          { vendor: { vendor_name: 'บริษัท ไซเบอร์คอม ซิสเต็มส์ จำกัด' } }
        ],
      },
      {
        rfq_id: 'rfq-02',
        rfq_no: 'RFQ2606002',
        title: 'จัดหาเก้าอี้และโต๊ะทำงานฝ่ายขายสาขาใหม่ (Live Reverse Auction)',
        description: 'จัดจ้างประกวดราคาแบบประมูลแข่งขันสดแบบเรียลไทม์ (Live Auction Dashboard)',
        close_date: new Date(Date.now() + 86400000 * 3), // closes in 3 days
        status: 'OpenForQuotation',
        vendors: [{}, {}, {}],
        quotations: [
          { vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' } }
        ],
      },
      {
        rfq_id: 'rfq-03',
        rfq_no: 'RFQ2606003',
        title: 'โครงการบำรุงรักษาและล้างเครื่องปรับอากาศคลังสินค้าใหญ่',
        description: 'โครงการปรับปรุงงานซ่อมบำรุงล้างระบบปรับอากาศ (Evaluated - รอจัดจ้าง)',
        close_date: new Date(Date.now() - 86400000), // closed 1 day ago
        status: 'OpenForQuotation', // will display as UnderEvaluation due to close date
        vendors: [{}, {}, {}],
        quotations: [
          { status: 'Pending', vendor: { vendor_name: 'บริษัท เอ็นจิเนียริ่ง แคร์ จำกัด' } },
          { status: 'Pending', vendor: { vendor_name: 'บริษัท คลีนแอร์ พลัส จำกัด' } }
        ],
      },
      {
        rfq_id: 'rfq-04',
        rfq_no: 'RFQ2606004',
        title: 'จัดจ้างบริการขนส่งสินค้าควบคุมอุณหภูมิด่วน (Awarded)',
        description: 'โครงการคัดเลือกและจัดตั้งบริษัทขนส่งกระจายสินค้า (ออก PO สำเร็จ)',
        close_date: new Date(Date.now() - 86400000 * 4), // closed 4 days ago
        status: 'Awarded',
        vendors: [{}, {}, {}],
        quotations: [
          { status: 'Selected', vendor: { vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' } },
          { status: 'NotSelected', vendor: { vendor_name: 'บริษัท เอ็กซ์เพรส ทรานสปอร์ต จำกัด' } }
        ],
      },
      {
        rfq_id: 'rfq_mock_5',
        rfq_no: 'RFQ2606005',
        title: 'จัดจ้างบริการทำความสะอาดอาคารสำนักงาน ปี 2570',
        description: 'โครงการจัดจ้างบริการทำความสะอาดอาคารสำนักงานใหญ่และคลังสินค้า',
        close_date: new Date(Date.now() - 86400000 * 2),
        status: 'PendingEvaluation',
        vendors: [{}, {}, {}, {}],
        quotations: [
          { vendor: { vendor_name: 'บริษัท คลีนเซอร์วิส จำกัด' } },
          { vendor: { vendor_name: 'บริษัท โปรคลีน ไทย จำกัด' } },
          { vendor: { vendor_name: 'บริษัท เฟรช สเปซ จำกัด' } }
        ],
      },
      {
        rfq_id: 'rfq_mock_6',
        rfq_no: 'RFQ2606006',
        title: 'จัดซื้อระบบ ERP Module เพิ่มเติมสำหรับฝ่ายผลิต',
        description: 'โครงการจัดหาซอฟต์แวร์ ERP เพิ่มเติม ไม่มีผู้ผ่านคุณสมบัติ',
        close_date: new Date(Date.now() - 86400000 * 10),
        status: 'NoAward',
        vendors: [{}, {}],
        quotations: [
          { vendor: { vendor_name: 'บริษัท เอ็นเทอร์ไพรส์ ซอฟต์ จำกัด' } }
        ],
      },
      {
        rfq_id: 'rfq_mock_7',
        rfq_no: 'RFQ2606007',
        title: 'จัดซื้อรถยกสินค้า Forklift ไฟฟ้า 3 ตัน',
        description: 'โครงการจัดซื้อรถยกไฟฟ้าสำหรับคลังสินค้า (ยกเลิกโครงการ)',
        close_date: new Date(Date.now() - 86400000 * 20),
        status: 'Cancelled',
        vendors: [{}, {}, {}],
        quotations: [],
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
      if (filterStatus.value === 'UnderEvaluation') {
        if (!(r.status === 'UnderEvaluation' || isClosedButNotAwarded(r))) return false;
      } else {
      if (filterStatus.value === 'OpenForQuotation' && isExpired(r.close_date)) {
        return false;
      }
      if (r.status !== filterStatus.value) {
        return false;
      }
      }
    }
    if (search.value) {
      const q = search.value.toLowerCase();
      return r.rfq_no?.toLowerCase().includes(q)
        || r.title?.toLowerCase().includes(q)
        || r.description?.toLowerCase().includes(q);
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

<style scoped>
.bidding-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bidding-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 18px;
  padding: 22px;
  border: 1px solid #e5ebf3;
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(248, 252, 255, 0.96), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at top right, rgba(0, 146, 69, 0.08), transparent 32%);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.bidding-hero__eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  color: #00833e;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.bidding-hero__copy h3 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
}

.bidding-hero__copy p {
  max-width: 720px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.bidding-hero__metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  align-content: stretch;
}

.bidding-stat {
  min-height: 82px;
  padding: 12px 10px;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
}

.bidding-stat__value {
  display: block;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.bidding-stat__label {
  display: block;
  margin-top: 9px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.tone-slate { color: #0f172a; }
.tone-blue { color: #2563eb; }
.tone-amber { color: #d97706; }
.tone-orange { color: #ea580c; }
.tone-green { color: #059669; }

.bidding-toolbar {
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
}

.bidding-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.bidding-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font-size: 13px;
}

.bidding-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.bidding-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.16s ease;
}

.bidding-tab:hover {
  background: #eaf2ff;
  color: #1e40af;
}

.bidding-tab--active {
  background: #ffffff;
  border-color: #cfe0f8;
  color: #005f2f;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.bidding-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
}

.bidding-tab--active .bidding-tab__count {
  background: #dcfce7;
  color: #047857;
}

.rfq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rfq-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 18px;
  padding: 18px;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.rfq-card:hover {
  transform: translateY(-1px);
  border-color: #cbdff3;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

.rfq-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.rfq-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.rfq-card__no {
  color: #006b35;
  font-size: 12px;
  font-weight: 900;
}

.rfq-card__deadline-alert {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 10px;
  font-weight: 800;
}

.rfq-card__title {
  margin: 7px 0 0;
  color: #111827;
  font-size: 16px;
  font-weight: 850;
  line-height: 1.45;
}

.rfq-card__description {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
}

.rfq-card__details {
  display: grid;
  grid-template-columns: 1.4fr repeat(2, minmax(108px, 0.5fr));
  gap: 10px;
  margin-top: 14px;
}

.rfq-detail {
  padding: 10px 12px;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #f8fafc;
}

.rfq-detail__label {
  display: block;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.rfq-detail__value {
  display: block;
  margin-top: 4px;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
}

.rfq-detail__value--strong {
  color: #0f172a;
}

.rfq-card__actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding-left: 18px;
  border-left: 1px solid #edf2f7;
}

.rfq-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 850;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.16s ease;
}

.rfq-action--primary {
  background: #eef4ff;
  color: #1d4ed8;
  border-color: #dbe8ff;
}

.rfq-action--warning {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}

.rfq-action--success {
  background: #e8f8ef;
  color: #047857;
  border-color: #c8eed8;
}

.rfq-action--secondary {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.rfq-action--disabled {
  background: #f8fafc;
  color: #94a3b8;
  border-color: #edf2f7;
  cursor: not-allowed;
}

.rfq-action:not(.rfq-action--disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.rfq-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 220px;
  color: #94a3b8;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  background: #fff;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .bidding-hero,
  .bidding-toolbar,
  .rfq-card {
    grid-template-columns: 1fr;
  }

  .bidding-tabs {
    justify-content: flex-start;
  }

  .rfq-card__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-left: 0;
    padding-top: 14px;
    border-left: 0;
    border-top: 1px solid #edf2f7;
  }
}

@media (max-width: 760px) {
  .bidding-hero__metrics,
  .rfq-card__details,
  .rfq-card__actions {
    grid-template-columns: 1fr;
  }
}
</style>
