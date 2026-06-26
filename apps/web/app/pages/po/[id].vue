<template>
  <div class="space-y-6">
    <!-- Back Navigation -->
    <div>
      <UButton 
        to="/po" 
        variant="ghost" 
        color="gray" 
        size="sm"
        class="cursor-pointer"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
        กลับไปรายการใบสั่งซื้อ
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-[var(--primary)]" />
    </div>

    <!-- PO Details Card -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left side: PO Header and Lines -->
      <div class="lg:col-span-2 space-y-6">
        <!-- PO General Info -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6">
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
            <div>
              <span class="text-xs font-semibold text-[var(--muted-foreground)] uppercase">รายละเอียดใบสั่งซื้อ</span>
              <h2 class="text-xl font-bold text-[var(--foreground)] mt-0.5">{{ po.po_no }}</h2>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">สถานะปัจจุบัน</span>
              <span 
                class="px-2.5 py-1 rounded-full text-xs font-bold inline-block mt-1"
                :class="[
                  po.status === 'VendorConfirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                  po.status === 'SentToVendor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  po.status === 'RevisionRequested' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse' :
                  'bg-slate-100 text-slate-700'
                ]"
              >
                {{ formatStatus(po.status) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="space-y-3">
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">บริษัทผู้สั่งซื้อ (Company)</span>
                <span class="font-medium text-slate-800">{{ po.company?.company_name || 'SCGJWD Logistics' }}</span>
              </div>
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">อ้างอิงใบขอซื้อ (PR)</span>
                <span class="font-bold text-[var(--primary)]">{{ po.pr?.pr_no || 'N/A' }}</span>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">วันที่ออกเอกสาร (PO Date)</span>
                <span class="font-medium text-slate-800">{{ formatDate(po.created_at) }}</span>
              </div>
              <div>
                <span class="text-xs text-[var(--muted-foreground)] block">ประวัติการแก้ไข (Revision)</span>
                <span class="font-semibold text-slate-700">แก้ไขครั้งที่ {{ po.revision_no }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PO Lines table -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
          <div class="p-6 border-b border-[var(--border)] flex justify-between items-center bg-slate-50/50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-[var(--primary)]" />
              รายการสินค้าและบริการในใบสั่งซื้อ
            </h3>
            <UButton 
              v-if="po.status === 'RevisionRequested' || po.status === 'SentToVendor'"
              color="primary" 
              size="sm" 
              class="cursor-pointer"
              @click="openRevisionDrawer"
            >
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 mr-1" />
              แก้ไขรายละเอียดใบสั่งซื้อ (Revise PO)
            </UButton>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">รายการสินค้า / บริการ</th>
                <th class="px-6 py-3 text-right">จำนวน</th>
                <th class="px-6 py-3 text-right">ราคาหน่วย (THB)</th>
                <th class="px-6 py-3 text-right">ราคารวม (THB)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="line in po.lines" :key="line.po_line_id" class="hover:bg-slate-50/20">
                <td class="px-6 py-4">
                  <div class="font-semibold text-slate-700">{{ line.item_name }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Line ID: {{ line.po_line_id }}</div>
                </td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ formatQuantity(line.quantity) }} {{ line.uom }}</td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ formatCurrency(line.unit_price) }}</td>
                <td class="px-6 py-4 text-right font-bold text-slate-800">{{ formatCurrency(line.total_price) }}</td>
              </tr>
            </tbody>
          </table>

          </div>

        <!-- Payment Plan & Milestones -->
        <div v-if="po.payment_milestones && po.payment_milestones.length > 0" class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden mt-6">
          <div class="p-6 border-b border-[var(--border)] flex justify-between items-center bg-slate-50/50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-indigo-600" />
              <span>แผนงวดชำระเงิน (Payment Milestones)</span>
            </h3>
          </div>

          <div class="divide-y divide-[var(--border)] text-sm">
            <div 
              v-for="ms in po.payment_milestones" 
              :key="ms.milestone_id" 
              class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/20"
            >
              <div>
                <div class="font-bold text-slate-800 flex items-center gap-2">
                  <span>{{ ms.title }}</span>
                  <span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-mono">{{ ms.percentage }}%</span>
                </div>
                <div class="text-xs text-slate-400 mt-1">ยอดเงิน: {{ formatCurrency(ms.amount) }} THB</div>
                <div v-if="ms.error_message" class="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                  <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
                  <span>{{ ms.error_message }} ({{ ms.error_code }})</span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                  :class="[
                    ms.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                    ms.status === 'ProcessingPayment' ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' :
                    ms.status === 'Failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  ]"
                >
                  {{ formatMilestoneStatus(ms.status) }}
                </span>

                <UButton
                  v-if="ms.status === 'Pending' || ms.status === 'Failed'"
                  @click="openOffsetDrawer(ms)"
                  size="sm"
                  color="indigo"
                  class="cursor-pointer font-bold"
                  icon="i-heroicons-paper-airplane"
                >
                  ส่งจ่ายเงิน (Pay)
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Vendor Info and Actions -->
      <div class="space-y-6">
        <!-- Vendor Info Card -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-3">
            <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-[var(--primary)]" />
            ข้อมูลคู่ค้า / Vendor Info
          </h3>
          <div class="space-y-3 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ชื่อบริษัทคู่ค้า</span>
              <span class="font-semibold text-slate-800">{{ po.vendor?.vendor_name || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">เลขประจำตัวผู้เสียภาษี</span>
              <span class="font-medium text-slate-600">{{ po.vendor?.tax_id || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Vendor Confirmation / Delivery Card -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-3">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-[var(--primary)]" />
            การยืนยันและการส่งมอบ
          </h3>
          <div class="space-y-4 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">วันที่ยืนยันส่งมอบ (Est. Delivery Date)</span>
              <span v-if="po.estimated_delivery_date" class="font-bold text-green-600 flex items-center gap-1 mt-1">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                {{ formatDateNoTime(po.estimated_delivery_date) }}
              </span>
              <span v-else class="font-medium text-slate-400 italic block mt-1">
                ยังไม่ได้รับแจ้งวันที่ส่งมอบจากผู้ขาย
              </span>
            </div>
            
            <div v-if="isCancellable" class="pt-4 border-t border-slate-100 space-y-2">
              <UButton 
                v-if="po.status === 'SentToVendor' || po.status === 'VendorConfirmed' || po.status === 'PartiallyReceived'"
                :to="`/gr-stock/create?po_id=${po.po_id}`"
                color="primary" 
                block
                icon="i-heroicons-document-check"
                class="cursor-pointer"
              >
                บันทึกตรวจรับสินค้า (GR)
              </UButton>
              <UButton 
                color="red" 
                variant="outline"
                block
                icon="i-heroicons-x-circle"
                class="cursor-pointer font-bold"
                @click="cancelPO"
              >
                ยกเลิกใบสั่งซื้อ (Cancel PO)
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PO Revision Drawer/Modal -->
    <UModal v-model="revisionOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[var(--foreground)]">
              ปรับปรุงรายละเอียดใบสั่งซื้อ {{ po.po_no }}
            </h3>
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              class="cursor-pointer"
              @click="revisionOpen = false" 
            />
          </div>
        </template>

        <div class="space-y-4 py-2 text-xs">
          <p class="text-slate-500 mb-2">เมื่อทำการบันทึก: ระบบจะอัปเดตมูลค่าใบสั่งซื้อ, ปรับเปลี่ยนสถานะกลับเป็น <b>ส่งให้ผู้ขายแล้ว (SentToVendor)</b> และผู้ขายต้องทำการยืนยันวันส่งมอบอีกครั้ง</p>
          
          <div v-for="(line, idx) in revisionLines" :key="line.po_line_id" class="border border-[var(--border)] rounded-lg p-3 space-y-3 bg-slate-50/50">
            <div class="font-bold text-slate-700">{{ line.item_name }}</div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">จำนวนที่สั่งซื้อ ({{ line.uom }})</label>
                <UInput 
                  v-model.number="line.quantity" 
                  type="number" 
                  step="1" 
                  min="1" 
                  size="sm"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">ราคาต่อหน่วย (THB)</label>
                <UInput 
                  v-model.number="line.unit_price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" size="sm" @click="revisionOpen = false">ยกเลิก</UButton>
            <UButton color="primary" size="sm" class="cursor-pointer" @click="saveRevision">
              <UIcon name="i-heroicons-check" class="w-4 h-4 mr-1" />
              บันทึกการแก้ไขและส่งใหม่
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Credit Note Offset Drawer/Modal -->
    <UModal v-model="offsetOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[var(--foreground)]">
              ยืนยันการจ่ายเงินพร้อมหักกลบ Credit Notes
            </h3>
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              class="cursor-pointer"
              @click="offsetOpen = false" 
            />
          </div>
        </template>

        <div class="space-y-4 py-2 text-xs">
          <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100 space-y-1">
            <div class="font-bold text-indigo-900">งวดงาน: {{ selectedMilestone?.title || 'ชำระเต็มจำนวน' }}</div>
            <div class="text-indigo-700">ยอดชำระขั้นต้น: {{ formatCurrency(selectedMilestone?.amount || po?.total_amount || 0) }} THB</div>
          </div>

          <div class="space-y-2">
            <div class="font-bold text-slate-700 mb-1">เลือกใบลดหนี้ (Credit Notes) ที่ต้องการหักกลบ:</div>
            
            <div v-if="creditNotes.length === 0" class="text-slate-400 italic py-2">
              ไม่พบใบลดหนี้ (Credit Notes) ที่ได้รับการอนุมัติของคู่ค้ารายนี้
            </div>
            
            <div 
              v-else 
              v-for="cn in creditNotes" 
              :key="cn.cn_dn_id"
              class="flex items-center justify-between p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer"
              @click="toggleCn(cn)"
            >
              <div class="flex items-center gap-2">
                <UCheckbox :model-value="selectedCnIds.includes(cn.cn_dn_id)" />
                <div>
                  <div class="font-bold text-slate-800">ใบลดหนี้ #{{ cn.cn_dn_id.substring(0, 8) }}</div>
                  <div class="text-[10px] text-slate-400">เหตุผล: {{ cn.reason }}</div>
                </div>
              </div>
              <div class="font-bold text-red-600">-{{ formatCurrency(cn.amount) }} THB</div>
            </div>
          </div>

          <div class="border-t pt-3 space-y-2 text-xs font-semibold text-slate-600">
            <div class="flex justify-between">
              <span>ยอดชำระขั้นต้น:</span>
              <span>{{ formatCurrency(selectedMilestone?.amount || po?.total_amount || 0) }} THB</span>
            </div>
            <div class="flex justify-between text-red-600">
              <span>หักกลบ Credit Notes:</span>
              <span>-{{ formatCurrency(totalDeduction) }} THB</span>
            </div>
            <div class="flex justify-between text-lg font-extrabold text-[var(--primary)] border-t pt-2">
              <span>ยอดเงินโอนสุทธิ (Net Payout):</span>
              <span>{{ formatCurrency(netPayout) }} THB</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" size="sm" @click="offsetOpen = false">ยกเลิก</UButton>
            <UButton 
              color="indigo" 
              size="sm" 
              class="cursor-pointer font-bold" 
              :loading="isSubmittingPayment"
              @click="confirmTriggerPayment"
            >
              <UIcon name="i-heroicons-check" class="w-4 h-4 mr-1" />
              ยืนยันสั่งจ่ายสุทธิ (Net Transfer)
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const poId = route.params.id as string;

const loading = ref(true);
const po = ref<any>(null);

const isCancellable = computed(() => {
  const invalidStatuses = ['Paid', 'FullyReceived', 'Closed', 'Cancelled', 'Rejected'];
  return po.value && !invalidStatuses.includes(po.value.status);
});

const revisionOpen = ref(false);
const revisionLines = ref<any[]>([]);

// Payment/Milestones Refs
const offsetOpen = ref(false);
const selectedMilestone = ref<any>(null);
const creditNotes = ref<any[]>([]);
const selectedCnIds = ref<string[]>([]);
const isSubmittingPayment = ref(false);

const loadPoDetails = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    po.value = res;
  } catch (err) {
    console.warn('Backend connection failed. Using mock PO details.');
    // Provide corresponding mock PO details based on ID
    if (poId === 'po_mock_2') {
      po.value = {
        po_id: 'po_mock_2',
        po_no: 'PO2606002',
        created_at: new Date(Date.now() - 86400000 * 2),
        total_amount: 28500,
        revision_no: 1,
        status: 'VendorConfirmed',
        estimated_delivery_date: new Date(Date.now() + 86400000 * 5),
        vendor: {
          vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
          tax_id: '0105561012345',
        },
        pr: {
          pr_no: 'PR2606001',
        },
        company: {
          company_name: 'บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน)',
        },
        lines: [
          {
            po_line_id: 'l_mock_201',
            item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว',
            quantity: 1,
            uom: 'เครื่อง',
            unit_price: 28500,
            total_price: 28500,
            po_id: 'po_mock_2',
            pr_line_id: '101',
          },
        ],
        payment_milestones: [
          { milestone_id: 'm1_po2', title: 'งวดที่ 1 - มัดจำ (30%)', percentage: 30, amount: 8550, status: 'Pending', error_code: null, error_message: null },
          { milestone_id: 'm2_po2', title: 'งวดที่ 2 - ส่งมอบงานส่วนที่เหลือ (70%)', percentage: 70, amount: 19950, status: 'Pending', error_code: null, error_message: null },
        ],
      };
    } else {
      po.value = {
        po_id: 'po_mock_1',
        po_no: 'PO2606001',
        created_at: new Date(Date.now() - 3600000 * 4),
        total_amount: 85500,
        revision_no: 0,
        status: 'SentToVendor',
        estimated_delivery_date: null,
        vendor: {
          vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด',
          tax_id: '0105565056789',
        },
        pr: {
          pr_no: 'PR2606002',
        },
        company: {
          company_name: 'บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน)',
        },
        lines: [
          {
            po_line_id: 'l_mock_101',
            item_name: 'เก้าอี้สำนักงานเบาะหนัง',
            quantity: 10,
            uom: 'ตัว',
            unit_price: 4800,
            total_price: 48000,
            po_id: 'po_mock_1',
            pr_line_id: '201',
          },
          {
            po_line_id: 'l_mock_102',
            item_name: 'โต๊ะทำงานเหล็ก',
            quantity: 10,
            uom: 'ตัว',
            unit_price: 3750,
            total_price: 37500,
            po_id: 'po_mock_1',
            pr_line_id: '202',
          },
        ],
        payment_milestones: [
          { milestone_id: 'm1_po1', title: 'งวดที่ 1 - มัดจำ (30%)', percentage: 30, amount: 25650, status: 'Pending', error_code: null, error_message: null },
          { milestone_id: 'm2_po1', title: 'งวดที่ 2 - ส่งมอบงานส่วนที่เหลือ (70%)', percentage: 70, amount: 59850, status: 'Pending', error_code: null, error_message: null },
        ],
      };
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPoDetails();
});

const openRevisionDrawer = () => {
  revisionLines.value = po.value.lines.map((l: any) => ({
    po_line_id: l.po_line_id,
    item_name: l.item_name,
    uom: l.uom,
    quantity: Number(l.quantity),
    unit_price: Number(l.unit_price),
  }));
  revisionOpen.value = true;
};

const saveRevision = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}/revise`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        lines: revisionLines.value.map((l) => ({
          po_line_id: l.po_line_id,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      },
    });
    po.value = res;
    revisionOpen.value = false;
  } catch (err: any) {
    console.warn('Backend PO revision failed, applying locally.');
    // Local mock revision application
    po.value.revision_no = po.value.revision_no + 1;
    po.value.status = 'SentToVendor';
    po.value.estimated_delivery_date = null;
    
    // Update lines locally
    let sum = 0;
    for (const rLine of revisionLines.value) {
      const line = po.value.lines.find((l: any) => l.po_line_id === rLine.po_line_id);
      if (line) {
        line.quantity = rLine.quantity;
        line.unit_price = rLine.unit_price;
        line.total_price = rLine.quantity * rLine.unit_price;
        sum += line.total_price;
      }
    }
    po.value.total_amount = sum;
    revisionOpen.value = false;
  }
};

const cancelPO = async () => {
  if (!confirm(`คุณต้องการยกเลิกใบสั่งซื้อ ${po.value.po_no} ใช่หรือไม่? ยอดเงินคงค้างสำรองที่ไม่ได้ตรวจรับจะถูกส่งคืนศูนย์ต้นทุน`)) {
    return;
  }
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    po.value = res;
    alert('ยกเลิกใบสั่งซื้อเรียบร้อยแล้ว!');
  } catch (err: any) {
    console.warn('Backend PO cancellation failed, applying locally.');
    po.value.status = 'Cancelled';
    alert(`[MOCK] ยกเลิกใบสั่งซื้อ ${po.value.po_no} สำเร็จ! (คืนงบจองที่เหลือเรียบร้อย)`);
  }
};

const toggleCn = (cn: any) => {
  const idx = selectedCnIds.value.indexOf(cn.cn_dn_id);
  if (idx > -1) {
    selectedCnIds.value.splice(idx, 1);
  } else {
    selectedCnIds.value.push(cn.cn_dn_id);
  }
};

const totalDeduction = computed(() => {
  return creditNotes.value
    .filter((cn) => selectedCnIds.value.includes(cn.cn_dn_id))
    .reduce((sum, cn) => sum + Number(cn.amount), 0);
});

const netPayout = computed(() => {
  const base = selectedMilestone.value ? Number(selectedMilestone.value.amount) : Number(po.value?.total_amount || 0);
  return Math.max(0, base - totalDeduction.value);
});

const openOffsetDrawer = async (milestone: any) => {
  selectedMilestone.value = milestone;
  selectedCnIds.value = [];
  
  // Load approved credit notes for this vendor
  try {
    const res = await $fetch<any[]>(`http://localhost:3001/api/payment/credit-debit-note/${po.value.vendor_id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    creditNotes.value = res.filter((cn) => cn.status === 'Approved' && cn.type === 'Credit');
  } catch (err) {
    console.warn('Failed to load credit notes, using mock data.');
    creditNotes.value = [
      { cn_dn_id: 'cn_mock_1', type: 'Credit', amount: 1500.00, reason: 'สินค้าชำรุดเสียหายในขั้นตอนขนส่ง', status: 'Approved' },
      { cn_dn_id: 'cn_mock_2', type: 'Credit', amount: 3200.00, reason: 'ปรับลดราคาปริมาตรส่วนเกิน', status: 'Approved' }
    ];
  }
  offsetOpen.value = true;
};

const confirmTriggerPayment = async () => {
  if (!po.value) return;
  isSubmittingPayment.value = true;
  try {
    const res = await $fetch<any>('http://localhost:3001/api/payment/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        po_id: poId,
        milestone_id: selectedMilestone.value?.milestone_id || undefined,
        selected_cn_ids: selectedCnIds.value,
      },
    });
    po.value = res;
    offsetOpen.value = false;
    alert('ส่งจ่ายเงินไปยังระบบ e-Payment สำเร็จ!');
  } catch (err: any) {
    console.error(err);
    // Local simulation
    if (selectedMilestone.value) {
      const ms = po.value.payment_milestones.find((m: any) => m.milestone_id === selectedMilestone.value.milestone_id);
      if (ms) {
        ms.status = 'ProcessingPayment';
      }
    }
    po.value.status = 'ProcessingPayment';
    offsetOpen.value = false;
    alert('ส่งจ่ายเงินไปยังระบบ e-Payment สำเร็จ! (Simulated)');
  } finally {
    isSubmittingPayment.value = false;
  }
};

const formatMilestoneStatus = (status: string) => {
  switch (status) {
    case 'Pending': return 'รอชำระเงิน';
    case 'ProcessingPayment': return 'กำลังโอนเงิน...';
    case 'Paid': return 'จ่ายเงินสำเร็จ';
    case 'Failed': return 'โอนเงินล้มเหลว';
    default: return status;
  }
};

const formatStatus = (status?: string) => {
  switch (status) {
    case 'SentToVendor': return 'ส่งให้ผู้ขายแล้ว';
    case 'VendorConfirmed': return 'ผู้ขายยืนยันการรับสั่งซื้อ';
    case 'RevisionRequested': return 'ขอแก้ไขรายการ';
    case 'FullyReceived': return 'รับสินค้าครบถ้วน';
    case 'Cancelled': return 'ยกเลิกแล้ว';
    case 'Rejected': return 'ปฏิเสธ';
    default: return status || '—';
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

const formatDateNoTime = (dateVal: any) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
