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
        <NuxtLink to="/pr/create" class="relative inline-flex">
          <button class="btn-primary relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h19l-1.68 8.39A2 2 0 0 1 18.34 16H7.66a2 2 0 0 1-1.97-1.61L4 6"/><path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M1 1h4l2.68 13.39"/></svg>
            สร้างใบขอซื้อ (PR)
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[11px] font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1 border-2 border-white shadow-md"
              style="animation: bounceOnce 0.4s ease;"
            >
              {{ cartStore.totalItems }}
            </span>
          </button>
        </NuxtLink>
        <NuxtLink to="/pr">
          <button class="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            ติดตามสถานะ PR
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white p-4 border border-[#e9ecef] rounded-[var(--radius)] shadow-[var(--shadow-sm)]">
      <div class="toolbar__search relative w-full sm:max-w-md">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          v-model="search"
          class="toolbar__search-input pl-9"
          placeholder="ค้นหาชื่อสินค้า รหัสสินค้า หรือชื่อผู้ขาย..."
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select v-model="filterType" class="ds-select w-full sm:w-40">
          <option>ทั้งหมด</option>
          <option>Goods</option>
          <option>Service</option>
        </select>
        <button
          v-if="search || filterType !== 'ทั้งหมด'"
          class="btn-outline"
          @click="resetFilters"
        >
          ล้างค่า
        </button>
      </div>
    </div>

    <!-- Catalog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="item in filteredItems"
        :key="item.item_id"
        class="catalog-card bg-white border border-[#e9ecef] rounded-xl overflow-hidden flex flex-col group"
        :class="getCartQty(item.item_id) > 0 ? 'ring-2 ring-[var(--primary)]/25 border-[var(--primary)]/30 shadow-md' : 'hover:shadow-lg'"
      >
        <!-- Image — clickable to detail -->
        <NuxtLink :to="`/catalog/${item.item_id}`" class="block relative h-44 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex-shrink-0">
          <!-- Code badge -->
          <span class="z-10 absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/95 backdrop-blur border border-[#e9ecef] text-[var(--muted-foreground)]">
            {{ item.central_item_code }}
          </span>
          <!-- Type badge -->
          <span
            class="z-10 absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold"
            :class="item.item_type === 'Goods' ? 'bg-blue-50/95 text-blue-700 border border-blue-200' : 'bg-indigo-50/95 text-indigo-700 border border-indigo-200'"
          >
            {{ item.item_type === 'Goods' ? 'สินค้า' : 'บริการ' }}
          </span>
          <!-- In-cart pill overlay -->
          <div v-if="getCartQty(item.item_id) > 0" class="z-10 absolute bottom-2 right-2 flex items-center gap-1 bg-green-600 text-white text-[11px] font-bold rounded-full px-2.5 py-0.5 shadow-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            {{ getCartQty(item.item_id) }} {{ item.uom }}
          </div>

          <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg v-if="item.item_type === 'Goods'" class="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"/></svg>
            <svg v-else class="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.71-4.345a4.5 4.5 0 1 1-6.364-6.364 4.5 4.5 0 0 1 6.364 6.364Z"/></svg>
          </div>
        </NuxtLink>

        <!-- Card Body -->
        <div class="p-4 flex-1 flex flex-col gap-3">
          <!-- Name — clickable to detail -->
          <NuxtLink :to="`/catalog/${item.item_id}`" class="block">
            <h3 class="font-bold text-sm text-[var(--foreground)] line-clamp-2 leading-snug hover:text-[var(--primary)] transition-colors" style="min-height: 2.5rem;">
              {{ item.item_name }}
            </h3>
          </NuxtLink>

          <div class="space-y-0.5 text-xs text-[var(--muted-foreground)]">
            <p class="truncate">คู่ค้า: {{ item.price?.vendor_name || 'N/A' }}</p>
            <p>หน่วยนับ: {{ item.uom }}</p>
          </div>

          <!-- Stock status -->
          <div v-if="item.status === 'LowStock'" class="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ใกล้หมด — เหลือ {{ item.stock_qty }} {{ item.uom }}
          </div>
          <div v-else-if="item.status === 'OutOfStock'" class="flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            สินค้าหมดสต็อก
          </div>
          <div v-else-if="item.status === 'Discontinued'" class="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">
            ยกเลิกการจำหน่าย
          </div>

          <!-- Price + actions — pushed to bottom -->
          <div class="mt-auto pt-3 border-t border-[#eff1f5] space-y-2">
            <div>
              <span class="text-[10px] text-[var(--muted-foreground)]">ราคาต่อหน่วย</span>
              <div class="flex items-baseline gap-1">
                <span class="text-base font-extrabold text-[var(--foreground)]">{{ formatCurrency(item.price?.unit_price) }}</span>
                <span class="text-[10px] text-[var(--muted-foreground)]">THB</span>
              </div>
            </div>

            <!-- State A: ยังไม่ได้เลือก -->
            <template v-if="getCartQty(item.item_id) === 0">
              <button
                class="w-full btn-primary justify-center"
                style="padding: 8px 14px; font-size: 0.75rem;"
                :disabled="['OutOfStock','Discontinued'].includes(item.status)"
                @click="addCart(item)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
                เลือก
              </button>
            </template>

            <!-- State B: มีในตะกร้าแล้ว -->
            <template v-else>
              <div class="flex items-center gap-2">
                <!-- Stepper with editable input -->
                <div class="flex items-center flex-1 border-2 border-[var(--primary)] rounded-lg overflow-hidden bg-white" style="height: 36px;">
                  <button
                    class="w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors font-bold text-lg flex-shrink-0"
                    @click="decreaseCart(item)"
                  >−</button>
                  <input
                    :value="getCartQty(item.item_id)"
                    type="number"
                    min="1"
                    class="flex-1 h-full text-center text-sm font-bold text-[var(--foreground)] focus:outline-none bg-transparent w-0"
                    @change="(e) => setCartQty(item, +(e.target as HTMLInputElement).value)"
                    @input="(e) => setCartQty(item, +(e.target as HTMLInputElement).value)"
                  />
                  <button
                    class="w-9 h-full flex items-center justify-center text-[var(--primary)] hover:bg-green-50 transition-colors font-bold text-lg flex-shrink-0"
                    @click="addCart(item)"
                  >+</button>
                </div>
                <!-- Clear all button -->
                <button
                  class="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors flex-shrink-0 border border-red-200"
                  title="ลบออกจากตะกร้า"
                  @click="clearCart(item)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="filteredItems.length === 0" 
      class="text-center py-16 bg-white border border-[#e9ecef] rounded-xl shadow-[var(--shadow-sm)]"
    >
      <svg class="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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
        item_id: 'cat-01',
        central_item_code: 'ITM-00001',
        item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: 'p01', unit_price: 35000, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/notebook_office.png',
      },
      {
        item_id: 'cat-02',
        central_item_code: 'ITM-00002',
        item_name: 'จอคอมพิวเตอร์ Dell 24 นิ้ว FHD',
        item_type: 'Goods',
        uom: 'จอ',
        status: 'Active',
        price: { price_id: 'p02', unit_price: 4000, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/dell_monitor.png',
      },
      {
        item_id: 'cat-03',
        central_item_code: 'ITM-00003',
        item_name: 'เก้าอี้สำนักงาน Steelcase Gesture',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: 'p03', unit_price: 12000, vendor_id: 'v03', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' },
        image_url: '/images/catalog/office_chair.png',
      },
      {
        item_id: 'cat-08',
        central_item_code: 'ITM-00008',
        item_name: 'โต๊ะทำงานโครงเหล็กกล้า',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: 'p08', unit_price: 3750, vendor_id: 'v03', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' },
        image_url: '/images/catalog/office_desk.png',
      },
      {
        item_id: 'cat-10',
        central_item_code: 'ITM-00010',
        item_name: 'บริการขนส่งสินค้าควบคุมอุณหภูมิด่วน (LTL)',
        item_type: 'Service',
        uom: 'เที่ยว',
        status: 'Active',
        price: { price_id: 'p10', unit_price: 1500, vendor_id: 'v10', vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
        image_url: '/images/catalog/logistics_truck.png',
      },
      {
        item_id: 'cat-11',
        central_item_code: 'ITM-00011',
        item_name: 'บริการซ่อมบำรุงล้างระบบปรับอากาศคลังสินค้า',
        item_type: 'Service',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: 'p11', unit_price: 850, vendor_id: 'v11', vendor_name: 'บริษัท เอ็นจิเนียริ่ง แคร์ จำกัด' },
        image_url: '/images/catalog/office_cleaning.png',
      },
      {
        item_id: 'cat-12',
        central_item_code: 'ITM-00012',
        item_name: 'กระดาษ A4 80 แกรม (ลัง)',
        item_type: 'Goods',
        uom: 'ลัง',
        status: 'Active',
        price: { price_id: 'p12', unit_price: 650, vendor_id: 'v12', vendor_name: 'บริษัท สยามเปเปอร์ ซัพพลาย จำกัด' },
        image_url: '/images/catalog/office_desk.png',
      },
      {
        item_id: 'cat-13',
        central_item_code: 'ITM-00013',
        item_name: 'หมึกพิมพ์เลเซอร์ HP LaserJet (ตลับดำ)',
        item_type: 'Goods',
        uom: 'ตลับ',
        status: 'LowStock',
        stock_qty: 3,
        price: { price_id: 'p13', unit_price: 1200, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/notebook_office.png',
      },
      {
        item_id: 'cat-14',
        central_item_code: 'ITM-00014',
        item_name: 'สวิตช์ Network Managed 24 Port Gigabit',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'OutOfStock',
        stock_qty: 0,
        price: { price_id: 'p14', unit_price: 8500, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/notebook_office.png',
      },
      {
        item_id: 'cat-15',
        central_item_code: 'ITM-00015',
        item_name: 'แฟ้มเอกสาร D-Ring ปกใส A4 (แพ็ค 12)',
        item_type: 'Goods',
        uom: 'แพ็ค',
        status: 'Discontinued',
        stock_qty: 0,
        price: { price_id: 'p15', unit_price: 180, vendor_id: 'v12', vendor_name: 'บริษัท สยามเปเปอร์ ซัพพลาย จำกัด' },
        image_url: '/images/catalog/office_desk.png',
      },
      {
        item_id: 'cat-16',
        central_item_code: 'ITM-00016',
        item_name: 'บริการพัฒนาซอฟต์แวร์ตามสั่ง (Custom Dev)',
        item_type: 'Service',
        uom: 'Man-Day',
        status: 'Active',
        price: { price_id: 'p16', unit_price: 3500, vendor_id: 'v02', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
        image_url: '/images/catalog/notebook_office.png',
      },
      // 20 New Business Case Items
      {
        item_id: 'cat-21',
        central_item_code: 'ITM-00021',
        item_name: 'บริการขนส่งสินค้าทั่วไป (FTL) เส้นทาง กรุงเทพฯ - เชียงใหม่',
        item_type: 'Service',
        uom: 'เที่ยว',
        status: 'Active',
        price: { price_id: 'p21', unit_price: 18000, vendor_id: 'v10', vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
        image_url: '/images/catalog/logistics_truck.png',
      },
      {
        item_id: 'cat-22',
        central_item_code: 'ITM-00022',
        item_name: 'บริการขนส่งสินค้าควบคุมอุณหภูมิ เส้นทาง กรุงเทพฯ - สุราษฎร์ธานี',
        item_type: 'Service',
        uom: 'เที่ยว',
        status: 'Active',
        price: { price_id: 'p22', unit_price: 24000, vendor_id: 'v10', vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
        image_url: '/images/catalog/logistics_truck.png',
      },
      {
        item_id: 'cat-23',
        central_item_code: 'ITM-00023',
        item_name: 'งานก่อสร้างอาคารพาณิชย์ 3 ชั้น (งานโยธาฐานรากและโครงสร้าง)',
        item_type: 'Service',
        uom: 'งาน',
        status: 'Active',
        price: { price_id: 'p23', unit_price: 4500000, vendor_id: 'v11', vendor_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด' },
        image_url: '/images/catalog/commercial_building.png',
      },
      {
        item_id: 'cat-24',
        central_item_code: 'ITM-00024',
        item_name: 'บริการทำความสะอาดคลังสินค้าอุตสาหกรรมบิ๊กคลีนนิ่ง (Big Cleaning)',
        item_type: 'Service',
        uom: 'ครั้ง',
        status: 'Active',
        price: { price_id: 'p24', unit_price: 35000, vendor_id: 'v11', vendor_name: 'บริษัท คลีนโปร เซอร์วิส จำกัด' },
        image_url: '/images/catalog/office_cleaning.png',
      },
      {
        item_id: 'cat-25',
        central_item_code: 'ITM-00025',
        item_name: 'โน้ตบุ๊คทีมวิศวกรรมสเปคสูง 16 นิ้ว (Intel i9 / 32GB / 1TB)',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: 'p25', unit_price: 48500, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/notebook_office.png',
      },
      {
        item_id: 'cat-26',
        central_item_code: 'ITM-00026',
        item_name: 'เก้าอี้ทำงานเพื่อสุขภาพ Herman Miller Aeron (Size B)',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: 'p26', unit_price: 45000, vendor_id: 'v03', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' },
        image_url: '/images/catalog/office_chair.png',
      },
      {
        item_id: 'cat-27',
        central_item_code: 'ITM-00027',
        item_name: 'โต๊ะทำงานปรับระดับไฟฟ้าเพื่อสุขภาพ (Standing Desk Light Wood)',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: 'p27', unit_price: 15500, vendor_id: 'v03', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด' },
        image_url: '/images/catalog/office_desk.png',
      },
      {
        item_id: 'cat-28',
        central_item_code: 'ITM-00028',
        item_name: 'การจ้างพนักงาน Outsource ฝ่ายคลังสินค้า (รายวัน/คน)',
        item_type: 'Service',
        uom: 'Man-Day',
        status: 'Active',
        price: { price_id: 'p28', unit_price: 650, vendor_id: 'v11', vendor_name: 'บริษัท เอ็นจิเนียริ่ง แคร์ จำกัด' },
        image_url: '/images/catalog/safety_vest.png',
      },
      {
        item_id: 'cat-29',
        central_item_code: 'ITM-00029',
        item_name: 'ชุดเสื้อกั๊กนิรภัยสะท้อนแสงมาตรฐานอุตสาหกรรม (Safety Vest)',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: 'p29', unit_price: 450, vendor_id: 'v12', vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด' },
        image_url: '/images/catalog/safety_vest.png',
      },
      {
        item_id: 'cat-30',
        central_item_code: 'ITM-00030',
        item_name: 'ปูนซีเมนต์ปอร์ตแลนด์งานโครงสร้างตราเพชร (ตัน)',
        item_type: 'Goods',
        uom: 'ตัน',
        status: 'Active',
        price: { price_id: 'p30', unit_price: 2500, vendor_id: 'v11', vendor_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด' },
        image_url: '/images/catalog/cement_bag.png',
      },
      {
        item_id: 'cat-31',
        central_item_code: 'ITM-00031',
        item_name: 'เหล็กเส้นกลม SR24 ขนาด 9 มม. มาตรฐาน มอก. (ตัน)',
        item_type: 'Goods',
        uom: 'ตัน',
        status: 'Active',
        price: { price_id: 'p31', unit_price: 22000, vendor_id: 'v11', vendor_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด' },
        image_url: '/images/catalog/steel_bar.png',
      },
      {
        item_id: 'cat-32',
        central_item_code: 'ITM-00032',
        item_name: 'พาเลทพลาสติกอุตสาหกรรมรองรับน้ำหนักกระแทกสูง (Heavy Duty Pallet)',
        item_type: 'Goods',
        uom: 'ชิ้น',
        status: 'Active',
        price: { price_id: 'p32', unit_price: 850, vendor_id: 'v12', vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด' },
        image_url: '/images/catalog/plastic_pallet.png',
      },
      {
        item_id: 'cat-33',
        central_item_code: 'ITM-00033',
        item_name: 'บริการตรวจสอบความมั่นคงของโครงสร้างโรงงานและคลังสินค้าประจำปี',
        item_type: 'Service',
        uom: 'ครั้ง',
        status: 'Active',
        price: { price_id: 'p33', unit_price: 85000, vendor_id: 'v11', vendor_name: 'บริษัท เอ็นจิเนียริ่ง แคร์ จำกัด' },
        image_url: '/images/catalog/commercial_building.png',
      },
      {
        item_id: 'cat-34',
        central_item_code: 'ITM-00034',
        item_name: 'บริการลากตู้คอนเทนเนอร์และขนส่งสินค้าขาเข้า ท่าเรือคลองเตย',
        item_type: 'Service',
        uom: 'เที่ยว',
        status: 'Active',
        price: { price_id: 'p34', unit_price: 6500, vendor_id: 'v10', vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
        image_url: '/images/catalog/logistics_truck.png',
      },
      {
        item_id: 'cat-35',
        central_item_code: 'ITM-00035',
        item_name: 'บริการซ่อมบำรุงเปลี่ยนและตั้งศูนย์สายพานลำเลียงหลักคลังสินค้า',
        item_type: 'Service',
        uom: 'งาน',
        status: 'Active',
        price: { price_id: 'p35', unit_price: 125000, vendor_id: 'v11', vendor_name: 'บริษัท เอ็นจิเนียริ่ง แคร์ จำกัด' },
        image_url: '/images/catalog/office_cleaning.png',
      },
      {
        item_id: 'cat-36',
        central_item_code: 'ITM-00036',
        item_name: 'เครื่องคอมพิวเตอร์ตั้งโต๊ะ All-in-One สำนักงาน 23.8 นิ้ว',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: 'p36', unit_price: 19500, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/notebook_office.png',
      },
      {
        item_id: 'cat-37',
        central_item_code: 'ITM-00037',
        item_name: 'จอภาพโค้งคมชัดสูง UltraWide QHD ขนาด 34 นิ้ว สำหรับงานออกแบบ',
        item_type: 'Goods',
        uom: 'จอ',
        status: 'Active',
        price: { price_id: 'p37', unit_price: 18900, vendor_id: 'v01', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
        image_url: '/images/catalog/dell_monitor.png',
      },
      {
        item_id: 'cat-38',
        central_item_code: 'ITM-00038',
        item_name: 'กระดานบอร์ดประชุมอัจฉริยะระบบสัมผัส Interactive Whiteboard 65 นิ้ว',
        item_type: 'Goods',
        uom: 'ตัว',
        status: 'Active',
        price: { price_id: 'p38', unit_price: 89000, vendor_id: 'v02', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
        image_url: '/images/catalog/office_desk.png',
      },
      {
        item_id: 'cat-39',
        central_item_code: 'ITM-00039',
        item_name: 'โคมไฟตั้งโต๊ะทำงานถนอมสายตา LED ปรับความสว่างและมุมแสงได้',
        item_type: 'Goods',
        uom: 'เครื่อง',
        status: 'Active',
        price: { price_id: 'p39', unit_price: 1290, vendor_id: 'v12', vendor_name: 'บริษัท สยามเปเปอร์ ซัพพลาย จำกัด' },
        image_url: '/images/catalog/desk_lamp.png',
      },
      {
        item_id: 'cat-40',
        central_item_code: 'ITM-00040',
        item_name: 'บริการกำจัดปลวก แมลง และสัตว์รบกวนสำนักงานคลังสินค้าประจำปี',
        item_type: 'Service',
        uom: 'ครั้ง',
        status: 'Active',
        price: { price_id: 'p40', unit_price: 14500, vendor_id: 'v11', vendor_name: 'บริษัท คลีนโปร เซอร์วิส จำกัด' },
        image_url: '/images/catalog/pest_control.png',
      }
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

const getCartQty = (itemId: string): number => {
  return cartStore.items.find((i) => i.item_id === itemId)?.quantity || 0;
};

const decreaseCart = (item: any) => {
  const idx = cartStore.items.findIndex((i) => i.item_id === item.item_id);
  if (idx === -1) return;
  const current = cartStore.items[idx].quantity;
  if (current <= 1) {
    cartStore.removeFromCart(idx);
  } else {
    cartStore.updateQuantity(idx, current - 1);
  }
};

const setCartQty = (item: any, val: number) => {
  if (!val || isNaN(val) || val < 1) return;
  const qty = Math.floor(val);
  const idx = cartStore.items.findIndex((i) => i.item_id === item.item_id);
  if (idx === -1) return;
  cartStore.updateQuantity(idx, qty);
};

const clearCart = (item: any) => {
  const idx = cartStore.items.findIndex((i) => i.item_id === item.item_id);
  if (idx !== -1) cartStore.removeFromCart(idx);
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

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => {
  loadCatalog();
});
</script>

<style scoped>
/* Hide number input arrows in the qty stepper */
.catalog-card input[type=number]::-webkit-inner-spin-button,
.catalog-card input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.catalog-card input[type=number] { -moz-appearance: textfield; }
</style>
