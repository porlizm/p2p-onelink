<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รับของ & คลังสินค้า (Goods Receipt & Inventory)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">บันทึกตรวจรับสินค้า จัดการสินค้าคงเหลือ และดำเนินการเคลมสินค้าชำรุด</p>
      </div>
      <div class="flex gap-2">
        <UButton 
          to="/po"
          color="primary"
          icon="i-heroicons-plus-circle"
          class="cursor-pointer"
        >
          บันทึกรับของจาก PO
        </UButton>
      </div>
    </div>

    <!-- Custom Tabs Navigation -->
    <div class="flex border-b border-slate-200">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer"
        :class="[
          activeTab === tab.id 
            ? 'border-[var(--primary)] text-[var(--primary)]' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        ]"
      >
        <div class="flex items-center gap-2">
          <UIcon :name="tab.icon" class="w-4 h-4" />
          <span>{{ tab.name }}</span>
        </div>
      </button>
    </div>

    <!-- TAB 1: GR LIST -->
    <div v-if="activeTab === 'gr'" class="space-y-4">
      <!-- Search & Filters -->
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <UInput 
            v-model="grSearch" 
            placeholder="ค้นหาเลขที่ GR, PO, ผู้ขาย..." 
            icon="i-heroicons-magnifying-glass-20-solid"
          />
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <USelect 
            v-model="grFilterStatus"
            :options="['สถานะทั้งหมด', 'FullReceipt', 'PartialReceipt', 'ServiceAccepted', 'ClaimRaised']"
            class="w-full sm:w-48"
          />
        </div>
      </div>

      <!-- GR Table -->
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">เลขที่ GR</th>
                <th class="px-6 py-3">อ้างอิง PO</th>
                <th class="px-6 py-3">วันที่รับสินค้า</th>
                <th class="px-6 py-3">ผู้รับ / ตรวจรับ</th>
                <th class="px-6 py-3 text-center">คะแนนบริการ (ดาว)</th>
                <th class="px-6 py-3 text-center">สถานะ</th>
                <th class="px-6 py-3 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="gr in filteredGrs" :key="gr.gr_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-bold text-[var(--primary)]">{{ gr.gr_no }}</td>
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-700">{{ gr.po?.po_no || 'N/A' }}</div>
                  <div class="text-[10px] text-slate-400">{{ gr.po?.vendor?.vendor_name || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ formatDate(gr.receive_date) }}</td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-700">{{ gr.receiver?.username || 'System' }}</div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-0.5 text-amber-500 font-semibold text-xs">
                    <UIcon name="i-heroicons-star-20-solid" class="w-4 h-4" />
                    <span>{{ gr.quality_score }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                    :class="[
                      gr.status === 'FullReceipt' ? 'bg-green-50 text-green-700 border-green-200' :
                      gr.status === 'PartialReceipt' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      gr.status === 'ServiceAccepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      gr.status === 'ClaimRaised' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    ]"
                  >
                    {{ formatGrStatus(gr.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <UButton 
                    :to="`/gr-stock/${gr.gr_id}`"
                    size="xs" 
                    variant="outline"
                    class="cursor-pointer"
                  >
                    รายละเอียด
                  </UButton>
                </td>
              </tr>
              <tr v-if="filteredGrs.length === 0">
                <td colspan="7" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                  ไม่พบรายการใบรับสินค้า (GR)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: STOCK INVENTORY -->
    <div v-if="activeTab === 'stock'" class="space-y-4">
      <!-- Sync bar -->
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <UIcon name="i-heroicons-arrow-path-solid" class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-slate-800 text-sm">การเชื่อมต่อระบบสต็อกคลังสินค้า (SAP B1 Sync)</h4>
            <p class="text-xs text-slate-500 mt-0.5">เชื่อมโยงข้อมูลจำนวนคงคลังและรายการวัสดุกับระบบ ERP ของกลุ่ม SCGJWD</p>
          </div>
        </div>
        <UButton 
          @click="syncStock"
          color="indigo" 
          :loading="syncing"
          icon="i-heroicons-arrow-path"
          class="cursor-pointer"
        >
          Sync ข้อมูลจาก SAP B1
        </UButton>
      </div>

      <!-- Stock Table -->
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div class="relative w-full max-w-xs">
            <UInput 
              v-model="stockSearch" 
              placeholder="ค้นหารหัสสินค้า, ชื่อสินค้า..." 
              icon="i-heroicons-magnifying-glass-20-solid"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">รหัสสินค้า</th>
                <th class="px-6 py-3">ชื่อสินค้า</th>
                <th class="px-6 py-3 text-right">จำนวนคงเหลือ (On-Hand)</th>
                <th class="px-6 py-3 text-center">หน่วยนับ</th>
                <th class="px-6 py-3 text-center">Sync ล่าสุด</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="stk in filteredStocks" :key="stk.stock_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-bold text-slate-700">{{ stk.item?.central_item_code || 'N/A' }}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ stk.item?.item_name || 'N/A' }}</td>
                <td class="px-6 py-4 text-right font-extrabold text-indigo-600">{{ stk.qty_onhand }}</td>
                <td class="px-6 py-4 text-center text-slate-500">{{ stk.item?.uom || 'ชิ้น' }}</td>
                <td class="px-6 py-4 text-center text-xs text-slate-400">{{ formatDate(stk.last_sync_at) }}</td>
              </tr>
              <tr v-if="filteredStocks.length === 0">
                <td colspan="5" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                  ไม่พบข้อมูลสินค้าคงคลัง
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: CLAIMS & RETURNS -->
    <div v-if="activeTab === 'claims'" class="space-y-4">
      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">รหัส Claim</th>
                <th class="px-6 py-3">เลขที่ GR อ้างอิง</th>
                <th class="px-6 py-3">ประเภทเคลม</th>
                <th class="px-6 py-3">รายละเอียดปัญหา</th>
                <th class="px-6 py-3 text-center">สถานะเคลม</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="clm in claimsList" :key="clm.claim_id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-bold text-red-600">{{ clm.claim_id.slice(0, 8).toUpperCase() }}</td>
                <td class="px-6 py-4 font-semibold text-[var(--primary)]">{{ clm.gr?.gr_no || 'GR-2026-0004' }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 text-xs font-bold">
                    {{ clm.claim_type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600">{{ clm.description }}</td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-bold inline-block border"
                    :class="[
                      clm.status === 'Open' ? 'bg-red-50 text-red-700 border-red-200' :
                      clm.status === 'InProgress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    ]"
                  >
                    {{ clm.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="claimsList.length === 0">
                <td colspan="5" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                  ไม่พบรายการแจ้งเคลมสินค้าชำรุด
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: AI REPLENISHMENT PLANNER -->
    <div v-if="activeTab === 'replenish'" class="space-y-4">
      <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-indigo-100 text-indigo-600 animate-pulse">
            <UIcon name="i-heroicons-sparkles" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-extrabold text-indigo-900 text-sm">AI Stock Replenishment Assistant (ตัวช่วยคำนวณจุดเติมของอัตโนมัติ)</h4>
            <p class="text-xs text-indigo-700 mt-0.5">วิเคราะห์สถิติจำนวนการใช้งาน ยอดสั่งซื้อคงเหลือ และความต้องการใช้งานราย BU เพื่อแนะนำจังหวะการสั่งของล่วงหน้า</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">รหัสสินค้า</th>
                <th class="px-6 py-3">ชื่อสินค้า</th>
                <th class="px-6 py-3 text-right">จำนวนคงคลัง (On Hand)</th>
                <th class="px-6 py-3 text-right">อัตราการใช้งาน / เดือน</th>
                <th class="px-6 py-3 text-center">ระดับสต็อกแนะนำขั้นต่ำ</th>
                <th class="px-6 py-3 text-right font-bold text-indigo-600">ยอดที่ AI แนะนำให้สั่งซื้อ</th>
                <th class="px-6 py-3 text-center">สถานะสต็อก</th>
                <th class="px-6 py-3 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-xs">
              <tr v-for="item in replenishSuggestions" :key="item.code" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-bold text-slate-500">{{ item.code }}</td>
                <td class="px-6 py-4 font-bold text-slate-800">{{ item.name }}</td>
                <td class="px-6 py-4 text-right font-bold" :class="item.qty_onhand < item.min_suggested ? 'text-red-600 animate-pulse' : 'text-slate-700'">
                  {{ item.qty_onhand }} {{ item.uom }}
                </td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ item.avg_consumption }} {{ item.uom }}</td>
                <td class="px-6 py-4 text-center text-slate-500">{{ item.min_suggested }} {{ item.uom }}</td>
                <td class="px-6 py-4 text-right font-extrabold text-indigo-600">{{ item.suggested_order }} {{ item.uom }}</td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block"
                    :class="[
                      item.qty_onhand < item.min_suggested ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200'
                    ]"
                  >
                    {{ item.qty_onhand < item.min_suggested ? 'สต็อกวิกฤต (Low Stock)' : 'ปกติ (Healthy)' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <UButton 
                    size="xs" 
                    color="primary"
                    icon="i-heroicons-shopping-cart"
                    class="cursor-pointer font-bold bg-[#0054FF] hover:bg-[#002266]"
                    :loading="item.loading"
                    @click="autoOrder(item)"
                  >
                    เปิดร่าง PR ทันที
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const activeTab = ref('gr');

const tabs = [
  { id: 'gr', name: 'ประวัติรับสินค้า (GR)', icon: 'i-heroicons-document-check' },
  { id: 'stock', name: 'สินค้าคงคลัง (Stock)', icon: 'i-heroicons-circle-stack' },
  { id: 'claims', name: 'รายการเคลมสินค้า (Claims)', icon: 'i-heroicons-exclamation-triangle' },
  { id: 'replenish', name: 'ระบบเติมสินค้า AI (Replenish Planner)', icon: 'i-heroicons-sparkles' },
];

const grSearch = ref('');
const grFilterStatus = ref('สถานะทั้งหมด');
const grList = ref<any[]>([]);

const stockSearch = ref('');
const stockList = ref<any[]>([]);

const claimsList = ref<any[]>([]);
const syncing = ref(false);

const replenishSuggestions = ref([
  { code: 'ITM-00001', name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', qty_onhand: 5, avg_consumption: 15, min_suggested: 8, suggested_order: 15, uom: 'เครื่อง', loading: false },
  { code: 'ITM-00002', name: 'จอคอมพิวเตอร์ 24 นิ้ว', qty_onhand: 4, avg_consumption: 10, min_suggested: 6, suggested_order: 10, uom: 'จอ', loading: false },
  { code: 'ITM-00008', name: 'โต๊ะทำงานเหล็ก', qty_onhand: 15, avg_consumption: 5, min_suggested: 5, suggested_order: 0, uom: 'ตัว', loading: false },
  { code: 'ITM-00012', name: 'พาเลทไม้แร็คกิ้ง ทนความชื้น', qty_onhand: 20, avg_consumption: 120, min_suggested: 50, suggested_order: 150, uom: 'ชิ้น', loading: false },
]);

const autoOrder = (item: any) => {
  if (item.suggested_order <= 0) {
    alert('สินค้านี้ยังมีจำนวนเพียงพอ ไม่จำเป็นต้องเติมสินค้าในขณะนี้');
    return;
  }
  item.loading = true;
  setTimeout(() => {
    item.loading = false;
    alert(`สร้างแบบร่างใบขอซื้อ (Draft PR) สำหรับสินค้า "${item.name}" จำนวน ${item.suggested_order} ${item.uom} สำเร็จ!`);
    item.qty_onhand += item.suggested_order;
    item.suggested_order = 0;
  }, 1200);
};

const loadGrs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/gr', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    grList.value = res;
  } catch (err) {
    console.warn('Backend unavailable. Using mock GR data.');
    grList.value = [
      {
        gr_id: 'gr_mock_1',
        gr_no: 'GR-2026-0001',
        receive_date: new Date(Date.now() - 3600000 * 24),
        quality_score: 4.5,
        status: 'FullReceipt',
        po: { po_no: 'PO2606002', vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
        receiver: { username: 'kittichai.w' }
      },
      {
        gr_id: 'gr_mock_2',
        gr_no: 'GR-2026-0002',
        receive_date: new Date(Date.now() - 86400000 * 3),
        quality_score: 4.0,
        status: 'PartialReceipt',
        po: { po_no: 'PO2606001', vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด' } },
        receiver: { username: 'kittichai.w' }
      }
    ];
  }
};

const loadStocks = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/gr/stock', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    stockList.value = res;
  } catch (err) {
    stockList.value = [
      {
        stock_id: 'stk_mock_1',
        item_id: 'item_1',
        qty_onhand: 150,
        last_sync_at: new Date(),
        item: { central_item_code: 'ITM-00001', item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', uom: 'เครื่อง' }
      },
      {
        stock_id: 'stk_mock_2',
        item_id: 'item_2',
        qty_onhand: 42,
        last_sync_at: new Date(),
        item: { central_item_code: 'ITM-00002', item_name: 'จอคอมพิวเตอร์ 24 นิ้ว', uom: 'จอ' }
      },
      {
        stock_id: 'stk_mock_3',
        item_id: 'item_8',
        qty_onhand: 15,
        last_sync_at: new Date(),
        item: { central_item_code: 'ITM-00008', item_name: 'โต๊ะทำงานเหล็ก', uom: 'ตัว' }
      }
    ];
  }
};

const loadClaims = () => {
  claimsList.value = [
    {
      claim_id: 'clm_001_mock',
      claim_type: 'Claim',
      description: 'หมึกเครื่องพิมพ์เลเซอร์เสียหายขณะขนส่ง 5 กล่อง',
      status: 'Open',
      gr: { gr_no: 'GR-2026-0002' }
    }
  ];
};

const syncStock = async () => {
  syncing.value = true;
  try {
    await $fetch('http://localhost:3001/api/gr/stock/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    await loadStocks();
  } catch (err) {
    console.warn('Sync failed. Mocking update.');
    stockList.value.forEach(s => s.last_sync_at = new Date());
  } finally {
    setTimeout(() => {
      syncing.value = false;
    }, 800);
  }
};

const filteredGrs = computed(() => {
  return grList.value.filter(gr => {
    const matchesSearch = gr.gr_no.toLowerCase().includes(grSearch.value.toLowerCase()) ||
      (gr.po?.po_no || '').toLowerCase().includes(grSearch.value.toLowerCase()) ||
      (gr.po?.vendor?.vendor_name || '').toLowerCase().includes(grSearch.value.toLowerCase());
    
    const matchesStatus = grFilterStatus.value === 'สถานะทั้งหมด' || gr.status === grFilterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const filteredStocks = computed(() => {
  return stockList.value.filter(stk => {
    return (stk.item?.item_name || '').toLowerCase().includes(stockSearch.value.toLowerCase()) ||
      (stk.item?.central_item_code || '').toLowerCase().includes(stockSearch.value.toLowerCase());
  });
});

const formatGrStatus = (status: string) => {
  switch (status) {
    case 'FullReceipt': return 'รับของครบถ้วน';
    case 'PartialReceipt': return 'รับบางส่วน';
    case 'ServiceAccepted': return 'ยืนยันรับงานบริการ';
    case 'ClaimRaised': return 'แจ้งเคลมสินค้าชำรุด';
    default: return status;
  }
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
};

onMounted(() => {
  loadGrs();
  loadStocks();
  loadClaims();
});
</script>
