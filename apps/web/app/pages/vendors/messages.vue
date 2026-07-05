<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eff1f5] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ศูนย์การสื่อสารกับคู่ค้า (Vendor Communication Center)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ติดต่อสื่อสารกับคู่ค้าโดยตรง ลดการใช้อีเมลและงาน manual</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4" style="min-height: 500px;">
      <!-- Thread list -->
      <div class="bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700 text-sm flex items-center justify-between">
          <span>บทสนทนา</span>
          <button class="text-[10px] font-bold text-[var(--primary)]" @click="showNewThreadModal = true">+ เริ่มสนทนาใหม่</button>
        </div>
        <div class="flex-1 overflow-y-auto divide-y divide-[#eff1f5]">
          <button
            v-for="t in threads"
            :key="t.vendor_id"
            class="w-full text-left p-4 hover:bg-[#f8fffe] transition"
            :class="{ 'bg-indigo-50/50': activeVendorId === t.vendor_id }"
            @click="selectThread(t.vendor_id)"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-800 text-sm truncate">{{ t.vendor_name }}</span>
              <span v-if="t.unread_count > 0" class="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{{ t.unread_count }}</span>
            </div>
            <div class="text-[11px] text-slate-400 truncate mt-0.5">{{ t.last_message }}</div>
          </button>
          <div v-if="threads.length === 0" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ยังไม่มีบทสนทนากับคู่ค้า</div>
        </div>
      </div>

      <!-- Thread view -->
      <div class="md:col-span-2 bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div v-if="!activeVendorId" class="flex-1 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
          เลือกบทสนทนาทางซ้ายเพื่อดูรายละเอียด
        </div>
        <template v-else>
          <div class="p-4 border-b border-[#eff1f5] font-bold text-slate-700 text-sm">{{ activeVendorName }}</div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="m in messages"
              :key="m.message_id"
              class="max-w-[75%] p-3 rounded-xl text-xs"
              :class="m.sender_role === 'Buyer' ? 'bg-indigo-50 ml-auto text-indigo-900' : 'bg-slate-100 text-slate-800'"
            >
              <div class="font-bold mb-1">{{ m.sender_name }} <span class="font-normal text-slate-400">({{ m.sender_role === 'Buyer' ? 'ฝ่ายจัดซื้อ' : 'คู่ค้า' }})</span></div>
              <div v-if="m.subject" class="font-semibold mb-1">{{ m.subject }}</div>
              <div>{{ m.body }}</div>
              <div class="text-[9px] text-slate-400 mt-1">{{ formatDateTime(m.created_at) }}</div>
            </div>
            <div v-if="messages.length === 0" class="text-center py-10 text-xs text-[var(--muted-foreground)]">ยังไม่มีข้อความในบทสนทนานี้</div>
          </div>
          <div class="p-4 border-t border-[#eff1f5] flex items-end gap-2">
            <UTextarea v-model="replyBody" placeholder="พิมพ์ข้อความถึงคู่ค้า..." :rows="2" class="flex-1" />
            <UButton color="primary" class="cursor-pointer font-bold" :loading="sending" @click="sendReply">ส่ง</UButton>
          </div>
        </template>
      </div>
    </div>

    <!-- New Thread Modal -->
    <UModal v-model:open="showNewThreadModal">
      <template #content>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-sm">เริ่มสนทนาใหม่กับคู่ค้า</h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="showNewThreadModal = false" />
        </div>
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-600 font-semibold mb-1">คู่ค้า</label>
            <USelect v-model="newThreadVendorId" :options="vendorOptions" class="w-full" />
          </div>
          <div>
            <label class="block text-slate-600 font-semibold mb-1">หัวข้อ</label>
            <UInput v-model="newThreadSubject" placeholder="เช่น สอบถามความคืบหน้าการส่งมอบ..." />
          </div>
          <div>
            <label class="block text-slate-600 font-semibold mb-1">ข้อความ</label>
            <UTextarea v-model="newThreadBody" :rows="3" placeholder="พิมพ์ข้อความ..." />
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showNewThreadModal = false" variant="ghost" color="neutral">ยกเลิก</UButton>
          <UButton color="primary" :loading="sending" class="cursor-pointer font-bold" @click="submitNewThread">ส่งข้อความ</UButton>
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

const threads = ref<any[]>([]);
const messages = ref<any[]>([]);
const vendorsList = ref<any[]>([]);
const activeVendorId = ref('');
const replyBody = ref('');
const sending = ref(false);

const showNewThreadModal = ref(false);
const newThreadVendorId = ref('');
const newThreadSubject = ref('');
const newThreadBody = ref('');

const authHeaders = () => ({ Authorization: `Bearer ${authStore.token}` });

const activeVendorName = computed(() => threads.value.find((t) => t.vendor_id === activeVendorId.value)?.vendor_name || vendorsList.value.find(v => v.vendor_id === activeVendorId.value)?.vendor_name || '');
const vendorOptions = computed(() => vendorsList.value.map((v) => ({ value: v.vendor_id, label: v.vendor_name })));

const loadVendors = async () => {
  try {
    vendorsList.value = await $fetch<any[]>('http://localhost:3001/api/vendor', { headers: authHeaders() });
  } catch (err) {
    vendorsList.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
      { vendor_id: '00000000-0000-0000-0000-000000000603', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' },
    ];
  }
  if (vendorsList.value.length > 0) newThreadVendorId.value = vendorsList.value[0].vendor_id;
};

const loadThreads = async () => {
  try {
    threads.value = await $fetch<any[]>('http://localhost:3001/api/vendor-message/threads', { headers: authHeaders() });
  } catch (err) {
    threads.value = [
      {
        vendor_id: '00000000-0000-0000-0000-000000000601',
        vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
        last_message: 'ขอบคุณครับ จะเตรียมเอกสารส่งภายในสัปดาห์นี้',
        last_message_at: new Date(Date.now() - 3600000 * 3),
        unread_count: 1,
      },
    ];
  }
};

const loadMessages = async (vendorId: string) => {
  try {
    messages.value = await $fetch<any[]>(`http://localhost:3001/api/vendor-message/${vendorId}`, { headers: authHeaders() });
  } catch (err) {
    messages.value = [
      { message_id: 'm1', sender_role: 'Buyer', sender_name: 'nantaporn.s', body: 'รบกวนสอบถามความคืบหน้าใบสั่งซื้อ PO2606003 ครับ', created_at: new Date(Date.now() - 86400000) },
      { message_id: 'm2', sender_role: 'Vendor', sender_name: 'ผู้ติดต่อบริษัท', body: 'ขอบคุณครับ จะเตรียมเอกสารส่งภายในสัปดาห์นี้', created_at: new Date(Date.now() - 3600000 * 3) },
    ];
  }
  try {
    await $fetch(`http://localhost:3001/api/vendor-message/${vendorId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: { reader_role: 'Buyer' },
    });
  } catch (err) {
    // ignore
  }
};

const selectThread = async (vendorId: string) => {
  activeVendorId.value = vendorId;
  replyBody.value = '';
  await loadMessages(vendorId);
  const t = threads.value.find((x) => x.vendor_id === vendorId);
  if (t) t.unread_count = 0;
};

const sendReply = async () => {
  if (!replyBody.value.trim() || !activeVendorId.value) return;
  sending.value = true;
  const payload = {
    vendor_id: activeVendorId.value,
    sender_role: 'Buyer' as const,
    sender_name: authStore.user?.username || 'nantaporn.s',
    body: replyBody.value,
  };
  try {
    await $fetch('http://localhost:3001/api/vendor-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: payload,
    });
    replyBody.value = '';
    await loadMessages(activeVendorId.value);
    await loadThreads();
  } catch (err) {
    messages.value.push({ message_id: `m_${Date.now()}`, ...payload, created_at: new Date() });
    replyBody.value = '';
  } finally {
    sending.value = false;
  }
};

const submitNewThread = async () => {
  if (!newThreadVendorId.value || !newThreadBody.value.trim()) {
    await dialog.alert('กรุณาเลือกคู่ค้าและกรอกข้อความ', { variant: 'danger' });
    return;
  }
  sending.value = true;
  const payload = {
    vendor_id: newThreadVendorId.value,
    sender_role: 'Buyer' as const,
    sender_name: authStore.user?.username || 'nantaporn.s',
    subject: newThreadSubject.value || undefined,
    body: newThreadBody.value,
  };
  try {
    await $fetch('http://localhost:3001/api/vendor-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: payload,
    });
    showNewThreadModal.value = false;
    await loadThreads();
    await selectThread(newThreadVendorId.value);
  } catch (err) {
    const vendorName = vendorsList.value.find((v) => v.vendor_id === newThreadVendorId.value)?.vendor_name || '';
    threads.value.unshift({
      vendor_id: newThreadVendorId.value,
      vendor_name: vendorName,
      last_message: newThreadBody.value,
      last_message_at: new Date(),
      unread_count: 0,
    });
    showNewThreadModal.value = false;
    await selectThread(newThreadVendorId.value);
  } finally {
    sending.value = false;
    newThreadSubject.value = '';
    newThreadBody.value = '';
  }
};

const formatDateTime = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadVendors();
  loadThreads();
});
</script>
