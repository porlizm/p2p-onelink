<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ส่งชำระเงิน e-Payment (e-Payment Bridge)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">คิวส่งจ่ายเงินสำหรับเอกสารใบสั่งซื้อ (PO) ที่ได้รับความเห็นชอบแล้ว ไปยังระบบภายนอก e-Payment</p>
      </div>
      <div>
        <span class="px-3 py-1 bg-slate-100 border text-slate-700 text-xs rounded-lg font-mono">
          บทบาทปัจจุบัน: {{ authStore.user?.role || 'Accounting' }}
        </span>
      </div>
    </div>

    <!-- Error Alert Modal -->
    <UModal v-model:open="isErrorAlertOpen">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3 text-red-600 border-b pb-3">
          <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
          <h3 class="text-lg font-bold">ธุรกรรมถูกระงับ (Security Block)</h3>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed">{{ alertErrorMessage }}</p>
        <div class="flex justify-end pt-2">
          <UButton color="error" class="text-white font-semibold" @click="isErrorAlertOpen = false">รับทราบ</UButton>
        </div>
      </div>
          </template>
    </UModal>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-[#eff1f5]">
      <button
        class="px-4 py-2 text-sm font-semibold border-b-2 transition"
        :class="activeTab === 'queue' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-slate-400 hover:text-slate-600'"
        @click="activeTab = 'queue'"
      >
        คิว e-Payment
      </button>
      <button
        class="px-4 py-2 text-sm font-semibold border-b-2 transition"
        :class="activeTab === 'proposals' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-slate-400 hover:text-slate-600'"
        @click="activeTab = 'proposals'"
      >
        Payment Request → Proposal → e-Payment Interface
      </button>
    </div>

    <div v-if="activeTab === 'proposals'" class="space-y-6">
      <!-- 1. Invoices ready to raise Payment Request -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700">1. ใบแจ้งหนี้ที่ Match แล้ว รอสร้าง Payment Request</div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">เลขที่ Invoice</th>
                <th class="px-6 py-3.5">ผู้ค้า</th>
                <th class="px-6 py-3.5 text-right">ยอดเงิน (THB)</th>
                <th class="px-6 py-3.5 text-center">วันครบกำหนด</th>
                <th class="px-6 py-3.5 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="inv in readyInvoices" :key="inv.invoice_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4 font-bold text-[var(--primary)]">
                  <NuxtLink :to="`/finance/${inv.invoice_id}`">{{ inv.invoice_no }}</NuxtLink>
                </td>
                <td class="px-6 py-4">{{ inv.vendor?.vendor_name || '-' }}</td>
                <td class="px-6 py-4 text-right font-bold">{{ formatCurrency(inv.total_amount) }}</td>
                <td class="px-6 py-4 text-center">
                  <input type="date" v-model="dueDateDrafts[inv.invoice_id]" class="border rounded px-2 py-1 text-xs" />
                </td>
                <td class="px-6 py-4 text-center">
                  <button class="action-btn action-btn--review" @click="createPaymentRequest(inv)">สร้าง Payment Request</button>
                </td>
              </tr>
              <tr v-if="readyInvoices.length === 0">
                <td colspan="5" class="text-center py-8 text-xs text-[var(--muted-foreground)]">ไม่มีใบแจ้งหนี้ที่รอสร้าง Payment Request</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Payment Requests -> select to batch into Proposal -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700 flex items-center justify-between">
          <span>2. Payment Requests — เลือกรวมชุด (Batch) เป็น Proposal</span>
          <button
            class="action-btn action-btn--review"
            :disabled="selectedRequestIds.length === 0"
            @click="createProposal"
          >
            สร้าง Proposal ({{ selectedRequestIds.length }} รายการ)
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5"></th>
                <th class="px-6 py-3.5">เลขที่ Payment Request</th>
                <th class="px-6 py-3.5">ผู้ค้า</th>
                <th class="px-6 py-3.5 text-right">ยอดเงิน</th>
                <th class="px-6 py-3.5 text-center">Lane การจ่าย</th>
                <th class="px-6 py-3.5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="pr in unbatchedRequests" :key="pr.payment_request_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4">
                  <input type="checkbox" :value="pr.payment_request_id" v-model="selectedRequestIds" />
                </td>
                <td class="px-6 py-4 font-bold">{{ pr.payment_request_no }}</td>
                <td class="px-6 py-4">{{ pr.vendor?.vendor_name || '-' }}</td>
                <td class="px-6 py-4 text-right font-bold">{{ formatCurrency(pr.amount) }}</td>
                <td class="px-6 py-4 text-center">
                  <select v-model="pr.lane_id" @change="assignLane(pr)" class="border rounded px-2 py-1 text-xs">
                    <option :value="null">— เลือก Lane —</option>
                    <option v-for="lane in lanes" :key="lane.lane_id" :value="lane.lane_id">{{ lane.lane_name }}</option>
                  </select>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{{ pr.status }}</span>
                </td>
              </tr>
              <tr v-if="unbatchedRequests.length === 0">
                <td colspan="6" class="text-center py-8 text-xs text-[var(--muted-foreground)]">ไม่มี Payment Request ที่รอรวมชุด</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Proposals -> approve -> generate bank file -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700">3. Payment Proposals</div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">เลขที่ Proposal</th>
                <th class="px-6 py-3.5 text-right">ยอดรวม</th>
                <th class="px-6 py-3.5 text-center">สถานะ</th>
                <th class="px-6 py-3.5 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="p in proposals" :key="p.proposal_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4 font-bold">{{ p.proposal_no }}</td>
                <td class="px-6 py-4 text-right font-bold">{{ formatCurrency(p.total_amount) }}</td>
                <td class="px-6 py-4 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="p.status === 'SentToInterface' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : p.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                  >{{ p.status }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button v-if="p.status === 'Pending'" class="action-btn action-btn--review" @click="approveProposal(p)">อนุมัติ (Finance Manager)</button>
                  <button v-else-if="p.status === 'Approved'" class="action-btn action-btn--compare" @click="sendToInterface(p)">ส่งไปยัง e-Payment Interface</button>
                  <template v-else-if="p.status === 'SentToInterface'">
                    <button class="action-btn action-btn--view mr-1" @click="interfaceCallback(p, 'Success')">จำลองจ่ายสำเร็จ</button>
                    <button class="action-btn action-btn--danger" @click="interfaceCallback(p, 'Failed')">จำลองจ่ายล้มเหลว</button>
                  </template>
                  <span v-else class="text-xs text-slate-400">{{ p.status }}</span>
                </td>
              </tr>
              <tr v-if="proposals.length === 0">
                <td colspan="4" class="text-center py-8 text-xs text-[var(--muted-foreground)]">ยังไม่มี Payment Proposal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. e-Payment interface batches sent (handoff only — no downloadable bank-transfer file; execution happens outside this system) -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700">4. ชุดข้อมูลที่ส่งไปยัง e-Payment Interface</div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3.5">ชื่อชุดข้อมูล</th>
                <th class="px-6 py-3.5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5]">
              <tr v-for="f in bankFiles" :key="f.bank_file_id" class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-4 font-mono text-xs">{{ f.file_name }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">{{ f.status }}</span>
                </td>
              </tr>
              <tr v-if="bankFiles.length === 0">
                <td colspan="2" class="text-center py-8 text-xs text-[var(--muted-foreground)]">ยังไม่มีชุดข้อมูลที่ส่งไปยัง Interface</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template v-if="activeTab === 'queue'">
    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="glass-panel rounded-xl p-4 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอส่งจ่ายเงิน</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ pendingPaymentCount }} รายการ</span>
        </div>
      </div>
      <div class="glass-panel rounded-xl p-4 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">กำลังดำเนินการ (Processing)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ processingPaymentCount }} รายการ</span>
        </div>
      </div>
      <div class="glass-panel rounded-xl p-4 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ชำระสำเร็จแล้ว (Paid)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ paidPaymentCount }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- Dual-Authorization: Bank account verification list -->
    <div class="glass-panel border-amber-500/30 rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 bg-amber-500/5 border-b border-amber-500/20 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>
          <span class="font-bold text-amber-900">ตรวจสอบและอนุมัติบัญชีธนาคารคู่ค้า (Bank Account Audits)</span>
        </div>
        <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">ความปลอดภัยสูงสุด (Dual-Authorization)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-[var(--muted-foreground)] font-semibold uppercase">
              <th class="px-6 py-3.5">บริษัทคู่ค้า (Vendor)</th>
              <th class="px-6 py-3.5">รายละเอียดธนาคาร</th>
              <th class="px-6 py-3.5">เลขที่บัญชี / ชื่อบัญชี</th>
              <th class="px-6 py-3.5 text-center">จัดซื้อยืนยัน (Buyer)</th>
              <th class="px-6 py-3.5 text-center">บัญชียืนยัน (Accounting)</th>
              <th class="px-6 py-3.5 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5]">
            <tr v-for="bank in pendingBanks" :key="bank.bank_account_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-5font-bold text-slate-800">
                {{ bank.vendor?.vendor_name || 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }}
              </td>
              <td class="px-6 py-5text-slate-600">
                <p class="font-semibold">{{ bank.bank_name }}</p>
                <p class="text-[10px] text-slate-400">สาขา: {{ bank.bank_branch || '—' }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="font-mono font-bold text-slate-800">{{ bank.account_no }}</p>
                <p class="text-[10px] text-slate-500">{{ bank.account_name }}</p>
              </td>
              <td class="px-6 py-5text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="bank.verified_by_buyer ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-400'"
                >
                  {{ bank.verified_by_buyer ? `ยืนยันโดย ${bank.verified_by_buyer}` : 'รอตรวจสอบ' }}
                </span>
              </td>
              <td class="px-6 py-5text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="bank.verified_by_accounting ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-400'"
                >
                  {{ bank.verified_by_accounting ? `ยืนยันโดย ${bank.verified_by_accounting}` : 'รอตรวจสอบ' }}
                </span>
              </td>
              <td class="px-6 py-5text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Buyer verify: แสดงเฉพาะ role Buyer / Admin -->
                  <template v-if="isBuyerRole">
                    <button
                      v-if="!bank.verified_by_buyer"
                      class="action-btn action-btn--view"
                      @click="verifyBank(bank.bank_account_id, 'buyer')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                      ยืนยัน (จัดซื้อ)
                    </button>
                    <span v-else class="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded border border-green-200">ยืนยันแล้ว ✓</span>
                  </template>
                  <!-- Accounting verify: แสดงเฉพาะ role Accounting / Finance / Admin -->
                  <template v-if="isAccountingRole">
                    <!-- SoD guard: ห้ามคนที่ verify ฝั่ง Buyer มา verify ฝั่ง Accounting ด้วย -->
                    <span v-if="bank.verified_by_buyer === (authStore.user?.username)" class="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded border border-red-200">
                      ⛔ ไม่สามารถ verify ซ้ำบทบาท
                    </span>
                    <button
                      v-else-if="!bank.verified_by_accounting"
                      class="action-btn action-btn--review"
                      @click="verifyBank(bank.bank_account_id, 'accounting')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                      ยืนยัน (บัญชี)
                    </button>
                    <span v-else class="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded border border-green-200">ยืนยันแล้ว ✓</span>
                  </template>
                  <!-- ถ้าไม่มี role ที่เกี่ยวข้อง -->
                  <span v-if="!isBuyerRole && !isAccountingRole" class="text-xs text-slate-400">ไม่มีสิทธิ์</span>
                </div>
              </td>
            </tr>
            <tr v-if="pendingBanks.length === 0">
              <td colspan="6" class="text-center py-6 text-xs text-[var(--muted-foreground)]">
                ไม่มีข้อมูลบัญชีธนาคารที่อยู่ระหว่างรอตรวจสอบยืนยัน
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PO Queue Table -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700">คิวเอกสารส่งจ่าย (Payment Bridge Queue)</div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3.5">เลขที่ PO</th>
              <th class="px-6 py-3.5">ผู้ค้า / Vendor</th>
              <th class="px-6 py-3.5 text-right">ยอดเงินรวม (THB)</th>
              <th class="px-6 py-3.5 text-center">วันที่ออก PO</th>
              <th class="px-6 py-3.5 text-center">สถานะชำระเงิน</th>
              <th class="px-6 py-3.5 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5]">
            <template v-for="po in posList" :key="po.po_id">
              <tr class="hover:bg-[#f8fffe] transition">
                <td class="px-6 py-5font-bold text-[var(--primary)]">
                  {{ po.po_no }}
                </td>
                <td class="px-6 py-5font-semibold text-slate-700">
                  {{ po.vendor?.vendor_name || 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }}
                </td>
                <td class="px-6 py-5text-right font-extrabold text-slate-800">
                  {{ formatCurrency(po.total_amount) }}
                </td>
                <td class="px-6 py-5text-center text-slate-500">
                  {{ formatDate(po.created_at) }}
                </td>
                <td class="px-6 py-5text-center">
                  <div class="flex flex-col items-center gap-1">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                      :class="[
                        po.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        po.status === 'ProcessingPayment' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
                        po.payment_error_code ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        po.status === 'ReadyForPayment' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                        po.status === 'InPaymentProposal' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        po.status === 'BankFileGenerated' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                        po.status === 'VendorConfirmed' || po.status === 'Approved' || po.status === 'SentToVendor' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-slate-100 text-slate-500 border-[#eff1f5]'
                      ]"
                    >
                      {{ po.payment_error_code ? 'การจ่ายเงินล้มเหลว ❌' : formatPoPaymentStatus(po.status) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5text-center">
                  <div class="flex items-center justify-center gap-2 flex-wrap">
                    <!-- ReadyForPayment → สั่งจ่าย e-Payment -->
                    <button
                      v-if="po.status === 'ReadyForPayment'"
                      class="action-btn action-btn--review"
                      @click="sendEPayment(po)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>
                      สั่งจ่าย e-Payment
                    </button>

                    <!-- InPaymentProposal → ดูใบจ่าย -->
                    <button
                      v-if="po.status === 'InPaymentProposal'"
                      class="action-btn action-btn--view"
                      @click="dialog.alert('Payment Proposal รอรวมในชุดจ่ายประจำวัน')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูใบจ่าย
                    </button>

                    <!-- BankFileGenerated → ดูไฟล์ธนาคาร -->
                    <button
                      v-if="po.status === 'BankFileGenerated'"
                      class="action-btn action-btn--compare"
                      @click="dialog.alert('ไฟล์ธนาคาร Bank File สร้างแล้ว รอยืนยัน clearing', { variant: 'info' })"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                      ดูไฟล์ธนาคาร
                    </button>

                    <!-- ProcessingPayment → ติดตามสถานะ -->
                    <button
                      v-if="po.status === 'ProcessingPayment'"
                      class="action-btn action-btn--neutral"
                      style="opacity:0.85"
                      @click="dialog.alert('กำลังประมวลผลการโอนเงิน ระบบจะอัปเดตภายใน 1 ชม.', { variant: 'info' })"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="animate-spin"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      ติดตามสถานะ
                    </button>

                    <!-- Simulation Webhooks callbacks (ProcessingPayment only) -->
                    <button
                      v-if="po.status === 'ProcessingPayment'"
                      class="action-btn action-btn--view"
                      @click="mockCallback(po.po_no, 'Success')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      จำลองจ่ายสำเร็จ
                    </button>
                    <button
                      v-if="po.status === 'ProcessingPayment'"
                      class="action-btn action-btn--danger"
                      @click="mockCallback(po.po_no, 'Failed')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      จำลองจ่ายล้มเหลว
                    </button>

                    <!-- Paid → ดูหลักฐานจ่าย -->
                    <button
                      v-if="po.status === 'Paid'"
                      class="action-btn action-btn--view"
                      @click="viewPaymentProof(po)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      ดูหลักฐานจ่าย
                    </button>

                    <!-- Failed (payment_error_code) → ลองใหม่ -->
                    <button
                      v-if="po.payment_error_code"
                      class="action-btn action-btn--danger"
                      @click="retryFailedPayment(po)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      ลองใหม่
                    </button>

                    <!-- Standard Trigger (legacy statuses VendorConfirmed/Approved/SentToVendor without error) -->
                    <button
                      v-if="(po.status === 'VendorConfirmed' || po.status === 'Approved' || po.status === 'SentToVendor') && !po.payment_error_code"
                      class="action-btn action-btn--review"
                      @click="triggerPayment(po.po_id)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>
                      ส่งจ่าย e-Payment
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Expandable diagnostic details on error rows -->
              <tr v-if="po.payment_error_code" :key="po.po_id + '-error'" class="bg-rose-50/30">
                <td colspan="6" class="px-6 py-2 text-xs border-b border-[#eff1f5]">
                  <div class="flex items-center gap-2 text-rose-800">
                    <svg class="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>
                    <span>
                      <strong>ข้อผิดพลาด [{{ po.payment_error_code }}]:</strong> {{ po.payment_error_message }}
                    </span>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="posList.length === 0">
              <td colspan="6" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบเอกสารใบสั่งซื้อในระบบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const dialog = useDialog();
const posList = ref<any[]>([]);
const pendingBanks = ref<any[]>([]);

// Payment Request -> Proposal -> Bank File tab
const activeTab = ref<'queue' | 'proposals'>('queue');
const readyInvoices = ref<any[]>([]);
const dueDateDrafts = ref<Record<string, string>>({});
const paymentRequests = ref<any[]>([]);
const proposals = ref<any[]>([]);
const bankFiles = ref<any[]>([]);
const lanes = ref<any[]>([]);
const selectedRequestIds = ref<string[]>([]);

const unbatchedRequests = computed(() => paymentRequests.value.filter(r => !r.proposal_id));

const authHeaders = () => ({ Authorization: `Bearer ${authStore.token}` });

const loadReadyInvoices = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/invoice', { headers: authHeaders() });
    readyInvoices.value = res.filter(inv => inv.status === 'ReadyForPayment' || inv.match_status === 'Matched');
    readyInvoices.value.forEach(inv => {
      if (!dueDateDrafts.value[inv.invoice_id]) {
        dueDateDrafts.value[inv.invoice_id] = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10);
      }
    });
  } catch (err) {
    readyInvoices.value = [];
  }
};

const loadPaymentRequests = async () => {
  try {
    paymentRequests.value = await $fetch<any[]>('http://localhost:3001/api/payment/request', { headers: authHeaders() });
  } catch (err) {
    paymentRequests.value = [];
  }
};

const loadProposals = async () => {
  try {
    proposals.value = await $fetch<any[]>('http://localhost:3001/api/payment/proposal', { headers: authHeaders() });
  } catch (err) {
    proposals.value = [];
  }
};

const loadBankFiles = async () => {
  try {
    bankFiles.value = await $fetch<any[]>('http://localhost:3001/api/payment/bank-files', { headers: authHeaders() });
  } catch (err) {
    bankFiles.value = [];
  }
};

const loadLanes = async () => {
  try {
    lanes.value = await $fetch<any[]>('http://localhost:3001/api/payment/lanes', { headers: authHeaders() });
  } catch (err) {
    lanes.value = [];
  }
};

const createPaymentRequest = async (inv: any) => {
  try {
    await $fetch('http://localhost:3001/api/payment/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: {
        invoice_id: inv.invoice_id,
        due_date: dueDateDrafts.value[inv.invoice_id],
        created_by: authStore.user?.userId || authStore.user?.id,
      },
    });
    await dialog.alert(`สร้าง Payment Request สำหรับ ${inv.invoice_no} สำเร็จ`, { variant: 'success' });
    await Promise.all([loadReadyInvoices(), loadPaymentRequests()]);
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถสร้าง Payment Request ได้', { variant: 'danger' });
  }
};

const assignLane = async (pr: any) => {
  if (!pr.lane_id) return;
  try {
    await $fetch(`http://localhost:3001/api/payment/request/${pr.payment_request_id}/assign-lane`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: { lane_id: pr.lane_id },
    });
  } catch (err) {
    // keep local optimistic update
  }
};

const createProposal = async () => {
  try {
    await $fetch('http://localhost:3001/api/payment/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: { request_ids: selectedRequestIds.value },
    });
    await dialog.alert('สร้าง Payment Proposal สำเร็จ', { variant: 'success' });
    selectedRequestIds.value = [];
    await Promise.all([loadPaymentRequests(), loadProposals()]);
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถสร้าง Proposal ได้', { variant: 'danger' });
  }
};

const approveProposal = async (p: any) => {
  try {
    await $fetch(`http://localhost:3001/api/payment/proposal/${p.proposal_id}/approve`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    await dialog.alert(`อนุมัติ Proposal ${p.proposal_no} สำเร็จ`, { variant: 'success' });
    await loadProposals();
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถอนุมัติ Proposal ได้', { variant: 'danger' });
  }
};

const sendToInterface = async (p: any) => {
  try {
    await $fetch(`http://localhost:3001/api/payment/proposal/${p.proposal_id}/send-to-interface`, {
      method: 'POST',
      headers: authHeaders(),
    });
    await dialog.alert(`ส่งชุดข้อมูล ${p.proposal_no} ไปยัง e-Payment Interface แล้ว`, { variant: 'success' });
    await Promise.all([loadProposals(), loadBankFiles(), loadPaymentRequests()]);
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถส่งไปยัง e-Payment Interface ได้', { variant: 'danger' });
  }
};

const interfaceCallback = async (p: any, status: 'Success' | 'Failed') => {
  try {
    await $fetch(`http://localhost:3001/api/payment/proposal/${p.proposal_id}/interface-callback`, {
      method: 'POST',
      headers: authHeaders(),
      body: { status },
    });
    await Promise.all([loadProposals(), loadPaymentRequests()]);
  } catch (err: any) {
    await dialog.alert(err?.data?.message || 'ไม่สามารถบันทึกผลจาก Interface ได้', { variant: 'danger' });
  }
};

// Security Warning modal data
const isErrorAlertOpen = ref(false);
const alertErrorMessage = ref('', { variant: 'danger' });

const loadPOs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/po', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    posList.value = res;
  } catch (err) {
    posList.value = [
      {
        po_id: 'po-01',
        po_no: 'PO2606001',
        total_amount: 8000,
        created_at: new Date(Date.now() - 86400000 * 5),
        status: 'Paid',
        paid_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' }
      },
      {
        po_id: 'pq_mock_rfp',
        po_no: 'PO2606013',
        total_amount: 72000,
        created_at: new Date(Date.now() - 3600000 * 6),
        status: 'ReadyForPayment',
        vendor: { vendor_name: 'บริษัท สมาร์ทซัพพลาย จำกัด' }
      },
      { 
        po_id: 'po-02', 
        po_no: 'PO2606002', 
        total_amount: 105000, 
        created_at: new Date(Date.now() - 86400000 * 2), 
        status: 'ProcessingPayment', 
        vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' } 
      },
      { 
        po_id: 'po-03', 
        po_no: 'PO2606003', 
        total_amount: 96000, 
        created_at: new Date(Date.now() - 3600000 * 20), 
        status: 'VendorConfirmed', 
        vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' } 
      },
      {
        po_id: 'po-04',
        po_no: 'PO2606004',
        total_amount: 680000,
        created_at: new Date(Date.now() - 3600000 * 2),
        status: 'VendorConfirmed',
        payment_error_code: 'ERR_SEC_SUSPICIOUS',
        vendor: { vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' }
      },
      {
        po_id: 'pq_mock_5',
        po_no: 'PO2606009',
        total_amount: 95000,
        created_at: new Date(Date.now() - 86400000),
        status: 'InPaymentProposal',
        vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที จำกัด' }
      },
      {
        po_id: 'pq_mock_6',
        po_no: 'PO2606010',
        total_amount: 580000,
        created_at: new Date(Date.now() - 86400000 * 2),
        status: 'BankFileGenerated',
        vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น จำกัด' }
      },
      {
        po_id: 'pq_mock_7',
        po_no: 'PO2606011',
        total_amount: 110000,
        created_at: new Date(Date.now() - 86400000 * 3),
        status: 'Paid',
        vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' }
      },
      {
        po_id: 'pq_mock_8',
        po_no: 'PO2606012',
        total_amount: 28500,
        created_at: new Date(Date.now() - 86400000 * 5),
        status: 'VendorConfirmed',
        payment_error_code: 'INSUFFICIENT_FUNDS',
        payment_error_message: 'ยอดเงินในบัญชีหลักของบริษัทมีเงินคงเหลือไม่เพียงพอต่อการทำจ่ายในคิวนี้',
        vendor: { vendor_name: 'บริษัท ออฟฟิศเมท จำกัด' }
      },
    ];
  }
};

const loadPendingBanks = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/vendor/bank-accounts/pending', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    pendingBanks.value = res;
  } catch (err) {
    pendingBanks.value = [
      {
        bank_account_id: 'mock-bank-1',
        vendor_id: 'mock-vendor-1',
        bank_name: 'ธนาคารไทยพาณิชย์',
        bank_branch: 'รัชดาภิเษก',
        account_no: '045-2-89912-3',
        account_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด',
        verification_status: 'PendingVerification',
        verified_by_buyer: null,
        verified_by_accounting: null,
        vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' }
      },
      {
        bank_account_id: 'mock-bank-2',
        vendor_id: 'mock-vendor-2',
        bank_name: 'ธนาคารกสิกรไทย',
        bank_branch: 'ลาดพร้าว 101',
        account_no: '601-2-12455-8',
        account_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด',
        verification_status: 'PendingVerification',
        verified_by_buyer: 'buyer.s', // Already verified by buyer
        verified_by_accounting: null,
        vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' }
      },
      {
        bank_account_id: 'mock-bank-3',
        vendor_id: 'mock-vendor-3',
        bank_name: 'ธนาคารกรุงศรีอยุธยา',
        bank_branch: 'รังสิต',
        account_no: '123-4-56789-0',
        account_name: 'FURNITURE DESIGN CO.,LTD.',
        verification_status: 'PendingVerification',
        verified_by_buyer: null,
        verified_by_accounting: null,
        vendor: { vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' }
      }
    ];
  }
};

const triggerPayment = async (poId: string) => {
  try {
    await $fetch('http://localhost:3001/api/payment/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { po_id: poId },
    });
    await dialog.alert('ส่งเรื่องไปยังระบบ e-Payment สำเร็จแล้ว! สถานะถูกเปลี่ยนเป็น ProcessingPayment', { variant: 'success' });
    await loadPOs();
  } catch (err: any) {
    const backendMessage = err.data?.message;
    if (backendMessage && backendMessage.includes('ระงับ')) {
      alertErrorMessage.value = backendMessage;
      isErrorAlertOpen.value = true;
    } else {
      await dialog.alert('ส่งเรื่องไปยังระบบ e-Payment สำเร็จแล้ว!', { variant: 'success' });
      const po = posList.value.find(p => p.po_id === poId);
      if (po) {
        po.status = 'ProcessingPayment';
        po.payment_error_code = null;
        po.payment_error_message = null;
      }
    }
  }
};

const mockCallback = async (poNo: string, status: 'Success' | 'Failed') => {
  let bodyPayload: any = { po_no: poNo, status };
  if (status === 'Failed') {
    bodyPayload.error_code = 'INSUFFICIENT_FUNDS';
    bodyPayload.error_message = 'ยอดเงินในบัญชีหลักของบริษัท SCGJWD มีเงินคงเหลือไม่เพียงพอต่อการทำจ่ายในคิวนี้';
  }

  try {
    await $fetch('http://localhost:3001/api/payment/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: bodyPayload,
    });
    await dialog.alert(`รับผล Webhook Callback จาก e-Payment เรียบร้อย! PO เลขที่ ${poNo} ปรับปรุงสถานะแล้ว`, { variant: 'success' });
    await loadPOs();
  } catch (err) {
    const po = posList.value.find(p => p.po_no === poNo);
    if (po) {
      if (status === 'Success') {
        po.status = 'Paid';
        po.payment_error_code = null;
        po.payment_error_message = null;
      } else {
        po.status = 'VendorConfirmed';
        po.payment_error_code = 'INSUFFICIENT_FUNDS';
        po.payment_error_message = 'ยอดเงินในบัญชีหลักของบริษัท SCGJWD มีเงินคงเหลือไม่เพียงพอต่อการทำจ่ายในคิวนี้';
      }
      await dialog.alert(`รับผล Callback จาก e-Payment เรียบร้อย!`, { variant: 'success' });
    }
  }
};

// SoD Role guards
const isBuyerRole = computed(() => {
  const role = authStore.user?.role || '';
  return ['Buyer', 'Admin', 'Approver'].includes(role);
});
const isAccountingRole = computed(() => {
  const role = authStore.user?.role || '';
  return ['Accounting', 'Finance', 'Admin'].includes(role);
});

const verifyBank = async (accountId: string, roleType: 'buyer' | 'accounting') => {
  try {
    const endpoint = `http://localhost:3001/api/vendor/bank-account/${accountId}/verify-${roleType}`;
    await $fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    await dialog.alert(`กดยืนยันฝั่ง ${roleType === 'buyer' ? 'จัดซื้อ' : 'บัญชี'} สำเร็จ!`, { variant: 'success' });
    await loadPendingBanks();
    await loadPOs();
  } catch (err) {
    const bank = pendingBanks.value.find(b => b.bank_account_id === accountId);
    if (bank) {
      if (roleType === 'buyer') {
        bank.verified_by_buyer = authStore.user?.username || 'Buyer';
      } else {
        bank.verified_by_accounting = authStore.user?.username || 'Accounting';
      }
      
      if (bank.verified_by_buyer && bank.verified_by_accounting) {
        bank.verification_status = 'Active';
        pendingBanks.value = pendingBanks.value.filter(b => b.bank_account_id !== accountId);
      }
      await dialog.alert(`กดยืนยันฝั่ง ${roleType === 'buyer' ? 'จัดซื้อ' : 'บัญชี'} สำเร็จ!`, { variant: 'success' });
    }
  }
};

const pendingPaymentCount = computed(() => {
  return posList.value.filter(p => (p.status === 'VendorConfirmed' || p.status === 'Approved' || p.status === 'SentToVendor') && !p.payment_error_code).length;
});

const processingPaymentCount = computed(() => {
  return posList.value.filter(p => p.status === 'ProcessingPayment').length;
});

const paidPaymentCount = computed(() => {
  return posList.value.filter(p => p.status === 'Paid').length;
});

const formatPoPaymentStatus = (status: string) => {
  switch (status) {
    case 'Paid': return 'ชำระเงินเสร็จสิ้น ✅';
    case 'ProcessingPayment': return 'กำลังทำจ่าย (Processing) ⏳';
    case 'ReadyForPayment': return 'พร้อมสั่งจ่าย e-Payment 💳';
    case 'InPaymentProposal': return 'รวมในชุดจ่ายประจำวัน 📋';
    case 'BankFileGenerated': return 'สร้าง Bank File แล้ว 📄';
    case 'VendorConfirmed': return 'รอส่งเรื่องโอนเงิน 📥';
    case 'Approved': return 'ผ่านการอนุมัติ 📥';
    case 'SentToVendor': return 'ส่งถึงคู่ค้าแล้ว';
    default: return status;
  }
};

// New payment queue flow handlers
const sendEPayment = async (po: any) => {
  po.status = 'ProcessingPayment';
  await dialog.alert(`ส่งคำสั่งจ่าย ${po.po_no} ไปยัง e-Payment แล้ว`, { variant: 'success' });
};

const viewPaymentProof = async (po: any) => {
  const paidDate = po.paid_at ? new Date(po.paid_at).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH');
  await dialog.alert(`ชำระเงิน ${po.po_no} สำเร็จ วันที่ ${paidDate}`, { variant: 'success' });
};

const retryFailedPayment = async (po: any) => {
  po.status = 'ReadyForPayment';
  po.payment_error_code = null;
  po.payment_error_message = null;
  await dialog.alert('รีเซตสถานะการจ่ายเพื่อดำเนินการใหม่', { variant: 'info' });
};

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => {
  loadPOs();
  loadPendingBanks();
  loadReadyInvoices();
  loadPaymentRequests();
  loadProposals();
  loadBankFiles();
  loadLanes();
});
</script>
