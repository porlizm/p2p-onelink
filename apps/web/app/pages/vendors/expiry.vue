<template>
  <div class="vendor-like-page">
    <div>
      <h2 class="text-xl font-bold text-[var(--foreground)]">เอกสารคู่ค้าใกล้หมดอายุ (Expiring Documents)</h2>
      <p class="text-sm text-[var(--muted-foreground)] mt-1">ติดตาม ตรวจสอบ และแจ้งเตือนคู่ค้าภายนอกให้อัปเดตเอกสารสิทธิ์ก่อนหมดอายุการทำธุรกรรม</p>
    </div>

    <!-- Alert List Card -->
    <UCard 
      class="border border-[#e9ecef] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] bg-white overflow-hidden"
      :body="{ class: 'p-0' }"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="p-4">ชื่อผู้ค้า</th>
              <th class="p-4">ประเภทเอกสาร</th>
              <th class="p-4">วันหมดอายุ</th>
              <th class="p-4">วันคงเหลือ</th>
              <th class="p-4">สถานะเอกสาร</th>
              <th class="p-4 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr 
              v-for="d in docs" 
              :key="d.id"
              class="hover:bg-[var(--secondary)]/40 transition-colors"
            >
              <td class="p-4 font-medium text-[var(--foreground)]">{{ d.vendorName }}</td>
              <td class="p-4 text-[var(--muted-foreground)]">{{ d.docType }}</td>
              <td class="p-4 text-[var(--muted-foreground)] font-mono">{{ d.expiry }}</td>
              <td class="p-4">
                <span 
                  class="font-semibold"
                  :class="[d.days <= 0 ? 'text-[var(--destructive)]' : 'text-[var(--warning-soft-foreground)]']"
                >
                  {{ d.days <= 0 ? 'หมดอายุแล้ว' : `${d.days} วัน` }}
                </span>
              </td>
              <td class="p-4">
                <StatusBadge :status="d.status" />
              </td>
              <td class="p-4 text-center">
                <UButton 
                  size="xs" 
                  color="primary"
                  variant="outline"
                  class="font-medium"
                >
                  <UIcon name="i-heroicons-envelope-20-solid" class="w-4 h-4 mr-1.5" />
                  ส่งเมลแจ้งเตือน
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from '~/components/StatusBadge.vue';

const docs = [
  { id: 1, vendorName: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด', docType: 'ใบ ภ.พ.20', expiry: '2026-01-10', days: 0, status: 'Expired' },
  { id: 2, vendorName: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด', docType: 'ใบ ภ.พ.20', expiry: '2026-07-15', days: 27, status: 'ExpiringSoon' },
  { id: 3, vendorName: 'บริษัท คลีนโปร เซอร์วิส จำกัด', docType: 'หนังสือรับรองบริษัท', expiry: '2026-08-30', days: 73, status: 'Valid' },
];
</script>

<style scoped>
.vendor-like-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  font-family: var(--font-sans);
}

.vendor-like-page > div:first-child {
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

.vendor-like-page :deep(.overflow-hidden) {
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
</style>
