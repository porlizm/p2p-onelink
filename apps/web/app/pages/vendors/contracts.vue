<template>
  <div class="vendor-like-page">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ศูนย์จัดการและควบคุมสัญญาจัดซื้อ (Contract Management Console)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">บริหารสัญญาจ้าง ทรัพยากรจัดจ้างภายนอก การเช่า ประกันภัย และควบคุมการแก้ไขเวอร์ชันสัญญา (Amendments)</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline" @click="loadData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
          รีเฟรชข้อมูล
        </button>
        <button class="btn-primary" @click="showCreateModal = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
          ร่างสัญญาใหม่ (Draft Contract)
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-[var(--primary)] flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">สัญญาทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ contracts.length }} ฉบับ</span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">ใช้งานหลัก (ลงนามแล้ว)</span>
          <span class="text-lg font-bold text-green-600">
            {{ contracts.filter(c => c.status === 'Signed').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอลงนามร่วม</span>
          <span class="text-lg font-bold text-orange-600">
            {{ contracts.filter(c => c.status === 'PendingSignature').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รออนุมัติภายใน</span>
          <span class="text-lg font-bold text-yellow-600">
            {{ contracts.filter(c => c.status === 'PendingApproval').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg>
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">วงเงินสัญญารวม</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalContractsAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Console -->
    <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] space-y-4">
      <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div class="space-y-3 flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
                <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-[var(--primary)]" />
                <span>ตัวกรองสถานะสัญญา</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">เลือกสถานะเพื่อดูรายการสัญญาที่ต้องดำเนินการต่อ</p>
            </div>
            <span class="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              แสดง {{ filteredContracts.length }} จาก {{ contracts.length }} ฉบับ
            </span>
          </div>

          <div class="contract-status-tabs">
            <button
              v-for="st in statusFilters"
              :key="st.val"
              type="button"
              @click="activeStatusFilter = st.val"
              class="contract-status-tab"
              :class="getStatusFilterClass(st.val)"
            >
              <span class="contract-status-tab__label">
                {{ getStatusFilterLabel(st.val, st.label) }}
              </span>
              <span class="contract-status-tab__badge">{{ getStatusFilterCount(st.val) }}</span>
            </button>
          </div>
        </div>

        <!-- Expiration simulation triggers for UAT -->
        <div class="xl:w-[300px] border-t xl:border-t-0 xl:border-l border-[#eff1f5] pt-3 xl:pt-0 xl:pl-4 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase">UAT Expiry Sim</div>
          <div class="grid grid-cols-2 gap-2">
            <button class="action-btn action-btn--neutral justify-center" @click="simulateExpirations(90)">จำลอง 90 วัน</button>
            <button class="action-btn action-btn--neutral justify-center" @click="simulateExpirations(30)">จำลอง 30 วัน</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contracts Table -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3.5">เลขที่สัญญา</th>
              <th class="px-6 py-3.5">ชื่อสัญญา / ประเภท</th>
              <th class="px-6 py-3.5">ผู้ขาย / คู่ค้า</th>
              <th class="px-6 py-3.5 text-right">วงเงินรวม</th>
              <th class="px-6 py-3.5 text-right">คงเหลือคงคลัง</th>
              <th class="px-6 py-3.5 text-center">ระยะเวลา</th>
              <th class="px-6 py-3.5 text-center">ประเภท / ระดับสัญญา</th>
              <th class="px-6 py-3.5 text-center">สถานะ</th>
              <th class="px-6 py-3.5 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr
              v-for="c in filteredContracts"
              :key="c.contract_id"
              class="hover:bg-[#f8fffe] transition"
              :style="c.status === 'ExpiringSoon' ? 'border-left: 3px solid #f59e0b; background: #fffbeb;' : ''"
            >
              <td class="px-6 py-5 font-bold text-[var(--primary)] text-xs">
                {{ c.contract_no }}
                <span v-if="c.version_no > 1" class="text-[10px] font-normal text-slate-400 block">เวอร์ชัน {{ c.version_no }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-slate-700">{{ c.title }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">ประเภท: {{ formatContractType(c.contract_type) }} ({{ c.contract_period }})</div>
              </td>
              <td class="px-6 py-5 text-slate-600 font-semibold text-xs">{{ c.vendor?.vendor_name }}</td>
              <td class="px-6 py-5 text-right font-bold text-slate-800">{{ formatCurrency(c.total_amount) }}</td>
              <td class="px-6 py-5 text-right font-extrabold text-indigo-600">{{ formatCurrency(c.remaining_amount) }}</td>
              <td class="px-6 py-5 text-center text-slate-500 text-[10px]">
                {{ formatDate(c.start_date) }} - {{ formatDate(c.end_date) }}
              </td>
              <td class="px-6 py-5 text-center">
                <span class="contract-class-chip" :class="`contract-class-chip--${(c.contract_class||'original').toLowerCase()}`">
                  {{ c.contract_class || 'Original' }}
                </span>
              </td>
              <td class="px-6 py-5 text-center">
                <StatusBadge :status="c.status" />
              </td>
              <td class="px-6 py-4">
                <div class="ctr-actions">
                  <!-- Draft → ส่งอนุมัติ -->
                  <button v-if="c.status === 'Draft'" class="action-btn action-btn--review" @click="submitForApproval(c.contract_id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
                    ส่งอนุมัติ
                  </button>
                  <!-- PendingApproval → อนุมัติ / ปฏิเสธ -->
                  <template v-else-if="c.status === 'PendingApproval'">
                    <button class="action-btn action-btn--view" @click="approveContract(c.contract_id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      อนุมัติ
                    </button>
                    <button class="action-btn action-btn--danger" @click="rejectContract(c.contract_id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      ปฏิเสธ
                    </button>
                  </template>
                  <!-- PendingSignature → ลงนามสัญญา -->
                  <button v-if="c.status === 'PendingSignature' && !c.signatures?.buyer" class="action-btn action-btn--review" @click="signAgreement(c.contract_id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>
                    ลงนามสัญญา
                  </button>
                  <!-- Signed → ดูสัญญา + Amend -->
                  <template v-else-if="c.status === 'Signed'">
                    <button class="action-btn action-btn--view" @click="handleContractAction(c, 'view')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูสัญญา
                    </button>
                    <button class="action-btn action-btn--neutral" @click="openAmendModal(c)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>
                      แก้ไข
                    </button>
                  </template>
                  <!-- ExpiringSoon → ต่ออายุ + ดูสัญญา -->
                  <template v-else-if="c.status === 'ExpiringSoon'">
                    <button class="action-btn action-btn--compare" @click="handleContractAction(c, 'renew')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      ต่ออายุ
                    </button>
                    <button class="action-btn action-btn--neutral" @click="handleContractAction(c, 'view')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูสัญญา
                    </button>
                  </template>
                  <!-- Expired → ดูสัญญา + ต่ออายุ -->
                  <template v-else-if="c.status === 'Expired'">
                    <button class="action-btn action-btn--neutral" @click="handleContractAction(c, 'view')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูสัญญา
                    </button>
                    <button class="action-btn action-btn--compare" @click="handleContractAction(c, 'renew')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      ต่ออายุ
                    </button>
                  </template>
                  <!-- Terminated → ดูสัญญา (read-only) -->
                  <template v-else-if="c.status === 'Terminated'">
                    <button class="action-btn action-btn--neutral" @click="handleContractAction(c, 'view')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูสัญญา
                    </button>
                  </template>
                  <!-- Superceded → ดูสัญญา -->
                  <template v-else-if="c.status === 'Superceded'">
                    <button class="action-btn action-btn--neutral" @click="handleContractAction(c, 'view')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      ดูสัญญา
                    </button>
                  </template>
                  <!-- Fallback: ดูรายละเอียด for any other status -->
                  <button v-else class="action-btn action-btn--neutral" @click="viewAgreementDetail(c)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    ดู
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredContracts.length === 0">
              <td colspan="9" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบข้อมูลสัญญาสั่งซื้อในระบบตามตัวกรองที่เลือก
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Agreement Modal -->
    <UModal v-model:open="showCreateModal" prevent-close :ui="{ content: 'max-w-xl' }">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-sm">ร่างสัญญากลางและ Blanket Agreement ใหม่</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showCreateModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <!-- Vendor & Title -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">คู่ค้าหลัก / Vendor</label>
              <USelect v-model="newVendorId" :options="vendorOptions" class="w-full" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ประเภทสัญญา</label>
              <USelect v-model="newContractType" :options="contractTypeOptions" class="w-full" />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">ชื่อสัญญา / วัตถุประสงค์จัดหา</label>
            <UInput v-model="newTitle" placeholder="เช่น สัญญาจัดหาทรัพยากรผู้พัฒนาซอฟต์แวร์..." />
          </div>

          <!-- Duration period -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ระยะสัญญาจ้าง</label>
              <USelect v-model="newContractPeriod" :options="contractPeriodOptions" class="w-full" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันเริ่มสัญญา (Start Date)</label>
              <UInput v-model="newStartDate" type="date" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันสิ้นสุดสัญญา (End Date)</label>
              <UInput v-model="newEndDate" type="date" />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">วงเงินสัญญารวมทั้งหมด (THB)</label>
            <UInput v-model.number="newAmount" type="number" placeholder="เช่น 1000000" />
          </div>

          <!-- TYPE-SPECIFIC DYNAMIC INPUTS -->
          <!-- 1. Outsourcing Resource Config -->
          <div v-if="newContractType === 'Outsourcing'" class="border border-dashed border-[#eff1f5] rounded-xl p-3 bg-[#fafbfc] space-y-2">
            <div class="font-bold text-slate-700 flex justify-between items-center mb-1">
              <span>ข้อมูลทรัพยากรจัดจ้างภายนอก (US-141)</span>
              <UButton size="xs" color="primary" @click="addResourceItem" icon="i-heroicons-plus">เพิ่มรายชื่อ</UButton>
            </div>
            <div v-for="(r, idx) in newResources" :key="idx" class="grid grid-cols-5 gap-2 items-center">
              <UInput v-model="r.role" placeholder="บทบาท/ตำแหน่ง" class="col-span-2" />
              <UInput v-model.number="r.rate" type="number" placeholder="ค่าจ้าง/หน่วย" />
              <USelect v-model="r.unit" :options="[{value:'hour', label:'ชม.'},{value:'day', label:'วัน'},{value:'month', label:'เดือน'}]" />
              <div class="flex items-center gap-1">
                <UInput v-model.number="r.quantity" type="number" placeholder="จำนวน" />
                <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click="removeResourceItem(idx)" />
              </div>
            </div>
            <div v-if="newResources.length === 0" class="text-center text-[10px] text-slate-400">กรุณาเพิ่มตำแหน่งที่ต้องการจ้าง</div>
          </div>

          <!-- 2. Rental Details Config -->
          <div v-if="newContractType === 'Rental'" class="border border-dashed border-[#eff1f5] rounded-xl p-3 bg-[#fafbfc] space-y-3">
            <div class="font-bold text-slate-700">ข้อมูลสัญญาการเช่าพัสดุ (US-142)</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 mb-1">รอบเวลาการวางบิลเช่า</label>
                <USelect v-model="newRentalDetails.billing_cycle" :options="['Monthly','Quarterly','Yearly','Custom']" />
              </div>
              <div>
                <label class="block text-slate-500 mb-1">ค่าเช่าต่องวด (THB)</label>
                <UInput v-model.number="newRentalDetails.installment_amount" type="number" />
              </div>
            </div>
            <div>
              <label class="block text-slate-500 mb-1">เงื่อนไขการส่งคืนสินทรัพย์เมื่อสิ้นสัญญา</label>
              <UInput v-model="newRentalDetails.return_conditions" placeholder="เช่น ต้องแจ้งล่วงหน้า 30 วันและส่งคืนในสภาพสมบูรณ์..." />
            </div>
          </div>

          <!-- 3. Warranty/Support details -->
          <div v-if="newContractType === 'Warranty' || newContractType === 'Service'" class="border border-dashed border-[#eff1f5] rounded-xl p-3 bg-[#fafbfc] space-y-3">
            <div class="font-bold text-slate-700">ขอบเขตการรับประกัน & SLA (US-142)</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 mb-1">ระดับ SLA (SLA Standard)</label>
                <UInput v-model="newWarrantyDetails.sla_level" placeholder="เช่น 24x7 Support, Response within 4 hours..." />
              </div>
              <div>
                <label class="block text-slate-500 mb-1">ผู้รับผิดชอบดูแลหลัก (Contact Person)</label>
                <UInput v-model="newWarrantyDetails.contact_person" placeholder="เช่น ทีม Support บริษัท..." />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showCreateModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton 
            color="primary"
            :loading="submitting"
            class="px-5 cursor-pointer font-bold"
            @click="submitContract"
          >
            บันทึกเป็นร่างสัญญา
          </UButton>
        </div>
      </div>
          </template>
    </UModal>

    <!-- Amend Contract Modal -->
    <UModal v-model:open="showAmendModal" prevent-close :ui="{ content: 'max-w-xl' }">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-purple-900 text-sm">ขอแก้ไขข้อมูลสัญญากลาง (Contract Amendment / Addendum)</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showAmendModal = false" />
        </div>

        <div class="space-y-4 text-xs" v-if="amendTargetContract">
          <div class="bg-purple-50 border border-purple-100 rounded-lg p-3 text-[10px] text-purple-900 leading-normal">
            <strong>ข้อมูลอ้างอิง:</strong> การแก้ไขจะทำการยกเลิกสัญญารหัสเก่า ({{ amendTargetContract.contract_no }}) และสร้างฉบับใหม่ปรับเวอร์ชันหลังจากผ่านอนุมัติ internal และลงนามคู่ค้าแล้ว
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">ชื่อสัญญาจัดทำใหม่ (Title)</label>
            <UInput v-model="amendTitle" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันเริ่มสัญญาใหม่ (Start Date)</label>
              <UInput v-model="amendStartDate" type="date" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันสิ้นสุดสัญญาใหม่ (End Date)</label>
              <UInput v-model="amendEndDate" type="date" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วงเงินสัญญารวมใหม่ (Total Amount)</label>
              <UInput v-model.number="amendAmount" type="number" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ประเภทระยะเวลาสัญญา</label>
              <USelect v-model="amendContractPeriod" :options="contractPeriodOptions" />
            </div>
          </div>

          <!-- Type Specific parameters in Amendment -->
          <!-- 1. Outsourcing Resource -->
          <div v-if="amendContractType === 'Outsourcing'" class="border border-purple-100 rounded-xl p-3 bg-purple-50/30 space-y-2">
            <div class="font-bold text-purple-950 flex justify-between items-center mb-1">
              <span>ตำแหน่งและอัตราจ้างจัดซื้อใหม่</span>
              <UButton size="xs" color="primary" @click="addAmendResource" icon="i-heroicons-plus">เพิ่มรายชื่อ</UButton>
            </div>
            <div v-for="(r, idx) in amendResources" :key="idx" class="grid grid-cols-5 gap-2 items-center">
              <UInput v-model="r.role" placeholder="บทบาท/ตำแหน่ง" class="col-span-2" />
              <UInput v-model.number="r.rate" type="number" placeholder="ค่าจ้าง/หน่วย" />
              <USelect v-model="r.unit" :options="[{value:'hour', label:'ชม.'},{value:'day', label:'วัน'},{value:'month', label:'เดือน'}]" />
              <div class="flex items-center gap-1">
                <UInput v-model.number="r.quantity" type="number" placeholder="จำนวน" />
                <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click="removeAmendResource(idx)" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showAmendModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton 
            color="primary"
            :loading="submitting"
            class="px-5 cursor-pointer font-bold text-white bg-[var(--primary)] hover:bg-green-700"
            @click="submitAmendment"
          >
            สร้างคำขอเสนออนุมัติแก้ไข (Submit Amendment)
          </UButton>
        </div>
      </div>
          </template>
    </UModal>

    <!-- Contract Detail Slideover Drawer -->
    <USlideover v-model:open="showDetailDrawer" :ui="{ content: 'max-w-xl' }">
      <template #content>
      <div class="p-6 h-full flex flex-col space-y-4 bg-white text-xs" v-if="activeContract">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <div class="font-bold text-slate-800 text-sm">รายละเอียดเอกสารสัญญากลาง</div>
            <div class="text-[10px] text-slate-400">Class: {{ activeContract.contract_class || 'Original' }} | Version: {{ activeContract.version_no }}</div>
          </div>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showDetailDrawer = false" />
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto pr-1">
          <!-- Card Info -->
          <div class="bg-[#fafbfc] p-4 border rounded-xl space-y-3">
            <div class="flex justify-between font-bold text-slate-700 border-b pb-1.5">
              <span>เลขที่สัญญา:</span>
              <span class="text-[var(--primary)] font-mono">{{ activeContract.contract_no }}</span>
            </div>
            <div class="flex justify-between">
              <span>ชื่อสัญญา:</span>
              <span class="font-semibold text-slate-800 text-right">{{ activeContract.title }}</span>
            </div>
            <div class="flex justify-between">
              <span>ประเภทสัญญา:</span>
              <span class="font-bold text-slate-700">{{ formatContractType(activeContract.contract_type) }} ({{ activeContract.contract_period }})</span>
            </div>
            <div class="flex justify-between">
              <span>คู่ค้า / Vendor:</span>
              <span class="font-semibold text-slate-700">{{ activeContract.vendor?.vendor_name }}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span>วงเงินประกันสัญญา:</span>
              <span class="font-bold text-slate-800">{{ formatCurrency(activeContract.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>วงเงินคงเหลือคงคลัง:</span>
              <span class="font-extrabold text-indigo-600">{{ formatCurrency(activeContract.remaining_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>ระยะเวลากลางสัญญา:</span>
              <span>{{ formatDate(activeContract.start_date) }} - {{ formatDate(activeContract.end_date) }}</span>
            </div>
          </div>

          <!-- SPECIFIC VALUE VIEW DETAILS -->
          <!-- 1. Resource Outsourcing Details -->
          <div v-if="activeContract.contract_type === 'Outsourcing' && activeContract.resources" class="border rounded-xl p-4 bg-[#fafbfc]/50 space-y-2">
            <div class="font-bold text-slate-800">รายการอัตราจ้างจัดซื้อทรัพยากรจัดจ้าง (Outsourcing Details)</div>
            <div class="divide-y divide-slate-100">
              <div v-for="(r, idx) in activeContract.resources" :key="idx" class="flex justify-between py-1.5 text-[11px]">
                <span class="font-semibold text-slate-700">{{ r.role }}</span>
                <span class="text-slate-600 font-mono">
                  {{ formatCurrency(r.rate) }} / {{ r.unit === 'hour' ? 'ชม.' : r.unit === 'day' ? 'วัน' : 'เดือน' }} (จำนวน {{ formatQuantity(r.quantity) }} ราย)
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Rental Details View -->
          <div v-if="activeContract.contract_type === 'Rental' && activeContract.rental_details" class="border rounded-xl p-4 bg-[#fafbfc]/50 space-y-2">
            <div class="font-bold text-slate-800">ข้อมูลรอบการเช่ารายงวด</div>
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span>รอบการชำระเงินเช่า:</span>
                <span class="font-bold text-slate-700">{{ activeContract.rental_details.billing_cycle }}</span>
              </div>
              <div class="flex justify-between">
                <span>ยอดเงินงวดการเช่า:</span>
                <span class="font-extrabold text-indigo-600">{{ formatCurrency(activeContract.rental_details.installment_amount) }}</span>
              </div>
              <div v-if="activeContract.rental_details.return_conditions" class="text-slate-500 mt-1">
                <strong>เงื่อนไขการส่งคืน:</strong> {{ activeContract.rental_details.return_conditions }}
              </div>
            </div>
          </div>

          <!-- 3. Warranty details view -->
          <div v-if="(activeContract.contract_type === 'Warranty' || activeContract.contract_type === 'Service') && activeContract.warranty_details" class="border rounded-xl p-4 bg-[#fafbfc]/50 space-y-2">
            <div class="font-bold text-slate-800">ข้อมูล SLA & ขอบเขตความคุ้มครอง</div>
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span>ระดับมาตรฐาน SLA:</span>
                <span class="font-semibold text-slate-700">{{ activeContract.warranty_details.sla_level || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span>ผู้ประสานงานหลัก (Contact Person):</span>
                <span class="font-semibold text-slate-700">{{ activeContract.warranty_details.contact_person || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Digital Signature Details -->
          <div class="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-4">
            <div class="font-bold text-indigo-900 flex items-center gap-1">
              <span>✏ สถานะการลงนามอิเล็กทรอนิกส์ (E-Signatures Status)</span>
            </div>

            <!-- Buyer signature -->
            <div class="border-b pb-3 border-indigo-100/50">
              <div class="font-bold text-slate-700">ตัวแทนสั่งซื้อ (SCGJWD Buyer)</div>
              <div v-if="activeContract.signatures?.buyer" class="mt-1.5 space-y-1 text-slate-600 bg-white p-2 rounded border border-slate-100">
                <div class="flex justify-between">
                  <span>ผู้ลงนาม:</span>
                  <span class="font-semibold text-slate-800">{{ activeContract.signatures.buyer.name }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>IP Address:</span>
                  <span class="font-mono text-slate-400">{{ activeContract.signatures.buyer.ip }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>เวลาลงนาม:</span>
                  <span>{{ formatDateTime(activeContract.signatures.buyer.signed_at) }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-orange-600 font-semibold mt-1">ยังไม่มีการลงนาม ⏳</div>
            </div>

            <!-- Vendor signature -->
            <div>
              <div class="font-bold text-slate-700">ตัวแทนผู้ขาย (Vendor Representative)</div>
              <div v-if="activeContract.signatures?.vendor" class="mt-1.5 space-y-1 text-slate-600 bg-white p-2 rounded border border-slate-100">
                <div class="flex justify-between">
                  <span>ผู้ลงนาม:</span>
                  <span class="font-semibold text-slate-800">{{ activeContract.signatures.vendor.name }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>IP Address:</span>
                  <span class="font-mono text-slate-400">{{ activeContract.signatures.vendor.ip }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>เวลาลงนาม:</span>
                  <span>{{ formatDateTime(activeContract.signatures.vendor.signed_at) }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-orange-600 font-semibold mt-1">ยังไม่ได้รับการลงนามจากฝั่งคู่ค้า ⏳</div>
            </div>
          </div>
        </div>

        <div class="border-t pt-4 flex gap-2 justify-end bg-white">
          <UButton @click="showDetailDrawer = false" color="neutral" variant="ghost">ปิด</UButton>
          <!-- Submit approval button if Draft -->
          <UButton 
            v-if="activeContract.status === 'Draft'"
            color="warning"
            class="cursor-pointer font-bold px-4"
            @click="submitForApproval(activeContract.contract_id)"
          >
            ส่งอนุมัติร่างสัญญา
          </UButton>
          <!-- Sign Contract button if Pending signature -->
          <UButton 
            v-if="activeContract.status === 'PendingSignature' && !activeContract.signatures?.buyer"
            color="primary"
            class="cursor-pointer font-bold px-4"
            @click="signAgreement(activeContract.contract_id)"
          >
            ลงนามสัญญากลาง
          </UButton>
        </div>
      </div>
          </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const authStore = useAuthStore();
const dialog = useDialog();

const contracts = ref<any[]>([]);
const vendorsList = ref<any[]>([]);

const showCreateModal = ref(false);
const showAmendModal = ref(false);
const showDetailDrawer = ref(false);
const submitting = ref(false);
const activeContract = ref<any | null>(null);
const amendTargetContract = ref<any | null>(null);

// Filter configs
const statusFilters = [
  { val: 'All', label: 'ทั้งหมด' },
  { val: 'Signed', label: 'ใช้งานหลัก (ลงนามแล้ว)' },
  { val: 'PendingSignature', label: 'รอลงนามร่วม' },
  { val: 'PendingApproval', label: 'รออนุมัติภายใน' },
  { val: 'Draft', label: 'ร่างสัญญา' },
  { val: 'Superceded', label: 'สิ้นสุด/มีสัญญาใหม่แทนที่' }
];
const activeStatusFilter = ref('All');

// Create Form Refs
const newVendorId = ref('');
const newTitle = ref('');
const newStartDate = ref(new Date().toISOString().split('T')[0]);
const newEndDate = ref(new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]);
const newAmount = ref<number | null>(null);
const newContractType = ref('Sales');
const newContractPeriod = ref('1 Year');

const newResources = ref<{ role: string; rate: number; unit: 'hour' | 'day' | 'month'; quantity: number }[]>([]);
const newRentalDetails = ref({ billing_cycle: 'Monthly', installment_amount: 0, return_conditions: '' });
const newWarrantyDetails = ref({ sla_level: '', contact_person: '' });

// Amendment Form Refs
const amendTitle = ref('');
const amendStartDate = ref('');
const amendEndDate = ref('');
const amendAmount = ref<number | null>(null);
const amendContractType = ref('Sales');
const amendContractPeriod = ref('1 Year');
const amendResources = ref<any[]>([]);

const contractTypeOptions = [
  { value: 'Sales', label: 'สัญญาการขายพัสดุ (Sales Agreement)' },
  { value: 'Rental', label: 'สัญญาเช่าครุภัณฑ์/สินทรัพย์ (Rental Contract)' },
  { value: 'Service', label: 'สัญญาบริการทั่วไป (Service Contract)' },
  { value: 'Warranty', label: 'การบำรุงรักษา / ประกันภัย (Warranty SLA)' },
  { value: 'Outsourcing', label: 'จัดจ้างพนักงาน Outsource (Resource Outsourcing)' }
];

const contractPeriodOptions = [
  { value: '6 Months', label: '6 เดือน' },
  { value: '1 Year', label: '1 ปี' },
  { value: '3 Years', label: '3 ปี' },
  { value: 'Custom', label: 'กำหนดระยะเวลาเอง (Custom)' }
];

// Resource actions
const addResourceItem = () => {
  newResources.value.push({ role: '', rate: 0, unit: 'month', quantity: 1 });
};
const removeResourceItem = (idx: number) => {
  newResources.value.splice(idx, 1);
};
const addAmendResource = () => {
  amendResources.value.push({ role: '', rate: 0, unit: 'month', quantity: 1 });
};
const removeAmendResource = (idx: number) => {
  amendResources.value.splice(idx, 1);
};

const filteredContracts = computed(() => {
  if (activeStatusFilter.value === 'All') return contracts.value;
  return contracts.value.filter(c => c.status === activeStatusFilter.value);
});

const getStatusFilterCount = (status: string) => {
  if (status === 'All') return contracts.value.length;
  return contracts.value.filter(c => c.status === status).length;
};

const getStatusFilterLabel = (status: string, fallback: string) => {
  const labels: Record<string, string> = {
    All: 'ทั้งหมด',
    Signed: 'ใช้งานหลัก',
    PendingSignature: 'รอลงนามร่วม',
    PendingApproval: 'รออนุมัติภายใน',
    Draft: 'ร่างสัญญา',
    Superceded: 'สิ้นสุด/แทนที่'
  };
  return labels[status] || fallback;
};

const getStatusFilterDescription = (status: string) => {
  const descriptions: Record<string, string> = {
    All: 'ทุกสถานะ',
    Signed: 'ลงนามแล้ว',
    PendingSignature: 'รอคู่ค้าหรือผู้ซื้อ',
    PendingApproval: 'รอผู้มีอำนาจอนุมัติ',
    Draft: 'ยังไม่ส่งอนุมัติ',
    Superceded: 'มีฉบับใหม่แทนแล้ว'
  };
  return descriptions[status] || '';
};

const getStatusFilterClass = (status: string) => {
  if (activeStatusFilter.value === status) {
    return 'contract-status-tab--active';
  }
  return '';
};

const loadData = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/contract', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    contracts.value = res;
  } catch (err) {
    console.warn('API error, using fallback dashboard seed data.');
    contracts.value = [
      {
        contract_id: 'con-01',
        contract_no: 'CNT-2026-0001',
        title: 'สัญญาจัดซื้อเครื่องพิมพ์สำนักงานและวัสดุสิ้นเปลือง',
        contract_type: 'Sales',
        contract_period: '1 Year',
        total_amount: 150000,
        remaining_amount: 120000,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        contract_class: 'Original',
        status: 'Signed',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        signatures: { buyer: true, vendor: true }
      },
      {
        contract_id: 'con-02',
        contract_no: 'CNT-2026-0002',
        title: 'สัญญาจัดจ้างบริการขนส่งสินค้าควบคุมอุณหภูมิปี 2569',
        contract_type: 'Service',
        contract_period: '1 Year',
        total_amount: 950000,
        remaining_amount: 950000,
        start_date: '2026-07-01',
        end_date: '2027-06-30',
        contract_class: 'Original',
        status: 'PendingApproval',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
        signatures: { buyer: false, vendor: false }
      },
      {
        contract_id: 'con-03',
        contract_no: 'CNT-2026-0003',
        title: 'สัญญาเช่าครุภัณฑ์เซิร์ฟเวอร์ระบบสำรองศูนย์ข้อมูล',
        contract_type: 'Rental',
        contract_period: '1 Year',
        total_amount: 680000,
        remaining_amount: 680000,
        start_date: '2026-07-15',
        end_date: '2027-07-14',
        contract_class: 'Original',
        status: 'PendingSignature',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        signatures: { buyer: false, vendor: false }
      },
      {
        contract_id: 'con-04',
        contract_no: 'CNT-2026-0004',
        title: 'สัญญาจ้างบริการพัฒนาปรับปรุงโปรแกรมบริหารจัดส่ง',
        contract_type: 'Outsourcing',
        contract_period: '6 Months',
        total_amount: 320000,
        remaining_amount: 320000,
        start_date: '2026-08-01',
        end_date: '2027-01-31',
        contract_class: 'Original',
        status: 'Draft',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
        signatures: { buyer: false, vendor: false }
      },
      {
        contract_id: 'con-05',
        contract_no: 'CNT-2026-0005',
        title: 'สัญญาจัดซื้อวัสดุสำนักงานประจำปีของคลังสินค้า (ปี 2568)',
        contract_type: 'Sales',
        contract_period: '1 Year',
        total_amount: 45000,
        remaining_amount: 0,
        start_date: '2025-06-01',
        end_date: '2026-05-31',
        contract_class: 'Original',
        status: 'Superceded',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        signatures: { buyer: true, vendor: true }
      },
      {
        contract_id: 'cnt_mock_6',
        contract_no: 'CNT-2025-0018',
        title: 'สัญญาบริการทำความสะอาดอาคารสำนักงานใหญ่ประจำปี',
        contract_type: 'Service',
        contract_period: '1 Year',
        total_amount: 480000,
        remaining_amount: 38400,
        start_date: new Date(Date.now() - 86400000 * 340).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0],
        contract_class: 'Original',
        status: 'ExpiringSoon',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท คลีนเซอร์วิส จำกัด' },
        signatures: { buyer: true, vendor: true }
      },
      {
        contract_id: 'cnt_mock_7',
        contract_no: 'CNT-2025-0010',
        title: 'สัญญาจัดหาอุปกรณ์ความปลอดภัยและ PPE ประจำปี',
        contract_type: 'Sales',
        contract_period: '1 Year',
        total_amount: 150000,
        remaining_amount: 0,
        start_date: new Date(Date.now() - 86400000 * 400).toISOString().split('T')[0],
        end_date: new Date(Date.now() - 86400000 * 35).toISOString().split('T')[0],
        contract_class: 'Original',
        status: 'Expired',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด' },
        signatures: { buyer: true, vendor: true }
      },
      {
        contract_id: 'cnt_mock_8',
        contract_no: 'CNT-2025-0005',
        title: 'สัญญาจัดจ้างงานซ่อมบำรุงระบบ HVAC คลังสินค้า',
        contract_type: 'Service',
        contract_period: '1 Year',
        total_amount: 320000,
        remaining_amount: 80000,
        start_date: new Date(Date.now() - 86400000 * 180).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0],
        contract_class: 'Original',
        status: 'Terminated',
        version_no: 1,
        vendor: { vendor_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด' },
        signatures: { buyer: true, vendor: true }
      }
    ];
  }

  try {
    const vRes = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    vendorsList.value = vRes;
    if (vRes.length > 0 && !newVendorId.value) {
      newVendorId.value = vRes[0].vendor_id;
    }
  } catch (err) {
    vendorsList.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
      { vendor_id: '00000000-0000-0000-0000-000000000602', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' }
    ];
    newVendorId.value = '00000000-0000-0000-0000-000000000601';
  }
};

const vendorOptions = computed(() => {
  return vendorsList.value.map(v => ({ value: v.vendor_id, label: v.vendor_name }));
});

const totalContractsAmount = computed(() => {
  return contracts.value.reduce((sum, c) => sum + Number(c.total_amount), 0);
});

const viewAgreementDetail = (c: any) => {
  activeContract.value = c;
  showDetailDrawer.value = true;
};

// Create Contract Action
const submitContract = async () => {
  if (!newVendorId.value || !newTitle.value || !newAmount.value) {
    await dialog.alert('กรุณากรอกข้อมูลให้ครบถ้วน', { variant: 'danger' });
    return;
  }
  submitting.value = true;
  const payload = {
    vendor_id: newVendorId.value,
    title: newTitle.value,
    start_date: newStartDate.value,
    end_date: newEndDate.value,
    total_amount: newAmount.value,
    contract_type: newContractType.value,
    contract_period: newContractPeriod.value,
    resources: newContractType.value === 'Outsourcing' ? newResources.value : null,
    rental_details: newContractType.value === 'Rental' ? newRentalDetails.value : null,
    warranty_details: (newContractType.value === 'Warranty' || newContractType.value === 'Service') ? newWarrantyDetails.value : null,
    contract_class: 'Original'
  };

  try {
    await $fetch('http://localhost:3001/api/contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: payload,
    });
    await dialog.alert('ร่างเอกสัญญากลางใหม่เรียบร้อย! กรุณาส่งขออนุมัติภายใน', { variant: 'danger' });
    showCreateModal.value = false;
    await loadData();
  } catch (err) {
    await dialog.alert('บันทึกร่างสัญญาจัดซื้อเรียบร้อย!', { variant: 'success' });
    contracts.value.unshift({
      contract_id: `con_${Date.now()}`,
      contract_no: `CNT-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newTitle.value,
      vendor: vendorsList.value.find(v => v.vendor_id === newVendorId.value),
      total_amount: newAmount.value,
      remaining_amount: newAmount.value,
      start_date: newStartDate.value,
      end_date: newEndDate.value,
      contract_type: newContractType.value,
      contract_period: newContractPeriod.value,
      resources: newContractType.value === 'Outsourcing' ? [...newResources.value] : null,
      rental_details: newContractType.value === 'Rental' ? { ...newRentalDetails.value } : null,
      warranty_details: (newContractType.value === 'Warranty' || newContractType.value === 'Service') ? { ...newWarrantyDetails.value } : null,
      status: 'Draft',
      contract_class: 'Original',
      version_no: 1,
      signatures: {}
    });
    showCreateModal.value = false;
  } finally {
    submitting.value = false;
  }
};

// submit approval
const submitForApproval = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/contract/${id}/submit-approval`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await dialog.alert('ส่งขออนุมัติภายในตามสายงานสำเร็จ!', { variant: 'success' });
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === id);
    if (c) {
      c.status = 'PendingApproval';
      await dialog.alert(`ส่งสัญญา ${c.contract_no} เพื่ออนุมัติแล้ว`, { variant: 'success' });
    }
  }
};

// Approve
const approveContract = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/contract/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await dialog.alert('อนุมัติสัญญาสำเร็จ! สถานะเปลี่ยนเป็นรอคู่ค้าลงนามร่วม', { variant: 'success' });
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === id);
    if (c) {
      c.status = 'PendingSignature';
      await dialog.alert(`อนุมัติสัญญา ${c.contract_no} แล้ว สถานะเปลี่ยนเป็นรอลงนาม`, { variant: 'success' });
    }
  }
};

// Reject
const rejectContract = async (id: string) => {
  const ok = await dialog.confirm('ยืนยันการปฏิเสธร่างสัญญานี้ใช่หรือไม่? สัญญาจะถูกส่งกลับให้ผู้ร่างแก้ไข', { variant: 'danger', title: 'ปฏิเสธร่างสัญญา' });
  if (!ok) return;
  const reason = 'ปฏิเสธตามดุลยพินิจผู้อนุมัติ';
  try {
    await $fetch(`http://localhost:3001/api/contract/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { reason }
    });
    await dialog.alert('ปฏิเสธเอกสารสัญญาแล้ว ส่งกลับให้ผู้ร่างแก้ไข', { variant: 'success' });
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === id);
    if (c) {
      c.status = 'Draft';
      c._reject_reason = reason;
    }
    await dialog.alert(`ปฏิเสธร่างเอกสารเรียบร้อย!\nเหตุผล: ${reason || '(ไม่ระบุ)'}\nสัญญาถูกส่งกลับเป็น Draft`, { variant: 'success' });
  }
};

// handleContractAction - central dispatcher for contract lifecycle actions
const handleContractAction = async (contract: any, action: string) => {
  if (action === 'view') {
    viewAgreementDetail(contract);
  } else if (action === 'renew') {
    await dialog.alert(`ส่งคำขอต่ออายุสัญญา ${contract.contract_no} ให้ฝ่ายจัดซื้อแล้ว`, { variant: 'success' });
  }
};

// Open Amendment Modal
const openAmendModal = (c: any) => {
  amendTargetContract.value = c;
  amendTitle.value = `แก้ไข - ${c.title}`;
  amendStartDate.value = c.start_date.split('T')[0];
  amendEndDate.value = c.end_date.split('T')[0];
  amendAmount.value = c.total_amount;
  amendContractType.value = c.contract_type;
  amendContractPeriod.value = c.contract_period;
  amendResources.value = c.resources ? JSON.parse(JSON.stringify(c.resources)) : [];
  showAmendModal.value = false;
  showAmendModal.value = true;
};

// Submit Amendment Action
const submitAmendment = async () => {
  const c = amendTargetContract.value;
  if (!amendTitle.value || !amendAmount.value) {
    await dialog.alert('กรุณากรอกข้อมูลให้ครบถ้วน', { variant: 'danger' });
    return;
  }
  submitting.value = true;

  const payload = {
    title: amendTitle.value,
    start_date: amendStartDate.value,
    end_date: amendEndDate.value,
    total_amount: amendAmount.value,
    contract_type: amendContractType.value,
    contract_period: amendContractPeriod.value,
    resources: amendContractType.value === 'Outsourcing' ? amendResources.value : null
  };

  try {
    await $fetch(`http://localhost:3001/api/contract/${c.contract_id}/amend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: payload
    });
    await dialog.alert('บันทึกคำร้องขอแก้ไขสัญญา (Amendment) สำเร็จ! กรุณาส่งขออนุมัติภายใน', { variant: 'danger' });
    showAmendModal.value = false;
    await loadData();
  } catch (err) {
    const versionNo = Number(c.version_no) + 1;
    contracts.value.unshift({
      contract_id: `con_amend_${Date.now()}`,
      contract_no: `${c.contract_no}-REV${versionNo}`,
      title: amendTitle.value,
      vendor: c.vendor,
      total_amount: amendAmount.value,
      remaining_amount: amendAmount.value,
      start_date: amendStartDate.value,
      end_date: amendEndDate.value,
      contract_type: amendContractType.value,
      contract_period: amendContractPeriod.value,
      resources: amendContractType.value === 'Outsourcing' ? [...amendResources.value] : null,
      rental_details: c.rental_details,
      status: 'Draft',
      contract_class: 'Amendment',
      version_no: versionNo,
      parent_contract_id: c.contract_id,
      signatures: {}
    });
    await dialog.alert('บันทึกสัญญากลางฉบับแก้ไขร่างใหม่สำเร็จ! (Simulated Draft)', { variant: 'success' });
    showAmendModal.value = false;
  } finally {
    submitting.value = false;
  }
};

// Sign Contract
const signAgreement = async (contractId: string) => {
  if (!(await dialog.confirm('ยืนยันประทับตราและลงลายมือชื่อดิจิทัลสำหรับผู้จัดซื้อใช่หรือไม่? การทำงานนี้จะบันทึกเลข IP ของเครื่องคุณ', { variant: 'warning' }))) return;
  const name = authStore.user?.username || 'คุณนันทพร ศิริวัฒน์';
  try {
    await $fetch(`http://localhost:3001/api/contract/${contractId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { role: 'buyer', name },
    });
    await dialog.alert('ลงนามสัญญากลางเรียบร้อย!', { variant: 'success' });
    showDetailDrawer.value = false;
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === contractId);
    if (c) {
      c.signatures = c.signatures || {};
      c.signatures.buyer = {
        name,
        signed_at: new Date().toISOString(),
        ip: '192.168.1.100 (UAT-Network)',
      };
      if (c.signatures.vendor) {
        c.status = 'Signed';
        if (c.contract_class === 'Amendment' && c.parent_contract_id) {
          const parent = contracts.value.find(p => p.contract_id === c.parent_contract_id);
          if (parent) parent.status = 'Superceded';
        }
      }
      await dialog.alert(`ลงนามสัญญา ${c.contract_no} เรียบร้อย`, { variant: 'success' });
      showDetailDrawer.value = false;
    }
  }
};

// UAT Alert Simulation triggers
const simulateExpirations = async (days: number) => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/contract/check-expirations?simulateDays=${days}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await dialog.alert(`ตรวจสอบแจ้งเตือนสำเร็จ!\nพบรายการเตือนใกล้หมดอายุ ${days} วัน จำนวน: ${res.triggered_alerts_count} รายการ\nข้อความอีเมล: ${JSON.stringify(res.logged_emails)}`, { variant: 'warning' });
  } catch (err) {
    await dialog.alert(`[Simulated Alert Trigger] สำหรับรอบหมดอายุใน ${days} วัน: \nส่งเมลไปหาผู้ดูแลซื้อขายเพื่อแจ้งหมดอายุเรียบร้อย!`, { variant: 'success' });
  }
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

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
};

const formatContractType = (t: string) => {
  switch (t) {
    case 'Sales': return 'การขายพัสดุ';
    case 'Rental': return 'เช่าสินทรัพย์/ครุภัณฑ์';
    case 'Service': return 'จ้างบริการ';
    case 'Warranty': return 'บำรุงรักษา/SLA';
    case 'Outsourcing': return 'Outsourcing พนักงาน';
    default: return t || 'ทั่วไป';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'Signed': return 'ประทับตราสมบูรณ์ ✅';
    case 'PendingSignature': return 'รอคู่ค้าลงนาม ⏳';
    case 'PendingApproval': return 'รออนุมัติภายใน ⏳';
    case 'Draft': return 'ร่างสัญญา (Draft)';
    case 'Rejected': return 'ปฏิเสธคำขออนุมัติ ❌';
    case 'Superceded': return 'สัญญาสิ้นสุด/ปรับปรุงแล้ว ⛔';
    default: return status || 'ร่าง';
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.vendor-like-page { display: flex; flex-direction: column; gap: var(--space-5); font-family: var(--font-sans); }

.vendor-like-page > .flex:first-child {
  align-items: flex-start;
  border-bottom: 0;
  padding-bottom: 0;
}

.vendor-like-page h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--fg-primary);
  letter-spacing: var(--tracking-tight);
}

.vendor-like-page p {
  margin-top: 4px;
  font-size: var(--text-sm);
  color: var(--fg-tertiary);
}

.vendor-like-page > .grid {
  gap: var(--space-4);
}

.vendor-like-page > .grid > div {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-1);
}

.vendor-like-page > .grid > div > div:first-child {
  display: none;
}

.vendor-like-page > .grid span:first-child {
  font-size: var(--text-xs);
  color: var(--fg-tertiary);
  font-weight: var(--weight-medium);
  text-transform: none;
}

.vendor-like-page > .grid span:last-child {
  font-size: 22px;
  font-weight: var(--weight-bold);
  line-height: 1;
}

.vendor-like-page > .bg-white {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-1);
}

.vendor-like-page table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.vendor-like-page thead tr {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

.vendor-like-page th {
  padding: 12px 20px;
  font-size: 11px;
  font-weight: var(--weight-bold);
  color: var(--fg-tertiary);
  text-transform: uppercase;
  white-space: nowrap;
}

.vendor-like-page td {
  padding: 16px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f5;
}

.vendor-like-page tbody tr:hover {
  background: #fafafa;
}

.contract-status-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 4px;
  background: #f3f5f7;
  border: 1px solid #eef1f4;
  border-radius: 14px;
}

.contract-status-tab {
  min-width: max-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #6b7280;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.contract-status-tab:hover {
  color: #374151;
  background: rgba(255, 255, 255, 0.65);
}

.contract-status-tab--active {
  color: #047857;
  background: #ffffff;
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.contract-status-tab--active:hover {
  color: #047857;
  background: #ffffff;
  border-color: #e5e7eb;
}

.contract-status-tab--active .contract-status-tab__label {
  color: #047857;
}

.contract-status-tab__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.contract-status-tab__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: #e5e7eb;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}

.contract-status-tab--active .contract-status-tab__badge {
  color: #047857;
  background: #d8f3df;
}

@media (max-width: 640px) {
  .contract-status-tabs { padding: 8px; }
  .contract-status-tab {
    height: 42px;
    padding: 0 12px;
    font-size: 12px;
  }
}

.contract-class-chip {
  display: inline-block; padding: 2px 10px; border-radius: var(--radius-sm);
  font-size: var(--text-2xs, 10px); font-weight: var(--weight-bold); border: 1px solid;
}
.contract-class-chip--original { background: var(--bg-surface); color: var(--fg-secondary); border-color: var(--border-default); }
.contract-class-chip--amendment { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
.contract-class-chip--addendum { background: #f0fdfa; color: #0f766e; border-color: #99f6e4; }

.ctr-actions {
  display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
}
</style>
