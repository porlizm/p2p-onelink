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
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ line.quantity }} {{ line.uom }}</td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ formatCurrency(line.unit_price) }}</td>
                <td class="px-6 py-4 text-right font-bold text-slate-800">{{ formatCurrency(line.total_price) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="p-6 bg-slate-50/50 border-t border-[var(--border)] flex justify-between items-center">
            <span class="text-sm font-semibold text-slate-500">มูลค่ารวมทั้งสิ้น (Grand Total):</span>
            <span class="text-lg font-extrabold text-[var(--primary)]">{{ formatCurrency(po.total_amount) }} THB</span>
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
                  step="0.01" 
                  min="0.01" 
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const poId = route.params.id as string;

const loading = ref(true);
const po = ref<any>(null);

const revisionOpen = ref(false);
const revisionLines = ref<any[]>([]);

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

const formatStatus = (status?: string) => {
  switch (status) {
    case 'SentToVendor': return 'ส่งให้ผู้ขายแล้ว';
    case 'VendorConfirmed': return 'ผู้ขายยืนยันการรับสั่งซื้อ';
    case 'RevisionRequested': return 'ขอแก้ไขรายการ';
    case 'FullyReceived': return 'รับสินค้าครบถ้วน';
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

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
