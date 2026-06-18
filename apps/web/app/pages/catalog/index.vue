<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">รายการสินค้าและบริการ (E-Catalog)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">
          ค้นหาและเลือกสินค้า/บริการที่ต้องการสั่งซื้อเพื่อสร้างใบขอซื้อ (PR)
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Floating Cart Summary -->
        <NuxtLink to="/pr/create">
          <UButton 
            color="primary"
            variant="solid"
            size="md"
            class="relative shadow-md hover:shadow-lg transition-all"
          >
            <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 mr-2" />
            <span>สร้างใบขอซื้อ (PR)</span>
            <span 
              v-if="cartStore.totalItems > 0"
              class="absolute -top-2 -right-2 bg-[var(--destructive)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce"
            >
              {{ cartStore.totalItems }}
            </span>
          </UButton>
        </NuxtLink>
        <NuxtLink to="/pr">
          <UButton variant="outline" size="md">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 mr-2" />
            ติดตามสถานะ PR
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white p-4 border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-sm)]">
      <div class="relative w-full sm:max-w-md">
        <UInput 
          v-model="search" 
          placeholder="ค้นหาชื่อสินค้า รหัสสินค้า หรือชื่อผู้ขาย..." 
          icon="i-heroicons-magnifying-glass-20-solid"
          size="md"
          class="w-full"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <USelect 
          v-model="filterType"
          :options="['ทั้งหมด', 'Goods', 'Service']"
          size="md"
          class="w-full sm:w-40"
        />
        <UButton 
          variant="ghost" 
          color="gray"
          @click="resetFilters"
          v-if="search || filterType !== 'ทั้งหมด'"
        >
          ล้างค่า
        </UButton>
      </div>
    </div>

    <!-- Catalog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="item in filteredItems" 
        :key="item.item_id"
        class="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
      >
        <!-- Card Header / Image placeholder -->
        <div class="h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 border-b border-[var(--border)] relative">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-[var(--border)] text-[var(--muted-foreground)]">
            {{ item.central_item_code }}
          </span>
          <span 
            class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold"
            :class="[
              item.item_type === 'Goods' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            ]"
          >
            {{ item.item_type === 'Goods' ? 'สินค้า' : 'บริการ' }}
          </span>
          <UIcon 
            :name="item.item_type === 'Goods' ? 'i-heroicons-cpu-chip' : 'i-heroicons-wrench-screwdriver'" 
            class="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-300" 
          />
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-bold text-sm text-[var(--foreground)] line-clamp-2 min-h-[40px] group-hover:text-[var(--primary)] transition-colors">
              {{ item.item_name }}
            </h3>
            <div class="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-user-group" class="w-3.5 h-3.5" />
                <span class="truncate">คู่ค้า: {{ item.price?.vendor_name || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-scale" class="w-3.5 h-3.5" />
                <span>หน่วยนับ: {{ item.uom }}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <div>
              <span class="text-[10px] text-[var(--muted-foreground)] block">ราคาต่อหน่วย</span>
              <span class="text-base font-extrabold text-[var(--foreground)]">
                {{ formatCurrency(item.price?.unit_price) }}
              </span>
              <span class="text-[10px] text-[var(--muted-foreground)]"> THB</span>
            </div>

            <!-- Add to Cart Widget -->
            <div class="flex items-center gap-1.5">
              <UButton 
                @click="addCart(item)"
                color="primary"
                size="sm"
                class="rounded-lg shadow-sm font-semibold"
              >
                <UIcon name="i-heroicons-plus-small" class="w-4 h-4 mr-1" />
                เลือก
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="filteredItems.length === 0" 
      class="text-center py-16 bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)]"
    >
      <UIcon name="i-heroicons-magnifying-glass-20-solid" class="w-12 h-12 text-slate-300 mx-auto" />
      <h3 class="mt-4 font-bold text-base text-[var(--foreground)]">ไม่พบสินค้าหรือบริการ</h3>
      <p class="text-xs text-[var(--muted-foreground)] mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภทรายการ</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useCartStore } from '~/stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();

const search = ref('');
const filterType = ref('ทั้งหมด');
const items = ref<any[]>([]);

const resetFilters = () => {
  search.value = '';
  filterType.value = 'ทั้งหมด';
};

const loadCatalog = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/catalog', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    items.value = res;
  } catch (err) {
    console.warn('Backend connection offline, using mock Catalog items.');
    items.value = [
      {
        item_id: '00000000-0000-0000-0000-000000000901',
        central_item_code: 'ITM-00001',
        item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: '1', unit_price: 28500, vendor_id: '1', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000902',
        central_item_code: 'ITM-00002',
        item_name: 'จอคอมพิวเตอร์ 24 นิ้ว',
        item_type: 'Goods',
        uom: 'จอ',
        status: 'Active',
        price: { price_id: '2', unit_price: 4200, vendor_id: '1', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000903',
        central_item_code: 'ITM-00003',
        item_name: 'เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: '3', unit_price: 12900, vendor_id: '3', vendor_name: 'บริษัท ออฟฟิศ เทค จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000904',
        central_item_code: 'ITM-00004',
        item_name: 'อุปกรณ์เครือข่าย Switch 24 Port',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: '4', unit_price: 8700, vendor_id: '2', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000905',
        central_item_code: 'ITM-00005',
        item_name: 'เครื่องถ่ายเอกสารระบบดิจิทัล',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: '5', unit_price: 65000, vendor_id: '3', vendor_name: 'บริษัท ออฟฟิศ เทค จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000907',
        central_item_code: 'ITM-00007',
        item_name: 'โทรศัพท์สำนักงานไร้สาย',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: '6', unit_price: 1850, vendor_id: '3', vendor_name: 'บริษัท ออฟฟิศ เทค จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000908',
        central_item_code: 'ITM-00008',
        item_name: 'โต๊ะทำงานเหล็ก',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: '7', unit_price: 3500, vendor_id: '5', vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000909',
        central_item_code: 'ITM-00009',
        item_name: 'เก้าอี้สำนักงานเบาะหนัง',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: '8', unit_price: 4800, vendor_id: '5', vendor_name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000911',
        central_item_code: 'ITM-00011',
        item_name: 'กระดาษ A4 80 แกรม (ลัง)',
        item_type: 'Goods',
        uom: 'ลัง',
        status: 'Active',
        price: { price_id: '9', unit_price: 650, vendor_id: '4', vendor_name: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000912',
        central_item_code: 'ITM-00012',
        item_name: 'หมวกนิรภัยมาตรฐาน',
        item_type: 'Goods',
        uom: 'ชิ้น',
        status: 'Active',
        price: { price_id: '10', unit_price: 280, vendor_id: '4', vendor_name: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000913',
        central_item_code: 'ITM-00013',
        item_name: 'รองเท้าเซฟตี้หัวเหล็ก',
        item_type: 'Goods',
        uom: 'คู่',
        status: 'Active',
        price: { price_id: '11', unit_price: 890, vendor_id: '4', vendor_name: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด' },
      },
      {
        item_id: '00000000-0000-0000-0000-000000000914',
        central_item_code: 'ITM-00014',
        item_name: 'บริการทำความสะอาดสำนักงานรายเดือน',
        item_type: 'Service',
        uom: 'เดือน',
        status: 'Active',
        price: { price_id: '12', unit_price: 18000, vendor_id: '6', vendor_name: 'บริษัท คลีนโปร เซอร์วิส จำกัด' },
      },
    ];
  }
};

const addCart = (item: any) => {
  cartStore.addToCart({
    item_id: item.item_id,
    item_name: item.item_name,
    uom: item.uom,
    unit_price: item.price?.unit_price || 0,
    vendor_id: item.price?.vendor_id,
    is_custom: false,
  });
};

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    if (filterType.value !== 'ทั้งหมด' && item.item_type !== filterType.value) {
      return false;
    }
    if (search.value) {
      const q = search.value.toLowerCase();
      const codeMatch = item.central_item_code?.toLowerCase().includes(q);
      const nameMatch = item.item_name?.toLowerCase().includes(q);
      const vendorMatch = item.price?.vendor_name?.toLowerCase().includes(q);
      return codeMatch || nameMatch || vendorMatch;
    }
    return true;
  });
});

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '—';
  return val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => {
  loadCatalog();
});
</script>
