<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="border-b border-[#eff1f5] pb-4">
      <h2 class="text-xl font-bold text-[var(--fg-primary)]">ตั้งค่าระบบหลัก (Admin Settings Console)</h2>
      <p class="text-sm text-[var(--muted-foreground)] mt-1">บริหารจัดการโครงสร้างพื้นฐาน ความมั่นคงปลอดภัย และการเชื่อมโยงเครือข่ายข้อมูลภายนอกของ P2P OneLink</p>
    </div>

    <!-- Admin Hub Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Card 1: Security -->
      <div
        class="border border-[#e9ecef] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-green-500/40 transition bg-white rounded-xl cursor-pointer p-5 flex flex-col justify-between gap-4"
        @click="navigateTo('/admin/security')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-green-50 text-[var(--primary)] flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">ระบบความปลอดภัย & การตรวจสอบ IP</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              จำกัดสิทธิ์ช่วงเลขที่อยู่ IP ด้วย CIDR Block สำหรับบัญชีพนักงานจัดซื้อ บันทึกประวัติการยอมรับข้อตกลงความเป็นส่วนตัว (PDPA) และติดตามความหน่วง Latency ของ API
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 text-[var(--primary)] font-bold text-xs pt-3 border-t border-[var(--border)]">
          <span>เข้าสู่การตั้งค่าความปลอดภัย</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
        </div>
      </div>

      <!-- Card 2: SAP Integration -->
      <div
        class="border border-[#e9ecef] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-indigo-500/40 transition bg-white rounded-xl cursor-pointer p-5 flex flex-col justify-between gap-4"
        @click="navigateTo('/admin/integration')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">การเชื่อมต่อระบบ SAP ERP (SAP Integration Monitor)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              ติดตามบันทึกการส่งข้อมูล Interface ระหว่างระบบ P2P OneLink กับ SAP Business One ติดตามคิว Retry งานเอกสาร PR, PO, GR และสถานะการชำระเงินกับธนาคารพันธมิตร
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 text-indigo-600 font-bold text-xs pt-3 border-t border-[var(--border)]">
          <span>ตรวจสอบสถานะเชื่อมต่อ SAP</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
        </div>
      </div>

      <!-- Card 3: Procurement Item Types -->
      <div
        class="border border-[#e9ecef] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-emerald-500/40 transition bg-white rounded-xl cursor-pointer p-5 flex flex-col justify-between gap-4"
        @click="navigateTo('/admin/item-types')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">ประเภทและรูปแบบสินค้าประมูล (Bidding Formats)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              จัดการรูปแบบสินค้าและบริการในการประมูล (Goods, Service, Rental, License) เพิ่มเติมประเภทการประมูลเช่าซื้อ หรือจ้างงานอื่นเพื่อรองรับการจัดหามัลติโมเดล
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 text-emerald-600 font-bold text-xs pt-3 border-t border-[var(--border)]">
          <span>จัดการประเภทและรูปแบบสินค้าประมูล</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
        </div>
      </div>

      <!-- Card 4: Asset Rentals & License Subscriptions -->
      <div
        class="border border-[#e9ecef] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-amber-500/40 transition bg-white rounded-xl cursor-pointer p-5 flex flex-col justify-between gap-4"
        @click="navigateTo('/admin/asset-rentals')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">บันทึกการเช่าสินทรัพย์ & สิทธิ์ไลเซนส์ (Asset & Licenses)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              ตรวจสอบประวัติการจองและเช่าครุภัณฑ์ข้ามหน่วยงาน (BU-to-BU Asset Logs) พร้อมบันทึกคีย์ ซอฟต์แวร์สิทธิ์ใช้งาน (Adobe, Antivirus) และกำหนดเตือนวันหมดอายุ
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 text-amber-600 font-bold text-xs pt-3 border-t border-[var(--border)]">
          <span>ตรวจสอบการเช่า & ไลเซนส์</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app';
</script>
