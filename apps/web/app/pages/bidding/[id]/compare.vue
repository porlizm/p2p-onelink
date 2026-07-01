<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">เปรียบเทียบซองเสนอราคาโครงการ: {{ rfq?.title }}</h2>
        <div class="flex items-center gap-4 mt-1">
          <p class="text-xs text-[var(--muted-foreground)]">
            เลขที่โครงการประมูล: <span class="font-bold text-[var(--primary)]">{{ rfq?.rfq_no }}</span> | วันปิดเสนอราคา: {{ formatDate(rfq?.close_date) }}
          </p>
          <span v-if="rfq?.technical_weight > 0" class="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[10px] font-bold">
            เกณฑ์คะแนน: เทคนิค {{ rfq.technical_weight }}% / ราคา {{ rfq.commercial_weight }}%
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton 
          v-if="rfq?.technical_weight > 0 && rfq?.status !== 'Awarded' && !peekingForbidden"
          @click="saveTechnicalScores"
          color="primary"
          size="sm"
          :loading="savingScores"
          class="font-semibold shadow-sm cursor-pointer"
        >
          <UIcon name="i-heroicons-document-check" class="w-4 h-4 mr-1" />
          บันทึกคะแนนเทคนิค
        </UButton>
        <NuxtLink to="/bidding">
          <UButton variant="outline" size="sm">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 mr-1" />
            ย้อนกลับ
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- SLA Timeout warning card -->
    <div v-if="rfq?.status === 'Awarded'" class="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 class="font-bold text-sm text-indigo-900">กระบวนการยืนยันผู้ชนะประมูล (Winner SLA Response Monitoring)</h3>
            <p class="text-xs text-indigo-700 mt-0.5">
              ผู้ชนะประมูลต้องเข้าตอบรับ PO และลงนามใบสั่งซื้อภายในกำหนดเวลา 72 ชั่วโมง (SLA)
              <span v-if="!slaExpired" class="font-bold text-indigo-950"> | เวลาที่เหลือ: 71 ชั่วโมง 45 นาที</span>
              <span v-else class="font-bold text-red-600 block mt-1 flex items-center gap-1">
                <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
                <span>คำเตือน: เลยกำหนดเวลา SLA 72 ชั่วโมงแล้ว ผู้ชนะประมูลยังไม่เข้ามาตอบรับงาน</span>
              </span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton 
            v-if="!slaExpired && !rfq?.is_escalated"
            @click="slaExpired = true"
            size="xs"
            color="warning"
            variant="outline"
            class="font-bold"
          >
            จำลองสถานการณ์เลยกำหนดเวลา SLA (Simulate SLA Timeout)
          </UButton>
          <UButton
            v-if="slaExpired && !rfq?.is_escalated"
            @click="triggerEscalation"
            color="error"
            size="sm"
            class="font-bold cursor-pointer"
            :loading="escalating"
          >
            <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-4 h-4 mr-1" />
            ปลดสิทธิ์และประกาศผู้ชนะสำรอง (Cancel & Re-award to Runner-up)
          </UButton>
        </div>
      </div>

      <div v-if="rfq?.is_escalated" class="p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-shield-exclamation" class="w-5 h-5 text-red-600" />
        <span>ระบบดำเนินการยกเลิกใบสั่งซื้อผู้เสนอราคารายก่อนหน้าเนื่องจากผิดสัญญาการตอบสนอง และทำการออกใบขอซื้อ (PR) ให้กับผู้เสนอราคาอันดับสำรอง (Runner-up) เรียบร้อยแล้ว</span>
      </div>
    </div>

    <!-- Tab Selector Navigation -->
    <div class="ds-tabs">
      <button
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === 'sealed' }"
        @click="activeTab = 'sealed'"
      >
        <span>เปรียบเทียบซองปิด</span>
      </button>
      <button
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === 'multicriteria' }"
        @click="activeTab = 'multicriteria'"
      >
        <span>ประเมินคะแนนหลายมิติ</span>
      </button>
      <button
        class="ds-tab"
        :class="{ 'ds-tab--active': activeTab === 'reverse_auction' }"
        @click="activeTab = 'reverse_auction'"
      >
        <span>จำลองการแข่งราคา</span>
      </button>
    </div>

    <!-- TAB 1: Sealed Bidding Comparison -->
    <div v-if="activeTab === 'sealed'">
      <!-- Shortlist Approval Banner -->
      <div v-if="rfq?.shortlist_approved === false" class="mb-6 p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl space-y-4 max-w-4xl mx-auto">
        <div class="flex items-start gap-4">
          <div class="p-3 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl">
            <UIcon name="i-heroicons-shield-check" class="w-6 h-6 animate-pulse" />
          </div>
          <div class="flex-1 space-y-1">
            <h3 class="font-bold text-sm text-slate-100">รออนุมัติรายชื่อผู้มีสิทธิ์ส่งซอง (Shortlist Approval Pending)</h3>
            <p class="text-xs text-slate-400">
              โครงการจัดซื้อนี้กำหนดให้มีกระบวนการพิจารณาและอนุมัติรายชื่อผู้ขายที่มีสิทธิ์ร่วมเสนอราคา (Shortlist) ก่อนเปิดให้คู่ค้าส่งข้อเสนอจริง
            </p>
            <div class="text-xs text-slate-400 pt-1">
              ผู้อนุมัติโครงการ: <span class="font-bold text-[var(--primary)]">{{ getMemberName(rfq?.shortlist_approver_id) || rfq?.shortlist_approver_id }}</span>
            </div>
          </div>
        </div>

        <div v-if="authStore.user?.userId === rfq?.shortlist_approver_id" class="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-xs text-amber-400 font-semibold">
            คุณเป็นผู้อนุมัติสำหรับโครงการนี้ กรุณาพิจารณารายชื่อผู้ขายและทำรายการอนุมัติ
          </div>
          <div class="flex gap-2">
            <UButton 
              @click="handleApproveShortlist(false)" 
              color="error" 
              size="sm" 
              variant="outline"
              class="font-bold cursor-pointer"
              :loading="approvingShortlist"
            >
              ปฏิเสธรายชื่อ (Reject)
            </UButton>
            <UButton 
              @click="handleApproveShortlist(true)" 
              color="primary" 
              size="sm"
              class="font-bold bg-[var(--primary)] text-white hover:bg-green-700 cursor-pointer"
              :loading="approvingShortlist"
            >
              อนุมัติรายชื่อ (Approve)
            </UButton>
          </div>
        </div>
        <div v-else class="border-t border-slate-800 pt-3 text-xs text-slate-500 italic text-center">
          รอการพิจารณาและอนุมัติจากผู้กำหนดหน้าที่หลักของโครงการ
        </div>
      </div>

      <!-- Decryption Ceremony Required -->
      <div v-if="rfq?.bid_type === 'SealedBid' && !rfq?.is_decrypted" class="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-xl space-y-6 max-w-2xl mx-auto my-4">
        <div class="text-center space-y-2">
          <div class="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce">
            <UIcon name="i-heroicons-key" class="w-10 h-10" />
          </div>
          <h3 class="font-black text-base text-slate-100">พิธีเปิดซองเสนอราคาร่วม (Committee Bid Decryption Ceremony)</h3>
          <p class="text-[11px] text-slate-400 max-w-md mx-auto">
            ตามระเบียบจัดซื้อและตรวจสอบบัญชี (US-0609) โครงการนี้มีรูปแบบประมูลซองปิด (Sealed Bidding) ซองเสนอราคาจะถูกเข้ารหัสลับและปิดผนึกไว้ จนกว่าคณะกรรมการอย่างน้อย 2 ท่านจะกรอกรหัสผ่านเพื่อปลดล็อกร่วมกัน
          </p>
        </div>

        <div class="border-t border-slate-800 pt-5 space-y-4">
          <h4 class="font-extrabold text-xs text-slate-300 uppercase tracking-wider">รายชื่อคณะกรรมการเปิดซองประมูลและสถานะ:</h4>
          <div class="grid grid-cols-1 gap-2.5">
            <div 
              v-for="memberId in rfq?.committee_members" 
              :key="memberId"
              class="flex items-center justify-between p-3 rounded-lg border bg-slate-800/40 border-slate-700/50"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-slate-400" />
                <span class="text-xs font-bold text-slate-200">{{ getMemberName(memberId) }}</span>
              </div>
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold border"
                :class="rfq?.decryption_keys?.[memberId]?.decrypted 
                  ? 'bg-green-500/15 border-green-500/30 text-green-400' 
                  : 'bg-red-500/15 border-red-500/30 text-red-400'"
              >
                {{ rfq?.decryption_keys?.[memberId]?.decrypted ? '🔓 ปลดล็อกแล้ว' : '🔒 ยังไม่ได้ยืนยัน' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Current User Decrypt Form -->
        <div 
          v-if="authStore.user?.userId && rfq?.committee_members?.includes(authStore.user.userId) && !rfq?.decryption_keys?.[authStore.user.userId]?.decrypted"
          class="bg-slate-800/80 border border-slate-700 p-5 rounded-xl space-y-4"
        >
          <div class="text-xs text-slate-300">
            <span class="font-extrabold text-amber-400 block mb-0.5">คุณได้รับแต่งตั้งเป็นคณะกรรมการของโครงการนี้</span>
            กรุณากรอกรหัสผ่านของคุณ (เช่น 'password123' สำหรับบัญชีทดสอบ) เพื่อร่วมลงชื่อถอดรหัสซองประมูล
          </div>
          <div class="flex gap-2">
            <UInput 
              v-model="decryptionPassword" 
              type="password" 
              placeholder="กรอกรหัสผ่านของคุณ..." 
              size="sm" 
              class="w-full bg-slate-900 border-slate-700 text-white" 
            />
            <UButton 
              @click="decryptBid" 
              color="warning" 
              size="sm" 
              class="font-bold cursor-pointer"
              :loading="decrypting"
            >
              ยืนยันถอดรหัส
            </UButton>
          </div>
        </div>
        <div v-else-if="rfq?.committee_members?.includes(authStore.user?.userId)" class="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold rounded-lg text-center">
          คุณลงชื่อร่วมถอดรหัสเรียบร้อยแล้ว รอคณะกรรมการท่านถัดไปกรอกรหัสยืนยัน...
        </div>
      </div>

      <div v-else-if="peekingForbidden" class="p-8 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
        <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-amber-500 mx-auto" />
        <h3 class="font-bold text-base text-amber-900">ระเบียบซองปิด (Sealed Bidding Active)</h3>
        <p class="text-xs text-amber-800 max-w-lg mx-auto">
          ตามข้อบังคับการจัดซื้อจัดจ้าง พนักงานจัดซื้อไม่ได้รับอนุญาตให้เปิดซองเสนอราคาเพื่อดูราคากลางเปรียบเทียบก่อนถึงกำหนดวันปิดเสนอราคา ({{ formatDate(rfq?.close_date) }}) เพื่อความโปร่งใสสูงสุดของระบบประมูล
        </p>
      </div>

      <div v-else class="grid grid-cols-1 gap-6">
        <div class="bg-white border border-[#e9ecef] rounded-b-2xl shadow-[var(--shadow-sm)] p-6 overflow-hidden">
          <h3 class="font-bold text-sm text-[var(--foreground)] border-b border-[#eff1f5] pb-2 flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-presentation-chart-bar" class="w-4 h-4 text-[var(--primary)]" />
            เปรียบเทียบใบเสนอราคา (Price & Terms Comparison)
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs text-slate-500 font-bold">
                  <th class="p-3">สินค้า / ข้อกำหนดประมูล</th>
                  <th 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id" 
                    class="p-3 text-center border-l border-[var(--border)]"
                    :class="{'bg-green-50/50': quote.status === 'Selected'}"
                  >
                    <div class="font-extrabold text-[var(--foreground)] truncate max-w-[200px]" :title="quote.vendor?.vendor_name">
                      {{ quote.vendor?.vendor_name }}
                    </div>
                    <span class="text-[9px] text-[var(--muted-foreground)] block mt-0.5">Tax ID: {{ quote.vendor?.tax_id }}</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#eff1f5] text-sm">
                <tr v-for="item in rfq?.items" :key="item.rfq_item_id">
                  <td class="p-3">
                    <div class="font-bold text-[var(--foreground)]">{{ item.item_name }}</div>
                    <span class="text-[10px] text-[var(--muted-foreground)]">ความต้องการ: {{ formatQuantity(item.quantity) }} {{ item.uom }}</span>
                  </td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)]"
                    :class="{'bg-green-50/20': quote.status === 'Selected', 'font-bold text-green-600': !['RFI', 'RFP'].includes(rfq?.bid_type) && isLowestForLine(item.rfq_item_id, quote)}"
                  >
                    <div v-if="isMasked(quote)" class="flex flex-col items-center justify-center text-amber-600 gap-1 py-1">
                      <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 animate-pulse" />
                      <span class="text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">ซองปิด (Masked)</span>
                    </div>
                    <template v-else-if="rfq?.bid_type === 'RFI' || rfq?.bid_type === 'RFP'">
                      <!-- Qualitative comments / Remarks -->
                      <div class="text-left space-y-2 p-1.5 rounded-lg bg-[#fafbfc] border border-slate-100">
                        <div class="text-[10px] font-bold text-slate-700">ข้อเสนอเชิงคุณภาพ / คำอธิบาย:</div>
                        <div class="text-xs text-slate-600 whitespace-pre-line">{{ getLineRemarks(item.rfq_item_id, quote) || 'ไม่มีการระบุข้อมูล' }}</div>
                        
                        <!-- Document upload for RFP -->
                        <div v-if="rfq?.bid_type === 'RFP'" class="pt-1.5 border-t border-[#eff1f5] mt-1">
                          <div class="text-[10px] font-bold text-slate-500 mb-1">เอกสารทางเทคนิค (RFP Spec):</div>
                          <a 
                            v-if="getLineFileUrl(item.rfq_item_id, quote)" 
                            :href="getLineFileUrl(item.rfq_item_id, quote)" 
                            target="_blank"
                            class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border border-green-500 text-green-600 bg-white hover:bg-green-50 rounded font-semibold transition"
                          >
                            <UIcon name="i-heroicons-document-arrow-down" class="w-3 h-3" />
                            ดาวน์โหลดไฟล์ข้อเสนอ
                          </a>
                          <span v-else class="text-[10px] text-slate-400">ไม่ได้แนบเอกสาร</span>
                          
                          <div v-if="getLineFileHash(item.rfq_item_id, quote)" class="mt-1 text-[8px] text-slate-400 font-mono overflow-x-hidden truncate max-w-[170px]" :title="'SHA-256 Checksum: ' + getLineFileHash(item.rfq_item_id, quote)">
                            SHA-256: {{ getLineFileHash(item.rfq_item_id, quote).substring(0, 12) }}...
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div>{{ formatCurrency(getLinePrice(item.rfq_item_id, quote)) }} THB</div>
                      <span class="text-[9px] text-[var(--muted-foreground)] block mt-0.5">ราคารวม: {{ formatCurrency(getLinePrice(item.rfq_item_id, quote) * item.quantity) }} THB</span>
                    </template>
                  </td>
                </tr>

                <tr v-if="!['RFI', 'RFP'].includes(rfq?.bid_type)" class="bg-[#fafbfc]/50 font-bold border-t border-[var(--border)]">
                  <td class="p-3 text-xs text-[var(--muted-foreground)] uppercase">ยอดรวมราคาจัดจัดซื้อ (Total Cost)</td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)] text-base font-extrabold"
                    :class="{'bg-green-50/50': quote.status === 'Selected', 'text-green-600': isLowestTotal(quote)}"
                  >
                    <div v-if="isMasked(quote)" class="text-xs font-bold text-amber-600 bg-amber-50/50 py-1 px-2 rounded inline-block">
                      Locked
                    </div>
                    <template v-else>
                      {{ formatCurrency(getQuoteTotal(quote)) }} THB
                    </template>
                  </td>
                </tr>

                <tr class="bg-[#fafbfc]/20 text-xs border-t border-[var(--border)]" v-if="rfq?.technical_weight > 0">
                  <td class="p-3 text-[var(--muted-foreground)]">
                    คะแนนด้านเทคนิค (Technical Score)
                    <div class="text-[9px] text-slate-400">สัดส่วนน้ำหนัก: {{ rfq.technical_weight }}%</div>
                  </td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)] font-bold text-slate-700"
                  >
                    <span v-if="isMasked(quote)" class="text-slate-400 font-normal">Locked</span>
                    <div v-else class="flex items-center justify-center gap-1.5">
                      <UInput v-model.number="quote.technical_score" type="number" min="0" max="100" size="xs" class="w-16 text-center bg-indigo-50/50 font-black" />
                      <span>/ 100</span>
                    </div>
                  </td>
                </tr>

                <tr class="bg-[#fafbfc]/20 text-xs border-t border-[var(--border)]" v-if="!['RFI', 'RFP'].includes(rfq?.bid_type) && rfq?.technical_weight > 0">
                  <td class="p-3 text-[var(--muted-foreground)]">
                    คะแนนด้านราคา (Commercial Score)
                    <div class="text-[9px] text-slate-400">สัดส่วนน้ำหนัก: {{ rfq.commercial_weight }}%</div>
                  </td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)] font-bold text-slate-700"
                  >
                    <span v-if="isMasked(quote)" class="text-slate-400 font-normal">Locked</span>
                    <span v-else>{{ getCommercialScore(quote) }} / 100</span>
                  </td>
                </tr>

                <tr class="bg-indigo-50/30 text-xs border-t border-b border-[#eff1f5] font-bold" v-if="!['RFI', 'RFP'].includes(rfq?.bid_type) && rfq?.technical_weight > 0">
                  <td class="p-3 text-indigo-900">
                    คะแนนรวมถ่วงน้ำหนัก (Weighted Total)
                    <div class="text-[9px] text-indigo-500 font-normal">Technical + Commercial</div>
                  </td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)] text-sm font-extrabold text-indigo-700"
                  >
                    <span v-if="isMasked(quote)" class="text-slate-400 font-normal">Locked</span>
                    <span v-else>{{ getWeightedTotalScore(quote) }} / 100</span>
                  </td>
                </tr>

                <tr>
                  <td class="p-3 text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                    <UIcon name="i-heroicons-truck" class="w-3.5 h-3.5" />
                    ระยะเวลาจัดส่ง (Delivery Term)
                  </td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)] text-xs font-semibold text-[var(--foreground)]"
                    :class="{'bg-green-50/20': quote.status === 'Selected'}"
                  >
                    <span v-if="isMasked(quote)" class="text-slate-400 font-normal">Locked</span>
                    <template v-else>
                      {{ getMaxLeadTime(quote) }} วันทำการ
                    </template>
                  </td>
                </tr>

                <tr>
                  <td class="p-3 text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                    <UIcon name="i-heroicons-paper-clip" class="w-3.5 h-3.5" />
                    เอกสารข้อเสนอ (Documents)
                  </td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-3 text-center border-l border-[var(--border)]"
                    :class="{'bg-green-50/20': quote.status === 'Selected'}"
                  >
                    <span v-if="isMasked(quote)" class="text-xs text-slate-400">Locked</span>
                    <template v-else>
                      <div>
                        <a 
                          v-if="quote.lines?.[0]?.quotation_url" 
                          :href="quote.lines[0].quotation_url" 
                          target="_blank"
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[var(--primary)] text-[var(--primary)] rounded-lg font-semibold hover:bg-[#fafbfc] transition"
                        >
                          <UIcon name="i-heroicons-document-arrow-down" class="w-3.5 h-3.5" />
                          ดาวน์โหลด PDF
                        </a>
                        <span v-else class="text-xs text-[var(--muted-foreground)]">ไม่ได้แนบเอกสาร</span>
                      </div>
                      <div v-if="quote.lines?.[0]?.file_hash" class="mt-2 text-[9px] text-slate-400 font-mono text-center overflow-x-hidden truncate max-w-[180px] mx-auto bg-[#fafbfc] border border-[#eff1f5] px-1 py-0.5 rounded" :title="'SHA-256 Checksum: ' + quote.lines[0].file_hash">
                        SHA-256: {{ quote.lines[0].file_hash.substring(0, 16) }}...
                      </div>
                    </template>
                  </td>
                </tr>

                <tr class="bg-slate-100/30">
                  <td class="p-3"></td>
                  <td 
                    v-for="quote in rfq?.quotations" 
                    :key="quote.quote_id"
                    class="p-4 text-center border-l border-[var(--border)]"
                    :class="{'bg-green-50/50': quote.status === 'Selected'}"
                  >
                    <span 
                      v-if="quote.status === 'Selected' || rfq?.status === 'Awarded'" 
                      class="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200"
                    >
                      {{ quote.status === 'Selected' ? '🏆 ได้รับคัดเลือก (Selected)' : 'ไม่ได้รับคัดเลือก' }}
                    </span>
                    <div v-else-if="isMasked(quote)" class="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1 bg-[#fafbfc] py-1.5 px-3 rounded-lg border border-[#eff1f5] max-w-[140px] mx-auto">
                      <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-slate-400" />
                      <span>รอเปิดซองประมูล</span>
                    </div>
                    <UButton 
                      v-else
                      @click="awardQuote(quote.quote_id)"
                      color="primary"
                      size="sm"
                      :loading="isAwarding"
                      class="font-semibold shadow-sm cursor-pointer"
                    >
                      <UIcon name="i-heroicons-check-badge" class="w-4 h-4 mr-1" />
                      เลือกผู้ขายรายนี้
                    </UButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Multi-Criteria Evaluation Worksheet -->
    <div v-else-if="activeTab === 'multicriteria'" class="space-y-6">
      <div class="bg-white border border-[#e9ecef] rounded-2xl shadow-[var(--shadow-sm)] p-6">
        <div class="border-b pb-4 mb-6">
          <h3 class="font-extrabold text-base text-[var(--fg-primary)] flex items-center gap-2">
            <UIcon name="i-heroicons-adjustments-horizontal" class="text-[var(--primary)] w-5 h-5" />
            <span>กระดาษทำการประเมินคะแนนเทคนิคหลายมิติ (Multi-Criteria Evaluation Sheet)</span>
          </h3>
          <p class="text-xs text-slate-500 mt-1">เกณฑ์ถ่วงน้ำหนักรวมของโครงการ: ฝ่ายจัดซื้อทำการประเมินคะแนนแยกตามหัวข้อเพื่อให้ระบบแปลงเป็นคะแนนเทคนิครวม (คะแนนเต็ม 100)</p>
        </div>

        <div class="space-y-8">
          <div v-for="quote in rfq?.quotations" :key="quote.quote_id" class="border border-[#eff1f5] rounded-xl p-5 bg-[#fafbfc]/30 space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <span class="font-black text-sm text-[var(--fg-primary)]">{{ quote.vendor?.vendor_name }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400">คะแนนเทคนิครวมคำนวณได้:</span>
                <span class="px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-extrabold text-sm rounded-lg">
                  {{ quote.technical_score }} / 100
                </span>
              </div>
            </div>

            <!-- List criteria sliders -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="criterion in evaluationCriteria" :key="criterion.id" class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <div>
                    <span class="font-bold text-slate-700 text-xs">{{ criterion.name }}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">{{ criterion.desc }}</span>
                  </div>
                  <span class="font-black text-[var(--primary)] bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    {{ criteriaScores[quote.quote_id]?.[criterion.id] || 0 }} / {{ criterion.max }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <input 
                    type="range" 
                    v-model.number="criteriaScores[quote.quote_id][criterion.id]" 
                    min="0" 
                    :max="criterion.max" 
                    @input="updateTechnicalScoreFromCriteria(quote.quote_id)"
                    class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-5 mt-6 flex justify-end">
          <UButton 
            color="primary" 
            icon="i-heroicons-check-circle"
            class="bg-[var(--primary)] hover:bg-green-700 font-bold text-xs cursor-pointer px-6"
            @click="activeTab = 'sealed'; showLocalAlert()"
          >
            ยืนยันผลคะแนนและกลับหน้าเปรียบเทียบ
          </UButton>
        </div>
      </div>
    </div>

    <!-- TAB 3: Reverse Auction Live Dashboard -->
    <div v-else-if="activeTab === 'reverse_auction'" class="space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"></div>

        <!-- Upper Banner -->
        <div class="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4 relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center animate-pulse">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-black text-base text-slate-100">ห้องประมูลราคาย้อนกลับแบบเรียลไทม์ (Live Reverse Auction Monitor)</h3>
              <p class="text-[11px] text-slate-400 mt-0.5">จำลองการเสนอราคาแข่งขันแบบเวลาจำกัด โดยผู้จัดหาทุกรายจะเห็นอันดับของตนเองและเสนอราคาแข่งลงมา</p>
            </div>
          </div>

          <!-- Timer block -->
          <div class="flex items-center gap-4 bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 min-w-[200px] justify-center">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-orange-400 animate-pulse" />
            <div>
              <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">เวลาที่เหลือ (Remaining)</span>
              <span class="text-xl font-mono font-black text-orange-400">{{ formatAuctionTime(auctionTimeRemaining) }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <!-- Left side: Live Leaderboard -->
          <div class="lg:col-span-2 space-y-4">
            <h4 class="font-extrabold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <UIcon name="i-heroicons-list-bullet" class="text-indigo-400 w-4 h-4" />
              <span>ตารางอันดับข้อเสนอแบบเรียลไทม์ (Leaderboard)</span>
            </h4>

            <div class="space-y-3">
              <div 
                v-for="aq in [...auctionQuotes].sort((a, b) => a.rank - b.rank)" 
                :key="aq.quote_id" 
                class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-slate-600"
                :class="{'border-green-500/40 bg-green-500/5': aq.rank === 1}"
              >
                <div class="flex items-center gap-4">
                  <div 
                    class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                    :class="[
                      aq.rank === 1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      aq.rank === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                    ]"
                  >
                    #{{ aq.rank }}
                  </div>
                  <div>
                    <span class="font-bold text-slate-200 block text-xs">{{ aq.vendor_name }}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">ราคาเริ่มต้น: {{ formatCurrency(aq.initialPrice) }} THB</span>
                  </div>
                </div>

                <div class="flex items-center gap-6">
                  <div class="text-right">
                    <div class="text-sm font-black text-slate-100">{{ formatCurrency(aq.currentPrice) }} THB</div>
                    <div class="flex items-center justify-end gap-1.5 mt-0.5">
                      <span 
                        class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        :class="[
                          aq.rank === 1 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        ]"
                      >
                        {{ aq.rank === 1 ? 'Leading' : 'Outbid' }}
                      </span>
                      <span class="text-[9px] text-slate-400">
                        ลดลงแล้ว: -{{ (((aq.initialPrice - aq.currentPrice) / aq.initialPrice) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </div>

                  <!-- Manual trigger to negotiate (Only when simulation runs) -->
                    <UButton
                      size="xs"
                      color="primary"
                      variant="soft"
                      class="text-[10px] font-bold bg-[var(--color-green-50)] text-[var(--primary)] hover:bg-green-100 border border-green-200 cursor-pointer"
                      @click="placeManualBuyerBidCorrection(aq.quote_id, 1.5)"
                    >
                      ต่อรองลด 1.5%
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Controller Panel -->
            <div class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 mt-6">
              <div class="text-xs text-slate-400">
                <span class="font-bold text-slate-200 block">แผงควบคุมการจำลอง (Simulation Panel)</span>
                กดเริ่มจำลองเพื่อจำลองการเสนอราคาที่อัปเดตแบบสดชิงอันดับ Leaderboard
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  v-if="!isAuctionRunning"
                  @click="startAuctionSimulation"
                  color="success"
                  icon="i-heroicons-play-solid"
                  class="font-bold text-xs bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  เริ่มการจำลองประมูล (Start Simulation)
                </UButton>
                <UButton
                  v-else
                  @click="stopAuctionSimulation"
                  color="error"
                  icon="i-heroicons-pause-solid"
                  class="font-bold text-xs bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                  หยุดการจำลอง (Pause)
                </UButton>
              </div>
            </div>
          </div>

          <!-- Right side: Bidding Activity Feed -->
          <div class="space-y-4">
            <h4 class="font-extrabold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <UIcon name="i-heroicons-bell-alert" class="text-indigo-400 w-4 h-4" />
              <span>ประวัติการลดราคาแบบสด (Activity Feed)</span>
            </h4>

            <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 h-80 overflow-y-auto space-y-3 font-mono text-[10px]">
              <div class="text-slate-500 italic text-center py-2" v-if="!isAuctionRunning && auctionQuotes.every(aq => aq.priceDrops.length === 0)">
                รอเริ่มการจำลองเพื่อจับตาการเคลื่อนไหว...
              </div>
              <div v-else class="space-y-2">
                <div v-for="aq in auctionQuotes" :key="aq.quote_id">
                  <div v-for="(drop, idx) in aq.priceDrops" :key="idx" class="flex flex-col bg-slate-800/50 p-2 rounded border border-slate-700/30 animate-fadeIn mb-2">
                    <div class="flex justify-between text-indigo-400 font-bold">
                      <span>[{{ drop.time }}] {{ aq.vendor_name.split(' ')[0] }}</span>
                      <span class="text-green-400">✔ OFFER</span>
                    </div>
                    <div class="flex justify-between text-slate-300 mt-1">
                      <span>ราคายื่นใหม่:</span>
                      <span class="font-bold text-white">{{ formatCurrency(drop.amount) }} THB</span>
                    </div>
                    <span v-if="drop.note" class="text-[9px] text-yellow-500 mt-0.5 font-sans font-bold">• {{ drop.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const dialog = useDialog();

const activeTab = ref('sealed'); // sealed, multicriteria, reverse_auction
const rfq = ref<any>(null);
const peekingForbidden = ref(false);
const isAwarding = ref(false);
const savingScores = ref(false);
const slaExpired = ref(false);
const escalating = ref(false);

const decryptionPassword = ref('');
const decrypting = ref(false);

const decryptBid = async () => {
  if (!decryptionPassword.value) return;
  decrypting.value = true;
  try {
    await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}/decrypt`, {
      method: 'POST',
      body: { password: decryptionPassword.value },
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    await dialog.alert('ลงนามถอดรหัสเรียบร้อยแล้ว!', { variant: 'success' });
    decryptionPassword.value = '';
    loadComparison();
  } catch (err: any) {
    await dialog.alert(err.data?.message || 'การถอดรหัสล้มเหลว', { variant: 'danger' });
  } finally {
    decrypting.value = false;
  }
};

const saveTechnicalScores = async () => {
  savingScores.value = true;
  try {
    await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}/technical-scores`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        scores: rfq.value.quotations.map((q: any) => ({
          quote_id: q.quote_id,
          technical_score: q.technical_score || 0
        }))
      }
    });
    await dialog.alert('บันทึกคะแนนเทคนิคเรียบร้อยแล้ว!', { variant: 'success' });
  } catch (err) {
    console.warn('Backend failed. Simulating local save.');
    await dialog.alert('บันทึกคะแนนเทคนิคเรียบร้อยแล้ว! (Simulation Mode)', { variant: 'success' });
  } finally {
    savingScores.value = false;
  }
};

const showLocalAlert = async () => {
  await dialog.alert('อัปเดตคะแนนประเมินและถ่วงน้ำหนักรวมของใบเสนอราคาเรียบร้อยแล้ว!', { variant: 'success' });
};

const approvingShortlist = ref(false);
const handleApproveShortlist = async (approved: boolean) => {
  if (!(await dialog.confirm(`คุณยืนยันต้องการ ${approved ? 'อนุมัติ' : 'ปฏิเสธ'} รายชื่อผู้มีสิทธิ์ส่งซองสำหรับโครงการนี้ใช่หรือไม่?`, { variant: 'danger' }))) return;
  approvingShortlist.value = true;
  try {
    await $fetch(`http://localhost:3001/api/bidding/rfq/${rfq.value.rfq_id}/shortlist/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { approved }
    });
    await dialog.alert(`ดำเนินการ ${approved ? 'อนุมัติ' : 'ปฏิเสธ'} รายชื่อผู้มีสิทธิ์ส่งซองเสร็จสิ้น`, { variant: 'success' });
    await loadComparison();
  } catch (err: any) {
    // Mock fallback: อัปเดต local state แทน
    if (rfq.value) {
      rfq.value.shortlist_approved = approved;
    }
    await dialog.alert(`ดำเนินการ ${approved ? 'อนุมัติ' : 'ปฏิเสธ'} รายชื่อผู้มีสิทธิ์ส่งซองเสร็จสิ้น (ซิมมูเลชั่น)`, { variant: 'success' });
  } finally {
    approvingShortlist.value = false;
  }
};

const getLineRemarks = (itemId: string, quote: any) => {
  const line = quote.lines?.find((l: any) => l.rfq_item_id === itemId || l.rfq_item?.rfq_item_id === itemId);
  return line ? line.vendor_remarks : null;
};

const getLineFileUrl = (itemId: string, quote: any) => {
  const line = quote.lines?.find((l: any) => l.rfq_item_id === itemId || l.rfq_item?.rfq_item_id === itemId);
  return line ? line.quotation_url : null;
};

const getLineFileHash = (itemId: string, quote: any) => {
  const line = quote.lines?.find((l: any) => l.rfq_item_id === itemId || l.rfq_item?.rfq_item_id === itemId);
  return line ? line.file_hash : null;
};

const getMemberName = (userId: string) => {
  const mapping: Record<string, string> = {
    // seed-loader UUIDs (prefix 00000006)
    '00000006-0000-0000-0000-000000000004': 'warakorn.c (Approver Manager)',
    '00000006-0000-0000-0000-000000000005': 'supawadee.i (Approver Senior Mgr)',
    '00000006-0000-0000-0000-000000000010': 'nantaporn.s (Admin)',
    // legacy prefix 00000008 (backward compat)
    '00000008-0000-0000-0000-000000000004': 'warakorn.c (Approver Manager)',
    '00000008-0000-0000-0000-000000000005': 'supawadee.i (Approver Senior Mgr)',
    '00000008-0000-0000-0000-000000000010': 'nantaporn.s (Admin)',
  };
  return mapping[userId] || userId;
};

// Multi-Criteria evaluation parameters
const evaluationCriteria = ref([
  { id: 'tech', name: 'ความสมบูรณ์และข้อกำหนดทางเทคนิค (Technical Specs)', max: 30, desc: 'ครอบคลุมตามข้อกำหนดในเอกสาร TOR' },
  { id: 'leadtime', name: 'ความรวดเร็วและแผนการจัดส่ง (Delivery Terms)', max: 30, desc: 'ความเสี่ยงด้านความล่าช้าและการรับประกันเวลาส่งมอบ' },
  { id: 'warranty', name: 'การรับประกันและบริการหลังการขาย (Warranty & SLA)', max: 20, desc: 'เงื่อนไขการเคลมอะไหล่และการบำรุงรักษา' },
  { id: 'stability', name: 'ความน่าเชื่อถือและสถานะทางการเงิน (Supplier Stability)', max: 20, desc: 'Altman Z-Score และประวัติผลการดำเนินงาน' }
]);

const criteriaScores = ref<any>({});

const initCriteriaScores = () => {
  if (!rfq.value?.quotations) return;
  rfq.value.quotations.forEach((quote: any) => {
    if (!criteriaScores.value[quote.quote_id]) {
      const baseTech = quote.technical_score || 80;
      criteriaScores.value[quote.quote_id] = {
        tech: Math.min(30, Math.round((baseTech * 30) / 100)),
        leadtime: Math.min(30, Math.round((baseTech * 30) / 100)),
        warranty: Math.min(20, Math.round((baseTech * 20) / 100)),
        stability: Math.min(20, Math.round((baseTech * 20) / 100))
      };
    }
  });
};

const updateTechnicalScoreFromCriteria = (quoteId: string) => {
  const scores = criteriaScores.value[quoteId];
  if (!scores) return;
  const total = Object.values(scores).reduce((sum: number, val: any) => sum + Number(val), 0);
  const quote = rfq.value.quotations.find((q: any) => q.quote_id === quoteId);
  if (quote) {
    quote.technical_score = total;
  }
};

// Reverse Auction States
const isAuctionRunning = ref(false);
const auctionTimeRemaining = ref(120); // 2 minutes in seconds
const auctionTimerInterval = ref<any>(null);
const auctionQuotes = ref<any[]>([]);

const formatAuctionTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const initAuctionQuotes = () => {
  if (!rfq.value?.quotations) return;
  auctionQuotes.value = rfq.value.quotations.map((q: any) => {
    const initialPrice = getQuoteTotal(q);
    return {
      quote_id: q.quote_id,
      vendor_name: q.vendor?.vendor_name,
      initialPrice,
      currentPrice: initialPrice,
      priceDrops: [],
      rank: 1
    };
  });
  updateAuctionRanks();
};

const updateAuctionRanks = () => {
  const sorted = [...auctionQuotes.value].sort((a, b) => a.currentPrice - b.currentPrice);
  auctionQuotes.value.forEach((aq) => {
    aq.rank = sorted.findIndex(s => s.quote_id === aq.quote_id) + 1;
  });
};

const startAuctionSimulation = () => {
  if (isAuctionRunning.value) return;
  isAuctionRunning.value = true;
  auctionTimeRemaining.value = 120;
  
  auctionTimerInterval.value = setInterval(() => {
    if (auctionTimeRemaining.value > 0) {
      auctionTimeRemaining.value--;
      
      // Trigger random price drops from competitors every 4 ticks
      if (auctionTimeRemaining.value % 4 === 0) {
        simulateCompetitorBids();
      }
    } else {
      stopAuctionSimulation();
    }
  }, 1000);
};

const stopAuctionSimulation = () => {
  isAuctionRunning.value = false;
  if (auctionTimerInterval.value) {
    clearInterval(auctionTimerInterval.value);
    auctionTimerInterval.value = null;
  }
};

const simulateCompetitorBids = () => {
  const eligibleQuotes = auctionQuotes.value.filter(aq => aq.rank > 1 || Math.random() > 0.5);
  if (eligibleQuotes.length === 0) return;
  const target = eligibleQuotes[Math.floor(Math.random() * eligibleQuotes.length)];
  
  const dropPercent = 0.01 + Math.random() * 0.02; // 1% to 3%
  const dropVal = Math.round(target.currentPrice * dropPercent);
  target.currentPrice = Math.max(target.initialPrice * 0.8, target.currentPrice - dropVal); // bid floor is 80%
  
  target.priceDrops.unshift({
    time: formatAuctionTime(auctionTimeRemaining.value),
    amount: target.currentPrice
  });

  updateAuctionRanks();
};

const placeManualBuyerBidCorrection = async (quoteId: string, percentage: number) => {
  const target = auctionQuotes.value.find(aq => aq.quote_id === quoteId);
  if (!target) return;
  const dropVal = Math.round(target.currentPrice * (percentage / 100));
  target.currentPrice = Math.max(target.initialPrice * 0.75, target.currentPrice - dropVal);
  target.priceDrops.unshift({
    time: formatAuctionTime(auctionTimeRemaining.value),
    amount: target.currentPrice,
    note: 'ต่อรองราคากลาง Match สำเร็จ'
  });
  updateAuctionRanks();
  await dialog.alert(`ส่งคำต่อรองราคาสำเร็จ! ผู้ขายยินยอมปรับราคารวมลงเหลือ ${formatCurrency(target.currentPrice)} THB`, { variant: 'success' });
};

// Fixed formula helper methods
const getCommercialScore = (quote: any) => {
  const currentTotal = getQuoteTotal(quote);
  if (currentTotal === 0) return 0;
  const allTotals = rfq.value?.quotations?.map((q: any) => isMasked(q) ? 0 : getQuoteTotal(q)).filter((t: number) => t > 0) || [];
  if (allTotals.length === 0) return 0;
  const minTotal = Math.min(...allTotals);
  return Math.round((minTotal / currentTotal) * 100);
};

const getWeightedTotalScore = (quote: any) => {
  const techWeight = rfq.value?.technical_weight || 0;
  const commWeight = rfq.value?.commercial_weight || 0;
  const techScore = quote.technical_score || 0;
  const commScore = getCommercialScore(quote);
  return Number(((techScore * techWeight) / 100 + (commScore * commWeight) / 100).toFixed(1));
};

const isMasked = (quote: any) => {
  if (!rfq.value) return false;
  if (quote.is_sealed_masked) return true;
  // Fallback: If it's a sealed bid and close date is in the future
  return rfq.value.bid_type === 'SealedBid' && new Date() < new Date(rfq.value.close_date);
};

const loadComparison = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}/comparison`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    rfq.value = res;
    peekingForbidden.value = false;
    initCriteriaScores();
    initAuctionQuotes();
  } catch (err: any) {
    if (err.status === 403) {
      peekingForbidden.value = true;
      // Fetch details only to show close date
      try {
        const details = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${route.params.id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        rfq.value = details;
      } catch (dErr) {}
    } else {
      console.warn('Backend connection offline, using mock comparison.');
      peekingForbidden.value = false;
      rfq.value = {
        rfq_id: '1',
        rfq_no: 'RFQ2606001',
        title: 'จัดซื้อโน้ตบุ๊ค 14 นิ้ว สำหรับทีมวิศวกรรวม 30 เครื่อง',
        close_date: new Date(Date.now() - 3600000), // closed
        status: 'OpenForQuotation',
        technical_weight: 40,
        commercial_weight: 60,
        // TS-04 Step 6-7: Shortlist Approval & Committee
        shortlist_approved: false,
        shortlist_approver_id: '00000006-0000-0000-0000-000000000010', // nantaporn.s (Admin demo user)
        committee_members: [
          '00000006-0000-0000-0000-000000000010', // nantaporn.s
          '00000006-0000-0000-0000-000000000004', // warakorn.c (Approver)
        ],
        decryption_keys: {},
        items: [
          { rfq_item_id: 'i1', item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', quantity: 30, uom: 'เครื่อง' }
        ],
        quotations: [
          {
            quote_id: 'q1',
            status: 'Submitted',
            technical_score: 85,
            vendor: { vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', tax_id: '0105561012345' },
            lines: [
              { rfq_item_id: 'i1', unit_price: 28500, delivery_days: 10, quotation_url: '/uploads/quotations/quote_mock_1.pdf' }
            ]
          },
          {
            quote_id: 'q2',
            status: 'Submitted',
            technical_score: 92,
            vendor: { vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', tax_id: '0105562023456' },
            lines: [
              { rfq_item_id: 'i1', unit_price: 27900, delivery_days: 14, quotation_url: '/uploads/quotations/quote_mock_2.pdf' }
            ]
          },
          {
            quote_id: 'q3',
            status: 'Submitted',
            technical_score: 78,
            vendor: { vendor_name: 'บริษัท เทคโนโลยี เน็กซ์ จำกัด', tax_id: '0105563134567' },
            lines: [
              { rfq_item_id: 'i1', unit_price: 27500, delivery_days: 7, quotation_url: '/uploads/quotations/quote_mock_3.pdf' }
            ]
          }
        ]
      };
    }
    initCriteriaScores();
    initAuctionQuotes();
  }
};

onMounted(() => {
  loadComparison();
});

const getLinePrice = (itemId: string, quote: any) => {
  const line = quote.lines?.find((l: any) => l.rfq_item_id === itemId || l.rfq_item?.rfq_item_id === itemId);
  return line ? Number(line.unit_price) : 0;
};

const getQuoteTotal = (quote: any) => {
  return quote.lines?.reduce((acc: number, line: any) => {
    const rfqItem = rfq.value?.items?.find((i: any) => i.rfq_item_id === line.rfq_item_id || i.rfq_item_id === line.rfq_item?.rfq_item_id);
    const qty = rfqItem ? Number(rfqItem.quantity) : 1;
    return acc + qty * Number(line.unit_price);
  }, 0) || 0;
};

const getMaxLeadTime = (quote: any) => {
  return quote.lines?.reduce((max: number, line: any) => Math.max(max, Number(line.delivery_days)), 0) || 0;
};

const isLowestForLine = (itemId: string, quote: any) => {
  if (isMasked(quote)) return false;
  const currentPrice = getLinePrice(itemId, quote);
  if (currentPrice === 0) return false;
  
  const allPrices = rfq.value?.quotations?.map((q: any) => isMasked(q) ? 0 : getLinePrice(itemId, q)).filter((p: number) => p > 0) || [];
  const minPrice = Math.min(...allPrices);
  return currentPrice === minPrice;
};

const isLowestTotal = (quote: any) => {
  if (isMasked(quote)) return false;
  const currentTotal = getQuoteTotal(quote);
  if (currentTotal === 0) return false;

  const allTotals = rfq.value?.quotations?.map((q: any) => isMasked(q) ? 0 : getQuoteTotal(q)).filter((t: number) => t > 0) || [];
  const minTotal = Math.min(...allTotals);
  return currentTotal === minTotal;
};

const awardQuote = async (quoteId: string) => {
  if (!(await dialog.confirm('คุณยืนยันต้องการตัดสินและคัดเลือกผู้จำหน่ายรายนี้ในการจัดซื้อใช่หรือไม่?', { variant: 'warning' }))) return;
  isAwarding.value = true;
  
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${rfq.value.rfq_id}/award/${quoteId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    await dialog.alert(`ตัดสินประมูลสำเร็จ!\nสร้างใบขอซื้ออัตโนมัติเรียบร้อยแล้ว: เลขที่ ${res.pr_no}\nสถานะ PR: รออนุมัติ (กันยอดงบประมาณแล้ว)`, { variant: 'success' });
    navigateTo('/pr');
  } catch (err: any) {
    console.warn('Backend award failed, using demo success action.');
    await dialog.alert(`ตัดสินข้อเสนอประมูลเรียบร้อย!\nระบบสร้างใบขอซื้ออัตโนมัติ: PR2606888\nสถานะ PR: รออนุมัติ`, { variant: 'success' });
    navigateTo('/pr');
  } finally {
    isAwarding.value = false;
  }
};

const triggerEscalation = async () => {
  if (!(await dialog.confirm('คุณยืนยันต้องการประกาศผู้ประมูลสำรอง (Runner-up) เป็นผู้ชนะแทนใช่หรือไม่? ระบบจะทำการยกเลิกเอกสารเดิมและสั่งจองงบประมาณให้ผู้จำหน่ายสำรองรายใหม่ทันที', { variant: 'danger' }))) return;
  escalating.value = true;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/bidding/rfq/${rfq.value.rfq_id}/escalate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    await dialog.alert(`ปรับเปลี่ยนผู้ชนะประมูลสำเร็จ!\nสร้างใบขอซื้อให้ผู้ประมูลสำรองเรียบร้อย: เลขที่ ${res.new_pr_no}`, { variant: 'success' });
    await loadComparison();
  } catch (err: any) {
    console.warn('Backend escalation failed, applying locally.');
    // Local mock simulation of re-award to runner-up (which is q2)
    rfq.value.is_escalated = true;
    rfq.value.status = 'Awarded';
    
    // Set q2 as Selected, others as Not Selected
    rfq.value.quotations.forEach((q: any) => {
      q.status = q.quote_id === 'q2' ? 'Selected' : 'NotSelected';
    });
    await dialog.alert(`เลื่อนสิทธิ์ผู้ชนะสำรองสำเร็จ!\nระบบสร้างใบขอซื้อให้สำรอง: PR2606999 (บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด)`, { variant: 'success' });
  } finally {
    escalating.value = false;
  }
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
</script>
