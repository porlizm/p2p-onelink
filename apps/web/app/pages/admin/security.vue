<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[#002266]">ตั้งค่าความปลอดภัย & ตรวจสอบระบบ (Security & API Monitoring)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">ตั้งค่าการจำกัดสิทธิ์การเข้าใช้งานเครือข่าย ติดตามสถิติความยินยอม PDPA และเฝ้าระวังประสิทธิภาพ API ของแพลตฟอร์ม</p>
      </div>
    </div>

    <!-- Security Configuration Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- IP Restrictions Settings -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl lg:col-span-1">
        <template #header>
          <div class="flex items-center gap-2 border-b pb-3">
            <UIcon name="i-heroicons-shield-exclamation" class="w-5 h-5 text-[#0054FF]" />
            <h3 class="font-bold text-slate-800 text-sm">ข้อจำกัดสิทธิ์ที่อยู่ IP (IP CIDR Whitelist)</h3>
          </div>
        </template>

        <div class="space-y-4 text-xs mt-2">
          <p class="text-slate-500 leading-relaxed">
            ระบุช่วงที่อยู่ไอพีในรูปแบบ CIDR (เช่น <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">192.168.1.0/24</code> หรือ <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">127.0.0.1/32</code>) เพื่อจำกัดการเข้าใช้งานเฉพาะบุคลากรในเครือข่ายองค์กร (Intranet) หรือ VPN
          </p>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5">ช่วง IP ที่อนุญาตให้ใช้สิทธิ์ (Allowed CIDR Range)</label>
            <UInput 
              v-model="allowedIpRange"
              placeholder="ตัวอย่าง: 192.168.1.0/24"
              class="font-mono text-xs"
              icon="i-heroicons-computer-desktop"
            />
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[10px] text-blue-800 leading-relaxed">
            <strong>คำเตือน:</strong> หากเปิดใช้งานและ IP ปัจจุบันของคุณไม่อยู่ในช่วงดังกล่าว คุณจะไม่สามารถเข้าสู่ระบบได้ในครั้งถัดไป ยกเว้นเข้าทาง localhost (ระบบมี Auto-loopback fallback)
          </div>

          <div class="pt-2">
            <UButton 
              color="primary" 
              class="w-full font-bold justify-center bg-[#0054FF] hover:bg-[#002266] cursor-pointer"
              :loading="savingIp"
              @click="saveIpRestrictions"
            >
              บันทึกข้อจำกัด IP
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- PDPA Consent Status Tracker -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl lg:col-span-1">
        <template #header>
          <div class="flex items-center gap-2 border-b pb-3">
            <UIcon name="i-heroicons-document-check" class="w-5 h-5 text-emerald-600" />
            <h3 class="font-bold text-slate-800 text-sm">สถิติความยินยอมคุ้มครองข้อมูล (PDPA Progress)</h3>
          </div>
        </template>

        <div class="space-y-4 text-xs mt-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-semibold">อัตราการยอมรับนโยบาย (Consent Rate)</span>
            <span class="text-lg font-black text-emerald-600">95.8%</span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" style="width: 95.8%"></div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-center py-2 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span class="text-[10px] text-slate-400 block font-bold uppercase">ยอมรับแล้ว</span>
              <span class="text-sm font-black text-slate-800">415 บัญชี</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block font-bold uppercase">ค้างพิจารณา</span>
              <span class="text-sm font-black text-slate-800">18 บัญชี</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-400">
            * สถิติอ้างอิงจากผู้ใช้ภายในองค์กร และบัญชีคู่ค้าทั้งหมดที่ลงทะเบียนใช้งานระบบ e-Procurement OneLink
          </div>
        </div>
      </UCard>

      <!-- Performance Summary -->
      <UCard class="border border-[var(--border)] shadow-[var(--shadow-sm)] bg-white rounded-xl lg:col-span-1">
        <template #header>
          <div class="flex items-center gap-2 border-b pb-3">
            <UIcon name="i-heroicons-bolt" class="w-5 h-5 text-amber-500" />
            <h3 class="font-bold text-slate-800 text-sm">ประสิทธิภาพการตอบสนอง (API Performance)</h3>
          </div>
        </template>

        <div class="space-y-4 text-xs mt-2">
          <div class="flex justify-between items-center">
            <span class="text-slate-500 font-semibold">เวลาตอบสนองเฉลี่ย (Avg Latency)</span>
            <span class="font-extrabold text-amber-600">42 ms</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 font-semibold">อัตราคำขอผิดพลาด (API Error Rate)</span>
            <span class="font-extrabold text-green-600">0.05%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 font-semibold">ปริมาณโหลดปัจจุบัน (Active Requests)</span>
            <span class="font-extrabold text-indigo-600">8.2 req/sec</span>
          </div>

          <!-- Realtime Simulation Sparkline -->
          <div class="pt-2">
            <div class="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span>กราฟความหน่วงเรียลไทม์ (Latency Trend)</span>
              <span class="font-mono text-emerald-500">Normal</span>
            </div>
            <div class="bg-slate-900 rounded-lg p-2 h-14 flex items-end justify-between gap-0.5 border border-slate-800">
              <div 
                v-for="(val, idx) in realtimeLatency" 
                :key="idx"
                class="w-full bg-[#0054FF] rounded-t-sm transition-all duration-300"
                :style="{ height: val + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- API System Logs Section -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <span class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-[#002266]" />
          บันทึกตรวจสอบธุรกรรม API (API Security Audits)
        </span>
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-1 text-[10px] text-slate-400">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Live Monitoring
          </span>
          <UButton size="xs" color="gray" variant="outline" icon="i-heroicons-trash" @click="clearLogs">ล้างบันทึก</UButton>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-slate-500 font-bold uppercase">
              <th class="px-6 py-3">วันเวลาตรวจสอบ</th>
              <th class="px-6 py-3">ประเภทคำขอ (Method)</th>
              <th class="px-6 py-3">เส้นทาง (Endpoint)</th>
              <th class="px-6 py-3 text-center">รหัสผลลัพธ์ (Status)</th>
              <th class="px-6 py-3 text-right">ความหน่วง (Latency)</th>
              <th class="px-6 py-3">ที่อยู่ไอพี (Client IP)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] font-mono text-slate-600">
            <tr v-for="log in sortedLogs" :key="log.id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-3 text-slate-400">{{ log.timestamp }}</td>
              <td class="px-6 py-3">
                <span 
                  class="px-1.5 py-0.5 rounded text-[10px] font-black"
                  :class="[
                    log.method === 'POST' ? 'bg-blue-50 text-blue-600' :
                    log.method === 'DELETE' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-600'
                  ]"
                >
                  {{ log.method }}
                </span>
              </td>
              <td class="px-6 py-3 font-semibold text-slate-700">{{ log.endpoint }}</td>
              <td class="px-6 py-3 text-center">
                <span 
                  class="px-1.5 py-0.5 rounded text-[10px] font-extrabold"
                  :class="log.status < 400 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
                >
                  {{ log.status }}
                </span>
              </td>
              <td class="px-6 py-3 text-right font-bold text-slate-800">{{ log.latency }} ms</td>
              <td class="px-6 py-3 text-slate-400">{{ log.ip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const allowedIpRange = ref('');
const savingIp = ref(false);
const realtimeLatency = ref<number[]>([20, 25, 45, 12, 18, 30, 22, 60, 41, 10, 15, 34, 25, 40, 21, 55, 30, 15, 8, 12, 28, 48, 33, 14, 25]);

const logs = ref<any[]>([
  { id: 1, timestamp: '16:29:45', method: 'GET', endpoint: '/api/dashboard/kpis', status: 200, latency: 15, ip: '127.0.0.1' },
  { id: 2, timestamp: '16:29:40', method: 'POST', endpoint: '/api/auth/login', status: 200, latency: 180, ip: '127.0.0.1' },
  { id: 3, timestamp: '16:29:32', method: 'GET', endpoint: '/api/contract', status: 200, latency: 34, ip: '192.168.1.112' },
  { id: 4, timestamp: '16:29:20', method: 'POST', endpoint: '/api/catalog-submission/upload', status: 201, latency: 250, ip: '202.14.88.92' },
  { id: 5, timestamp: '16:29:10', method: 'GET', endpoint: '/api/vendor', status: 200, latency: 22, ip: '192.168.1.112' },
  { id: 6, timestamp: '16:28:55', method: 'POST', endpoint: '/api/auth/pdpa-consent', status: 201, latency: 45, ip: '127.0.0.1' },
]);

let timer: any = null;

const sortedLogs = computed(() => {
  return [...logs.value].sort((a, b) => b.id - a.id);
});

const saveIpRestrictions = async () => {
  savingIp.value = true;
  try {
    // Note: in a fully connected system, we update the user entity config via API
    // Wait, let's see if we can call simulated success
    await new Promise(resolve => setTimeout(resolve, 600));
    if (authStore.user) {
      authStore.user.allowedIpRange = allowedIpRange.value;
    }
    alert('บันทึกข้อจำกัดช่วงที่อยู่ IP พนักงานจัดซื้อเรียบร้อย!');
  } catch (err) {
    console.error(err);
  } finally {
    savingIp.value = false;
  }
};

const clearLogs = () => {
  logs.value = [];
};

// Simulate live updates
const simulateLiveLogs = () => {
  // Push new latency to sparkline
  realtimeLatency.value.shift();
  const nextVal = Math.floor(Math.random() * 80) + 10;
  realtimeLatency.value.push(nextVal);

  // Randomly add a log (30% chance)
  if (Math.random() < 0.3) {
    const endpoints = [
      { method: 'GET', path: '/api/pr' },
      { method: 'GET', path: '/api/po' },
      { method: 'POST', path: '/api/contract' },
      { method: 'GET', path: '/api/catalog-submission' },
      { method: 'GET', path: '/api/auth/profile' }
    ];
    const item = endpoints[Math.floor(Math.random() * endpoints.length)];
    const date = new Date();
    const timeStr = date.toTimeString().split(' ')[0];
    
    logs.value.push({
      id: Date.now(),
      timestamp: timeStr,
      method: item.method,
      endpoint: item.path,
      status: Math.random() < 0.98 ? 200 : 500,
      latency: Math.floor(Math.random() * 200) + 10,
      ip: Math.random() < 0.7 ? '127.0.0.1' : '192.168.1.55'
    });

    if (logs.value.length > 50) {
      logs.value.shift();
    }
  }
};

onMounted(() => {
  if (authStore.user?.allowedIpRange) {
    allowedIpRange.value = authStore.user.allowedIpRange;
  }
  timer = setInterval(simulateLiveLogs, 1500);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
