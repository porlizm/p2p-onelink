<template>
  <div class="space-y-6 max-w-4xl mx-auto bg-white p-8 border border-[#e9ecef] rounded-2xl shadow-[var(--shadow-sm)]">
    <!-- Header -->
    <div class="border-b border-[#eff1f5] pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[#002266] flex items-center gap-2">
          <UIcon name="i-heroicons-squares-plus" class="w-6 h-6 text-emerald-600" />
          ประเภทและรูปแบบสินค้าประมูล (Bidding Formats)
        </h2>
        <p class="text-xs text-[var(--muted-foreground)] mt-1">
          กำหนดรูปแบบและประเภทสำหรับสินค้าและบริการที่นำมาเปิดประมูล รวมถึงการประมูลจ้างบริการ เช่าสินทรัพย์ หรือซื้อซอฟต์แวร์สิทธิ์การใช้งาน
        </p>
      </div>
      <NuxtLink to="/admin">
        <UButton variant="outline" size="sm">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 mr-1" />
          ย้อนกลับ
        </UButton>
      </NuxtLink>
    </div>

    <!-- Error/Success Banner -->
    <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" class="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
      {{ successMsg }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Add New Type Form -->
      <div class="space-y-4 bg-[#fafbfc] p-5 rounded-2xl border border-[#eff1f5]/60 h-fit">
        <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
          <UIcon name="i-heroicons-plus-circle" class="w-4 h-4 text-emerald-600" />
          เพิ่มรูปแบบใหม่
        </h3>
        
        <form @submit.prevent="createItemType" class="space-y-4">
          <UFormField label="รหัสรูปแบบ (Code) *" name="typeCode" required>
            <UInput 
              v-model="newCode" 
              placeholder="เช่น Lease, Consulting" 
              size="sm" 
              class="mt-1 bg-white" 
            />
          </UFormField>

          <UFormField label="ชื่อรูปแบบ (Name) *" name="typeName" required>
            <UInput 
              v-model="newName" 
              placeholder="เช่น การเช่าซื้อทางการเงิน, บริการที่ปรึกษา" 
              size="sm" 
              class="mt-1 bg-white" 
            />
          </UFormField>

          <UFormField label="คำอธิบายรูปแบบ (Description)" name="typeDesc">
            <UTextarea 
              v-model="newDesc" 
              placeholder="เงื่อนไขหรือข้อมูลของรูปแบบนี้..." 
              :rows="3" 
              class="mt-1 bg-white" 
            />
          </UFormField>

          <UButton 
            type="submit" 
            color="success" 
            size="sm" 
            class="w-full font-semibold shadow-sm justify-center"
            :loading="isSubmitting"
          >
            บันทึกรูปแบบใหม่
          </UButton>
        </form>
      </div>

      <!-- Right Column: Formats List -->
      <div class="lg:col-span-2 space-y-4">
        <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
          <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-blue-600" />
          รายการรูปแบบทั้งหมดในระบบ
        </h3>

        <div class="border border-[#e9ecef] rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse bg-white">
            <thead>
              <tr class="bg-[#fafbfc] border-b border-[#eff1f5] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th class="p-3">รหัส</th>
                <th class="p-3">ชื่อรูปแบบ</th>
                <th class="p-3">ประเภทระบบ</th>
                <th class="p-3 text-center" style="width: 80px;">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#eff1f5] text-xs">
              <tr v-for="t in types" :key="t.type_id" class="hover:bg-[#f8fffe] transition-colors">
                <td class="p-3 font-semibold text-slate-700">
                  <span class="px-1.5 py-0.5 rounded bg-slate-100 border border-[#eff1f5]">
                    {{ t.type_code }}
                  </span>
                </td>
                <td class="p-3">
                  <span class="font-bold text-slate-800 block">{{ t.type_name }}</span>
                  <span class="text-[10px] text-slate-400 block mt-0.5 max-w-xs truncate">{{ t.description || 'ไม่มีคำอธิบาย' }}</span>
                </td>
                <td class="p-3">
                  <span 
                    class="px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                    :class="t.is_system_default ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'"
                  >
                    {{ t.is_system_default ? 'ค่าตั้งต้นระบบ' : 'สร้างโดยผู้ใช้' }}
                  </span>
                </td>
                <td class="p-3 text-center">
                  <button 
                    v-if="!t.is_system_default" 
                    @click.prevent="deleteItemType(t.type_id)" 
                    class="text-red-500 hover:text-red-700 transition"
                    title="ลบประเภทนี้"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                  <span v-else class="text-slate-300">
                    <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
              <tr v-if="types.length === 0">
                <td colspan="4" class="text-center py-8 text-slate-400">
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const types = ref<any[]>([]);
const newCode = ref('');
const newName = ref('');
const newDesc = ref('');

const errorMsg = ref('');
const successMsg = ref('');
const isSubmitting = ref(false);

const loadItemTypes = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/catalog/item-types', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    types.value = res;
  } catch (err: any) {
    console.error('Failed to load item types', err);
    errorMsg.value = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ใช้ข้อมูลจำลองชั่วคราว';
    types.value = [
      { type_id: '1', type_code: 'Goods', type_name: 'สินค้า / ครุภัณฑ์', description: 'ประมูลซื้อสินค้าทั่วไป มีการตรวจรับมอบของ (GR)', is_system_default: true },
      { type_id: '2', type_code: 'Service', type_name: 'งานบริการ', description: 'จ้างเหมาบริการ ปรับปรุงสถานที่ มีจ่ายตามงวดงาน', is_system_default: true },
      { type_id: '3', type_code: 'Rental', type_name: 'การเช่าสินทรัพย์', description: 'เช่าเครื่องคอมพิวเตอร์ อุปกรณ์สำนักงาน', is_system_default: true },
      { type_id: '4', type_code: 'License', type_name: 'สิทธิ์การใช้งาน (License)', description: 'สิทธิ์โปรแกรมซอฟต์แวร์ เช่น Adobe, Antivirus', is_system_default: true },
    ];
  }
};

const createItemType = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  if (!newCode.value || !newName.value) {
    errorMsg.value = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
    return;
  }

  isSubmitting.value = true;
  try {
    await $fetch('http://localhost:3001/api/catalog/item-types', {
      method: 'POST',
      body: {
        type_code: newCode.value,
        type_name: newName.value,
        description: newDesc.value,
      },
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    successMsg.value = 'บันทึกรูปแบบสินค้าการประมูลสำเร็จแล้ว';
    newCode.value = '';
    newName.value = '';
    newDesc.value = '';
    await loadItemTypes();
  } catch (err: any) {
    errorMsg.value = err.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
  } finally {
    isSubmitting.value = false;
  }
};

const deleteItemType = async (id: string) => {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปแบบสินค้านี้ออกจากระบบ?')) return;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    await $fetch(`http://localhost:3001/api/catalog/item-types/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    successMsg.value = 'ลบรูปแบบสำเร็จเรียบร้อยแล้ว';
    await loadItemTypes();
  } catch (err: any) {
    errorMsg.value = err.data?.message || 'ไม่สามารถลบข้อมูลนี้ได้';
  }
};

onMounted(() => {
  loadItemTypes();
});
</script>
