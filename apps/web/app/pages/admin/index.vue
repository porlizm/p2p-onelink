<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="border-b border-[var(--border)] pb-4">
      <h2 class="text-xl font-bold text-[#002266]">ตั้งค่าระบบหลัก (Admin Settings Console)</h2>
      <p class="text-sm text-[var(--muted-foreground)] mt-1">บริหารจัดการโครงสร้างพื้นฐาน ความมั่นคงปลอดภัย และการเชื่อมโยงเครือข่ายข้อมูลภายนอกของ P2P OneLink</p>
    </div>

    <!-- Admin Hub Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Card 1: Security -->
      <UCard 
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-[#0054FF]/40 transition bg-white rounded-xl cursor-pointer flex flex-col justify-between"
        @click="navigateTo('/admin/security')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-[#0054FF] flex items-center justify-center">
            <UIcon name="i-heroicons-shield-check" class="w-8 h-8" />
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">ระบบความปลอดภัย & การตรวจสอบ IP</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              จำกัดสิทธิ์ช่วงเลขที่อยู่ IP ด้วย CIDR Block สำหรับบัญชีพนักงานจัดซื้อ บันทึกประวัติการยอมรับข้อตกลงความเป็นส่วนตัว (PDPA) และติดตามความหน่วง Latency ของ API
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex items-center gap-1 text-[#0054FF] font-bold text-xs">
            <span>เข้าสู่การตั้งค่าความปลอดภัย</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </div>
        </template>
      </UCard>

      <!-- Card 2: SAP Integration -->
      <UCard 
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-indigo-500/40 transition bg-white rounded-xl cursor-pointer flex flex-col justify-between"
        @click="navigateTo('/admin/integration')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8" />
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">การเชื่อมต่อระบบ SAP ERP (SAP Integration Monitor)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              ติดตามบันทึกการส่งข้อมูล Interface ระหว่างระบบ P2P OneLink กับ SAP Business One ติดตามคิว Retry งานเอกสาร PR, PO, GR และสถานะการชำระเงินกับธนาคารพันธมิตร
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex items-center gap-1 text-indigo-600 font-bold text-xs">
            <span>ตรวจสอบสถานะเชื่อมต่อ SAP</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </div>
        </template>
      </UCard>

      <!-- Card 3: Procurement Item Types -->
      <UCard 
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-emerald-500/40 transition bg-white rounded-xl cursor-pointer flex flex-col justify-between"
        @click="navigateTo('/admin/item-types')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UIcon name="i-heroicons-squares-plus" class="w-8 h-8" />
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">ประเภทและรูปแบบสินค้าประมูล (Bidding Formats)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              จัดการรูปแบบสินค้าและบริการในการประมูล (Goods, Service, Rental, License) เพิ่มเติมประเภทการประมูลเช่าซื้อ หรือจ้างงานอื่นเพื่อรองรับการจัดหามัลติโมเดล
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <span>จัดการประเภทและรูปแบบสินค้าประมูล</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </div>
        </template>
      </UCard>

      <!-- Card 4: Asset Rentals & License Subscriptions -->
      <UCard 
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-amber-500/40 transition bg-white rounded-xl cursor-pointer flex flex-col justify-between"
        @click="navigateTo('/admin/asset-rentals')"
      >
        <div class="space-y-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UIcon name="i-heroicons-archive-box" class="w-8 h-8" />
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base">บันทึกการเช่าสินทรัพย์ & สิทธิ์ไลเซนส์ (Asset & Licenses)</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              ตรวจสอบประวัติการจองและเช่าครุภัณฑ์ข้ามหน่วยงาน (BU-to-BU Asset Logs) พร้อมบันทึกคีย์ ซอฟต์แวร์สิทธิ์ใช้งาน (Adobe, Antivirus) และกำหนดเตือนวันหมดอายุ
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex items-center gap-1 text-amber-600 font-bold text-xs">
            <span>ตรวจสอบการเช่า & ไลเซนส์</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app';
</script>
