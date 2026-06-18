<template>
  <div class="space-y-6">
    <!-- Welcome section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-[var(--foreground)]">ยินดีต้อนรับกลับ, คุณนันทพร</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">นี่คือภาพรวมของระบบ e-Procurement วันนี้</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton color="gray" size="md" variant="solid" class="shadow-[var(--shadow-sm)] border border-[var(--border)]">
          <UIcon name="i-heroicons-arrow-path-20-solid" class="w-4 h-4 mr-2" />
          อัปเดตข้อมูล
        </UButton>
        <UButton color="primary" size="md" class="shadow-[var(--shadow-sm)]">
          <UIcon name="i-heroicons-plus-20-solid" class="w-4 h-4 mr-2" />
          สร้างใบขอซื้อ (PR)
        </UButton>
      </div>
    </div>

    <!-- KPI Summary Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard 
        v-for="kpi in kpis" 
        :key="kpi.title"
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300 rounded-[var(--radius-lg)] bg-white"
        :body="{ class: 'p-6' }"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-[var(--muted-foreground)] font-medium">{{ kpi.title }}</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--secondary)] text-[var(--primary)]">
            <UIcon :name="kpi.icon" class="w-5 h-5" />
          </div>
        </div>
        <div class="flex items-baseline gap-2 mt-4">
          <span class="text-2xl font-bold text-[var(--foreground)]">{{ kpi.value }}</span>
          <span v-if="kpi.change" class="text-xs font-semibold text-[var(--success-soft-foreground)]">
            {{ kpi.change }}
          </span>
        </div>
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Vendors Table (2/3 width) -->
      <UCard 
        class="lg:col-span-2 border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white"
        :body="{ class: 'p-0' }"
      >
        <template #header>
          <div class="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h3 class="font-medium text-base text-[var(--foreground)]">ผู้ค้าในระบบ (Recent Vendors)</h3>
            <UButton to="/vendors" variant="link" size="xs" class="font-semibold p-0">ดูทั้งหมด</UButton>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[var(--muted)] border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="p-4">ชื่อผู้ค้า</th>
                <th class="p-4">ประเภทธุรกิจ</th>
                <th class="p-4">เลขประจำตัวผู้เสียภาษี</th>
                <th class="p-4">สถานะ</th>
                <th class="p-4">คะแนนประเมิน</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr 
                v-for="vendor in vendors" 
                :key="vendor.id" 
                class="hover:bg-[var(--secondary)]/40 transition-colors"
              >
                <td class="p-4 font-medium text-[var(--foreground)]">{{ vendor.name }}</td>
                <td class="p-4 text-[var(--muted-foreground)]">{{ vendor.category }}</td>
                <td class="p-4 font-mono text-[var(--muted-foreground)]">{{ vendor.taxId }}</td>
                <td class="p-4">
                  <StatusBadge :status="vendor.status" />
                </td>
                <td class="p-4 font-semibold text-[var(--foreground)]">
                  {{ vendor.score > 0 ? vendor.score.toFixed(1) : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Budget Usage Summary (1/3 width) -->
      <UCard 
        class="border border-[var(--border)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white"
      >
        <template #header>
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h3 class="font-medium text-base text-[var(--foreground)]">การใช้งบประมาณ (IT Dept CC-IT-01)</h3>
          </div>
        </template>

        <div class="space-y-6 mt-4">
          <!-- Circular Progress Simulation -->
          <div class="flex flex-col items-center justify-center py-4">
            <div class="relative w-36 h-36 flex items-center justify-center rounded-full border-12 border-[var(--muted)]">
              <div class="absolute inset-0 rounded-full border-12 border-[var(--primary)] border-t-transparent border-r-transparent"></div>
              <div class="flex flex-col items-center">
                <span class="text-2xl font-bold text-[var(--foreground)]">91.5%</span>
                <span class="text-[10px] text-[var(--muted-foreground)] uppercase">ใช้ไปแล้ว</span>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between text-xs">
              <span class="text-[var(--muted-foreground)]">งบประมาณประจำปี:</span>
              <span class="font-bold text-[var(--foreground)]">1,200,000 บาท</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-[var(--muted-foreground)]">ใช้ไปแล้ว:</span>
              <span class="font-bold text-[var(--foreground)]">1,098,000 บาท</span>
            </div>
            <!-- Alert bar if close to full -->
            <div class="p-3 bg-[var(--warning-soft)] text-[var(--warning-soft-foreground)] text-xs rounded-[var(--radius)] flex gap-2 border border-[var(--warning-soft-foreground)]/10 mt-4">
              <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-5 h-5 flex-shrink-0" />
              <span>งบประมาณไอทีใกล้เต็มแล้ว! ไม่สามารถสร้างรายการขนาดใหญ่ได้</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from '~/components/StatusBadge.vue';

const kpis = [
  { title: 'ใบขอซื้อ (PR) เดือนนี้', value: '45 รายการ', icon: 'i-heroicons-document-text', change: '+12% เทียบกับเดือนก่อน' },
  { title: 'ใบขอซื้อรอการอนุมัติ', value: '8 รายการ', icon: 'i-heroicons-clock', change: '' },
  { title: 'ยอดซื้ออนุมัติแล้ว', value: '3,850,200 ฿', icon: 'i-heroicons-check-circle', change: '' },
  { title: 'ผู้ค้ารอการยืนยัน', value: '3 ราย', icon: 'i-heroicons-users', change: '' },
];

const vendors = [
  { id: 'ven_001', name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', category: 'อุปกรณ์ไอที', taxId: '0105561012345', status: 'Active', score: 4.6 },
  { id: 'ven_002', name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', category: 'อุปกรณ์ไอที/บริการ', taxId: '0105562023456', status: 'Active', score: 4.3 },
  { id: 'ven_007', name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด', category: 'อุปกรณ์เซฟตี้', taxId: '0105567078901', status: 'PendingRegistration', score: 0 },
  { id: 'ven_009', name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด', category: 'บำรุงรักษา/วิศวกรรม', taxId: '0105569090123', status: 'Suspended', score: 3.5 },
  { id: 'ven_011', name: 'บริษัท สมาร์ท ปริ้นติ้ง จำกัด', category: 'บริการสิ่งพิมพ์', taxId: '0105561112345', status: 'Blacklisted', score: 1.2 },
];
</script>
