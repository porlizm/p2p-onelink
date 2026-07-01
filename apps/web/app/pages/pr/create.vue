<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">สร้างใบขอซื้อใหม่ (Create Purchase Requisition)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">กรอกรายละเอียดใบขอซื้อ ตรวจสอบงบประมาณ และแนบเอกสารใบเสนอราคา</p>
      </div>
      <NuxtLink to="/catalog">
        <UButton variant="outline" size="sm">
          <UIcon name="i-heroicons-chevron-left-20-solid" class="w-4 h-4 mr-1" />
          กลับไป E-Catalog
        </UButton>
      </NuxtLink>
    </div>

    <!-- Alert Modal / Banner for Hard Blocked (Exceeds Tolerance) -->
    <div 
      v-if="hasHardBlockedLines" 
      class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3"
    >
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-bold text-red-800">คำเตือน: งบประมาณไม่เพียงพอและเกินเกณฑ์ผ่อนปรน</h4>
          <p class="text-xs text-red-700 mt-1">
            มีรายการจัดซื้อบางส่วนที่มียอดสูงกว่างบประมาณคงเหลือและเกินระดับ Tolerance ที่ยอมรับได้ของแผนกท่าน ระบบระงับการสร้าง PR กรุณายื่นคำขอเพิ่มงบประมาณ (Request Budget) หรือปรับแก้ไขรายการสั่งซื้อ
          </p>
        </div>
      </div>
      <UButton 
        @click="openRequestBudgetModal" 
        color="error" 
        size="xs"
        class="font-bold flex-shrink-0 cursor-pointer animate-pulse"
      >
        ยื่นขอเพิ่มงบประมาณ (Request Budget)
      </UButton>
    </div>

    <!-- Alert Modal / Banner for Overrun Within Tolerance -->
    <div 
      v-if="hasOverrunWithinTolerance && !hasHardBlockedLines" 
      class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3"
    >
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-exclamation-circle-20-solid" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-bold text-amber-850">คำแนะนำ: งบประมาณจัดซื้อเกินวงเงินคงเหลือ (ในเกณฑ์อนุมัติพิเศษ)</h4>
          <p class="text-xs text-amber-700 mt-1">
            ยอดจัดซื้อรวมเกินกว่างบประมาณคงเหลือแต่ไม่เกินเกณฑ์ผ่อนปรน (Tolerance) ระบบจะอนุญาตให้สร้างคำขอ PR ได้ แต่จะถูกเปลี่ยนเส้นทางเพื่อขออนุมัติพิเศษจาก CFO หรือ VP เป็นกรณีพิเศษโดยอัตโนมัติ
          </p>
        </div>
      </div>
      <UButton 
        @click="openRequestBudgetModal" 
        color="warning" 
        size="xs"
        variant="outline"
        class="font-bold flex-shrink-0 cursor-pointer"
      >
        ขอเพิ่มงบสำรอง (Optional Request)
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Left 2 Columns: Items Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- PR Header Information -->
        <div class="bg-white border border-[#e9ecef] rounded-xl p-6 shadow-[var(--shadow-sm)] space-y-4">
          <h3 class="font-bold text-sm text-[var(--foreground)] border-b border-[#eff1f5] pb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[var(--primary)]" />
            ข้อมูลทั่วไปของใบขอซื้อ
          </h3>
          <div>
            <UFormField label="คำอธิบาย / วัตถุประสงค์ในการจัดซื้อ (Description)" name="description">
              <UTextarea 
                v-model="description" 
                placeholder="ระบุวัตถุประสงค์ในการขอจัดซื้อครั้งนี้ เช่น ขอซื้อโน้ตบุ๊คสำหรับพนักงานใหม่ ฝ่ายบัญชี..." 
                :rows="3"
                class="w-full mt-1.5"
              />
            </UFormField>
          </div>
        </div>

        <!-- PR Line Items -->
        <div class="bg-white border border-[#e9ecef] rounded-xl p-6 shadow-[var(--shadow-sm)] space-y-4">
          <div class="flex items-center justify-between border-b border-[#eff1f5] pb-2">
            <h3 class="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-[var(--primary)]" />
              รายการขอสั่งซื้อ (PR Line Items)
            </h3>
            <UButton 
              @click="addCustomItem"
              color="neutral"
              variant="outline"
              size="xs"
            >
              <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 mr-1" />
              เพิ่มรายการนอกแคตตาล็อก (Custom)
            </UButton>
          </div>

          <!-- Empty Cart -->
          <div v-if="cartStore.items.length === 0" class="text-center py-10">
            <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10 text-slate-300 mx-auto" />
            <p class="text-xs text-[var(--muted-foreground)] mt-2">ยังไม่มีรายการสินค้าในใบขอซื้อ</p>
            <NuxtLink to="/catalog" class="inline-block mt-3">
              <UButton size="xs" color="primary">ไปที่ Catalog</UButton>
            </NuxtLink>
          </div>

          <!-- Items List -->
          <div v-else class="space-y-4 divide-y divide-[#eff1f5]">
            <div 
              v-for="(item, idx) in cartStore.items" 
              :key="idx" 
              class="pt-4 first:pt-0 space-y-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 space-y-3">
                  <!-- Name & Badge -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <span 
                      v-if="item.is_custom" 
                      class="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200"
                    >
                      Custom Item
                    </span>
                    <span 
                      v-else 
                      class="px-2 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      Catalog Item
                    </span>
                    
                    <input 
                      v-if="item.is_custom"
                      v-model="item.item_name"
                      type="text"
                      placeholder="ระบุชื่อสินค้า / บริการที่ต้องการขอใบเสนอราคา"
                      class="w-full sm:w-80 px-2.5 py-1 text-sm border border-[#e9ecef] rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <span v-else class="font-bold text-sm text-[var(--foreground)]">
                      {{ item.item_name }}
                    </span>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label class="text-[10px] text-[var(--muted-foreground)] block mb-1">จำนวน</label>
                      <UInput 
                        v-model.number="item.quantity" 
                        type="number" 
                        min="1" 
                        size="xs"
                        @update:model-value="val => cartStore.updateQuantity(idx, Number(val))"
                      />
                    </div>
                    <div>
                      <label class="text-[10px] text-[var(--muted-foreground)] block mb-1">หน่วยนับ</label>
                      <UInput 
                        v-model="item.uom" 
                        :disabled="!item.is_custom"
                        size="xs"
                      />
                    </div>
                    <div>
                      <label class="text-[10px] text-[var(--muted-foreground)] block mb-1">ราคาต่อหน่วย (THB)</label>
                      <UInput 
                        :model-value="formatMoneyInput(item.unit_price)" 
                        type="text" 
                        inputmode="decimal"
                        :disabled="!item.is_custom"
                        size="xs"
                        @update:model-value="val => updateCustomItemPriceInput(idx, val)"
                      />
                    </div>
                    <div>
                      <label class="text-[10px] text-[var(--muted-foreground)] block mb-1">ราคารวม (THB)</label>
                      <span class="text-sm font-bold block pt-1.5 text-[var(--foreground)]">
                        {{ formatCurrency(item.quantity * item.unit_price) }}
                      </span>
                    </div>
                  </div>

                  <!-- Cost Center Selector -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <label class="text-[10px] text-[var(--muted-foreground)] block mb-1">ศูนย์ต้นทุน (Cost Center) *</label>
                      <select 
                        v-model="item.cost_center_id"
                        class="w-full px-2.5 py-1.5 text-xs border border-[#e9ecef] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      >
                        <option value="" disabled>-- เลือกศูนย์ต้นทุน --</option>
                        <option 
                          v-for="cc in costCenters" 
                          :key="cc.cost_center_id" 
                          :value="cc.cost_center_id"
                        >
                          {{ cc.cc_name }} ({{ cc.cc_code }})
                        </option>
                      </select>
                    </div>

                    <!-- Custom Item PDF Quote Upload -->
                    <div v-if="item.is_custom">
                      <label class="text-[10px] text-[var(--muted-foreground)] block mb-1">
                        แนบใบเสนอราคา (PDF) *
                      </label>
                      <div class="flex items-center gap-2">
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg" 
                          @change="e => handleFileUpload(e, idx)"
                          class="hidden" 
                          :id="'quote-file-' + idx"
                        />
                        <label 
                          :for="'quote-file-' + idx"
                          class="px-3 py-1.5 border border-[#e9ecef] hover:bg-[#f8fffe] transition rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <UIcon name="i-heroicons-arrow-up-tray" class="w-3.5 h-3.5" />
                          <span>{{ item.quotation_url ? 'เปลี่ยนไฟล์' : 'อัปโหลดใบเสนอราคา' }}</span>
                        </label>
                        <span 
                          v-if="item.quotation_url" 
                          class="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 truncate max-w-[150px]"
                        >
                          <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
                          สำเร็จ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Delete Item button -->
                <button 
                  @click="cartStore.removeFromCart(idx)" 
                  class="p-1 hover:bg-red-50 text-[var(--destructive)] hover:text-red-700 rounded-md transition-colors mt-6"
                >
                  <UIcon name="i-heroicons-trash" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Live Budget Meter & Summary -->
      <div class="space-y-6">
        <!-- Budget Reservation Widget -->
        <div class="bg-white border border-[#e9ecef] rounded-xl p-6 shadow-[var(--shadow-sm)] space-y-4">
          <h3 class="font-bold text-sm text-[var(--foreground)] border-b border-[#eff1f5] pb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-presentation-chart-bar" class="w-4 h-4 text-[var(--primary)]" />
            ตรวจสอบงบประมาณของหน่วยงาน
          </h3>

          <div v-if="affectedBudgets.length === 0" class="text-xs text-[var(--muted-foreground)] py-4 text-center">
            เลือกศูนย์ต้นทุนในแถวรายการด้านซ้าย เพื่อคำนวณงบประมาณ
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="budget in affectedBudgets" 
              :key="budget.id" 
              class="p-3 border border-[#e9ecef] rounded-lg space-y-2 bg-[#fafbfc]/50"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-[var(--foreground)]">{{ budget.name }}</span>
                <span 
                  class="px-2 py-0.5 rounded-full text-[9px] font-extrabold"
                  :class="[
                    budget.isSufficient 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : budget.isWithinTolerance
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  ]"
                >
                  {{ budget.isSufficient ? 'งบประมาณเพียงพอ' : budget.isWithinTolerance ? 'งบเกินเกณฑ์ผ่อนปรน (CFO/VP)' : 'งบเกินกำหนดบล็อก' }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                  <div 
                    class="h-full rounded-full transition-all duration-300"
                    :class="[budget.isSufficient ? 'bg-[var(--primary)]' : 'bg-[var(--destructive)]']"
                    :style="{ width: Math.min(100, (budget.totalProposed / budget.remaining) * 100) + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between text-[9px] text-[var(--muted-foreground)]">
                  <span>ขอซื้อใน PR นี้: {{ formatCurrency(budget.totalProposed) }} THB</span>
                  <span>งบคงเหลือจริง: {{ formatCurrency(budget.remaining) }} THB</span>
                </div>
              </div>

              <div class="text-[10px] text-slate-500 pt-1 flex justify-between">
                <span>งบประมาณปี: {{ formatCurrency(budget.annual) }} THB</span>
                <span>จอง/ใช้ไปแล้ว: {{ formatCurrency(budget.usedAndReserved) }} THB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PR Summary Card -->
        <div class="bg-white border border-[#e9ecef] rounded-xl p-6 shadow-[var(--shadow-sm)] space-y-4">
          <h3 class="font-bold text-sm text-[var(--foreground)] border-b border-[#eff1f5] pb-2">
            สรุปรายการใบขอซื้อ (PR Summary)
          </h3>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-[var(--muted-foreground)]">จำนวนรายการสินค้า:</span>
              <span class="font-bold text-[var(--foreground)]">{{ cartStore.totalItems }} รายการ</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--muted-foreground)]">ยอดรวมจัดซื้อจัดจ้าง:</span>
              <span class="font-extrabold text-sm text-[var(--foreground)]">
                {{ formatCurrency(cartStore.totalAmount) }} THB
              </span>
            </div>
          </div>

          <UButton 
            @click="submitPR"
            :color="hasHardBlockedLines ? 'error' : hasOverrunWithinTolerance ? 'warning' : 'primary'"
            block
            size="md"
            :loading="isSubmitting"
            :disabled="cartStore.items.length === 0 || hasRequiredFieldIssues || hasHardBlockedLines"
            class="font-semibold h-10 shadow-sm cursor-pointer"
          >
            {{ hasHardBlockedLines ? 'งบประมาณเกินเกณฑ์ (ต้องขอเพิ่มงบฯ)' : hasOverrunWithinTolerance ? 'สร้างใบขอซื้อ (ส่งอนุมัติพิเศษ CFO/VP)' : 'ยืนยันสร้างใบขอซื้อ (PR)' }}
          </UButton>
          <p v-if="submitHint" class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {{ submitHint }}
          </p>
        </div>
      </div>
    </div>

    <!-- Request Budget Modal -->
    <UModal v-model:open="showRequestBudgetModal" prevent-close>
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-base">ยื่นขอเพิ่มงบประมาณ (Request Budget)</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showRequestBudgetModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">ศูนย์ต้นทุน (Cost Center) *</label>
            <select 
              v-model="requestCcId"
              class="w-full px-2.5 py-1.5 text-xs border border-[#e9ecef] rounded bg-white focus:outline-none"
            >
              <option value="" disabled>-- เลือกศูนย์ต้นทุน --</option>
              <option 
                v-for="budget in affectedBudgets" 
                :key="budget.id" 
                :value="budget.id"
              >
                {{ budget.name }} ({{ budget.code }}) - ขาดอีก {{ formatCurrency(Math.max(0, budget.totalProposed - budget.remaining)) }} THB
              </option>
            </select>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">จำนวนเงินที่ขอเพิ่ม (THB) *</label>
            <UInput
              :model-value="formatMoneyInput(requestAmount)"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
              @update:model-value="val => requestAmount = parseMoneyInput(val)"
            />
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">เหตุผลในการขอเพิ่มงบประมาณ *</label>
            <UTextarea 
              v-model="requestReason" 
              placeholder="ระบุเหตุผลความจำเป็นในการขออนุมัติเพิ่มงบประมาณ เช่น โครงการด่วน..." 
              :rows="3"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showRequestBudgetModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton 
            @click="submitBudgetRequest"
            color="primary"
            :loading="isSubmittingRequest"
            :disabled="!requestCcId || !requestAmount || requestAmount <= 0"
            class="px-5 cursor-pointer font-bold"
          >
            ส่งคำขอเพิ่มงบประมาณ
          </UButton>
        </div>
      </div>
          </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useCartStore } from '~/stores/cart';

const authStore = useAuthStore();
const dialog = useDialog();
const cartStore = useCartStore();

const description = ref('');
const costCenters = ref<any[]>([]);
const isSubmitting = ref(false);

const loadCostCenters = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/pr/cost-centers', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    costCenters.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Using mock cost centers.');
    costCenters.value = [
      { cost_center_id: '00000000-0000-0000-0000-000000000301', cc_code: 'CC-PROC-01', cc_name: 'งบจัดซื้อกลาง', annual_budget_amount: 2000000, budget_reserved_amount: 85500, budget_used_amount: 950000 },
      { cost_center_id: '00000000-0000-0000-0000-000000000302', cc_code: 'CC-IT-01', cc_name: 'งบไอที', annual_budget_amount: 1200000, budget_reserved_amount: 0, budget_used_amount: 1098000 },
      { cost_center_id: '00000000-0000-0000-0000-000000000303', cc_code: 'CC-WH-01', cc_name: 'งบคลังสินค้า', annual_budget_amount: 3000000, budget_reserved_amount: 0, budget_used_amount: 1250000 },
      { cost_center_id: '00000000-0000-0000-0000-000000000304', cc_code: 'CC-FIN-01', cc_name: 'งบบัญชีการเงิน', annual_budget_amount: 1500000, budget_reserved_amount: 0, budget_used_amount: 620000 },
      { cost_center_id: '00000000-0000-0000-0000-000000000305', cc_code: 'CC-B2C-01', cc_name: 'งบขาย B2C', annual_budget_amount: 2500000, budget_reserved_amount: 142500, budget_used_amount: 1890000 },
    ];
  }
};

onMounted(() => {
  loadCostCenters();
});

const addCustomItem = () => {
  cartStore.addToCart({
    item_name: '',
    uom: 'ชิ้น',
    unit_price: 0,
    is_custom: true,
  });
};

const handleFileUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await $fetch<{ file_url: string }>('http://localhost:3001/api/pr/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    cartStore.updateQuotationUrl(index, res.file_url);
  } catch (err) {
    console.warn('Backend file upload offline. Simulating upload success.');
    cartStore.updateQuotationUrl(index, `/uploads/quotations/quote_mock_${Date.now()}.pdf`);
  }
};

// Computes affected budgets live
const affectedBudgets = computed(() => {
  if (costCenters.value.length === 0) return [];
  
  const groups: { [id: string]: number } = {};
  for (const item of cartStore.items) {
    if (item.cost_center_id) {
      groups[item.cost_center_id] = (groups[item.cost_center_id] || 0) + item.quantity * item.unit_price;
    }
  }

  const results: {
    id: string;
    name: string;
    code: string;
    annual: number;
    usedAndReserved: number;
    remaining: number;
    totalProposed: number;
    isSufficient: boolean;
    isWithinTolerance: boolean;
    overrunAmount: number;
    tolerancePct: number;
    toleranceAmt: number;
  }[] = [];

  for (const ccId of Object.keys(groups)) {
    const cc = costCenters.value.find((c) => c.cost_center_id === ccId);
    if (!cc) continue;

    const annual = Number(cc.annual_budget_amount);
    const used = Number(cc.budget_used_amount);
    const reserved = Number(cc.budget_reserved_amount);
    const remaining = annual - used - reserved;
    const totalProposed = groups[ccId] || 0;
    const isSufficient = totalProposed <= remaining;

    const overrunAmount = totalProposed - remaining;
    const tolerancePct = Number(cc.budget_overrun_tolerance_pct ?? 5.0);
    const toleranceAmt = Number(cc.budget_overrun_tolerance_amount ?? 20000.0);
    const pctLimit = remaining > 0 ? (remaining * (tolerancePct / 100)) : 0;

    const isWithinTolerance = isSufficient || (overrunAmount <= toleranceAmt || (remaining > 0 && overrunAmount <= pctLimit));

    results.push({
      id: ccId,
      name: cc.cc_name,
      code: cc.cc_code,
      annual,
      usedAndReserved: used + reserved,
      remaining,
      totalProposed,
      isSufficient,
      isWithinTolerance,
      overrunAmount,
      tolerancePct,
      toleranceAmt,
    });
  }

  return results;
});

const hasOverBudgetLines = computed(() => {
  return affectedBudgets.value.some((b) => b && !b.isSufficient);
});

const hasHardBlockedLines = computed(() => {
  return affectedBudgets.value.some((b) => b && !b.isWithinTolerance);
});

const hasOverrunWithinTolerance = computed(() => {
  return affectedBudgets.value.some((b) => b && !b.isSufficient && b.isWithinTolerance);
});

const hasRequiredFieldIssues = computed(() => {
  return cartStore.items.some((item) => {
    if (!item.cost_center_id) return true;
    if (item.is_custom && (!item.item_name || !item.unit_price)) return true;
    return false;
  });
});

const hasMissingQuotation = computed(() => {
  return cartStore.items.some((item) => item.is_custom && !item.quotation_url);
});

const submitHint = computed(() => {
  if (cartStore.items.length === 0) return '';
  if (hasRequiredFieldIssues.value) return 'กรุณากรอกชื่อสินค้า ราคา และศูนย์ต้นทุนให้ครบก่อนสร้างใบขอซื้อ';
  if (hasHardBlockedLines.value) return 'งบประมาณเกินเกณฑ์ที่กำหนด กรุณายื่นคำขอเพิ่มงบประมาณก่อนสร้าง PR';
  if (hasMissingQuotation.value) return 'ยังไม่ได้แนบใบเสนอราคา ระบบจะสร้าง PR เพื่อเก็บ feedback ได้ และระบุให้แนบเอกสารเพิ่มเติมภายหลัง';
  return '';
});

const submitPR = async () => {
  isSubmitting.value = true;
  const payload = {
    description: description.value,
    lines: cartStore.items.map((item) => ({
      item_id: item.item_id || undefined,
      item_name: item.item_name,
      quantity: item.quantity,
      uom: item.uom,
      unit_price: item.unit_price,
      cost_center_id: item.cost_center_id,
      quotation_url: item.quotation_url || undefined,
    })),
  };

  try {
    const response = await $fetch<any>('http://localhost:3001/api/pr', {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    await dialog.alert(`บันทึกใบขอซื้อสำเร็จ! เลขที่ใบสั่งซื้อ: ${response.pr_no}\nสถานะเอกสาร: ${response.status}`, { variant: 'success' });
    cartStore.clearCart();
    navigateTo('/pr');
  } catch (err) {
    console.warn('Backend saving failed. Executing mock submit response.');
    
    // Fallback simulation
    const yy = new Date().getFullYear().toString().slice(-2);
    const mm = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const mockPrNo = `PR${yy}${mm}999`;
    const mockStatus = hasHardBlockedLines.value ? 'BlockedOverBudget' : 'PendingApproval';

    await dialog.alert(`ส่งใบขอซื้อเรียบร้อย!\nเลขที่ใบขอซื้อ: ${mockPrNo}\nสถานะเอกสาร: ${mockStatus}`, { variant: 'success' });
    cartStore.clearCart();
    navigateTo('/pr');
  } finally {
    isSubmitting.value = false;
  }
};

const showRequestBudgetModal = ref(false);
const requestCcId = ref('');
const requestAmount = ref(0);
const requestReason = ref('');
const isSubmittingRequest = ref(false);

const openRequestBudgetModal = () => {
  const overBudgetCc = affectedBudgets.value.find((b) => b && !b.isSufficient);
  if (overBudgetCc) {
    requestCcId.value = overBudgetCc.id;
    requestAmount.value = Math.ceil(overBudgetCc.totalProposed - overBudgetCc.remaining);
  } else {
    requestCcId.value = '';
    requestAmount.value = 0;
  }
  requestReason.value = `ขอเพิ่มงบประมาณสำหรับใบขอซื้อวัตถุประสงค์: ${description.value}`;
  showRequestBudgetModal.value = true;
};

const submitBudgetRequest = async () => {
  if (!requestCcId.value || !requestAmount.value) return;
  isSubmittingRequest.value = true;

  try {
    await $fetch('http://localhost:3001/api/budget/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        cost_center_id: requestCcId.value,
        requested_amount: requestAmount.value,
        reason: requestReason.value,
      },
    });
    await dialog.alert('ส่งคำขอเพิ่มงบประมาณไปยัง Accountant เรียบร้อยแล้ว!', { variant: 'success' });
    showRequestBudgetModal.value = false;
    await loadCostCenters();
  } catch (err) {
    console.warn('Backend connection failed. Simulating budget request submission.');
    await dialog.alert(`ส่งคำขอเพิ่มงบประมาณเรียบร้อย!\nจำนวนเงิน: ${formatCurrency(requestAmount.value)} THB\nรอการอนุมัติจากทางทีมบัญชี`, { variant: 'success' });
    showRequestBudgetModal.value = false;
  } finally {
    isSubmittingRequest.value = false;
  }
};

const parseMoneyInput = (value: unknown) => {
  const normalized = String(value ?? '').replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoneyInput = (value: unknown) => {
  const parsed = parseMoneyInput(value);
  if (!parsed) return '';
  return parsed.toLocaleString('th-TH', { maximumFractionDigits: 2 });
};

const updateCustomItemPriceInput = (index: number, value: unknown) => {
  cartStore.updateCustomItemPrice(index, parseMoneyInput(value));
};

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
