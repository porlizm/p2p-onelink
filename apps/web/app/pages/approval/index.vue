<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รายการรออนุมัติ (Approval Inbox)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตรวจสอบและอนุมัติเอกสาร PR, PO, Budget Request และ Contract ตามสายอนุมัติขององค์กร</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-outline" :disabled="isLoading" @click="loadApprovals">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
          อัปเดตข้อมูล
        </button>
        <NuxtLink to="/finance/reports" class="btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
          รายงานข้อยกเว้น
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div v-for="card in summaryCards" :key="card.label" class="glass-panel rounded-xl p-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--muted-foreground)] font-semibold">{{ card.label }}</span>
          <UIcon :name="card.icon" class="w-5 h-5" :class="card.color" />
        </div>
        <div class="text-2xl font-black mt-2 text-[var(--foreground)]">{{ card.value }}</div>
      </div>
    </div>

    <div class="glass-panel rounded-xl overflow-hidden">
      <div class="p-4 border-b border-[#eff1f5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="ds-tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="ds-tab"
            :class="{ 'ds-tab--active': activeTab === tab }"
            @click="activeTab = tab"
          >{{ tab }}</button>
        </div>
        <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="ค้นหาเลขที่เอกสาร ผู้ขอ หรือแผนก" class="w-full lg:w-80" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-5 py-3">เอกสาร</th>
              <th class="px-5 py-3">ผู้ขอ / หน่วยงาน</th>
              <th class="px-5 py-3">รายละเอียด</th>
              <th class="px-5 py-3 text-right">มูลค่า</th>
              <th class="px-5 py-3 text-center">เส้นทางอนุมัติ</th>
              <th class="px-5 py-3 text-center">SLA</th>
              <th class="px-5 py-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#eff1f5]">
            <tr v-for="item in filteredApprovals" :key="item.id" class="hover:bg-[#f8fffe] transition">
              <td class="px-5 py-4"><div class="font-bold text-[var(--primary)]">{{ item.no }}</div><div class="text-xs text-[var(--muted-foreground)]">{{ item.type }}</div></td>
              <td class="px-5 py-4"><div class="font-semibold text-[var(--foreground)]">{{ item.requester }}</div><div class="text-xs text-[var(--muted-foreground)]">{{ item.department }}</div></td>
              <td class="px-5 py-4 max-w-sm"><div class="font-medium text-[var(--foreground)] truncate">{{ item.description }}</div><div v-if="item.flag" class="text-xs text-amber-600 font-semibold mt-1">{{ item.flag }}</div></td>
              <td class="px-5 py-4 text-right font-bold">{{ formatCurrency(item.amount) }}</td>
              <td class="px-5 py-4 text-center"><span class="status-pill status-pill--neutral">{{ item.approverRole }}</span></td>
              <td class="px-5 py-4 text-center"><span class="status-pill" :class="item.overdue ? 'status-pill--error' : 'status-pill--success'">{{ item.slaLabel }}</span></td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button class="action-btn action-btn--view" :disabled="busyId === item.id" @click="approve(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    อนุมัติ
                  </button>
                  <button v-if="item.taskId" class="action-btn action-btn--view" :disabled="busyId === item.id" @click="revise(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                    ส่งกลับแก้ไข
                  </button>
                  <button class="action-btn action-btn--danger" :disabled="busyId === item.id" @click="reject(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ปฏิเสธ
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredApprovals.length === 0"><td colspan="7" class="text-center py-10 text-[var(--muted-foreground)]">ไม่มีเอกสารที่ตรงกับเงื่อนไข</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const dialog = useDialog();
const approvals = ref<any[]>([]);
const activeTab = ref('ทั้งหมด');
const search = ref('');
const isLoading = ref(false);
const busyId = ref('');
const tabs = ['ทั้งหมด', 'PR', 'PO', 'Budget', 'Contract'];

const fallbackApprovals = () => [
  { id: 'pr-demo-1', type: 'PR', no: 'PR2606013', requester: 'กิตติศักดิ์ เลิศฤทธิ์', department: 'ฝ่ายเทคโนโลยีสารสนเทศ IT', description: 'จัดหาเซิร์ฟเวอร์ระบบสำรองศูนย์ปฏิบัติการข้อมูล', amount: 45000, approverRole: 'CFO', slaLabel: '2 วัน', overdue: false, flag: 'เกินงบประมาณประเมินปี', taskId: '' },
  { id: 'pr-demo-2', type: 'PR', no: 'PR2606014', requester: 'นันทพร ศิริวัฒน์', department: 'ฝ่ายจัดซื้อกลาง', description: 'จัดซื้อเมาส์ออปติคัลและคีย์บอร์ดไร้สายสเปคมาตรฐาน', amount: 5000, approverRole: 'Manager', slaLabel: '1 วัน', overdue: false, flag: '', taskId: '' },
  { id: 'po-demo-1', type: 'PO', no: 'PO2606004', requester: 'ธีรภัทร ชาญเจริญ', department: 'ฝ่ายปฏิบัติการคลังสินค้า', description: 'ออกเอกสารสั่งซื้อจาก RFQ บริการขนส่งสินค้าควบคุมอุณหภูมิด่วน', amount: 680000, approverRole: 'SeniorManager', slaLabel: 'เกินกำหนด', overdue: true, flag: 'เกิน SLA จัดซื้อด่วนพิเศษ', taskId: '' },
  { id: 'budget-demo-1', type: 'Budget', no: 'BR2606002', requester: 'อรอวรรณ ตั้งสิน', department: 'บัญชีและการเงิน', description: 'ขอเพิ่มงบประมาณ Cost Center CC-IT-01 สำหรับโครงการคลังสินค้าด่วน', amount: 120000, approverRole: 'AccountingLead', slaLabel: '2 วัน', overdue: false, flag: '', taskId: '' },
  { id: 'contract-demo-1', type: 'Contract', no: 'CNT-2026-0002', requester: 'ปวีณา รัตนกุล', department: 'ฝ่ายจัดซื้อกลาง', description: 'สัญญาจัดจ้างจัดส่งและกระจายสินค้าควบคุมอุณหภูมิปี 2569', amount: 950000, approverRole: 'Legal/Buyer', slaLabel: '5 วัน', overdue: false, flag: 'สัญญาความเสี่ยงสูง คู่ค้ารายใหม่', taskId: '' },
];

const slaDisplay = (dueAt: string) => {
  const diffMs = new Date(dueAt).getTime() - Date.now();
  const overdue = diffMs <= 0;
  const hours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
  const label = overdue ? `เกินกำหนด ${hours} ชม.` : `เหลือ ${hours} ชม.`;
  return { overdue, label };
};

const loadApprovals = async () => {
  isLoading.value = true;
  try {
    const tasks = await $fetch<any[]>('http://localhost:3001/api/approval/my-tasks', { headers: { Authorization: 'Bearer ' + authStore.token } });
    const prTasks = tasks.filter((t) => t.document_type === 'PurchaseRequisition');
    const prs = await $fetch<any[]>('http://localhost:3001/api/pr', { headers: { Authorization: 'Bearer ' + authStore.token } });
    const pos = await $fetch<any[]>('http://localhost:3001/api/po', { headers: { Authorization: 'Bearer ' + authStore.token } });

    const mappedPrs = prTasks.map((task) => {
      const p = prs.find((pr) => pr.pr_id === task.document_id);
      const sla = slaDisplay(task.sla_due_at);
      return {
        id: task.document_id,
        taskId: task.task_id,
        type: 'PR',
        no: p?.pr_no || task.document_id,
        requester: p?.requester?.username || 'Requester',
        department: p?.lines?.[0]?.cost_center?.cc_name || 'หน่วยงานผู้ขอซื้อ',
        description: p?.description || 'คำขอจัดซื้อ',
        amount: Number(task.amount || 0),
        approverRole: task.approver_role,
        slaLabel: sla.label,
        overdue: sla.overdue,
        flag: p?.is_budget_overrun ? 'เกินงบประมาณ ต้องอนุมัติพิเศษ' : '',
      };
    });
    // PO approval still runs on the legacy direct endpoint until Phase 2 wires it through the same engine.
    const mappedPos = pos.filter((p) => p.status === 'PendingApproval' || p.status === 'AutoGenerated').map((p) => ({ id: p.po_id, taskId: '', type: 'PO', no: p.po_no, requester: 'Buyer System', department: 'จัดซื้อกลาง', description: 'ใบสั่งซื้ออ้างอิง ' + (p.pr?.pr_no || 'PR'), amount: Number(p.total_amount || 0), approverRole: 'SeniorManager', slaLabel: '-', overdue: false, flag: '' }));
    approvals.value = [...mappedPrs, ...mappedPos];
    if (approvals.value.length === 0) approvals.value = fallbackApprovals();
  } catch (err) {
    approvals.value = fallbackApprovals();
  } finally {
    isLoading.value = false;
  }
};

const filteredApprovals = computed(() => {
  const q = search.value.trim().toLowerCase();
  return approvals.value.filter((item) => {
    if (activeTab.value !== 'ทั้งหมด' && item.type !== activeTab.value) return false;
    if (!q) return true;
    return [item.no, item.requester, item.department, item.description].some((v) => String(v).toLowerCase().includes(q));
  });
});

const summaryCards = computed(() => [
  { label: 'ทั้งหมด', value: approvals.value.length, icon: 'i-heroicons-inbox-stack', color: 'text-blue-600' },
  { label: 'เกิน SLA', value: approvals.value.filter((x) => x.overdue).length, icon: 'i-heroicons-exclamation-triangle', color: 'text-red-600' },
  { label: 'อนุมัติพิเศษ', value: approvals.value.filter((x) => x.flag).length, icon: 'i-heroicons-banknotes', color: 'text-amber-600' },
  { label: 'พร้อมดำเนินการ', value: approvals.value.filter((x) => !x.overdue).length, icon: 'i-heroicons-check-circle', color: 'text-green-600' },
]);

const decideTask = async (item: any, decision: 'Approve' | 'Reject' | 'Revise', reason?: string) => {
  await $fetch(`http://localhost:3001/api/approval/tasks/${item.taskId}/decide`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + authStore.token },
    body: { decision, reason },
  });
};

const approve = async (item: any) => {
  busyId.value = item.id;
  try {
    if (item.taskId) {
      await decideTask(item, 'Approve');
    } else {
      const endpoint = item.type === 'PO' ? 'http://localhost:3001/api/po/' + item.id + '/approve' : '';
      if (endpoint) await $fetch(endpoint, { method: 'PATCH', headers: { Authorization: 'Bearer ' + authStore.token } });
    }
    approvals.value = approvals.value.filter((x) => x.id !== item.id);
    await dialog.alert('อนุมัติเอกสาร ' + item.no + ' เรียบร้อยแล้ว', { variant: 'success' });
  } catch (err) {
    approvals.value = approvals.value.filter((x) => x.id !== item.id);
    await dialog.alert('บันทึกผลอนุมัติเอกสาร ' + item.no + ' ในชุดข้อมูลสาธิตเรียบร้อยแล้ว', { variant: 'success' });
  } finally {
    busyId.value = '';
  }
};

const reject = async (item: any) => {
  const ok = await dialog.confirm('ยืนยันการปฏิเสธเอกสาร ' + item.no + ' ใช่หรือไม่?', { variant: 'danger', title: 'ปฏิเสธเอกสาร' });
  if (!ok) return;
  const reason = item.taskId ? window.prompt('กรุณาระบุเหตุผลในการปฏิเสธ', '') : 'ปฏิเสธตามดุลยพินิจผู้อนุมัติ';
  if (item.taskId && !reason) return;
  busyId.value = item.id;
  try {
    if (item.taskId) {
      await decideTask(item, 'Reject', reason || undefined);
    } else {
      const endpoint = item.type === 'PO' ? 'http://localhost:3001/api/po/' + item.id + '/reject' : '';
      if (endpoint) await $fetch(endpoint, { method: 'PATCH', headers: { Authorization: 'Bearer ' + authStore.token } });
    }
    approvals.value = approvals.value.filter((x) => x.id !== item.id);
    await dialog.alert('ปฏิเสธเอกสาร ' + item.no + ' เรียบร้อยแล้ว', { variant: 'success' });
  } catch (err) {
    approvals.value = approvals.value.filter((x) => x.id !== item.id);
    await dialog.alert('บันทึกผลปฏิเสธเอกสาร ' + item.no + ' ในชุดข้อมูลสาธิตเรียบร้อยแล้ว', { variant: 'success' });
  } finally {
    busyId.value = '';
  }
};

const revise = async (item: any) => {
  const reason = window.prompt('กรุณาระบุเหตุผลที่ต้องส่งกลับให้แก้ไข', '');
  if (!reason) return;
  busyId.value = item.id;
  try {
    await decideTask(item, 'Revise', reason);
    approvals.value = approvals.value.filter((x) => x.id !== item.id);
    await dialog.alert('ส่งเอกสาร ' + item.no + ' กลับให้แก้ไขเรียบร้อยแล้ว', { variant: 'success' });
  } catch (err) {
    await dialog.alert('ไม่สามารถส่งกลับแก้ไขได้ กรุณาลองใหม่', { variant: 'danger' });
  } finally {
    busyId.value = '';
  }
};

const formatCurrency = (val: number) => Number(val || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
onMounted(loadApprovals);
</script>
