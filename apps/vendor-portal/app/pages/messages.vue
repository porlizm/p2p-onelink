<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="border-b border-[#eff1f5] pb-4">
      <h2 class="text-xl font-bold text-[var(--foreground)]">ข้อความจาก SCGJWD (Communication Center)</h2>
      <p class="text-sm text-[var(--muted-foreground)] mt-1">พูดคุยและติดตามความคืบหน้ากับฝ่ายจัดซื้อ SCGJWD โดยตรง</p>
    </div>

    <div class="bg-white border border-[#e9ecef] rounded-xl shadow-sm overflow-hidden flex flex-col" style="min-height: 500px;">
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="m in messages"
          :key="m.message_id"
          class="max-w-[75%] p-3 rounded-xl text-xs"
          :class="m.sender_role === 'Vendor' ? 'bg-emerald-50 ml-auto text-emerald-900' : 'bg-slate-100 text-slate-800'"
        >
          <div class="font-bold mb-1">{{ m.sender_name }} <span class="font-normal text-slate-400">({{ m.sender_role === 'Vendor' ? 'บริษัทของคุณ' : 'ฝ่ายจัดซื้อ SCGJWD' }})</span></div>
          <div v-if="m.subject" class="font-semibold mb-1">{{ m.subject }}</div>
          <div>{{ m.body }}</div>
          <div class="text-[9px] text-slate-400 mt-1">{{ formatDateTime(m.created_at) }}</div>
        </div>
        <div v-if="messages.length === 0" class="text-center py-10 text-xs text-gray-400">ยังไม่มีข้อความจากฝ่ายจัดซื้อ</div>
      </div>
      <div class="p-4 border-t border-[#eff1f5] flex items-end gap-2">
        <UTextarea v-model="replyBody" placeholder="พิมพ์ข้อความถึงฝ่ายจัดซื้อ..." :rows="2" class="flex-1" />
        <UButton color="primary" class="cursor-pointer font-bold" :loading="sending" @click="sendReply">ส่ง</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorAuthStore } from '~/stores/auth';

const vendorAuth = useVendorAuthStore();

const messages = ref<any[]>([]);
const replyBody = ref('');
const sending = ref(false);

const authHeaders = () => ({ Authorization: `Bearer ${vendorAuth.token}` });

const loadMessages = async () => {
  const vendorId = vendorAuth.vendor?.vendorId;
  if (!vendorId) return;
  try {
    messages.value = await $fetch<any[]>(`http://localhost:3001/api/vendor-message/${vendorId}`, { headers: authHeaders() });
  } catch (err) {
    messages.value = [
      { message_id: 'm1', sender_role: 'Buyer', sender_name: 'nantaporn.s', body: 'รบกวนสอบถามความคืบหน้าใบสั่งซื้อครับ', created_at: new Date(Date.now() - 86400000) },
    ];
  }
  try {
    await $fetch(`http://localhost:3001/api/vendor-message/${vendorId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: { reader_role: 'Vendor' },
    });
  } catch (err) {
    // ignore
  }
};

const sendReply = async () => {
  const vendorId = vendorAuth.vendor?.vendorId;
  if (!replyBody.value.trim() || !vendorId) return;
  sending.value = true;
  const payload = {
    vendor_id: vendorId,
    sender_role: 'Vendor' as const,
    sender_name: vendorAuth.vendor?.vendorName || 'ผู้ติดต่อบริษัท',
    body: replyBody.value,
  };
  try {
    await $fetch('http://localhost:3001/api/vendor-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: payload,
    });
    replyBody.value = '';
    await loadMessages();
  } catch (err) {
    messages.value.push({ message_id: `m_${Date.now()}`, ...payload, created_at: new Date() });
    replyBody.value = '';
  } finally {
    sending.value = false;
  }
};

const formatDateTime = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadMessages();
});
</script>
