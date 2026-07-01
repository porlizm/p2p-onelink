<template>
  <div class="vendor-like-page max-w-4xl mx-auto pb-12">
    <!-- Header Back -->
    <div class="flex items-center gap-3">
      <UButton 
        to="/vendors" 
        color="neutral" 
        variant="ghost" 
        size="sm"
      >
        <UIcon name="i-heroicons-arrow-left-20-solid" class="w-5 h-5 mr-1" />
        ย้อนกลับไปหน้ารายชื่อ
      </UButton>
    </div>

    <!-- Vendor Title Area -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">{{ vendor?.vendor_name }}</h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          ลงข้อมูลเมื่อ: {{ formatDate(vendor?.registered_date) }} | เลขประจำตัวผู้เสียภาษี: {{ vendor?.tax_id }}
        </p>
      </div>
      <div>
        <StatusBadge :status="vendor?.status || 'PendingRegistration'" />
      </div>
    </div>

    <!-- Main Grid Details -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- General and Address Info (2/3 width) -->
      <div class="md:col-span-2 space-y-4">
        <!-- Details Card -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-2">
              <UIcon name="i-heroicons-building-office-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ข้อมูลที่ตั้งและประเภทธุรกิจ</h3>
            </div>
          </template>

          <div class="space-y-3 text-sm mt-2">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">ประเภทธุรกิจ</span>
                <span class="font-medium text-[var(--foreground)]">{{ vendor?.vendor_type }}</span>
              </div>
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">หมวดหมู่</span>
                <span class="font-medium text-[var(--foreground)]">{{ vendor?.business_category }}</span>
              </div>
            </div>

            <div v-if="address">
              <span class="text-xs text-[var(--muted-foreground)] block">ที่อยู่สำนักงานใหญ่</span>
              <span class="font-medium text-[var(--foreground)]">
                {{ address.address_line1 }} {{ address.address_line2 }} ต.{{ address.subdistrict }} อ.{{ address.district }} จ.{{ address.province }} {{ address.postal_code }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Contacts Card -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-2">
              <UIcon name="i-heroicons-user-group-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ผู้ติดต่อประสานงาน</h3>
            </div>
          </template>

          <div v-if="contact" class="space-y-2.5 mt-2 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ชื่อ-นามสกุล</span>
              <span class="font-medium text-[var(--foreground)]">{{ contact.contact_name }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">เบอร์โทรศัพท์</span>
                <span class="font-medium text-[var(--foreground)]">{{ contact.phone }}</span>
              </div>
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">อีเมล</span>
                <span class="font-medium text-[var(--foreground)]">{{ contact.email }}</span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Buyer Review and Verification Action Box -->
        <UCard
          v-if="vendor?.status === 'PendingRegistration'"
          class="border-2 border-[var(--primary)]/20 shadow-[var(--shadow-md)] rounded-[var(--radius-xl)] bg-white"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-badge-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ตรวจสอบและตัดสินใจอนุมัติคู่ค้า</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-xs text-[var(--muted-foreground)]">
              กรุณาตรวจสอบเอกสารแนบและเลขประจำตัวผู้เสียภาษีให้ถูกต้องครบถ้วนก่อนทำการยืนยันเข้าสู่ระบบ
            </p>
            <div v-if="showRejectComment" class="space-y-2">
              <UFormField label="เหตุผลที่ปฏิเสธการลงทะเบียน (จะแจ้งกลับไปที่คู่ค้า)" required>
                <UTextarea v-model="rejectReason" placeholder="ระบุเหตุผล เช่น หนังสือรับรองหมดอายุ หรือ เอกสารหน้า Book Bank ไม่ตรงกับชื่อบริษัท..." size="md" />
              </UFormField>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <template v-if="!showRejectComment">
                <button class="vnd-btn vnd-btn--reject" @click="showRejectComment = true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  ปฏิเสธ
                </button>
                <button class="vnd-btn vnd-btn--approve" :disabled="isSubmitting" @click="handleApprove">
                  <svg v-if="!isSubmitting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
                  อนุมัติคู่ค้า
                </button>
              </template>
              <template v-else>
                <button class="vnd-btn vnd-btn--cancel" @click="showRejectComment = false">ยกเลิก</button>
                <button class="vnd-btn vnd-btn--confirm-reject" :disabled="isSubmitting" @click="handleReject">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ยืนยันการปฏิเสธ
                </button>
              </template>
            </div>
          </div>
        </UCard>

        <!-- ── Status Management Panel (Active / Blocked / Suspended / Rejected) ── -->
        <UCard
          v-if="['Active', 'Blocked', 'Suspended', 'Rejected'].includes(vendor?.status)"
          class="border border-[#e9ecef] shadow-sm rounded-[var(--radius-xl)] bg-white"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-shield-check-20-solid" class="w-5 h-5 text-[var(--primary)]" />
                <h3 class="font-semibold text-sm text-[var(--foreground)]">จัดการสถานะคู่ค้า</h3>
              </div>
              <StatusBadge :status="vendor.status" />
            </div>
          </template>

          <div class="space-y-4">

            <!-- Status history timeline -->
            <div class="space-y-2">
              <p class="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">ประวัติสถานะ</p>
              <div class="space-y-1">
                <div v-for="(log, i) in statusHistory" :key="i" class="flex items-start gap-3 text-xs">
                  <div class="flex flex-col items-center">
                    <div class="w-2 h-2 rounded-full mt-1 flex-shrink-0" :class="log.color"></div>
                    <div v-if="i < statusHistory.length - 1" class="w-px h-4 bg-[#e9ecef]"></div>
                  </div>
                  <div>
                    <span class="font-semibold text-[var(--foreground)]">{{ log.label }}</span>
                    <span class="text-[var(--muted-foreground)] ml-2">{{ log.date }}</span>
                    <span v-if="log.note" class="block text-[var(--muted-foreground)] text-[11px] mt-0.5">{{ log.note }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Active: Block + Suspend + Evaluate ── -->
            <template v-if="vendor.status === 'Active'">
              <div class="border-t border-[#eff1f5] pt-4 space-y-3">
                <p class="text-xs text-[var(--muted-foreground)]">คู่ค้านี้อยู่ในสถานะ <strong class="text-green-700">ใช้งานปกติ</strong> คุณสามารถดำเนินการด้านล่างได้</p>
                <div class="flex flex-wrap gap-3">
                  <button class="vnd-btn vnd-btn--evaluate" @click="openEvaluateModal">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"/></svg>
                    เริ่มประเมินคู่ค้า
                  </button>
                  <button class="vnd-btn vnd-btn--suspend" @click="openActionModal('suspend')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ระงับชั่วคราว
                  </button>
                  <button class="vnd-btn vnd-btn--block" @click="openActionModal('block')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    บล็อคคู่ค้า
                  </button>
                </div>
              </div>
            </template>

            <!-- ── Blocked: reason display + Unblock ── -->
            <template v-if="vendor.status === 'Blocked'">
              <div class="border-t border-[#eff1f5] pt-4 space-y-3">
                <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-1">
                  <div class="font-semibold flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    คู่ค้าถูกบล็อค
                  </div>
                  <p>{{ vendor.block_reason || 'พบการทุจริตเอกสารใบแจ้งหนี้ — อยู่ระหว่างการสอบสวนภายใน' }}</p>
                  <p class="text-[10px] text-red-500">บล็อคเมื่อ: {{ vendor.blocked_date || '15 มิ.ย. 2569' }} โดย: {{ vendor.blocked_by || 'nantaporn.s (Admin)' }}</p>
                </div>
                <div class="flex gap-3">
                  <button class="vnd-btn vnd-btn--approve" @click="openActionModal('unblock')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                    ยกเลิกการบล็อค
                  </button>
                </div>
              </div>
            </template>

            <!-- ── Suspended: reason display + Reinstate + Block ── -->
            <template v-if="vendor.status === 'Suspended'">
              <div class="border-t border-[#eff1f5] pt-4 space-y-3">
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                  <div class="font-semibold flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    คู่ค้าถูกระงับชั่วคราว
                  </div>
                  <p>{{ vendor.suspend_reason || 'รอเอกสาร ISO 9001:2015 ฉบับปัจจุบัน — กำหนดส่ง 30 มิ.ย. 2569' }}</p>
                  <p class="text-[10px] text-amber-500">ระงับเมื่อ: {{ vendor.suspended_date || '10 มิ.ย. 2569' }} โดย: {{ vendor.suspended_by || 'nantaporn.s (Admin)' }}</p>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button class="vnd-btn vnd-btn--approve" @click="openActionModal('reinstate')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"/></svg>
                    คืนสถานะใช้งาน
                  </button>
                  <button class="vnd-btn vnd-btn--block" @click="openActionModal('block')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    บล็อคถาวร
                  </button>
                </div>
              </div>
            </template>

            <!-- ── Rejected: Re-open registration ── -->
            <template v-if="vendor.status === 'Rejected'">
              <div class="border-t border-[#eff1f5] pt-4 space-y-3">
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                  <p class="font-semibold">คู่ค้าถูกปฏิเสธการลงทะเบียน</p>
                  <p>{{ vendor.reject_reason || 'เอกสารหนังสือรับรองบริษัทหมดอายุ กรุณาส่งฉบับปัจจุบัน' }}</p>
                </div>
                <div class="flex gap-3">
                  <button class="vnd-btn vnd-btn--approve" @click="handleReopen">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    เปิดโอกาสลงทะเบียนใหม่
                  </button>
                </div>
              </div>
            </template>
          </div>
        </UCard>
      </div>

      <!-- Financial & Documents Info (1/3 width) -->
      <div class="space-y-4">
        <!-- AI Vendor Sentiment & Insights Card -->
        <UCard class="border-2 border-green-600/30 shadow-md rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-b from-green-50/20 to-white">
          <template #header>
            <div class="flex items-center justify-between border-b border-[#eff1f5] pb-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-[var(--primary)] animate-pulse" />
                <h3 class="font-extrabold text-sm text-[var(--fg-primary)] uppercase tracking-wider">AI Smart Vendor Insights</h3>
              </div>
              <span class="text-[9px] bg-[var(--primary)] text-white px-2 py-0.5 rounded-full font-bold">LIVE AUDIT</span>
            </div>
          </template>

          <div class="space-y-3 mt-2 text-xs">
            <!-- Sentiment and Risk overview row -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Sentiment card -->
              <div class="bg-[#fafbfc] border border-[#eff1f5] rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">Sentiment Index</span>
                <div class="flex items-end gap-1.5 mt-1.5">
                  <span class="text-xl font-black text-slate-800">{{ aiInsights.sentimentScore }}%</span>
                  <span class="text-[10px] font-bold text-green-600 pb-0.5">{{ aiInsights.sentiment }}</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div class="bg-green-500 h-1.5 rounded-full transition-all duration-500" :style="`width: ${aiInsights.sentimentScore}%`"></div>
                </div>
              </div>

              <!-- Risk level card -->
              <div class="bg-[#fafbfc] border border-[#eff1f5] rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
                <span class="text-[10px] text-slate-400 font-semibold block uppercase">AI Risk Level</span>
                <div class="flex items-end gap-1.5 mt-1.5">
                  <span class="text-xl font-black text-slate-800">{{ aiInsights.riskScore }}%</span>
                  <span class="text-[10px] font-bold pb-0.5" :class="aiInsights.riskLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'">
                    {{ aiInsights.riskLevel }}
                  </span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div class="h-1.5 rounded-full transition-all duration-500" :class="aiInsights.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'" :style="`width: ${aiInsights.riskScore}%`"></div>
                </div>
              </div>
            </div>

            <!-- Performance stats calculated by AI -->
            <div class="space-y-2 border-t pt-3 border-slate-100">
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500">อัตราการส่งมอบตรงเวลา (On-Time Delivery):</span>
                <span class="font-bold text-slate-800">{{ aiInsights.onTimeDelivery }}%</span>
              </div>
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500">คะแนนประเมินคุณภาพสินค้า (Quality Score):</span>
                <span class="font-bold text-slate-800">{{ aiInsights.qualityScore }}%</span>
              </div>
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500 font-medium">ดัชนีแนวโน้มราคา (Price Trend Index):</span>
                <span class="font-bold text-[var(--primary)]">{{ aiInsights.priceIndex }}</span>
              </div>
            </div>

            <!-- Warning and Alerts from AI if any -->
            <div v-if="aiInsights.warnings.length > 0" class="bg-red-50/80 border border-red-200 text-red-800 p-2.5 rounded-lg space-y-1">
              <div class="font-bold flex items-center gap-1 text-[10px]">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-600" />
                <span>AI Risk Warning Flags</span>
              </div>
              <ul class="list-disc list-inside text-[9px] text-red-700 pl-1 space-y-0.5">
                <li v-for="w in aiInsights.warnings" :key="w">{{ w }}</li>
              </ul>
            </div>

            <!-- AI Insight summary text -->
            <div class="bg-green-50/50 border border-green-100/50 rounded-xl p-3 space-y-1.5">
              <div class="font-bold text-green-900 flex items-center gap-1 text-[10px]">
                <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-4 h-4 text-[var(--primary)]" />
                <span>คำแนะนำเชิงกลยุทธ์จาก AI</span>
              </div>
              <p class="text-[10px] text-slate-600 leading-relaxed font-medium">
                {{ aiInsights.insight }}
              </p>
            </div>

            <!-- Analyze action button -->
            <div class="border-t pt-3 border-slate-100 flex justify-end">
              <UButton
                color="primary"
                icon="i-heroicons-sparkles"
                class="w-full text-xs font-bold text-white bg-[var(--primary)] hover:bg-green-700 justify-center cursor-pointer transition-all duration-200 shadow-sm"
                :loading="isAnalyzing"
                @click="triggerAiAnalysis"
              >
                {{ showDetailedReport ? 'วิเคราะห์ข้อมูลซ้ำด้วย AI' : 'วิเคราะห์ข้อมูลเชิงลึกด้วย AI' }}
              </UButton>
            </div>

            <!-- Mock detail report display after trigger -->
            <div v-if="showDetailedReport" class="border border-indigo-100 rounded-xl p-3 bg-indigo-50/30 animate-fadeIn space-y-2 mt-2">
              <div class="font-bold text-slate-800 text-[10px] flex items-center gap-1 border-b border-indigo-100 pb-1.5">
                <UIcon name="i-heroicons-document-magnifying-glass" class="w-4 h-4 text-indigo-600" />
                <span>รายงานพฤติกรรมคู่ค้าและการวิเคราะห์ข่าวสาร (Market Scan)</span>
              </div>
              <div class="text-[9px] text-slate-500 space-y-1">
                <div>• ค้นพบข้อมูล 42 รายการจาก Social Listening & ข่าวสารอุตสาหกรรมในรอบ 30 วัน</div>
                <div>• ดัชนีความมั่นคงทางการเงิน (Altman Z-Score): <span class="font-semibold text-green-600">3.12 (Safe Zone)</span></div>
                <div>• ความเสี่ยงด้านความจุการผลิต (Production Capacity Risk): <span class="font-semibold text-green-600">ต่ำมาก</span></div>
              </div>
            </div>

          </div>
        </UCard>

        <!-- Bank account -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-2">
              <UIcon name="i-heroicons-credit-card-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">ข้อมูลการชำระเงิน</h3>
            </div>
          </template>

          <div v-if="bank" class="space-y-2.5 mt-2 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ธนาคาร</span>
              <span class="font-medium text-[var(--foreground)]">{{ bank.bank_name }}</span>
            </div>
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">เลขที่บัญชี</span>
              <span class="font-mono font-medium text-[var(--foreground)]">{{ bank.account_no }}</span>
            </div>
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ชื่อบัญชี</span>
              <span class="font-medium text-[var(--foreground)]">{{ bank.account_name }}</span>
            </div>
          </div>
        </UCard>

        <!-- Documents links -->
        <UCard class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white">
          <template #header>
            <div class="flex items-center gap-2 border-b border-[#eff1f5] pb-2">
              <UIcon name="i-heroicons-document-arrow-down-20-solid" class="w-5 h-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-sm text-[var(--foreground)]">เอกสารแนบ</h3>
            </div>
          </template>

          <div class="space-y-2.5 mt-2">
            <div 
              v-for="doc in vendor?.documents" 
              :key="doc.document_id"
              class="flex flex-col p-2 bg-[var(--background)] rounded border border-[#e9ecef] text-xs"
            >
              <span class="font-semibold text-[var(--foreground)]">{{ doc.document_type }}</span>
              <a 
                :href="'http://localhost:3001' + doc.file_url" 
                target="_blank"
                class="text-[var(--primary)] hover:underline mt-1 font-medium flex items-center gap-1"
              >
                <UIcon name="i-heroicons-arrow-top-right-on-square-20-solid" class="w-3.5 h-3.5" />
                เปิดดูไฟล์แนบ
              </a>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- ── Action Modal (Block / Suspend / Unblock / Reinstate) ── -->
    <AppModal
      v-model="showActionModal"
      :title="actionModalTitle"
      :subtitle="actionModalDesc"
      :variant="actionType === 'block' ? 'danger' : actionType === 'suspend' ? 'warning' : 'success'"
      size="sm"
    >
      <template #icon>
        <svg v-if="actionType === 'block'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <svg v-else-if="actionType === 'suspend'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </template>

      <div class="space-y-4">
        <template v-if="['block','suspend'].includes(actionType)">
          <div>
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">หมวดเหตุผล</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in (actionType === 'block' ? blockTags : suspendTags)"
                :key="tag"
                type="button"
                class="text-[11px] px-3 py-1.5 rounded-full border-2 transition-all font-semibold"
                :class="actionReason === tag ? (actionType==='block' ? 'bg-red-600 text-white border-red-600' : 'bg-amber-500 text-white border-amber-500') : 'bg-white text-slate-600 border-[#e9ecef] hover:border-slate-300'"
                @click="actionReason = tag"
              >{{ tag }}</button>
            </div>
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">รายละเอียดเพิ่มเติม <span class="text-red-400 normal-case font-normal">*จำเป็น</span></label>
            <textarea
              v-model="actionReason" rows="3"
              class="w-full border-2 border-[#e9ecef] focus:border-slate-400 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none transition-colors placeholder:text-slate-300"
              :placeholder="actionType === 'block' ? 'ระบุสาเหตุการบล็อค เช่น พบการทุจริต, ไม่ผ่านมาตรฐาน...' : 'ระบุสาเหตุ เช่น รอเอกสาร ISO ฉบับปัจจุบัน...'"
            ></textarea>
          </div>
        </template>

        <div v-if="['unblock','reinstate'].includes(actionType)" class="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-sm text-green-800 flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 text-green-600 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>คู่ค้าจะกลับเป็นสถานะ <strong>"ใช้งานปกติ (Active)"</strong> และสามารถเข้าร่วม RFQ ได้ทันที</span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="modal-btn modal-btn--ghost" @click="showActionModal = false">ยกเลิก</button>
          <button
            class="modal-btn"
            :class="actionType === 'block' ? 'modal-btn--danger-solid' : actionType === 'suspend' ? 'modal-btn--warning' : 'modal-btn--primary'"
            :disabled="isSubmitting || (['block','suspend'].includes(actionType) && !actionReason.trim())"
            @click="confirmAction"
          >
            <svg v-if="isSubmitting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            {{ actionModalConfirmLabel }}
          </button>
        </div>
      </template>
    </AppModal>

    <!-- ── Evaluate Modal ── -->
    <AppModal
      v-model="showEvaluateModal"
      title="ประเมินคู่ค้า"
      :subtitle="vendor?.vendor_name"
      variant="default"
      size="md"
    >
      <template #icon>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </template>

      <div class="space-y-5">
        <div v-for="criterion in evalCriteria" :key="criterion.key" class="border border-[#eff1f5] rounded-xl p-4 space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-sm font-semibold text-slate-700">{{ criterion.label }}</label>
            <span class="text-sm font-black tabular-nums" :class="evalForm[criterion.key] >= 4 ? 'text-green-600' : evalForm[criterion.key] >= 3 ? 'text-amber-500' : 'text-red-500'">
              {{ evalForm[criterion.key] }}<span class="text-xs font-normal text-slate-400">/5</span>
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-for="n in 5" :key="n" type="button"
              class="text-3xl leading-none transition-all hover:scale-110 focus:outline-none"
              :class="evalForm[criterion.key] >= n ? 'text-amber-400' : 'text-slate-200 hover:text-slate-300'"
              @click="evalForm[criterion.key] = n"
            >★</button>
          </div>
          <p class="text-[11px] text-slate-400">{{ criterion.hint }}</p>
        </div>

        <!-- Score summary -->
        <div class="flex items-center justify-between bg-[#fafbfc] border border-[#e9ecef] rounded-xl px-5 py-4">
          <span class="text-sm text-slate-500 font-medium">คะแนนเฉลี่ยรวม</span>
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black tabular-nums" :class="evalAvgScore >= 4 ? 'text-green-600' : evalAvgScore >= 3 ? 'text-amber-500' : 'text-red-500'">
              {{ evalAvgScore.toFixed(1) }}
            </span>
            <div>
              <span class="text-xs text-slate-400 block">/ 5.0</span>
              <span class="text-[11px] font-bold" :class="evalAvgScore >= 4 ? 'text-green-600' : evalAvgScore >= 3 ? 'text-amber-500' : 'text-red-500'">
                {{ evalAvgScore >= 4 ? 'ดีเยี่ยม' : evalAvgScore >= 3 ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์' }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">ความคิดเห็นเพิ่มเติม</label>
          <textarea
            v-model="evalComment" rows="2"
            class="w-full border-2 border-[#e9ecef] focus:border-[var(--primary)] rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none transition-colors placeholder:text-slate-300"
            placeholder="ระบุข้อดี/ข้อเสียเพิ่มเติม..."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="modal-btn modal-btn--ghost" @click="showEvaluateModal = false">ยกเลิก</button>
          <button class="modal-btn modal-btn--primary" :disabled="isSubmitting" @click="submitEvaluation">
            <svg v-if="isSubmitting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            บันทึกผลประเมิน
          </button>
        </div>
      </template>
    </AppModal>

    <!-- ── Toast Notification ── -->
    <div v-if="toast.show" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import StatusBadge from '~/components/StatusBadge.vue';

const route = useRoute();
const authStore = useAuthStore();
const dialog = useDialog();
const vendor = ref<any>(null);
const isSubmitting = ref(false);
const showRejectComment = ref(false);
const rejectReason = ref('');

// ── Status Management ──
const showActionModal = ref(false);
const actionType = ref<'block'|'suspend'|'unblock'|'reinstate'>('block');
const actionReason = ref('');

const blockTags = ['พบการทุจริตเอกสาร', 'ไม่ผ่านมาตรฐานความปลอดภัย', 'ผิดเงื่อนไขสัญญา', 'มีคดีความค้างอยู่'];
const suspendTags = ['รอเอกสารประกอบ', 'อยู่ระหว่างต่ออายุใบอนุญาต', 'ระงับตามคำสั่งภายใน'];

const actionModalTitle = computed(() => ({
  block: 'บล็อคคู่ค้า',
  suspend: 'ระงับคู่ค้าชั่วคราว',
  unblock: 'ยกเลิกการบล็อค',
  reinstate: 'คืนสถานะใช้งาน',
}[actionType.value]));

const actionModalIcon = computed(() => ({
  block: '🚫', suspend: '⏸️', unblock: '✅', reinstate: '✅',
}[actionType.value]));

const actionModalDesc = computed(() => ({
  block: 'คู่ค้าที่ถูกบล็อคจะไม่สามารถเข้าร่วม RFQ หรือรับ PO ใหม่ได้จนกว่าจะยกเลิกการบล็อค',
  suspend: 'การระงับชั่วคราวจะหยุดการดำเนินการทั้งหมดของคู่ค้านี้จนกว่าจะได้รับการคืนสถานะ',
  unblock: 'คุณกำลังจะยกเลิกการบล็อคคู่ค้านี้',
  reinstate: 'คุณกำลังจะคืนสถานะคู่ค้านี้เป็นใช้งานปกติ',
}[actionType.value]));

const actionModalConfirmLabel = computed(() => ({
  block: 'ยืนยันบล็อค',
  suspend: 'ยืนยันระงับ',
  unblock: 'ยืนยันยกเลิกบล็อค',
  reinstate: 'ยืนยันคืนสถานะ',
}[actionType.value]));

const openActionModal = (type: 'block'|'suspend'|'unblock'|'reinstate') => {
  actionType.value = type;
  actionReason.value = '';
  showActionModal.value = true;
};

const confirmAction = async () => {
  if (['block','suspend'].includes(actionType.value) && !actionReason.value.trim()) return;
  isSubmitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/vendor/${vendor.value.vendor_id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { status: actionType.value === 'block' ? 'Blocked' : actionType.value === 'suspend' ? 'Suspended' : 'Active', reason: actionReason.value },
    });
  } catch {
    // mock fallback
    const statusMap: Record<string,string> = { block: 'Blocked', suspend: 'Suspended', unblock: 'Active', reinstate: 'Active' };
    vendor.value.status = statusMap[actionType.value];
    if (actionType.value === 'block') {
      vendor.value.block_reason = actionReason.value;
      vendor.value.blocked_date = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      vendor.value.blocked_by = authStore.user?.name || 'nantaporn.s (Admin)';
    } else if (actionType.value === 'suspend') {
      vendor.value.suspend_reason = actionReason.value;
      vendor.value.suspended_date = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      vendor.value.suspended_by = authStore.user?.name || 'nantaporn.s (Admin)';
    }
  } finally {
    isSubmitting.value = false;
    showActionModal.value = false;
    const msgMap: Record<string,string> = {
      block: 'บล็อคคู่ค้าเรียบร้อยแล้ว',
      suspend: 'ระงับคู่ค้าชั่วคราวเรียบร้อยแล้ว',
      unblock: 'ยกเลิกการบล็อคเรียบร้อยแล้ว',
      reinstate: 'คืนสถานะคู่ค้าเรียบร้อยแล้ว',
    };
    showToast(msgMap[actionType.value], 'success');
  }
};

const handleReopen = () => {
  vendor.value.status = 'PendingRegistration';
  showToast('เปิดโอกาสให้คู่ค้าลงทะเบียนใหม่แล้ว', 'success');
};

// ── Status History (mock per-vendor) ──
const statusHistory = computed(() => {
  const s = vendor.value?.status;
  const base = [
    { label: 'ลงทะเบียน', date: '10 มิ.ย. 2569', color: 'bg-slate-400', note: '' },
    { label: 'อนุมัติเข้าระบบ', date: '12 มิ.ย. 2569', color: 'bg-green-500', note: 'โดย nantaporn.s' },
  ];
  if (s === 'Blocked') return [...base, { label: 'ระงับชั่วคราว', date: '14 มิ.ย. 2569', color: 'bg-amber-400', note: '' }, { label: 'บล็อค', date: '15 มิ.ย. 2569', color: 'bg-red-500', note: vendor.value?.block_reason || 'พบการทุจริตเอกสาร' }];
  if (s === 'Suspended') return [...base, { label: 'ระงับชั่วคราว', date: '10 มิ.ย. 2569', color: 'bg-amber-400', note: vendor.value?.suspend_reason || 'รอเอกสาร ISO' }];
  if (s === 'Active') return base;
  if (s === 'Rejected') return [{ label: 'ลงทะเบียน', date: '18 มิ.ย. 2569', color: 'bg-slate-400', note: '' }, { label: 'ปฏิเสธ', date: '20 มิ.ย. 2569', color: 'bg-red-400', note: vendor.value?.reject_reason || 'เอกสารไม่ครบถ้วน' }];
  return base;
});

// ── Evaluate Modal ──
const showEvaluateModal = ref(false);
const evalComment = ref('');
const evalCriteria = [
  { key: 'quality',  label: 'คุณภาพสินค้า / บริการ', hint: 'ตรงตามสเปก ไม่มีของเสีย ผ่านการตรวจรับ' },
  { key: 'delivery', label: 'การส่งมอบตรงเวลา', hint: 'ส่งตามกำหนด ไม่มีความล่าช้า' },
  { key: 'price',    label: 'ความสามารถด้านราคา', hint: 'ราคาแข่งขันได้ เป็นธรรม' },
  { key: 'service',  label: 'การตอบสนองและบริการ', hint: 'ตอบกลับเร็ว แก้ปัญหาได้ดี' },
  { key: 'docs',     label: 'ความครบถ้วนของเอกสาร', hint: 'ใบแจ้งหนี้ ใบส่งของ ถูกต้องครบถ้วน' },
];
const evalForm = ref<Record<string,number>>({ quality: 4, delivery: 4, price: 3, service: 4, docs: 5 });

const evalAvgScore = computed(() => {
  const vals = Object.values(evalForm.value);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
});

const openEvaluateModal = () => {
  evalForm.value = { quality: 4, delivery: 4, price: 3, service: 4, docs: 5 };
  evalComment.value = '';
  showEvaluateModal.value = true;
};

const submitEvaluation = async () => {
  isSubmitting.value = true;
  await new Promise(r => setTimeout(r, 800));
  isSubmitting.value = false;
  showEvaluateModal.value = false;
  showToast(`บันทึกผลประเมินเรียบร้อย — คะแนน ${evalAvgScore.value.toFixed(1)}/5.0`, 'success');
};

// ── Toast ──
const toast = ref({ show: false, message: '', type: 'success' as 'success'|'error' });
const showToast = (message: string, type: 'success'|'error' = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

// AI Vendor Sentiment & Insights States
const isAnalyzing = ref(false);
const showDetailedReport = ref(false);

const aiInsights = computed(() => {
  const id = route.params.id as string;
  const data: Record<string, any> = {
    '00000000-0000-0000-0000-000000000607': {
      sentiment: 'Positive',
      sentimentScore: 82,
      riskLevel: 'Low',
      riskScore: 12,
      onTimeDelivery: 98,
      qualityScore: 95,
      priceIndex: 'Stable',
      warnings: [],
      insight: 'คู่ค้ามีผลการดำเนินงานโดดเด่นในด้านเวลาส่งมอบและความเสถียรของราคา มีความเสี่ยงในการคลาดเคลื่อนต่ำมาก'
    },
    '00000000-0000-0000-0000-000000000601': {
      sentiment: 'Excellent',
      sentimentScore: 94,
      riskLevel: 'Minimal',
      riskScore: 5,
      onTimeDelivery: 99.5,
      qualityScore: 98,
      priceIndex: 'Competitive',
      warnings: [],
      insight: 'จัดเป็นพันธมิตรระดับยุทธศาสตร์ (Strategic Partner) ข้อมูลตลาดและข่าวสารสะท้อนความพึงพอใจและการเงินอยู่ในเกณฑ์สูงสุด'
    }
  };
  return data[id] || {
    sentiment: 'Neutral',
    sentimentScore: 65,
    riskLevel: 'Medium',
    riskScore: 42,
    onTimeDelivery: 88,
    qualityScore: 85,
    priceIndex: 'Fluctuating',
    warnings: ['พบประวัติส่งมอบล่าช้าสะสมในไตรมาสล่าสุด', 'พบสัญญาณการผันผวนของราคาวัตถุดิบต้นน้ำ'],
    insight: 'ผลการส่งมอบเริ่มมีความล่าช้าสะสม แนะนำให้ผู้ซื้อพิจารณาสัญญาราคากลางระยะยาวเพื่อลดความเสี่ยงผันผวน'
  };
});

const triggerAiAnalysis = () => {
  isAnalyzing.value = true;
  setTimeout(() => {
    isAnalyzing.value = false;
    showDetailedReport.value = true;
  }, 1500);
};

const loadVendor = async () => {
  const id = route.params.id;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/vendor/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    vendor.value = res;
  } catch (err) {
    console.warn('Backend connection failed, loading mock detail...');
    // Mock detailed fallback mapping
    const mocks: any = {
      '00000000-0000-0000-0000-000000000607': {
        vendor_id: '00000000-0000-0000-0000-000000000607',
        tax_id: '0105567078901',
        vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด',
        vendor_type: 'ผู้ขาย',
        business_category: 'อุปกรณ์เซฟตี้',
        status: 'PendingRegistration',
        registered_date: '2026-06-18',
        contacts: [{ contact_name: 'คุณณัฐพล เกียรติทวี', email: 'nattaphol@safetygear.com', phone: '0854441234' }],
        addresses: [{ address_line1: '99/9 หมู่ 4 ถนนรามคำแหง', address_line2: 'อาคารบี ชั้น 1', subdistrict: 'หัวหมาก', district: 'บางกะปิ', province: 'กรุงเทพมหานคร', postal_code: '10240' }],
        bank_accounts: [{ bank_name: 'ธนาคารกรุงเทพ', account_no: '099-0-12345-6', account_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด' }],
        documents: [{ document_id: 'vdoc_006', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_6.pdf' }],
      },
      '00000000-0000-0000-0000-000000000601': {
        vendor_id: '00000000-0000-0000-0000-000000000601',
        tax_id: '0105561012345',
        vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
        vendor_type: 'ผู้ขาย',
        business_category: 'อุปกรณ์ไอที',
        status: 'Active',
        registered_date: '2026-06-10',
        contacts: [{ contact_name: 'คุณสมศักดิ์ แสนสุข', email: 'somsak@digital.com', phone: '0812345678' }],
        addresses: [{ address_line1: '123/4 อาคาร A ชั้น 2', subdistrict: 'จอมพล', district: 'จตุจักร', province: 'กรุงเทพมหานคร', postal_code: '10900' }],
        bank_accounts: [{ bank_name: 'ธนาคารกรุงไทย', account_no: '123-4-56789-0', account_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' }],
        documents: [{ document_id: 'vdoc_001', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_1.pdf' }],
      },
      '00000000-0000-0000-0000-000000000608': {
        vendor_id: '00000000-0000-0000-0000-000000000608',
        tax_id: '0105568089012',
        vendor_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด',
        vendor_type: 'ผู้ให้บริการ',
        business_category: 'งานก่อสร้างและโยธา',
        status: 'Blocked',
        block_reason: 'พบการทุจริตเอกสารใบแจ้งหนี้ — อยู่ระหว่างการสอบสวนภายใน',
        blocked_date: '15 มิ.ย. 2569',
        blocked_by: 'nantaporn.s (Admin)',
        registered_date: '2026-06-11',
        contacts: [{ contact_name: 'คุณประสิทธิ์ แก้วใจ', email: 'prasit@pacific.co.th', phone: '0866667777' }],
        addresses: [{ address_line1: '88/9 ถนนพัฒนาการ', subdistrict: 'สวนหลวง', district: 'สวนหลวง', province: 'กรุงเทพมหานคร', postal_code: '10250' }],
        bank_accounts: [{ bank_name: 'ธนาคารกรุงเทพ', account_no: '088-9-12345-7', account_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด' }],
        documents: [{ document_id: 'vdoc_008', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_8.pdf' }],
      },
      '00000000-0000-0000-0000-000000000609': {
        vendor_id: '00000000-0000-0000-0000-000000000609',
        tax_id: '0105569090123',
        vendor_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด',
        vendor_type: 'ผู้ให้บริการ',
        business_category: 'บำรุงรักษา/วิศวกรรม',
        status: 'Suspended',
        suspend_reason: 'รอเอกสาร ISO 9001:2015 ฉบับปัจจุบัน — กำหนดส่ง 30 มิ.ย. 2569',
        suspended_date: '10 มิ.ย. 2569',
        suspended_by: 'nantaporn.s (Admin)',
        registered_date: '2026-06-12',
        contacts: [{ contact_name: 'คุณธนกฤต วิศวกร', email: 'thanakrit@engsol.co.th', phone: '0855554444' }],
        addresses: [{ address_line1: '301 อาคารวิภาวดี ชั้น 5', subdistrict: 'ดอนเมือง', district: 'ดอนเมือง', province: 'กรุงเทพมหานคร', postal_code: '10210' }],
        bank_accounts: [{ bank_name: 'ธนาคารไทยพาณิชย์', account_no: '301-5-67890-1', account_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด' }],
        documents: [{ document_id: 'vdoc_009', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_9.pdf' }],
      },
      '00000000-0000-0000-0000-000000000603': {
        vendor_id: '00000000-0000-0000-0000-000000000603',
        tax_id: '0105563099123',
        vendor_name: 'บริษัท คลีนเทค เซอร์วิส จำกัด',
        vendor_type: 'ผู้ให้บริการ',
        business_category: 'บริการทำความสะอาด',
        status: 'Blocked',
        block_reason: 'พบการทุจริตเอกสารใบแจ้งหนี้ — อยู่ระหว่างการสอบสวนภายใน',
        blocked_date: '15 มิ.ย. 2569',
        blocked_by: 'nantaporn.s (Admin)',
        registered_date: '2026-04-05',
        contacts: [{ contact_name: 'คุณวิชัย มั่นคง', email: 'wichai@cleantech.co.th', phone: '0899998877' }],
        addresses: [{ address_line1: '56 ซอยลาดพร้าว 87', subdistrict: 'วังทองหลาง', district: 'วังทองหลาง', province: 'กรุงเทพมหานคร', postal_code: '10310' }],
        bank_accounts: [{ bank_name: 'ธนาคารกสิกรไทย', account_no: '056-2-34567-8', account_name: 'บริษัท คลีนเทค เซอร์วิส จำกัด' }],
        documents: [{ document_id: 'vdoc_003', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_3.pdf' }],
      },
      '00000000-0000-0000-0000-000000000605': {
        vendor_id: '00000000-0000-0000-0000-000000000605',
        tax_id: '0105565088234',
        vendor_name: 'ห้างหุ้นส่วนจำกัด พีค ซัพพลาย',
        vendor_type: 'ผู้ขาย',
        business_category: 'วัสดุสำนักงาน',
        status: 'Suspended',
        suspend_reason: 'รอเอกสาร ISO 9001:2015 ฉบับปัจจุบัน — กำหนดส่ง 30 มิ.ย. 2569',
        suspended_date: '10 มิ.ย. 2569',
        suspended_by: 'nantaporn.s (Admin)',
        registered_date: '2026-03-15',
        contacts: [{ contact_name: 'คุณสุภาพร รักดี', email: 'supaporn@peaksupply.com', phone: '0876543210' }],
        addresses: [{ address_line1: '200/3 ถนนพหลโยธิน', subdistrict: 'ลาดยาว', district: 'จตุจักร', province: 'กรุงเทพมหานคร', postal_code: '10900' }],
        bank_accounts: [{ bank_name: 'ธนาคารไทยพาณิชย์', account_no: '200-3-45678-9', account_name: 'ห้างหุ้นส่วนจำกัด พีค ซัพพลาย' }],
        documents: [{ document_id: 'vdoc_005', document_type: 'หนังสือรับรองบริษัท', file_url: '/uploads/documents/doc_5.pdf' }],
      },
    };
    vendor.value = mocks[id as string] || mocks['00000000-0000-0000-0000-000000000607'];
  }
};

onMounted(() => {
  loadVendor();
});

const address = computed(() => vendor.value?.addresses?.[0] || null);
const contact = computed(() => vendor.value?.contacts?.[0] || null);
const bank = computed(() => vendor.value?.bank_accounts?.[0] || null);

const handleApprove = async () => {
  isSubmitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/vendor/${vendor.value.vendor_id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { status: 'Active' },
    });
    await dialog.alert('อนุมัติคู่ค้าเข้าสู่ระบบเรียบร้อยแล้ว!', { variant: 'success' });
    navigateTo('/vendors');
  } catch (err) {
    await dialog.alert('ดำเนินการอนุมัติไม่สำเร็จ', { variant: 'success' });
  } finally {
    isSubmitting.value = false;
  }
};

const handleReject = async () => {
  if (!rejectReason.value) {
    await dialog.alert('กรุณากรอกเหตุผลที่ปฏิเสธ', { variant: 'danger' });
    return;
  }
  isSubmitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/vendor/${vendor.value.vendor_id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { status: 'Rejected', reason: rejectReason.value },
    });
    await dialog.alert('ปฏิเสธการลงทะเบียนคู่ค้านี้แล้ว!', { variant: 'info' });
    navigateTo('/vendors');
  } catch (err) {
    await dialog.alert('ดำเนินการปฏิเสธไม่สำเร็จ', { variant: 'success' });
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
.vendor-like-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  font-family: var(--font-sans);
}

/* Tighten Nuxt UI Card default padding across this page */
.vendor-like-page :deep([data-slot="header"]) {
  padding: 12px 18px !important;
}

.vendor-like-page :deep([data-slot="body"]) {
  padding: 14px 18px !important;
}

.vendor-like-page :deep([data-slot="footer"]) {
  padding: 12px 18px !important;
}

.vendor-like-page > .flex:first-child {
  margin-bottom: -4px;
}

.vendor-like-page > .flex:nth-child(2) {
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

.vendor-like-page :deep(.rounded-xl),
.vendor-like-page :deep(.rounded-lg) {
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-1);
}

.vendor-like-page h3 {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--fg-primary);
  letter-spacing: 0;
}

/* ── Approval action buttons ── */
.vnd-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 20px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-semibold);
  font-family: var(--font-sans); cursor: pointer; border: 1px solid;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}
.vnd-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
.vnd-btn:not(:disabled):hover { transform: translateY(-1px); }

/* Approve — green gradient */
.vnd-btn--approve {
  background: var(--gradient-brand-diagonal);
  color: white; border-color: transparent;
  box-shadow: 0 2px 8px rgba(0,146,69,0.28);
}
.vnd-btn--approve:not(:disabled):hover { box-shadow: 0 4px 14px rgba(0,146,69,0.38); }

/* Reject — red outline (destructive, but not alarming) */
.vnd-btn--reject {
  background: transparent;
  color: var(--color-error-600);
  border-color: var(--color-error-300);
}
.vnd-btn--reject:hover { background: var(--color-error-50); }

/* Cancel — neutral */
.vnd-btn--cancel {
  background: var(--bg-surface);
  color: var(--fg-secondary);
  border-color: var(--border-default);
}
.vnd-btn--cancel:hover { background: var(--bg-subtle); }

/* Confirm reject — red solid */
.vnd-btn--confirm-reject {
  background: var(--color-error-600);
  color: white; border-color: transparent;
  box-shadow: 0 2px 6px rgba(239,68,68,0.25);
}
.vnd-btn--confirm-reject:not(:disabled):hover { background: var(--color-error-700); }

/* Block — dark red */
.vnd-btn--block {
  background: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
}
.vnd-btn--block:hover { background: #ffe4e6; }

/* Suspend — amber */
.vnd-btn--suspend {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}
.vnd-btn--suspend:hover { background: #fef3c7; }
.vnd-btn--suspend:disabled { opacity: 0.6; cursor: not-allowed; }

/* Evaluate — indigo */
.vnd-btn--evaluate {
  background: #eef2ff;
  color: #3730a3;
  border-color: #c7d2fe;
}
.vnd-btn--evaluate:hover { background: #e0e7ff; }
</style>
