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

    <!-- TAB: STOCK MOVEMENTS (Transfer / Adjustment / Write-off / Near Expiry) -->
    <div v-if="activeTab === 'movements'" class="space-y-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 class="font-bold text-slate-800 text-sm">รายการเคลื่อนไหวสต็อก (Stock Movement Ledger)</h4>
          <p class="text-xs text-slate-500 mt-0.5">ทุกการเปลี่ยนแปลงจำนวนคงคลัง — รับสินค้า, โอนย้าย, ปรับปรุงยอด, ตัดจำหน่าย</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-outline" @click="createTransferPrompt">โอนย้ายสต็อก (Transfer)</button>
          <button class="btn-outline" @click="createAdjustmentPrompt">ปรับปรุงยอด (Adjustment)</button>
          <button class="btn-outline" @click="createWriteOffPrompt">ตัดจำหน่าย (Write-off)</button>
        </div>
      </div>

      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">เลขที่ Movement</th>
                <th class="px-6 py-3.5">สินค้า</th>
                <th class="px-6 py-3.5 text-center">ประเภท</th>
                <th class="px-6 py-3.5 text-right">เข้า</th>
                <th class="px-6 py-3.5 text-right">ออก</th>
                <th class="px-6 py-3.5 text-right">คงเหลือหลังรายการ</th>
                <th class="px-6 py-3.5 text-center">สถานะ</th>
                <th class="px-6 py-3.5 text-center">วันที่</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="mv in movements" :key="mv.movement_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4 font-mono font-bold text-slate-600">{{ mv.movement_no }}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ mv.item?.item_name || '—' }}</td>
                <td class="px-6 py-4 text-center"><span class="status-pill status-pill--neutral">{{ mv.movement_type }}</span></td>
                <td class="px-6 py-4 text-right text-green-600 font-bold">{{ Number(mv.qty_in) > 0 ? '+' + mv.qty_in : '' }}</td>
                <td class="px-6 py-4 text-right text-red-600 font-bold">{{ Number(mv.qty_out) > 0 ? '-' + mv.qty_out : '' }}</td>
                <td class="px-6 py-4 text-right font-bold">{{ mv.balance_after ?? '—' }}</td>
                <td class="px-6 py-4 text-center"><span class="status-pill" :class="mv.status === 'Posted' ? 'status-pill--success' : 'status-pill--neutral'">{{ mv.status }}</span></td>
                <td class="px-6 py-4 text-center text-xs text-slate-400">{{ formatDate(mv.created_at) }}</td>
              </tr>
              <tr v-if="movements.length === 0">
                <td colspan="8" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ยังไม่มีรายการเคลื่อนไหวสต็อก</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-100 rounded-xl overflow-hidden" v-if="nearExpiry.length > 0">
        <div class="p-4 border-b border-amber-100">
          <h4 class="font-bold text-amber-900 text-sm">แจ้งเตือนสินค้าใกล้หมดอายุ (Near Expiry, 90 วัน)</h4>
        </div>
        <table class="w-full text-left border-collapse text-sm">
          <tbody class="divide-y divide-amber-100">
            <tr v-for="mv in nearExpiry" :key="mv.movement_id">
              <td class="px-6 py-3 font-semibold text-slate-800">{{ mv.item?.item_name || '—' }}</td>
              <td class="px-6 py-3 text-xs text-slate-500">Lot: {{ mv.lot_no || '—' }}</td>
              <td class="px-6 py-3 text-right text-amber-700 font-bold">{{ formatDate(mv.expiry_date) }}</td>
            </tr>
          </tbody>
        </table>
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
    <AppModal
      v-model="showReceiveModal"
      title="ตรวจรับสินค้า"
      :subtitle="`${selectedGR?.gr_no} — PO: ${selectedGR?.po?.po_no || 'N/A'} (${selectedGR?.po?.vendor?.vendor_name || 'N/A'})`"
      variant="success"
      size="md"
    >
      <template #icon>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </template>

      <div class="space-y-5">
        <!-- Items table -->
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">รายการสินค้า</p>
          <div class="border border-[#e9ecef] rounded-xl overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#fafbfc] border-b border-[#eff1f5]">
                  <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">รายการ</th>
                  <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">จำนวนที่สั่ง</th>
                  <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">จำนวนที่รับได้</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#f8f9fa]">
                <tr v-for="(item, idx) in receiveForm.items" :key="idx" class="hover:bg-[#f8fffe] transition-colors">
                  <td class="px-4 py-3 text-sm font-semibold text-slate-700">{{ item.item_name }}</td>
                  <td class="px-4 py-3 text-sm text-slate-500 text-right tabular-nums">{{ item.qty_ordered }} <span class="text-[10px] text-slate-400">{{ item.uom }}</span></td>
                  <td class="px-4 py-3 text-right">
                    <input
                      v-model.number="item.received_qty"
                      type="number" :min="0" :max="item.qty_ordered"
                      class="w-20 border-2 border-[#e9ecef] focus:border-[var(--primary)] rounded-lg px-2 py-1.5 text-right text-sm font-bold focus:outline-none transition-colors text-slate-800"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Result radio cards -->
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">ผลการตรวจรับ</p>
          <div class="grid grid-cols-3 gap-2">
            <label
              v-for="opt in [{value:'FullReceipt',label:'รับครบถ้วน',color:'green'},{value:'PartialReceipt',label:'รับบางส่วน',color:'amber'},{value:'Rejected',label:'ปฏิเสธ',color:'red'}]"
              :key="opt.value"
              class="receive-radio-card"
              :class="receiveForm.result === opt.value ? `receive-radio-card--${opt.color}` : ''"
            >
              <input type="radio" v-model="receiveForm.result" :value="opt.value" class="sr-only" />
              <span class="text-sm font-bold">{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- Rating -->
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">คะแนนบริการผู้ขาย</p>
          <div class="flex items-center gap-1">
            <button
              v-for="star in 5" :key="star"
              type="button"
              class="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
              :class="star <= receiveForm.rating ? 'text-amber-400' : 'text-slate-200'"
              @click="receiveForm.rating = star"
            >★</button>
            <span class="ml-3 text-sm font-bold text-slate-600">{{ receiveForm.rating }} / 5</span>
          </div>
        </div>

        <!-- Remark -->
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">หมายเหตุ <span class="normal-case font-normal">(ไม่บังคับ)</span></p>
          <textarea
            v-model="receiveForm.remark" rows="2"
            placeholder="ระบุหมายเหตุเพิ่มเติม เช่น สินค้าแตกหัก, บรรจุภัณฑ์เสียหาย..."
            class="w-full border-2 border-[#e9ecef] focus:border-[var(--primary)] rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none text-slate-700 placeholder:text-slate-300"
          ></textarea>
        </div>

        <!-- Receipt image upload -->
        <div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รูปภาพหลักฐานการตรวจรับ</p>
              <p class="text-[11px] text-slate-400 mt-0.5">อัปโหลดได้สูงสุด 10 ภาพ รองรับเฉพาะไฟล์รูปภาพ ภาพละไม่เกิน 10 MB</p>
            </div>
            <span class="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-1">
              {{ receiveForm.attachments.length }} / 10
            </span>
          </div>

          <input
            ref="receiptFileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleReceiptImageUpload"
          />

          <button
            type="button"
            class="w-full border-2 border-dashed border-[#dce6f1] hover:border-[var(--primary)] hover:bg-green-50/40 rounded-xl px-4 py-4 transition text-left group"
            :disabled="receiveForm.attachments.length >= receiptUploadLimits.maxFiles"
            :class="receiveForm.attachments.length >= receiptUploadLimits.maxFiles ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'"
            @click="receiptFileInput?.click()"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 text-[var(--primary)] flex items-center justify-center group-hover:scale-105 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-700">เพิ่มรูปภาพการตรวจรับสินค้า</p>
                <p class="text-xs text-slate-400">เช่น รูปสินค้า, กล่อง, ใบส่งของ หรือจุดชำรุดเสียหาย</p>
              </div>
            </div>
          </button>

          <p v-if="receiptUploadError" class="mt-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {{ receiptUploadError }}
          </p>

          <div v-if="receiveForm.attachments.length" class="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
            <div
              v-for="(image, index) in receiveForm.attachments"
              :key="image.id"
              class="relative rounded-xl border border-[#e9ecef] bg-white overflow-hidden shadow-[var(--shadow-sm)]"
            >
              <img :src="image.url" :alt="image.name" class="w-full h-20 object-cover bg-slate-100" />
              <button
                type="button"
                class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/95 text-red-600 shadow flex items-center justify-center hover:bg-red-50"
                :aria-label="`ลบรูป ${image.name}`"
                @click="removeReceiptImage(index)"
              >
                ×
              </button>
              <div class="px-2 py-1">
                <p class="text-[10px] font-semibold text-slate-600 truncate">{{ image.name }}</p>
                <p class="text-[9px] text-slate-400">{{ formatFileSize(image.size) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="modal-btn modal-btn--ghost" @click="closeReceiveModal">ยกเลิก</button>
          <button class="modal-btn modal-btn--primary" @click="confirmReceive">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            ยืนยันการรับสินค้า
          </button>
        </div>
      </template>
    </AppModal>

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
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const dialog = useDialog();
const activeTab = ref('gr');

type ReceiptImage = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
};

const showReceiveModal = ref(false);
const selectedGR = ref<any>(null);
const receiptFileInput = ref<HTMLInputElement | null>(null);
const receiptUploadError = ref('');
const receiptUploadLimits = {
  maxFiles: 10,
  maxSizeBytes: 10 * 1024 * 1024,
};
const receiveForm = ref({
  result: 'FullReceipt',
  rating: 5,
  remark: '',
  items: [] as any[],
  attachments: [] as ReceiptImage[],
});

const clearReceiptImages = () => {
  receiveForm.value.attachments.forEach(image => URL.revokeObjectURL(image.url));
  receiveForm.value.attachments = [];
  receiptUploadError.value = '';
  if (receiptFileInput.value) receiptFileInput.value.value = '';
};

const openReceiveModal = (gr: any) => {
  clearReceiptImages();
  selectedGR.value = gr;
  receiveForm.value = {
    result: 'FullReceipt',
    rating: 5,
    remark: '',
    items: [
      { item_name: 'สินค้าตามใบสั่งซื้อ ' + (gr.po?.po_no || ''), qty_ordered: 10, received_qty: 10, uom: 'ชิ้น' },
      { item_name: 'อุปกรณ์เสริม', qty_ordered: 5, received_qty: 5, uom: 'ชิ้น' },
    ],
    attachments: [],
  };
  showReceiveModal.value = true;
};

const closeReceiveModal = () => {
  showReceiveModal.value = false;
  clearReceiptImages();
};

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const handleReceiptImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  receiptUploadError.value = '';

  if (!files.length) return;

  const rejected: string[] = [];
  let availableSlots = receiptUploadLimits.maxFiles - receiveForm.value.attachments.length;

  for (const file of files) {
    if (availableSlots <= 0) {
      rejected.push(`อัปโหลดได้สูงสุด ${receiptUploadLimits.maxFiles} ภาพ`);
      break;
    }

    if (!file.type.startsWith('image/')) {
      rejected.push(`${file.name}: รองรับเฉพาะไฟล์รูปภาพ`);
      continue;
    }

    if (file.size > receiptUploadLimits.maxSizeBytes) {
      rejected.push(`${file.name}: ขนาดเกิน 10 MB`);
      continue;
    }

    receiveForm.value.attachments.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID?.() || Date.now()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    });
    availableSlots -= 1;
  }

  receiptUploadError.value = rejected.slice(0, 3).join(' • ');
  input.value = '';
};

const removeReceiptImage = (index: number) => {
  const [removed] = receiveForm.value.attachments.splice(index, 1);
  if (removed) URL.revokeObjectURL(removed.url);
  receiptUploadError.value = '';
};

const confirmReceive = async () => {
  if (!selectedGR.value) return;
  selectedGR.value.status = receiveForm.value.result;
  selectedGR.value.quality_score = receiveForm.value.rating;
  selectedGR.value.receipt_images = receiveForm.value.attachments.map(image => ({
    file_name: image.name,
    file_size: image.size,
    file_type: image.type,
    uploaded_at: new Date().toISOString(),
  }));
  showReceiveModal.value = false;
  clearReceiptImages();
  await dialog.alert(`บันทึกการรับสินค้า ${selectedGR.value.gr_no} เรียบร้อยแล้ว`, { variant: 'success' });
};

watch(showReceiveModal, (isOpen) => {
  if (!isOpen) clearReceiptImages();
});

const tabs = [
  { id: 'gr', name: 'ประวัติรับสินค้า (GR)', icon: 'i-heroicons-document-check' },
  { id: 'stock', name: 'สินค้าคงคลัง (Stock)', icon: 'i-heroicons-circle-stack' },
  { id: 'movements', name: 'เคลื่อนไหวสต็อก (Movements)', icon: 'i-heroicons-arrows-right-left' },
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

const autoOrder = async (item: any) => {
  if (item.suggested_order <= 0) {
    await dialog.alert('สินค้านี้ยังมีจำนวนเพียงพอ ไม่จำเป็นต้องเติมสินค้าในขณะนี้', { variant: 'info' });
    return;
  }
  item.loading = true;
  setTimeout(async () => {
    item.loading = false;
    await dialog.alert(`สร้างแบบร่างใบขอซื้อ (Draft PR) สำหรับสินค้า "${item.name}" จำนวน ${item.suggested_order} ${item.uom} สำเร็จ!`, { variant: 'success' });
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

const movements = ref<any[]>([]);
const nearExpiry = ref<any[]>([]);

const loadMovements = async () => {
  try {
    movements.value = await $fetch<any[]>('http://localhost:3001/api/stock/movements', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
  } catch (err) {
    movements.value = [];
  }
};

const loadNearExpiry = async () => {
  try {
    nearExpiry.value = await $fetch<any[]>('http://localhost:3001/api/stock/near-expiry', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
  } catch (err) {
    nearExpiry.value = [];
  }
};

const createTransferPrompt = async () => {
  const stk = stockList.value[0];
  if (!stk?.item_id) {
    await dialog.alert('ไม่พบสินค้าคงคลังสำหรับทดสอบโอนย้าย', { variant: 'warning' });
    return;
  }
  const qtyStr = window.prompt(`โอนย้ายสินค้า "${stk.item?.item_name}" จาก MAIN ไป WAREHOUSE-2 กี่หน่วย?`, '1');
  if (!qtyStr) return;
  try {
    await $fetch('http://localhost:3001/api/stock/transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { item_id: stk.item_id, company_id: stk.company_id, from_warehouse: 'MAIN', to_warehouse: 'WAREHOUSE-2', qty: Number(qtyStr), reason: 'Manual transfer' },
    });
    await dialog.alert('โอนย้ายสต็อกสำเร็จ', { variant: 'success' });
    await Promise.all([loadStocks(), loadMovements()]);
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถโอนย้ายสต็อกได้', { variant: 'danger' });
  }
};

const createAdjustmentPrompt = async () => {
  const stk = stockList.value[0];
  if (!stk?.item_id) {
    await dialog.alert('ไม่พบสินค้าคงคลังสำหรับทดสอบปรับปรุงยอด', { variant: 'warning' });
    return;
  }
  const countedStr = window.prompt(`นับจริงสินค้า "${stk.item?.item_name}" ได้กี่หน่วย? (ระบบมี ${stk.qty_onhand})`, String(stk.qty_onhand));
  if (!countedStr) return;
  const reason = window.prompt('เหตุผลของการปรับปรุงยอด', 'Physical count variance');
  if (!reason) return;
  try {
    await $fetch('http://localhost:3001/api/stock/adjustment', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { item_id: stk.item_id, company_id: stk.company_id, counted_qty: Number(countedStr), reason },
    });
    await dialog.alert('ส่งคำขอปรับปรุงยอดเข้าสู่การอนุมัติแล้ว', { variant: 'success' });
    await loadMovements();
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถส่งคำขอปรับปรุงยอดได้', { variant: 'danger' });
  }
};

const createWriteOffPrompt = async () => {
  const stk = stockList.value[0];
  if (!stk?.item_id) {
    await dialog.alert('ไม่พบสินค้าคงคลังสำหรับทดสอบตัดจำหน่าย', { variant: 'warning' });
    return;
  }
  const qtyStr = window.prompt(`ตัดจำหน่ายสินค้า "${stk.item?.item_name}" กี่หน่วย?`, '1');
  if (!qtyStr) return;
  const reason = window.prompt('เหตุผลการตัดจำหน่าย (ชำรุด/หมดอายุ/สูญหาย)', 'Damaged');
  if (!reason) return;
  try {
    await $fetch('http://localhost:3001/api/stock/write-off', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { item_id: stk.item_id, company_id: stk.company_id, qty: Number(qtyStr), reason },
    });
    await dialog.alert('ส่งคำขอตัดจำหน่ายเข้าสู่การอนุมัติแล้ว', { variant: 'success' });
    await loadMovements();
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถส่งคำขอตัดจำหน่ายได้', { variant: 'danger' });
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
  loadMovements();
  loadNearExpiry();
});
</script>
