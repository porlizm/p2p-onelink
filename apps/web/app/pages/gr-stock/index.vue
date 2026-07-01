<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รับของ & คลังสินค้า (Goods Receipt & Inventory)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">บันทึกตรวจรับสินค้า จัดการสินค้าคงเหลือ และดำเนินการเคลมสินค้าชำรุด</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/po" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
          บันทึกรับของจาก PO
        </NuxtLink>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="ds-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- TAB 1: GR LIST -->
    <div v-if="activeTab === 'gr'" class="space-y-4">
      <!-- Search & Filters -->
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-center justify-between gap-4">
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
            :options="[
              { label: 'สถานะทั้งหมด', value: '' },
              { label: 'รับของครบถ้วน', value: 'FullReceipt' },
              { label: 'รับบางส่วน', value: 'PartialReceipt' },
              { label: 'ยืนยันรับงานบริการ', value: 'ServiceAccepted' },
              { label: 'แจ้งเคลมสินค้า', value: 'ClaimRaised' },
            ]"
            class="w-full sm:w-48"
          />
        </div>
      </div>

      <!-- GR Table -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">เลขที่ GR</th>
                <th class="px-6 py-3.5">อ้างอิง PO</th>
                <th class="px-6 py-3.5">วันที่รับสินค้า</th>
                <th class="px-6 py-3.5">ผู้รับ / ตรวจรับ</th>
                <th class="px-6 py-3.5 text-center">คะแนนบริการ (ดาว)</th>
                <th class="px-6 py-3.5 text-center">สถานะ</th>
                <th class="px-6 py-3.5 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-sm">
              <tr v-for="gr in filteredGrs" :key="gr.gr_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5font-bold text-[var(--primary)]">{{ gr.gr_no }}</td>
                <td class="px-6 py-5">
                  <div class="font-bold text-slate-700">{{ gr.po?.po_no || 'N/A' }}</div>
                  <div class="text-[10px] text-slate-400">{{ gr.po?.vendor?.vendor_name || 'N/A' }}</div>
                </td>
                <td class="px-6 py-5text-slate-500">{{ formatDate(gr.receive_date) }}</td>
                <td class="px-6 py-5">
                  <div class="font-medium text-slate-700">{{ gr.receiver?.username || 'System' }}</div>
                </td>
                <td class="px-6 py-5text-center">
                  <div class="flex items-center justify-center gap-0.5 text-amber-500 font-semibold text-xs">
                    <UIcon name="i-heroicons-star-20-solid" class="w-4 h-4" />
                    <span>{{ Number(gr.quality_score) > 5 ? (Number(gr.quality_score) / 2).toFixed(2) : Number(gr.quality_score).toFixed(2) }}</span>
                  </div>
                </td>
                <td class="px-6 py-5text-center">
                  <StatusBadge :status="gr.status" />
                </td>
                <td class="px-6 py-5text-center">
                  <button
                    v-if="gr.status === 'PendingReceipt'"
                    class="action-btn action-btn--review"
                    @click="openReceiveModal(gr)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ตรวจรับสินค้า
                  </button>
                  <NuxtLink
                    v-else
                    :to="`/gr-stock/${gr.gr_id}`"
                    class="action-btn action-btn--view"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    รายละเอียด
                  </NuxtLink>
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
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <UIcon name="i-heroicons-arrow-path-solid" class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-slate-800 text-sm">การเชื่อมต่อระบบสต็อกคลังสินค้า (SAP B1 Sync)</h4>
            <p class="text-xs text-slate-500 mt-0.5">เชื่อมโยงข้อมูลจำนวนคงคลังและรายการวัสดุกับระบบ ERP ของกลุ่ม SCGJWD</p>
          </div>
        </div>
        <button class="btn-outline" :disabled="syncing" @click="syncStock">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
          Sync ข้อมูลจาก SAP B1
        </button>
      </div>

      <!-- Stock Table -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] flex items-center justify-between">
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
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">รหัสสินค้า</th>
                <th class="px-6 py-3.5">ชื่อสินค้า</th>
                <th class="px-6 py-3.5 text-right">จำนวนคงเหลือ (On-Hand)</th>
                <th class="px-6 py-3.5 text-center">หน่วยนับ</th>
                <th class="px-6 py-3.5 text-center">Sync ล่าสุด</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-sm">
              <tr v-for="stk in filteredStocks" :key="stk.stock_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5font-mono font-bold text-slate-700">{{ stk.item?.central_item_code || 'N/A' }}</td>
                <td class="px-6 py-5font-semibold text-slate-800">{{ stk.item?.item_name || 'N/A' }}</td>
                <td class="px-6 py-5text-right font-extrabold text-indigo-600">{{ stk.qty_onhand }}</td>
                <td class="px-6 py-5text-center text-slate-500">{{ stk.item?.uom || 'ชิ้น' }}</td>
                <td class="px-6 py-5text-center text-xs text-slate-400">{{ formatDate(stk.last_sync_at) }}</td>
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
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">รหัส Claim</th>
                <th class="px-6 py-3.5">เลขที่ GR อ้างอิง</th>
                <th class="px-6 py-3.5">ประเภทเคลม</th>
                <th class="px-6 py-3.5">รายละเอียดปัญหา</th>
                <th class="px-6 py-3.5 text-center">สถานะเคลม</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-sm">
              <tr v-for="clm in claimsList" :key="clm.claim_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5font-mono font-bold text-red-600">{{ clm.claim_id.slice(0, 8).toUpperCase() }}</td>
                <td class="px-6 py-5font-semibold text-[var(--primary)]">{{ clm.gr?.gr_no || 'GR-2026-0004' }}</td>
                <td class="px-6 py-5">
                  <span class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 text-xs font-bold">
                    {{ clm.claim_type }}
                  </span>
                </td>
                <td class="px-6 py-5text-slate-600">{{ clm.description }}</td>
                <td class="px-6 py-5text-center">
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

    <!-- GR Receive Modal -->
    <div v-if="showReceiveModal" class="gr-modal-overlay" @click.self="showReceiveModal = false">
      <div class="gr-modal">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-slate-800">ตรวจรับสินค้า</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ selectedGR?.gr_no }} &mdash; อ้างอิง PO: {{ selectedGR?.po?.po_no || 'N/A' }}
              <span class="ml-2 text-slate-400">({{ selectedGR?.po?.vendor?.vendor_name || 'N/A' }})</span>
            </p>
          </div>
          <button class="text-slate-400 hover:text-slate-700 text-xl leading-none" @click="showReceiveModal = false">&times;</button>
        </div>

        <!-- Items table -->
        <div class="border border-[#e9ecef] rounded-lg overflow-hidden mb-4">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-slate-500 uppercase">
                <th class="px-4 py-2.5">รายการสินค้า</th>
                <th class="px-4 py-2.5 text-right">จำนวนที่สั่ง</th>
                <th class="px-4 py-2.5 text-right">จำนวนที่รับ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="(item, idx) in receiveForm.items" :key="idx">
                <td class="px-4 py-2.5 font-medium text-slate-700">{{ item.item_name }}</td>
                <td class="px-4 py-2.5 text-right text-slate-500">{{ item.qty_ordered }} {{ item.uom }}</td>
                <td class="px-4 py-2.5 text-right">
                  <input
                    v-model.number="item.received_qty"
                    type="number"
                    :min="0"
                    :max="item.qty_ordered"
                    class="w-20 border border-[#e9ecef] rounded-lg px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Service rating -->
        <div class="mb-4">
          <label class="text-xs font-semibold text-slate-600 block mb-1.5">คะแนนบริการผู้ขาย</label>
          <div class="flex gap-1">
            <span
              v-for="star in 5"
              :key="star"
              class="star-btn"
              :class="star <= receiveForm.rating ? 'text-amber-400' : 'text-slate-300'"
              @click="receiveForm.rating = star"
            >★</span>
            <span class="ml-2 text-xs text-slate-500 self-center">{{ receiveForm.rating }} / 5</span>
          </div>
        </div>

        <!-- Receive result -->
        <div class="mb-4">
          <label class="text-xs font-semibold text-slate-600 block mb-1.5">ผลการตรวจรับ</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="radio" v-model="receiveForm.result" value="FullReceipt" class="accent-green-500" />
              รับครบถ้วน
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="radio" v-model="receiveForm.result" value="PartialReceipt" class="accent-amber-500" />
              รับบางส่วน
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer text-sm">
              <input type="radio" v-model="receiveForm.result" value="Rejected" class="accent-red-500" />
              ปฏิเสธทั้งหมด
            </label>
          </div>
        </div>

        <!-- Remark -->
        <div class="mb-5">
          <label class="text-xs font-semibold text-slate-600 block mb-1.5">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            v-model="receiveForm.remark"
            rows="2"
            placeholder="ระบุหมายเหตุเพิ่มเติม..."
            class="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-3">
          <button class="action-btn action-btn--neutral" @click="showReceiveModal = false">ยกเลิก</button>
          <button class="action-btn action-btn--review" style="background:#16a34a;color:#fff;border-color:#16a34a;" @click="confirmReceive">
            ยืนยันการรับสินค้า
          </button>
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

      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">รหัสสินค้า</th>
                <th class="px-6 py-3.5">ชื่อสินค้า</th>
                <th class="px-6 py-3.5 text-right">จำนวนคงคลัง (On Hand)</th>
                <th class="px-6 py-3.5 text-right">อัตราการใช้งาน / เดือน</th>
                <th class="px-6 py-3.5 text-center">ระดับสต็อกแนะนำขั้นต่ำ</th>
                <th class="px-6 py-3.5 text-right font-bold text-indigo-600">ยอดที่ AI แนะนำให้สั่งซื้อ</th>
                <th class="px-6 py-3.5 text-center">สถานะสต็อก</th>
                <th class="px-6 py-3.5 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-xs">
              <tr v-for="item in replenishSuggestions" :key="item.code" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5font-mono font-bold text-slate-500">{{ item.code }}</td>
                <td class="px-6 py-5font-bold text-slate-800">{{ item.name }}</td>
                <td class="px-6 py-5text-right font-bold" :class="item.qty_onhand < item.min_suggested ? 'text-red-600 animate-pulse' : 'text-slate-700'">
                  {{ item.qty_onhand }} {{ item.uom }}
                </td>
                <td class="px-6 py-5text-right font-medium text-slate-600">{{ item.avg_consumption }} {{ item.uom }}</td>
                <td class="px-6 py-5text-center text-slate-500">{{ item.min_suggested }} {{ item.uom }}</td>
                <td class="px-6 py-5text-right font-extrabold text-indigo-600">{{ item.suggested_order }} {{ item.uom }}</td>
                <td class="px-6 py-5text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block"
                    :class="[
                      item.qty_onhand < item.min_suggested ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200'
                    ]"
                  >
                    {{ item.qty_onhand < item.min_suggested ? 'สต็อกวิกฤต (Low Stock)' : 'ปกติ (Healthy)' }}
                  </span>
                </td>
                <td class="px-6 py-5text-center">
                  <button class="action-btn action-btn--review" :disabled="item.loading" @click="autoOrder(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                    เปิดร่าง PR
                  </button>
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
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const activeTab = ref('gr');

const showReceiveModal = ref(false);
const selectedGR = ref<any>(null);
const receiveForm = ref({ result: 'FullReceipt', rating: 5, remark: '', items: [] as any[] });

const openReceiveModal = (gr: any) => {
  selectedGR.value = gr;
  receiveForm.value = {
    result: 'FullReceipt',
    rating: 5,
    remark: '',
    items: [
      { item_name: 'สินค้าตามใบสั่งซื้อ ' + (gr.po?.po_no || ''), qty_ordered: 10, received_qty: 10, uom: 'ชิ้น' },
      { item_name: 'อุปกรณ์เสริม', qty_ordered: 5, received_qty: 5, uom: 'ชิ้น' },
    ],
  };
  showReceiveModal.value = true;
};

const confirmReceive = () => {
  if (!selectedGR.value) return;
  selectedGR.value.status = receiveForm.value.result;
  selectedGR.value.quality_score = receiveForm.value.rating;
  showReceiveModal.value = false;
  alert(`บันทึกการรับสินค้า ${selectedGR.value.gr_no} เรียบร้อยแล้ว`);
};

const tabs = [
  { id: 'gr', name: 'ประวัติรับสินค้า (GR)', icon: 'i-heroicons-document-check' },
  { id: 'stock', name: 'สินค้าคงคลัง (Stock)', icon: 'i-heroicons-circle-stack' },
  { id: 'claims', name: 'รายการเคลมสินค้า (Claims)', icon: 'i-heroicons-exclamation-triangle' },
  { id: 'replenish', name: 'ระบบเติมสินค้า AI (Replenish Planner)', icon: 'i-heroicons-sparkles' },
];

const grSearch = ref('');
const grFilterStatus = ref('');
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
        gr_id: 'gr_mock_3',
        gr_no: 'GR-2026-0003',
        receive_date: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        quality_score: 4.8,
        status: 'FullReceipt',
        po: { po_no: 'PO2606002', vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
        receiver: { username: 'kittichai.w' }
      },
      {
        gr_id: 'gr_mock_2',
        gr_no: 'GR-2026-0002',
        receive_date: new Date(Date.now() - 86400000 * 2), // 2 days ago
        quality_score: 3.2,
        status: 'PartialReceipt',
        po: { po_no: 'PO2606003', vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' } },
        receiver: { username: 'kittichai.w' }
      },
      {
        gr_id: 'gr_mock_1',
        gr_no: 'GR-2026-0001',
        receive_date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        quality_score: 5.0,
        status: 'FullReceipt',
        po: { po_no: 'PO2606001', vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
        receiver: { username: 'kittichai.w' }
      },
      {
        gr_id: 'gr_mock_4',
        gr_no: 'GR-2026-0004',
        receive_date: new Date(Date.now() - 86400000 * 3),
        quality_score: null,
        status: 'PendingReceipt',
        po: { po_no: 'PO2606005', vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอทีเซอร์วิส จำกัด' } },
        receiver: { username: 'kittichai.w' }
      },
      {
        gr_id: 'gr_mock_5',
        gr_no: 'GR-2026-0005',
        receive_date: new Date(Date.now() - 86400000 * 2),
        quality_score: 2.1,
        status: 'Rejected',
        po: { po_no: 'PO2606006', vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' } },
        receiver: { username: 'kittichai.w' }
      },
      {
        gr_id: 'gr_mock_6',
        gr_no: 'GR-2026-0006',
        receive_date: new Date(Date.now() - 86400000),
        quality_score: 3.5,
        status: 'ClaimRaised',
        po: { po_no: 'PO2606007', vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' } },
        receiver: { username: 'somchai.t' }
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
        item_id: 'item_3',
        qty_onhand: 8,
        last_sync_at: new Date(),
        item: { central_item_code: 'ITM-00003', item_name: 'เก้าอี้สำนักงาน Steelcase Gesture', uom: 'ตัว' }
      },
      {
        stock_id: 'stk_mock_4',
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
      description: 'เก้าอี้สำนักงานเสียหายจากการจัดส่งและมีตำหนิรวม 2 ตัว',
      status: 'Processed', // Processed claim
      gr: { gr_no: 'GR-2026-0002' }
    },
    {
      claim_id: 'clm_002_mock',
      claim_type: 'Return',
      description: 'โต๊ะทำงานสเปคไม่ตรงกับใบสั่งซื้อ ขนาดสั้นกว่ากำหนด ส่งคืนคู่ค้า 1 ตัว',
      status: 'Open', // Pending return
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
    console.warn('Sync failed. Using demo update.');
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
    
    const matchesStatus = !grFilterStatus.value || gr.status === grFilterStatus.value;
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

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => {
  loadGrs();
  loadStocks();
  loadClaims();
});
</script>

<style scoped>
.gr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gr-modal {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 42rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.star-btn {
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  user-select: none;
  transition: color 0.15s;
}
</style>
