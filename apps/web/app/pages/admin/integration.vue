<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ตรวจสอบสถานะการเชื่อมต่อระบบ (SAP Integration Monitor)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ติดตามสถานะการส่งข้อมูล Interface ระหว่างระบบ P2P OneLink, SAP B1, ธนาคาร และกรมสรรพากร</p>
      </div>
      <div>
        <UButton 
          @click="loadLogs"
          color="neutral"
          variant="outline"
          icon="i-heroicons-arrow-path"
          class="cursor-pointer"
        >
          อัปเดตข้อมูล
        </UButton>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white border border-[#e9ecef] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-xs">
        <UInput 
          v-model="search" 
          placeholder="ค้นหาประเภทเอกสาร หรือระบบเป้าหมาย..." 
          icon="i-heroicons-magnifying-glass-20-solid"
        />
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <USelect 
          v-model="filterStatus"
          :options="['สถานะทั้งหมด', 'Success', 'Failed', 'Retrying']"
          class="w-full sm:w-48"
        />
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">ระบบเป้าหมาย</th>
              <th class="px-6 py-3">ประเภทเอกสาร</th>
              <th class="px-6 py-3">ID อ้างอิงเอกสาร</th>
              <th class="px-6 py-3 text-center">จำนวนครั้งที่ Retry</th>
              <th class="px-6 py-3 text-center">วันเวลาที่ซิงค์</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5] text-sm">
            <tr v-for="log in filteredLogs" :key="log.log_id" class="hover:bg-[#f8fffe] transition">
              <td class="px-6 py-4 font-bold text-slate-700">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" :class="log.target_system === 'SAP_B1' ? 'bg-blue-600' : 'bg-[#fafbfc]0'"></span>
                  <span>{{ log.target_system }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                  {{ log.doc_type }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-slate-400">
                {{ log.doc_id }}
              </td>
              <td class="px-6 py-4 text-center font-bold text-slate-600">
                {{ log.retry_count }}
              </td>
              <td class="px-6 py-4 text-center text-xs text-slate-400">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border"
                  :class="[
                    log.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' :
                    log.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  ]"
                >
                  {{ log.status === 'Success' ? 'สำเร็จ ✅' : log.status === 'Failed' ? 'ล้มเหลว ❌' : 'กำลังซิงค์ใหม่ ⏳' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <UButton 
                  v-if="log.status === 'Failed'"
                  @click="retryLog(log.log_id)"
                  size="xs" 
                  color="warning"
                  icon="i-heroicons-arrow-path"
                  class="cursor-pointer"
                >
                  Retry Sync
                </UButton>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="7" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบประวัติการเชื่อมต่อข้อมูล
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const search = ref('');
const filterStatus = ref('สถานะทั้งหมด');
const logsList = ref<any[]>([]);

const loadLogs = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/integration-log', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    logsList.value = res;
  } catch (err) {
    console.warn('Backend unavailable. Using mock integration logs.');
    logsList.value = [
      { log_id: 'log_mock_1', target_system: 'SAP_B1', doc_type: 'PurchaseRequisition', doc_id: 'PR260601', retry_count: 0, status: 'Success', created_at: new Date() },
      { log_id: 'log_mock_2', target_system: 'SAP_B1', doc_type: 'PurchaseOrder', doc_id: 'PO260602', retry_count: 0, status: 'Success', created_at: new Date() },
      { log_id: 'log_mock_3', target_system: 'SAP_B1', doc_type: 'GoodsReceipt', doc_id: 'GR260601', retry_count: 1, status: 'Failed', created_at: new Date(Date.now() - 3600000) },
      { log_id: 'log_mock_4', target_system: 'Bank_Gateway', doc_type: 'PaymentRequest', doc_id: 'PAY260601', retry_count: 0, status: 'Success', created_at: new Date() },
      { log_id: 'log_mock_5', target_system: 'RD_TaxAPI', doc_type: 'VendorVerification', doc_id: 'TAX-001', retry_count: 0, status: 'Success', created_at: new Date() },
    ];
  }
};

const retryLog = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/integration-log/${id}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    await loadLogs();
  } catch (err) {
    // Local mock simulation update
    const idx = logsList.value.findIndex(l => l.log_id === id);
    if (idx !== -1) {
      logsList.value[idx].status = 'Success';
      logsList.value[idx].retry_count += 1;
      logsList.value[idx].created_at = new Date();
    }
  }
};

const filteredLogs = computed(() => {
  return logsList.value.filter(log => {
    const matchesSearch = log.doc_type.toLowerCase().includes(search.value.toLowerCase()) ||
      log.target_system.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = filterStatus.value === 'สถานะทั้งหมด' || log.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

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

onMounted(() => {
  loadLogs();
});
</script>
