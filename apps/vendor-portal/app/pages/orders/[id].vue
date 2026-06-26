<template>
  <div class="space-y-6">
    <!-- Back Navigation -->
    <div>
      <UButton 
        to="/orders" 
        variant="ghost" 
        color="gray" 
        size="sm"
        class="cursor-pointer"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
        กลับไปรายการใบสั่งซื้อ
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Details View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left side: Order header and lines -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Header Info -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6">
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
            <div>
              <span class="text-xs font-semibold text-[var(--muted-foreground)] uppercase">รายละเอียดคำสั่งซื้อ</span>
              <h2 class="text-xl font-bold text-[var(--foreground)] mt-0.5">{{ order.po_no }}</h2>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">สถานะเอกสาร</span>
              <span 
                class="px-2.5 py-1 rounded-full text-xs font-bold inline-block mt-1"
                :class="[
                  order.status === 'VendorConfirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                  order.status === 'SentToVendor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  order.status === 'RevisionRequested' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  'bg-slate-100 text-slate-700'
                ]"
              >
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">ลูกค้า (Company)</span>
              <span class="font-semibold text-slate-800">{{ order.company?.company_name || 'SCGJWD Logistics' }}</span>
            </div>
            <div>
              <span class="text-xs text-[var(--muted-foreground)] block">วันที่สั่งซื้อ (Order Date)</span>
              <span class="font-medium text-slate-700">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="mt-2">
              <span class="text-xs text-[var(--muted-foreground)] block">ครั้งที่ส่งคำสั่งซื้อ (Revision No.)</span>
              <span class="font-semibold text-slate-700">คำสั่งซื้อปรับปรุงครั้งที่ {{ order.revision_no }}</span>
            </div>
            <div v-if="order.estimated_delivery_date" class="mt-2">
              <span class="text-xs text-[var(--muted-foreground)] block">วันส่งมอบคาดการณ์ที่ผู้ขายยืนยัน</span>
              <span class="font-bold text-green-600">{{ formatDateNoTime(order.estimated_delivery_date) }}</span>
            </div>
          </div>
        </div>

        <!-- Lines -->
        <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
          <div class="p-6 border-b border-[var(--border)] flex items-center gap-2 bg-slate-50/50">
            <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-[var(--primary)]" />
            <h3 class="font-bold text-slate-800">รายการสินค้า / บริการที่ต้องการ</h3>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <th class="px-6 py-3">รายการสินค้า / บริการ</th>
                <th class="px-6 py-3 text-right">จำนวน</th>
                <th class="px-6 py-3 text-right">ราคาต่อหน่วย (THB)</th>
                <th class="px-6 py-3 text-right">รวมเป็นเงิน (THB)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] text-sm">
              <tr v-for="line in order.lines" :key="line.po_line_id" class="hover:bg-slate-50/20">
                <td class="px-6 py-4 font-semibold text-slate-700">{{ line.item_name }}</td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ formatQuantity(line.quantity) }} {{ line.uom }}</td>
                <td class="px-6 py-4 text-right font-medium text-slate-600">{{ formatCurrency(line.unit_price) }}</td>
                <td class="px-6 py-4 text-right font-bold text-slate-800">{{ formatCurrency(line.total_price) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="p-6 bg-slate-50/50 border-t border-[var(--border)] flex justify-between items-center">
            <span class="text-sm font-semibold text-slate-500">มูลค่าคำสั่งซื้อรวม:</span>
            <span class="text-lg font-extrabold text-[var(--primary)]">{{ formatCurrency(order.total_amount) }} THB</span>
          </div>
        </div>
      </div>

      <!-- Right side: Actions -->
      <div class="space-y-6">
        <!-- Confirm order action card -->
        <div 
          v-if="order.status === 'SentToVendor'" 
          class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6 space-y-4"
        >
          <h3 class="font-bold text-slate-800 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            ดำเนินการกับคำสั่งซื้อนี้
          </h3>

          <!-- Date Selector -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-[var(--muted-foreground)] block">กำหนดวันส่งมอบสินค้าคาดการณ์ (Estimated Delivery Date)</label>
            <UInput 
              v-model="deliveryDate" 
              type="date" 
              size="md" 
              class="w-full"
            />
          </div>

          <UButton 
            color="success" 
            size="md" 
            block 
            class="cursor-pointer font-bold"
            :disabled="!deliveryDate"
            @click="confirmOrder"
          >
            <UIcon name="i-heroicons-hand-thumb-up" class="w-5 h-5 mr-1" />
            ยืนยันการรับสั่งซื้อ (Confirm PO)
          </UButton>

          <!-- Divider -->
          <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink mx-4 text-slate-400 text-xs uppercase font-medium">หรือ</span>
            <div class="flex-grow border-t border-gray-200"></div>
          </div>

          <UButton 
            color="yellow" 
            variant="outline" 
            size="md" 
            block 
            class="cursor-pointer"
            @click="revisionRequestOpen = true"
          >
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 mr-1" />
            ขอแก้ไขรายการ / ขอปรับราคา
          </UButton>
        </div>

        <div v-else class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] p-6 space-y-3">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-[var(--primary)]" />
            การดำเนินกิจกรรม
          </h3>
          <p v-if="order.status === 'VendorConfirmed'" class="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            ท่านได้ทำการยืนยันการรับสั่งซื้อเรียบร้อยแล้ว โดยกำหนดจัดส่งภายในวันที่ <b>{{ formatDateNoTime(order.estimated_delivery_date) }}</b>
          </p>
          <p v-if="order.status === 'RevisionRequested'" class="text-xs text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            ท่านส่งคำขอปรับปรุงราคาหรือจำนวนเรียบร้อยแล้ว กำลังรอพนักงานฝ่ายจัดซื้อตรวจสอบและปรับปรุงเอกสาร
          </p>
          <p v-if="order.status === 'FullyReceived'" class="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            คำสั่งซื้อนี้ได้รับการตรวจรับสินค้าเสร็จสมบูรณ์แล้ว
          </p>
        </div>
      </div>
    </div>

    <!-- Revision Request Modal -->
    <UModal v-model="revisionRequestOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[var(--foreground)]">
              รายละเอียดคำเสนอขอแก้ไข (Revision Request)
            </h3>
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              class="cursor-pointer"
              @click="revisionRequestOpen = false" 
            />
          </div>
        </template>

        <div class="space-y-4 py-2 text-xs">
          <label class="text-slate-500 font-semibold block">กรุณากรอกเหตุผลและจุดที่ต้องการเสนอปรับปรุง เช่น ราคา หรือ ปริมาณสินค้า เพื่อส่งกลับให้พนักงานจัดซื้อแก้ไข</label>
          <UTextarea 
            v-model="revisionReason" 
            placeholder="เช่น ขอปรับปรุงราคาสินค้าโน้ตบุ๊คเนื่องจากราคาชิปเพิ่มขึ้น หรือขอปรับลดจำนวนจาก 10 เครื่องเป็น 8 เครื่องเนื่องจากสินค้าขาดตลาด..." 
            rows="4"
            class="w-full"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" size="sm" @click="revisionRequestOpen = false">ยกเลิก</UButton>
            <UButton 
              color="yellow" 
              size="sm" 
              class="cursor-pointer font-bold"
              :disabled="!revisionReason"
              @click="submitRevisionRequest"
            >
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 mr-1" />
              ส่งข้อมูลเสนอขอแก้ไข
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useVendorAuthStore();
const poId = route.params.id as string;

const loading = ref(true);
const order = ref<any>(null);

const deliveryDate = ref('');
const revisionRequestOpen = ref(false);
const revisionReason = ref('');

const loadOrderDetails = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    order.value = res;
    if (res.estimated_delivery_date) {
      deliveryDate.value = new Date(res.estimated_delivery_date).toISOString().split('T')[0];
    }
  } catch (err) {
    console.warn('Backend connection failed. Using mock vendor PO details.');
    if (poId === 'po_mock_2') {
      order.value = {
        po_id: 'po_mock_2',
        po_no: 'PO2606002',
        created_at: new Date(Date.now() - 86400000 * 2),
        total_amount: 28500,
        revision_no: 1,
        status: 'VendorConfirmed',
        estimated_delivery_date: new Date(Date.now() + 86400000 * 5),
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
          },
        ],
      };
      deliveryDate.value = new Date(order.value.estimated_delivery_date).toISOString().split('T')[0];
    } else {
      order.value = {
        po_id: 'po_mock_1',
        po_no: 'PO2606001',
        created_at: new Date(Date.now() - 3600000 * 4),
        total_amount: 85500,
        revision_no: 0,
        status: 'SentToVendor',
        estimated_delivery_date: null,
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
          },
          {
            po_line_id: 'l_mock_102',
            item_name: 'โต๊ะทำงานเหล็ก',
            quantity: 10,
            uom: 'ตัว',
            unit_price: 3750,
            total_price: 37500,
          },
        ],
      };
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrderDetails();
});

const confirmOrder = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        estimated_delivery_date: new Date(deliveryDate.value).toISOString(),
      },
    });
    order.value = res;
  } catch (err: any) {
    console.warn('Backend confirmation failed. Applying locally.');
    // Local mock update
    order.value.status = 'VendorConfirmed';
    order.value.estimated_delivery_date = new Date(deliveryDate.value);
  }
};

const submitRevisionRequest = async () => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/po/${poId}/revision-request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        reason: revisionReason.value,
      },
    });
    order.value = res;
    revisionRequestOpen.value = false;
  } catch (err: any) {
    console.warn('Backend revision request failed. Applying locally.');
    order.value.status = 'RevisionRequested';
    revisionRequestOpen.value = false;
  }
};

const formatStatus = (status?: string) => {
  switch (status) {
    case 'SentToVendor': return 'รอยืนยัน';
    case 'VendorConfirmed': return 'ยืนยันการรับสั่งซื้อแล้ว';
    case 'RevisionRequested': return 'อยู่ระหว่างขอแก้ไข';
    case 'FullyReceived': return 'ส่งมอบสำเร็จ';
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
