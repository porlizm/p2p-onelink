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
        <NuxtLink to="/pr/create" class="relative">
          <button class="btn-primary relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
            สร้างใบขอซื้อ (PR)
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-2 -right-2 bg-[var(--destructive)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce"
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
        class="bg-white border border-[#e9ecef] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
      >
        <!-- Card Header / Image -->
        <div class="h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-[#eff1f5] relative overflow-hidden">
          <span class="z-10 absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/95 backdrop-blur border border-[#e9ecef] text-[var(--muted-foreground)]">
            {{ item.central_item_code }}
          </span>
          <span 
            class="z-10 absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold"
            :class="[
              item.item_type === 'Goods' 
                ? 'bg-blue-50/95 text-blue-700 border border-blue-200' 
                : 'bg-indigo-50/95 text-indigo-700 border border-indigo-200'
            ]"
          >
            {{ item.item_type === 'Goods' ? 'สินค้า' : 'บริการ' }}
          </span>
          <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="item photo" />
          <template v-else>
            <svg v-if="item.item_type === 'Goods'" class="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"/></svg>
            <svg v-else class="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.71-4.345a4.5 4.5 0 1 1-6.364-6.364 4.5 4.5 0 0 1 6.364 6.364Z"/></svg>
          </template>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="font-bold text-sm text-[var(--foreground)] line-clamp-2 min-h-[40px] group-hover:text-[var(--primary)] transition-colors">
              {{ item.item_name }}
            </h3>
            <div class="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
              <div class="flex items-center gap-1">
                <span class="truncate">คู่ค้า: {{ item.price?.vendor_name || 'N/A' }}</span>
              </div>
              <div class="flex items-center gap-1">
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
              <button
                @click="addCart(item)"
                class="btn-primary"
                style="padding: 6px 14px; font-size: 0.75rem;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
                เลือก
              </button>
            </div>
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
