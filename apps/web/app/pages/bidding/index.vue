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

    <!-- Stats summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-trophy" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">โครงการทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ rfqList.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
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
      <div class="bg-white border border-amber-200 rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <UIcon name="i-heroicons-scale" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอตัดสินผล</span>
          <span class="text-lg font-bold text-amber-600">
            {{ rfqList.filter(r => r.status === 'PendingEvaluation').length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Search & Filter Tab -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[#eff1f5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="search" 
            placeholder="ค้นหาเลขที่ RFQ หรือหัวข้อโครงการ..." 
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
          />
        </div>
        <div class="flex items-center gap-2">
          <select v-model="filterStatus" class="ds-select" style="width:180px">
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="OpenForQuotation">เปิดรับใบเสนอ</option>
            <option value="UnderEvaluation">กำลังประเมิน</option>
            <option value="Awarded">ตัดสินแล้ว</option>
            <option value="Draft">ร่างเอกสาร</option>
          </select>
        </div>
      </div>

      <!-- RFQ Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3.5">เลขที่โครงการ</th>
              <th class="px-6 py-3.5">หัวข้อประกวดราคา</th>
              <th class="px-6 py-3.5">ปิดรับซองเสนอราคา</th>
              <th class="px-6 py-3.5 text-center">จำนวนคู่ค้าที่เชิญ</th>
              <th class="px-6 py-3.5 text-center">ยื่นเสนอแล้ว</th>
              <th class="px-6 py-3.5 text-center">สถานะ</th>
              <th class="px-6 py-3.5 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="rfq in filteredRfqs" :key="rfq.rfq_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-5 font-bold text-[var(--primary)]">{{ rfq.rfq_no }}</td>
              <td class="px-6 py-5">
                <div class="font-medium text-[var(--foreground)]">{{ rfq.title }}</div>
                <div class="text-[10px] text-[var(--muted-foreground)] mt-0.5 line-clamp-1 max-w-sm">
                  {{ rfq.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}
                </div>
              </td>
              <td class="px-6 py-5 text-xs">
                <div class="text-[var(--foreground)] font-medium">{{ formatDate(rfq.close_date) }}</div>
                <span
                  v-if="isExpired(rfq.close_date) && rfq.status === 'OpenForQuotation'"
                  class="text-[9px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5"
                >
                  <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                  ปิดรับซองแล้ว
                </span>
              </td>
              <td class="px-6 py-5 text-center font-medium">{{ rfq.vendors?.length || 0 }} ราย</td>
              <td class="px-6 py-5 text-center font-bold text-slate-700">
                {{ rfq.quotations?.length || 0 }} ราย
              </td>
              <td class="px-6 py-5 text-center">
                <StatusBadge :status="rfq.status === 'OpenForQuotation' && isExpired(rfq.close_date) ? 'UnderEvaluation' : rfq.status" />
              </td>
              <td class="px-6 py-5 text-center">
                <div class="flex items-center justify-center gap-1.5 flex-wrap">
                  <!-- OpenForQuotation: disabled compare + ชวนผู้ขาย -->
                  <template v-if="rfq.status === 'OpenForQuotation' && !isExpired(rfq.close_date)">
                    <span
                      class="action-btn action-btn--neutral"
                      style="opacity:0.5;cursor:not-allowed"
                      title="เปิดเปรียบเทียบได้หลังปิดรับเสนอราคา"
                    >
                      ซองยังไม่เปิด
                    </span>
                    <button class="action-btn action-btn--neutral" @click="inviteVendorToRfq(rfq)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                      ชวนผู้ขาย
                    </button>
                  </template>

                  <!-- PendingEvaluation: compare (enabled) + ประกาศผล -->
                  <template v-else-if="rfq.status === 'PendingEvaluation'">
                    <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" class="action-btn action-btn--compare">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                      เปรียบเทียบ
                    </NuxtLink>
                    <button class="action-btn action-btn--review" @click="announceAward(rfq)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
                      ประกาศผล
                    </button>
                  </template>

                  <!-- OpenForQuotation expired (treat as PendingEvaluation) -->
                  <template v-else-if="rfq.status === 'OpenForQuotation' && isExpired(rfq.close_date)">
                    <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" class="action-btn action-btn--compare">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                      เปรียบเทียบและตัดสิน
                    </NuxtLink>
                    <button class="action-btn action-btn--neutral" @click="inviteVendorToRfq(rfq)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                      ชวนผู้ขาย
                    </button>
                  </template>

                  <!-- Awarded: ดูผล -->
                  <template v-else-if="rfq.status === 'Awarded'">
                    <NuxtLink :to="`/bidding/${rfq.rfq_id}/compare`" class="action-btn action-btn--view">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูผล
                    </NuxtLink>
                  </template>

                  <!-- NoAward: เปิดประมูลใหม่ -->
                  <template v-else-if="rfq.status === 'NoAward'">
                    <button class="action-btn action-btn--compare" @click="reopenRfq(rfq)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      เปิดประมูลใหม่
                    </button>
                  </template>

                  <!-- Cancelled: ดูรายละเอียด -->
                  <template v-else-if="rfq.status === 'Cancelled'">
                    <button class="action-btn action-btn--neutral" @click="alert(`รายละเอียด ${rfq.rfq_no}: ${rfq.description || rfq.title}`)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูรายละเอียด
                    </button>
                  </template>
                </div>
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

// Per-row RFQ action handlers
const inviteVendorToRfq = (rfq: any) => {
  alert(`ส่งคำเชิญประกวดราคา ${rfq.rfq_no} ไปยังผู้ขายในรายการแล้ว`);
};

const announceAward = (rfq: any) => {
  if (!confirm(`ยืนยันประกาศผลการตัดสินโครงการ ${rfq.rfq_no} ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้`)) return;
  rfq.status = 'Awarded';
  alert(`ประกาศผลการตัดสิน ${rfq.rfq_no} เรียบร้อยแล้ว`);
};

const reopenRfq = (rfq: any) => {
  const newCloseDate = new Date(Date.now() + 86400000 * 7);
  rfq.status = 'OpenForQuotation';
  rfq.close_date = newCloseDate;
  const closeDateStr = newCloseDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  alert(`เปิดประมูล ${rfq.rfq_no} ใหม่แล้ว กำหนดปิดรับซอง ${closeDateStr}`);
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
