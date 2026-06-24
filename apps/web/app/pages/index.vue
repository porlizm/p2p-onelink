<template>
  <div class="space-y-6">
    <!-- Welcome section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[#002266]">ยินดีต้อนรับกลับ, {{ authStore.user?.username || 'คุณนันทพร ศิริวัฒน์' }}</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">นี่คือรายงานแดชบอร์ดสรุปผลการจัดซื้อและการเบิกจ่าย (Executive Summary Dashboard)</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton 
          @click="isEditMode = !isEditMode" 
          :color="isEditMode ? 'primary' : 'gray'" 
          size="md" 
          variant="outline" 
          :icon="isEditMode ? 'i-heroicons-check' : 'i-heroicons-wrench-screwdriver'"
          class="cursor-pointer font-semibold"
        >
          {{ isEditMode ? 'เสร็จสิ้นการจัดเรียง' : 'ปรับแต่งวิดเจ็ต' }}
        </UButton>
        <UButton 
          @click="loadKpis" 
          color="gray" 
          size="md" 
          variant="outline" 
          icon="i-heroicons-arrow-path"
          class="cursor-pointer"
        >
          อัปเดตข้อมูล
        </UButton>
        <UButton 
          to="/pr" 
          color="primary" 
          size="md" 
          icon="i-heroicons-plus"
          class="cursor-pointer font-bold bg-[#0054FF] hover:bg-[#002266]"
        >
          สร้างใบขอซื้อ (PR)
        </UButton>
      </div>
    </div>

    <!-- KPI Summary Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- KPI 1 -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--muted-foreground)] font-semibold uppercase">ใบขอซื้อ (PR) ทั้งหมดในระบบ</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2 mt-3">
          <span class="text-2xl font-black text-[#002266]">{{ kpisData.totalPrs }}</span>
          <span class="text-[10px] text-slate-400">รายการ</span>
        </div>
      </UCard>

      <!-- KPI 2 -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--muted-foreground)] font-semibold uppercase">เอกสารรอการอนุมัติ</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
            <UIcon name="i-heroicons-clock" class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2 mt-3">
          <span class="text-2xl font-black text-orange-600">{{ kpisData.pendingApprovals }}</span>
          <span class="text-[10px] text-slate-400">รายการค้าง</span>
        </div>
      </UCard>

      <!-- KPI 3 -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--muted-foreground)] font-semibold uppercase">ยอดซื้ออนุมัติแล้วเดือนนี้</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2 mt-3">
          <span class="text-xl font-black text-green-600">{{ formatCurrency(kpisData.approvedAmount) }}</span>
        </div>
      </UCard>

      <!-- KPI 4 -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--muted-foreground)] font-semibold uppercase">หนี้ค้างชำระ (Overdue AP)</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600">
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2 mt-3">
          <span class="text-xl font-black text-red-600 animate-pulse">{{ formatCurrency(kpisData.overdueAmount) }}</span>
        </div>
      </UCard>
    </div>

    <!-- Widgets Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div 
        v-for="(w, idx) in widgets" 
        :key="w.id"
        :class="[w.cols, 'relative group bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] transition-all']"
      >
        <!-- Reordering buttons in Edit Mode -->
        <div v-if="isEditMode" class="absolute top-2 right-2 flex gap-1 z-20 bg-slate-100/90 p-1 rounded-lg shadow-sm border border-slate-200">
          <UButton 
            size="xs" 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-chevron-left" 
            :disabled="idx === 0"
            @click="moveWidget(idx, -1)" 
          />
          <UButton 
            size="xs" 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-chevron-right" 
            :disabled="idx === widgets.length - 1"
            @click="moveWidget(idx, 1)" 
          />
          <span class="text-[9px] px-1 text-slate-500 font-bold flex items-center">#{{ idx + 1 }}</span>
        </div>

        <!-- Render Content based on widget.id -->
        <div v-if="w.id === 'approval_inbox'" class="h-full">
          <div class="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5 text-indigo-600" />
                งานที่รอคุณอนุมัติ (Procurement Approval Inbox)
              </h3>
              <p class="text-[10px] text-slate-400 mt-0.5">อนุมัติใบขอซื้อ PR และใบสั่งซื้อ PO ตามสายอนุมัติระดับองค์กร (DOA Engine)</p>
            </div>
            <UBadge color="indigo" variant="subtle" size="xs">
              รออนุมัติ: {{ pendingApprovalsList.length }} รายการ
            </UBadge>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                  <th class="px-4 py-2">ประเภทเอกสาร / เลขที่</th>
                  <th class="px-4 py-2">ผู้ร้องขอ / แผนก</th>
                  <th class="px-4 py-2">รายละเอียด</th>
                  <th class="px-4 py-2 text-right">ยอดรวมจัดซื้อ</th>
                  <th class="px-4 py-2 text-center">สายอนุมัติ</th>
                  <th class="px-4 py-2 text-center">สถานะงบประมาณ</th>
                  <th class="px-4 py-2 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600">
                <tr v-for="item in pendingApprovalsList" :key="item.id" class="hover:bg-slate-50/50">
                  <td class="px-4 py-2.5 font-bold text-indigo-605">
                    {{ item.type }} - {{ item.no }}
                  </td>
                  <td class="px-4 py-2.5">
                    <div class="font-semibold text-slate-700">{{ item.requester }}</div>
                    <div class="text-[9px] text-slate-400">{{ item.department }}</div>
                  </td>
                  <td class="px-4 py-2.5 max-w-xs truncate">{{ item.description }}</td>
                  <td class="px-4 py-2.5 text-right font-bold text-slate-800">{{ formatCurrency(item.amount) }}</td>
                  <td class="px-4 py-2.5 text-center">
                    <UBadge color="gray" variant="soft" size="xs">{{ item.approver_role }}</UBadge>
                  </td>
                  <td class="px-4 py-2.5 text-center">
                    <span 
                      v-if="item.is_budget_overrun" 
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200"
                    >
                      งบเกินเกณฑ์ (CFO/VP)
                    </span>
                    <span 
                      v-else 
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200"
                    >
                      งบปกติ
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                      <UButton 
                        size="xs" 
                        color="green" 
                        icon="i-heroicons-check" 
                        class="cursor-pointer font-bold"
                        @click="handleApprove(item)"
                      >
                        อนุมัติ
                      </UButton>
                      <UButton 
                        size="xs" 
                        color="red" 
                        variant="outline"
                        icon="i-heroicons-x-mark" 
                        class="cursor-pointer font-bold"
                        @click="handleReject(item)"
                      >
                        ปฏิเสธ
                      </UButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="pendingApprovalsList.length === 0">
                  <td colspan="7" class="text-center py-8 text-slate-400 italic">
                    ไม่มีเอกสารจัดซื้อที่รออนุมัติในขณะนี้
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else-if="w.id === 'trend_chart'" class="h-full flex flex-col justify-between">
          <div class="flex items-center justify-between border-b pb-3 mb-4">
            <h3 class="font-bold text-slate-800 text-sm">แนวโน้มจำนวนการออกใบขอซื้อ (6 เดือนย้อนหลัง)</h3>
            <span class="text-xs text-slate-400 font-medium">หน่วย: รายการ</span>
          </div>

          <div class="h-64 relative flex items-end justify-between px-6 pt-4">
            <svg class="absolute inset-0 w-full h-full p-6" viewBox="0 0 500 200" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" stroke-width="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" stroke-width="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" stroke-width="1" />
              
              <!-- Connection path -->
              <path 
                d="M 20 150 L 100 110 L 180 130 L 260 80 L 340 50 L 420 30" 
                fill="none" 
                stroke="#0054FF" 
                stroke-width="3" 
                stroke-linecap="round"
              />
              
              <!-- Glow effect path -->
              <path 
                d="M 20 150 L 100 110 L 180 130 L 260 80 L 340 50 L 420 30 L 420 200 L 20 200 Z" 
                fill="url(#grad)" 
                opacity="0.08"
              />

              <!-- Dots -->
              <circle cx="20" cy="150" r="5" fill="#0054FF" stroke="white" stroke-width="2" />
              <circle cx="100" cy="110" r="5" fill="#0054FF" stroke="white" stroke-width="2" />
              <circle cx="180" cy="130" r="5" fill="#0054FF" stroke="white" stroke-width="2" />
              <circle cx="260" cy="80" r="5" fill="#0054FF" stroke="white" stroke-width="2" />
              <circle cx="340" cy="50" r="5" fill="#0054FF" stroke="white" stroke-width="2" />
              <circle cx="420" cy="30" r="5" fill="#0054FF" stroke="white" stroke-width="2" />

              <!-- Defs for gradient -->
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#0054FF" />
                  <stop offset="100%" stop-color="white" />
                </linearGradient>
              </defs>
            </svg>

            <!-- X axis labels -->
            <div 
              v-for="item in trendData" 
              :key="item.month"
              class="flex flex-col items-center justify-end z-10 w-16"
            >
              <span class="text-xs font-bold text-slate-800">{{ item.volume }}</span>
              <span class="text-[10px] text-slate-400 font-semibold mt-1">{{ item.month }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="w.id === 'pr_status'" class="h-full flex flex-col justify-between">
          <div class="flex items-center justify-between border-b pb-3 mb-4">
            <h3 class="font-bold text-slate-800 text-sm">สัดส่วนสถานะใบขอซื้อ (PR Status)</h3>
          </div>

          <div class="flex flex-col items-center justify-center space-y-6 py-2">
            <!-- CSS Donut Chart -->
            <div class="relative w-32 h-32 flex items-center justify-center rounded-full border-12 border-slate-100">
              <div class="absolute inset-0 rounded-full border-12 border-[#0054FF] border-t-transparent border-r-transparent"></div>
              <div class="absolute inset-0 rounded-full border-12 border-emerald-400 border-l-transparent border-b-transparent"></div>
              
              <div class="flex flex-col items-center">
                <span class="text-xl font-black text-slate-800">{{ kpisData.totalPrs }}</span>
                <span class="text-[9px] text-slate-400 uppercase font-semibold">รายการทั้งหมด</span>
              </div>
            </div>

            <!-- Chart legend -->
            <div class="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] w-full font-semibold">
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded bg-[#0054FF]"></span>
                <span>อนุมัติ: {{ statusCounts.Approved }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded bg-emerald-400"></span>
                <span>รออนุมัติ: {{ statusCounts.Pending }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded bg-slate-300"></span>
                <span>ร่าง: {{ statusCounts.Draft }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded bg-red-400"></span>
                <span>ปฏิเสธ: {{ statusCounts.Rejected }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="w.id === 'spend_bu'" class="h-full">
          <div class="flex items-center justify-between border-b pb-3 mb-4">
            <h3 class="font-bold text-slate-800 text-sm">การใช้งบประมาณรายแผนก (Budget Spending by BU)</h3>
            <span class="text-xs text-slate-400">หน่วย: บาท</span>
          </div>

          <div class="space-y-4">
            <div 
              v-for="bu in buSpendingData" 
              :key="bu.bu_name"
              class="space-y-1.5"
            >
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-600">{{ bu.bu_name }}</span>
                <span class="text-slate-800 font-bold">{{ formatCurrency(bu.spending) }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-blue-600 to-[#0054FF] h-full rounded-full transition-all duration-500" 
                  :style="{ width: getPercentage(bu.spending) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="w.id === 'price_trends'" class="h-full flex flex-col justify-between">
          <div class="flex items-center justify-between border-b pb-3 mb-4">
            <h3 class="font-bold text-slate-800 text-sm">แนวโน้มราคาวัสดุ / ขนส่ง (Price Trends)</h3>
            <span class="text-xs text-blue-600 font-bold">ตลาดจัดซื้อ</span>
          </div>

          <div class="space-y-3">
            <div v-for="pt in priceTrends" :key="pt.item" class="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-slate-800">{{ pt.item }}</span>
                <span 
                  class="px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-0.5"
                  :class="pt.status === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'"
                >
                  <UIcon :name="pt.status === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="w-3.5 h-3.5" />
                  {{ pt.trend }}
                </span>
              </div>
              <!-- Mini Sparkline using standard SVG -->
              <div class="h-6 flex items-center justify-between mt-2">
                <span class="text-[10px] text-slate-400 font-mono">ราคาล่าสุด: <strong class="text-slate-700 font-semibold">{{ pt.prices[pt.prices.length - 1] }} ฿</strong></span>
                <svg class="w-20 h-6" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path 
                    :d="generateSparklineD(pt.prices)" 
                    fill="none" 
                    :stroke="pt.status === 'up' ? '#ef4444' : '#10b981'" 
                    stroke-width="2" 
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="w.id === 'invoice_aging'" class="h-full">
          <div class="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-sm">รายงานวิเคราะห์อายุหนี้ (Invoice Aging Tracker)</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">ติดตามกำหนดชำระเงินผู้ค้า ป้องกันการจ่ายล่าช้าและรักษาระดับความสัมพันธ์</p>
            </div>
            <UButton size="xs" color="primary" variant="link" to="/finance" class="font-semibold text-xs text-[#0054FF]">
              จัดการใบตั้งหนี้
            </UButton>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                  <th class="px-4 py-2">ชื่อคู่ค้า / Vendor</th>
                  <th class="px-4 py-2 text-right">ยังไม่ถึงกำหนด</th>
                  <th class="px-4 py-2 text-right">เกินกำหนด 1-30 วัน</th>
                  <th class="px-4 py-2 text-right">เกินกำหนด 31-60 วัน</th>
                  <th class="px-4 py-2 text-right">เกินกำหนด > 60 วัน</th>
                  <th class="px-4 py-2 text-right font-bold">ยอดหนี้รวม</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600">
                <tr v-for="aging in invoiceAgingData" :key="aging.vendor" class="hover:bg-slate-50/50">
                  <td class="px-4 py-2.5 font-semibold text-slate-700 truncate max-w-[200px]">{{ aging.vendor }}</td>
                  <td class="px-4 py-2.5 text-right font-medium">{{ formatCurrency(aging.not_due) }}</td>
                  <td class="px-4 py-2.5 text-right text-orange-600 font-medium">{{ formatCurrency(aging.aging_1_30) }}</td>
                  <td class="px-4 py-2.5 text-right text-orange-800 font-bold">{{ formatCurrency(aging.aging_31_60) }}</td>
                  <td class="px-4 py-2.5 text-right text-red-600 font-black animate-pulse" v-if="aging.aging_over_60 > 0">
                    {{ formatCurrency(aging.aging_over_60) }}
                  </td>
                  <td class="px-4 py-2.5 text-right text-slate-400 font-medium" v-else>฿0</td>
                  <td class="px-4 py-2.5 text-right font-bold text-slate-800">{{ formatCurrency(aging.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action / SAP B1 Panel underneath -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-3 bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <h4 class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 text-indigo-600" />
            ระบบซิงค์ข้อมูลคงคลังและจับคู่ชำระ
          </h4>
          <p class="text-xs text-slate-500">เชื่อมโยงใบรับของ GR และใบขอซื้อกับฐานระบบหลัก SAP ERP บัญชีหลักของเครือ SCGJWD แบบ Real-time</p>
        </div>
        <div class="flex items-center gap-3">
          <UButton 
            to="/admin/integration" 
            color="gray" 
            variant="outline" 
            class="font-semibold text-xs cursor-pointer"
          >
            เปิดหน้าติดตามเชื่อมโยงข้อมูล SAP B1
          </UButton>
          <UButton 
            to="/finance" 
            color="primary" 
            class="font-semibold text-xs cursor-pointer bg-[#0054FF] hover:bg-[#002266]"
          >
            เปิดตารางตรวจสอบจับคู่บิล (AP Matching)
          </UButton>
        </div>
      </div>
    </div>

    <!-- PDPA Consent Overlay Modal -->
    <UModal v-model="showPdpaModal" prevent-close :ui="{ width: 'sm:max-w-lg' }">
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3 text-red-600">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-shield-check-solid" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-extrabold text-slate-800 text-base">การคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent)</h3>
            <p class="text-[10px] text-slate-400 font-medium">บริษัท เจดับเบิ้ลยูดี อินโฟโลจิสติกส์ จำกัด (มหาชน)</p>
          </div>
        </div>

        <div class="border-t border-b border-slate-100 py-3 text-xs text-slate-600 space-y-2.5 max-h-60 overflow-y-auto leading-relaxed">
          <p>
            <strong>นโยบายความเป็นส่วนตัวสำหรับการใช้งานระบบ P2P OneLink:</strong>
          </p>
          <p>
            เพื่อประสิทธิภาพสูงสุดในการซื้อขาย ตรวจรับพัสดุ ดำเนินการคัดกรองคู่จัดซื้อ และเป็นไปตามกฎหมายพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ทางบริษัทมีความจำเป็นต้องเก็บรวบรวม ข้อมูลระบุตัวตน (เช่น ชื่อ-นามสกุล, ตำแหน่ง, ที่อยู่อีเมล, หมายเลขโทรศัพท์) ข้อมูลทางเทคนิค (เช่น เลขที่อยู่ไอพี (IP Address), บันทึกการเข้าใช้งานระบบ) ของท่าน
          </p>
          <p>
            <strong>วัตถุประสงค์การใช้ข้อมูล:</strong>
          </p>
          <ul class="list-disc pl-4 space-y-1">
            <li>ใช้ในการยืนยันตัวตนสำหรับลงนามเอกสารสัญญาจัดซื้อระบบดิจิทัล (Digital Contract Signatures)</li>
            <li>ใช้สำหรับตรวจสอบมาตรการความปลอดภัยและจำกัดสิทธิ์ใช้งานไอพีแอดเดรส (CIDR IP restrictions)</li>
            <li>ปรับปรุงและเฝ้าระวังความมั่นคงปลอดภัยในการทำธุรกรรมผ่านระบบ e-Procurement</li>
          </ul>
          <p>
            ข้อมูลของท่านจะถูกจัดเก็บตามมาตรฐานความมั่นคงปลอดภัยสูงสุด และไม่มีการเผยแพร่ไปยังบุคคลภายนอกที่ไม่ได้รับอนุญาต
          </p>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-400">
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
            ข้อมูลของท่านถูกเข้ารหัสตามมาตรฐาน AES-256
          </span>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton 
            color="gray" 
            variant="ghost" 
            class="text-xs font-bold" 
            @click="rejectPdpa"
          >
            ปฏิเสธและออกจากระบบ
          </UButton>
          <UButton 
            color="primary" 
            class="text-xs font-bold bg-[#0054FF] hover:bg-[#002266] px-4 cursor-pointer"
            :loading="savingConsent"
            @click="acceptPdpa"
          >
            ยอมรับข้อตกลงและใช้งานระบบ
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const isEditMode = ref(false);
const showPdpaModal = ref(false);
const savingConsent = ref(false);

// Drag/arrangeable widget list
const widgets = ref<any[]>([
  { id: 'approval_inbox', cols: 'lg:col-span-3' },
  { id: 'trend_chart', cols: 'lg:col-span-2' },
  { id: 'pr_status', cols: 'lg:col-span-1' },
  { id: 'spend_bu', cols: 'lg:col-span-2' },
  { id: 'price_trends', cols: 'lg:col-span-1' },
  { id: 'invoice_aging', cols: 'lg:col-span-3' },
]);

const kpisData = ref({
  totalPrs: 45,
  pendingApprovals: 8,
  approvedAmount: 3850200,
  overdueAmount: 142500,
});

const statusCounts = ref({
  Approved: 28,
  Pending: 8,
  Draft: 6,
  Rejected: 3,
});

const trendData = ref<any[]>([
  { month: 'ม.ค.', volume: 15 },
  { month: 'ก.พ.', volume: 22 },
  { month: 'มี.ค.', volume: 18 },
  { month: 'เม.ย.', volume: 28 },
  { month: 'พ.ค.', volume: 35 },
  { month: 'มิ.ย.', volume: 45 },
]);

const buSpendingData = ref<any[]>([
  { bu_name: 'ฝ่ายขายและบริการลูกค้า B2C', spending: 1890000 },
  { bu_name: 'คลังสินค้าและปฏิบัติการ', spending: 1250000 },
  { bu_name: 'ฝ่ายเทคโนโลยีสารสนเทศ', spending: 1098000 },
  { bu_name: 'ฝ่ายจัดซื้อกลาง', spending: 950000 },
  { bu_name: 'ฝ่ายบัญชีและการเงิน', spending: 620000 },
]);

const priceTrends = ref<any[]>([
  { item: 'ปูนซีเมนต์ถุงปอร์ตแลนด์ (SCG)', trend: '+2.4%', status: 'up', prices: [140, 142, 145, 143, 145, 148] },
  { item: 'เหล็กเส้นกลม SR24 SD40', trend: '-1.8%', status: 'down', prices: [220, 218, 215, 216, 212, 214] },
  { item: 'น้ำมันดีเซล B7 (ลิตร)', trend: '+5.2%', status: 'up', prices: [30, 31, 31.5, 32, 32.2, 33] },
]);

const invoiceAgingData = ref<any[]>([
  { vendor: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)', not_due: 1200000, aging_1_30: 350000, aging_31_60: 0, aging_over_60: 0, total: 1550000 },
  { vendor: 'บริษัท เอสซีจี โลจิสติกส์ จำกัด', not_due: 450000, aging_1_30: 0, aging_31_60: 80000, aging_over_60: 0, total: 530000 },
  { vendor: 'บริษัท โตโยต้า มอเตอร์ ประเทศไทย จำกัด', not_due: 800000, aging_1_30: 120000, aging_31_60: 0, aging_over_60: 45000, total: 965000 },
]);

// Sparkline helper
const generateSparklineD = (prices: number[]) => {
  if (prices.length === 0) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * 100;
    const y = 30 - ((price - min) / range) * 20 - 5;
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
};

const moveWidget = (index: number, direction: number) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= widgets.value.length) return;
  const temp = widgets.value[index];
  widgets.value[index] = widgets.value[targetIndex];
  widgets.value[targetIndex] = temp;
};

const loadKpis = async () => {
  try {
    const res = await $fetch<any>('http://localhost:3001/api/dashboard/kpis', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    kpisData.value = {
      totalPrs: res.kpis.totalPrs || 45,
      pendingApprovals: res.kpis.pendingApprovals || 8,
      approvedAmount: res.kpis.approvedAmount || 3850200,
      overdueAmount: res.kpis.overdueAmount || 142500,
    };
    
    statusCounts.value = {
      Approved: res.charts.prStatusDistribution.find((x: any) => x.status === 'Approved')?.count || 28,
      Pending: res.charts.prStatusDistribution.find((x: any) => x.status === 'PendingApproval')?.count || 8,
      Draft: res.charts.prStatusDistribution.find((x: any) => x.status === 'Draft')?.count || 6,
      Rejected: res.charts.prStatusDistribution.find((x: any) => x.status === 'Rejected')?.count || 3,
    };

    trendData.value = res.charts.trend;
    buSpendingData.value = res.charts.buSpending;
  } catch (err) {
    console.warn('Backend connection failed. Using mock KPIs.');
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val);
};

const getPercentage = (amount: number) => {
  const max = 2500000;
  return Math.min(Math.round((amount / max) * 100), 100);
};

// PDPA Methods
const acceptPdpa = async () => {
  savingConsent.value = true;
  try {
    await authStore.recordPdpaConsent();
    showPdpaModal.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    savingConsent.value = false;
  }
};

const rejectPdpa = () => {
  alert('คุณจำเป็นต้องยอมรับนโยบายความเป็นส่วนตัวเพื่อใช้งานระบบ');
  authStore.logout();
};

const pendingApprovalsList = ref<any[]>([]);

const loadPendingApprovals = async () => {
  try {
    const prs = await $fetch<any[]>('http://localhost:3001/api/pr', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    const pos = await $fetch<any[]>('http://localhost:3001/api/po', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    const mappedPrs = prs
      .filter((p: any) => p.status === 'PendingApproval')
      .map((p: any) => ({
        id: p.pr_id,
        type: 'PR',
        no: p.pr_no,
        requester: p.requester?.username || 'Requester',
        department: p.lines?.[0]?.cost_center?.cc_name || 'ฝ่ายจัดซื้อ',
        description: p.description || 'จัดซื้อทั่วไป',
        amount: Number(p.total_amount),
        approver_role: p.approver_role || 'Manager',
        is_budget_overrun: p.is_budget_overrun,
      }));

    const mappedPos = pos
      .filter((p: any) => p.status === 'PendingApproval')
      .map((p: any) => ({
        id: p.po_id,
        type: 'PO',
        no: p.po_no,
        requester: 'Buyer System',
        department: 'จัดซื้อกลาง',
        description: `อ้างอิงใบขอซื้อ ${p.pr?.pr_no || ''}`,
        amount: Number(p.total_amount),
        approver_role: 'SeniorManager',
        is_budget_overrun: false,
      }));

    pendingApprovalsList.value = [...mappedPrs, ...mappedPos];
  } catch (err) {
    console.warn('Backend offline, using mock pending approvals.');
    pendingApprovalsList.value = [
      { id: 'pr_mock_overrun', type: 'PR', no: 'PR2606012', requester: 'คุณนันทพร ศิริวัฒน์', department: 'ฝ่ายขายและบริการลูกค้า B2C', description: 'สั่งซื้อเก้าอี้และอุปกรณ์สำหรับพนักงานสาขาใหม่', amount: 35000, approver_role: 'CFO', is_budget_overrun: true },
      { id: 'pr_mock_normal', type: 'PR', no: 'PR2606013', requester: 'คุณกิตติศักดิ์ เลิศฤทธิ์', department: 'คลังสินค้าและปฏิบัติการ', description: 'วัสดุบรรจุภัณฑ์และกล่องกระดาษลูกฟูก', amount: 48000, approver_role: 'Manager', is_budget_overrun: false },
    ];
  }
};

const handleApprove = async (item: any) => {
  try {
    const url = item.type === 'PR' 
      ? `http://localhost:3001/api/pr/${item.id}/approve`
      : `http://localhost:3001/api/po/${item.id}/approve`;
      
    await $fetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert(`อนุมัติเอกสาร ${item.no} เรียบร้อยแล้ว!`);
    await loadPendingApprovals();
    await loadKpis();
  } catch (err) {
    console.warn('Backend approval failed, applying mock.');
    pendingApprovalsList.value = pendingApprovalsList.value.filter(x => x.id !== item.id);
    alert(`[MOCK] อนุมัติเอกสาร ${item.no} สำเร็จ!`);
  }
};

const handleReject = async (item: any) => {
  const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธคำขอ:');
  if (reason === null) return;
  
  try {
    const url = item.type === 'PR' 
      ? `http://localhost:3001/api/pr/${item.id}/reject`
      : `http://localhost:3001/api/po/${item.id}/reject`;
      
    await $fetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert(`ปฏิเสธเอกสาร ${item.no} เรียบร้อยแล้ว (คืนวงเงินงบจองแล้ว)`);
    await loadPendingApprovals();
    await loadKpis();
  } catch (err) {
    console.warn('Backend rejection failed, applying mock.');
    pendingApprovalsList.value = pendingApprovalsList.value.filter(x => x.id !== item.id);
    alert(`[MOCK] ปฏิเสธเอกสาร ${item.no} เรียบร้อยแล้ว (คืนงบจองเรียบร้อย)`);
  }
};

onMounted(() => {
  loadKpis();
  loadPendingApprovals();
  if (authStore.user && !authStore.user.pdpaConsentDate) {
    showPdpaModal.value = true;
  }
});
</script>
