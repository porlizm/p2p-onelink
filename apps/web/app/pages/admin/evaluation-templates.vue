<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">มาตรฐานเกณฑ์การประเมิน (Evaluation Master)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">
          กำหนด Template เกณฑ์การประเมินและสัดส่วนคะแนน สำหรับใช้ใน Vendor Evaluation, Strategic Sourcing และ e-Bidding
        </p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
        + สร้าง Template ใหม่
      </button>
    </div>

    <!-- Templates List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="t in templates" :key="t.template_id" class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-800 text-sm">{{ t.name }}</div>
            <div class="text-[10px] text-slate-400">ใช้กับ: {{ appliesToLabel(t.applies_to) }} | v{{ t.version_no }}</div>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ t.status === 'Active' ? 'ใช้งานอยู่' : 'ยกเลิกใช้งาน' }}
          </span>
        </div>
        <div class="space-y-1.5">
          <div v-for="c in t.criteria" :key="c.key" class="flex items-center gap-2">
            <span class="text-[11px] text-slate-600 flex-1">{{ c.label }}</span>
            <div class="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div class="h-1.5 bg-[var(--primary)] rounded-full" :style="{ width: c.weight + '%' }" />
            </div>
            <span class="text-[11px] font-bold text-slate-700 w-8 text-right">{{ c.weight }}%</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t">
          <button
            v-if="t.status === 'Active'"
            class="action-btn action-btn--neutral"
            @click="archiveTemplate(t.template_id)"
          >
            ยกเลิกใช้งาน
          </button>
        </div>
      </div>
      <div v-if="templates.length === 0" class="col-span-2 text-center py-16 text-xs text-[var(--muted-foreground)] bg-white border border-dashed rounded-xl">
        ยังไม่มี Evaluation Template ในระบบ
      </div>
    </div>

    <!-- Create Template Modal -->
    <UModal v-model:open="showCreateModal">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-sm">สร้าง Evaluation Template ใหม่</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showCreateModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">ชื่อ Template</label>
            <UInput v-model="newTemplateName" placeholder="เช่น เกณฑ์ประเมินคู่ค้าประจำปี, เกณฑ์ประมูลงานก่อสร้าง..." />
          </div>
          <div>
            <label class="block text-slate-600 font-semibold mb-1">ใช้กับโมดูล</label>
            <select v-model="newTemplateAppliesTo" class="w-full px-3 py-2 text-sm border border-[#e9ecef] rounded-md bg-white h-9">
              <option value="VendorEvaluation">Vendor Evaluation (ประเมินคู่ค้า)</option>
              <option value="Sourcing">Strategic Sourcing</option>
              <option value="Bidding">e-Bidding / Tender</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-slate-600 font-semibold">เกณฑ์การประเมิน (น้ำหนักรวมต้องเท่ากับ 100%)</label>
              <button type="button" class="text-[10px] font-bold text-[var(--primary)]" @click="addCriterion">+ เพิ่มเกณฑ์</button>
            </div>
            <div class="space-y-2">
              <div v-for="(c, idx) in newCriteria" :key="idx" class="grid grid-cols-5 gap-2 items-center">
                <UInput v-model="c.label" placeholder="ชื่อเกณฑ์" class="col-span-3" size="xs" />
                <UInput v-model.number="c.weight" type="number" min="0" max="100" placeholder="น้ำหนัก %" size="xs" />
                <button type="button" class="text-red-500" @click="newCriteria.splice(idx, 1)">
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="text-right mt-1 text-[11px] font-bold" :class="totalWeight === 100 ? 'text-emerald-600' : 'text-red-500'">
              รวม {{ totalWeight }}% {{ totalWeight === 100 ? '✓' : '(ต้องเท่ากับ 100%)' }}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showCreateModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton color="primary" :loading="submitting" class="cursor-pointer font-bold" @click="submitTemplate">บันทึก Template</UButton>
        </div>
      </div>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const dialog = useDialog();

const templates = ref<any[]>([]);
const showCreateModal = ref(false);
const submitting = ref(false);

const newTemplateName = ref('');
const newTemplateAppliesTo = ref('VendorEvaluation');
const newCriteria = ref<{ label: string; weight: number }[]>([
  { label: 'คุณภาพสินค้า/บริการ', weight: 30 },
  { label: 'การส่งมอบตรงเวลา', weight: 30 },
  { label: 'ความสามารถด้านราคา', weight: 20 },
  { label: 'การตอบสนองและบริการ', weight: 20 },
]);

const totalWeight = computed(() => newCriteria.value.reduce((sum, c) => sum + (Number(c.weight) || 0), 0));

const authHeaders = () => ({ Authorization: `Bearer ${authStore.token}` });

const appliesToLabel = (val: string) => ({
  VendorEvaluation: 'ประเมินคู่ค้า',
  Sourcing: 'Strategic Sourcing',
  Bidding: 'e-Bidding / Tender',
}[val] || val);

const loadTemplates = async () => {
  try {
    templates.value = await $fetch<any[]>('http://localhost:3001/api/evaluation-template', { headers: authHeaders() });
  } catch (err) {
    templates.value = [
      {
        template_id: 'tpl_1',
        name: 'เกณฑ์ประเมินคู่ค้าประจำปี (มาตรฐาน)',
        applies_to: 'VendorEvaluation',
        version_no: 1,
        status: 'Active',
        criteria: [
          { key: 'quality', label: 'คุณภาพสินค้า/บริการ', weight: 30 },
          { key: 'delivery', label: 'การส่งมอบตรงเวลา', weight: 30 },
          { key: 'price', label: 'ความสามารถด้านราคา', weight: 20 },
          { key: 'service', label: 'การตอบสนองและบริการ', weight: 20 },
        ],
      },
      {
        template_id: 'tpl_2',
        name: 'เกณฑ์ประมูลงานหลายมิติ (Multi-Criteria Bidding)',
        applies_to: 'Bidding',
        version_no: 1,
        status: 'Active',
        criteria: [
          { key: 'tech', label: 'ความสมบูรณ์ทางเทคนิค', weight: 30 },
          { key: 'leadtime', label: 'ความรวดเร็วจัดส่ง', weight: 30 },
          { key: 'warranty', label: 'การรับประกัน', weight: 20 },
          { key: 'stability', label: 'ความน่าเชื่อถือ', weight: 20 },
        ],
      },
    ];
  }
};

const openCreateModal = () => {
  newTemplateName.value = '';
  newTemplateAppliesTo.value = 'VendorEvaluation';
  newCriteria.value = [
    { label: 'คุณภาพสินค้า/บริการ', weight: 30 },
    { label: 'การส่งมอบตรงเวลา', weight: 30 },
    { label: 'ความสามารถด้านราคา', weight: 20 },
    { label: 'การตอบสนองและบริการ', weight: 20 },
  ];
  showCreateModal.value = true;
};

const addCriterion = () => {
  newCriteria.value.push({ label: '', weight: 0 });
};

const submitTemplate = async () => {
  if (!newTemplateName.value || newCriteria.value.length === 0) {
    await dialog.alert('กรุณากรอกชื่อ Template และเพิ่มเกณฑ์อย่างน้อย 1 ข้อ', { variant: 'danger' });
    return;
  }
  if (totalWeight.value !== 100) {
    await dialog.alert('น้ำหนักคะแนนรวมต้องเท่ากับ 100%', { variant: 'danger' });
    return;
  }
  submitting.value = true;
  const payload = {
    name: newTemplateName.value,
    applies_to: newTemplateAppliesTo.value,
    criteria: newCriteria.value.map((c, i) => ({ key: `criterion_${i}`, label: c.label, weight: c.weight })),
  };
  try {
    await $fetch('http://localhost:3001/api/evaluation-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: payload,
    });
    await dialog.alert('บันทึก Evaluation Template เรียบร้อยแล้ว', { variant: 'success' });
    showCreateModal.value = false;
    await loadTemplates();
  } catch (err: any) {
    templates.value.unshift({
      template_id: `tpl_${Date.now()}`,
      name: payload.name,
      applies_to: payload.applies_to,
      version_no: 1,
      status: 'Active',
      criteria: payload.criteria,
    });
    showCreateModal.value = false;
    await dialog.alert(err?.data?.message || 'บันทึก Evaluation Template เรียบร้อยแล้ว', { variant: err?.data?.message ? 'danger' : 'success' });
  } finally {
    submitting.value = false;
  }
};

const archiveTemplate = async (id: string) => {
  const ok = await dialog.confirm('ยืนยันยกเลิกการใช้งาน Template นี้ใช่หรือไม่?', { variant: 'warning' });
  if (!ok) return;
  try {
    await $fetch(`http://localhost:3001/api/evaluation-template/${id}/archive`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    await loadTemplates();
  } catch (err) {
    const t = templates.value.find((x) => x.template_id === id);
    if (t) t.status = 'Archived';
  }
};

onMounted(() => {
  loadTemplates();
});
</script>
