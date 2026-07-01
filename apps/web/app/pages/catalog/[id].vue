<template>
  <div class="catalog-detail max-w-5xl mx-auto pb-12 space-y-6">

    <!-- Back -->
    <div class="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
      <NuxtLink to="/catalog" class="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        รายการสินค้า (E-Catalog)
      </NuxtLink>
      <span>/</span>
      <span class="text-[var(--foreground)] font-medium truncate max-w-[240px]">{{ item?.item_name }}</span>
    </div>

    <!-- Main layout -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

      <!-- Left: Gallery -->
      <div class="lg:col-span-3 space-y-3">
        <!-- Main image -->
        <div class="rounded-2xl overflow-hidden border border-[#e9ecef] bg-gradient-to-br from-slate-50 to-slate-100 relative" style="height: 340px;">
          <span class="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/95 backdrop-blur border border-[#e9ecef] text-[var(--muted-foreground)]">
            {{ item?.central_item_code }}
          </span>
          <span class="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="item?.item_type === 'Goods' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'">
            {{ item?.item_type === 'Goods' ? 'สินค้า' : 'บริการ' }}
          </span>
          <img
            v-if="galleryImages[selectedImage]"
            :src="galleryImages[selectedImage]"
            class="w-full h-full object-cover transition-opacity duration-300"
            :alt="item?.item_name"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-20 h-20 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
          </div>
        </div>

        <!-- Thumbnails -->
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(img, i) in galleryImages"
            :key="i"
            @click="selectedImage = i"
            class="flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all"
            :class="selectedImage === i ? 'border-[var(--primary)] shadow-sm' : 'border-[#e9ecef] hover:border-slate-300'"
          >
            <img v-if="img" :src="img" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/></svg>
            </div>
          </button>
        </div>

        <!-- Specs / Service scope -->
        <div class="bg-white border border-[#e9ecef] rounded-2xl overflow-hidden">
          <div class="px-5 py-3.5 border-b border-[#eff1f5] bg-[#fafbfc] flex items-center gap-2">
            <svg class="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>
            <h3 class="font-semibold text-sm text-[var(--foreground)]">
              {{ item?.item_type === 'Service' ? 'ขอบเขตการให้บริการ (Scope of Service)' : 'ข้อกำหนดสินค้า (Specifications)' }}
            </h3>
          </div>
          <div class="divide-y divide-[#eff1f5]">
            <div v-for="spec in item?.specs" :key="spec.label" class="flex items-start px-5 py-3 text-sm">
              <span class="w-44 flex-shrink-0 text-[var(--muted-foreground)] text-xs font-medium">{{ spec.label }}</span>
              <span class="flex-1 font-medium text-[var(--foreground)] text-xs">{{ spec.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Info + Cart -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Status warning banners -->
        <div v-if="item?.status === 'LowStock'" class="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
          สินค้าใกล้หมด — เหลือเพียง {{ item.stock_qty }} {{ item.uom }}
        </div>
        <div v-if="item?.status === 'OutOfStock'" class="flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          สินค้าหมดสต็อก — ไม่สามารถสั่งซื้อได้ในขณะนี้
        </div>
        <div v-if="item?.status === 'Discontinued'" class="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5">
          สินค้านี้ยกเลิกการจำหน่ายแล้ว ไม่รับออเดอร์ใหม่
        </div>

        <!-- Item name + code -->
        <div>
          <h2 class="text-xl font-extrabold text-[var(--foreground)] leading-snug">{{ item?.item_name }}</h2>
          <p class="text-xs text-[var(--muted-foreground)] mt-1">รหัส: <span class="font-mono font-semibold text-[var(--foreground)]">{{ item?.central_item_code }}</span></p>
        </div>

        <!-- Vendor info -->
        <div class="bg-[#fafbfc] border border-[#e9ecef] rounded-xl p-3 text-xs space-y-1.5">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/></svg>
            <span class="font-semibold text-[var(--foreground)]">{{ item?.price?.vendor_name || '—' }}</span>
          </div>
          <div class="flex items-center gap-4 pl-6 text-[var(--muted-foreground)]">
            <span>หน่วยนับ: <strong class="text-[var(--foreground)]">{{ item?.uom }}</strong></span>
            <span>หมวดหมู่: <strong class="text-[var(--foreground)]">{{ item?.category || '—' }}</strong></span>
          </div>
        </div>

        <!-- Price + QTY -->
        <div class="bg-white border border-[#e9ecef] rounded-2xl p-5 space-y-4">
          <div>
            <span class="text-xs text-[var(--muted-foreground)]">ราคาต่อหน่วย (ไม่รวม VAT)</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-3xl font-black text-[var(--foreground)]">{{ formatCurrency(item?.price?.unit_price) }}</span>
              <span class="text-sm text-[var(--muted-foreground)]">THB / {{ item?.uom }}</span>
            </div>
          </div>

          <!-- Qty input -->
          <div v-if="!['OutOfStock','Discontinued'].includes(item?.status || '')" class="space-y-2">
            <label class="text-xs font-semibold text-slate-700">จำนวนที่ต้องการ</label>
            <div class="flex items-center border border-[#e9ecef] rounded-xl overflow-hidden bg-white h-11">
              <button class="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors font-bold text-xl border-r border-[#e9ecef]" @click="qty = Math.max(1, qty - 1)">−</button>
              <input
                v-model.number="qty"
                type="number"
                min="1"
                class="flex-1 h-full text-center text-base font-bold text-[var(--foreground)] focus:outline-none bg-transparent"
              />
              <button class="w-11 h-full flex items-center justify-center text-[var(--primary)] hover:bg-green-50 transition-colors font-bold text-xl border-l border-[#e9ecef]" @click="qty++">+</button>
            </div>
          </div>

          <!-- Total -->
          <div v-if="!['OutOfStock','Discontinued'].includes(item?.status || '')" class="flex items-center justify-between text-sm border-t border-[#eff1f5] pt-3">
            <span class="text-[var(--muted-foreground)]">ราคารวม</span>
            <span class="font-black text-lg text-[var(--foreground)]">{{ formatCurrency((item?.price?.unit_price || 0) * qty) }} <span class="font-medium text-xs text-[var(--muted-foreground)]">THB</span></span>
          </div>

          <!-- In-cart indicator -->
          <div v-if="cartQty > 0" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs font-semibold text-green-800">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            มีในตะกร้าแล้ว {{ cartQty }} {{ item?.uom }}
          </div>

          <!-- Add to cart -->
          <button
            class="w-full btn-primary justify-center text-sm py-2.5"
            :disabled="['OutOfStock','Discontinued'].includes(item?.status || '')"
            @click="addToCart"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h19l-1.68 8.39A2 2 0 0 1 18.34 16H7.66a2 2 0 0 1-1.97-1.61L4 6"/><path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M1 1h4l2.68 13.39"/></svg>
            {{ cartQty > 0 ? 'เพิ่มในตะกร้าอีก' : 'เพิ่มในตะกร้า' }}
          </button>

          <NuxtLink to="/pr/create" class="block">
            <button class="w-full btn-outline justify-center text-sm py-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
              ไปสร้างใบขอซื้อ (PR)
              <span v-if="cartStore.totalItems > 0" class="ml-1.5 bg-red-600 text-white text-[10px] font-black rounded-full px-1.5 py-0.5">{{ cartStore.totalItems }}</span>
            </button>
          </NuxtLink>
        </div>

        <!-- Contract / Lead time info -->
        <div class="bg-white border border-[#e9ecef] rounded-xl px-4 py-3 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-[var(--muted-foreground)]">ระยะเวลาส่งมอบ</span>
            <span class="font-semibold text-[var(--foreground)]">{{ item?.lead_time || '3–5 วันทำการ' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[var(--muted-foreground)]">ขั้นต่ำการสั่งซื้อ (MOQ)</span>
            <span class="font-semibold text-[var(--foreground)]">{{ item?.moq || 1 }} {{ item?.uom }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[var(--muted-foreground)]">เงื่อนไขการรับประกัน</span>
            <span class="font-semibold text-[var(--foreground)]">{{ item?.warranty || '—' }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-[#eff1f5] pt-2">
            <span class="text-[var(--muted-foreground)]">สถานะในสัญญา</span>
            <span class="font-semibold text-green-700">{{ item?.contract_ref || 'ราคาสัญญา CNT-2025-0001' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl bg-green-600 text-white text-sm font-semibold transition-all">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useCartStore } from '~/stores/cart';

const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const item = ref<any>(null);
const selectedImage = ref(0);
const qty = ref(1);
const toast = ref({ show: false, message: '' });

const galleryImages = computed(() => {
  if (!item.value?.image_url) return [null, null, null];
  return [item.value.image_url, item.value.image_url, item.value.image_url];
});

const cartQty = computed(() => {
  return cartStore.items.find((i) => i.item_id === item.value?.item_id)?.quantity || 0;
});

const addToCart = () => {
  if (!item.value) return;
  for (let i = 0; i < qty.value; i++) {
    cartStore.addToCart({
      item_id: item.value.item_id,
      item_name: item.value.item_name,
      uom: item.value.uom,
      unit_price: item.value.price?.unit_price || 0,
      vendor_id: item.value.price?.vendor_id,
      is_custom: false,
      quantity: 1,
    });
  }
  toast.value = { show: true, message: `เพิ่ม "${item.value.item_name}" × ${qty.value} ${item.value.uom} ในตะกร้าแล้ว` };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const mockItems: Record<string, any> = {
  'cat-01': {
    item_id: 'cat-01', central_item_code: 'ITM-00001',
    item_name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว',
    item_type: 'Goods', uom: 'เครื่อง', status: 'Active',
    category: 'อุปกรณ์ไอที', lead_time: '5–7 วันทำการ', moq: 1, warranty: '1 ปี (On-site)',
    contract_ref: 'ราคาสัญญา CNT-2025-0001',
    price: { unit_price: 35000, vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
    image_url: '/images/catalog/notebook_office.png',
    specs: [
      { label: 'ซีพียู', value: 'Intel Core i5-1235U (10-core, up to 4.4 GHz)' },
      { label: 'หน่วยความจำ', value: 'RAM 16 GB DDR5' },
      { label: 'จัดเก็บข้อมูล', value: 'SSD NVMe 512 GB' },
      { label: 'หน้าจอ', value: '14" FHD IPS Anti-glare, 300 nits' },
      { label: 'การ์ดจอ', value: 'Intel Iris Xe Graphics' },
      { label: 'ระบบปฏิบัติการ', value: 'Windows 11 Pro (ลิขสิทธิ์แท้)' },
      { label: 'น้ำหนัก', value: '1.4 kg' },
      { label: 'แบตเตอรี่', value: '45 Wh, ใช้งานได้ ~10 ชม.' },
      { label: 'พอร์ตเชื่อมต่อ', value: 'USB-C, USB-A x2, HDMI, SD Card' },
      { label: 'มาตรฐาน', value: 'MIL-STD-810H Military Grade' },
    ],
  },
  'cat-02': {
    item_id: 'cat-02', central_item_code: 'ITM-00002',
    item_name: 'จอคอมพิวเตอร์ Dell 24 นิ้ว FHD',
    item_type: 'Goods', uom: 'จอ', status: 'Active',
    category: 'อุปกรณ์ไอที', lead_time: '3–5 วันทำการ', moq: 1, warranty: '3 ปี (Advance Exchange)',
    contract_ref: 'ราคาสัญญา CNT-2025-0001',
    price: { unit_price: 4000, vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด' },
    image_url: '/images/catalog/dell_monitor.png',
    specs: [
      { label: 'ขนาดหน้าจอ', value: '24 นิ้ว (23.8" Viewable)' },
      { label: 'ความละเอียด', value: 'Full HD 1920 × 1080' },
      { label: 'แผงหน้าจอ', value: 'IPS Anti-glare' },
      { label: 'อัตราการรีเฟรช', value: '75 Hz' },
      { label: 'เวลาตอบสนอง', value: '5 ms (GtG)' },
      { label: 'ความสว่าง', value: '250 nits' },
      { label: 'สี', value: 'sRGB 99%' },
      { label: 'พอร์ต', value: 'HDMI 1.4, VGA, DisplayPort 1.2' },
      { label: 'ขาตั้ง', value: 'ปรับเอียง -5° ถึง +21°' },
      { label: 'การรับรอง', value: 'TCO Certified, Energy Star 8.0' },
    ],
  },
  'cat-10': {
    item_id: 'cat-10', central_item_code: 'ITM-00010',
    item_name: 'บริการขนส่งสินค้าควบคุมอุณหภูมิด่วน (LTL)',
    item_type: 'Service', uom: 'เที่ยว', status: 'Active',
    category: 'โลจิสติกส์', lead_time: 'จองล่วงหน้า 1 วัน', moq: 1, warranty: 'ประกันสินค้าระหว่างขนส่ง',
    contract_ref: 'ราคาสัญญา CNT-2025-0003',
    price: { unit_price: 1500, vendor_name: 'บริษัท ทรานส์สปีด โลจิสติกส์ จำกัด' },
    image_url: '/images/catalog/logistics_truck.png',
    specs: [
      { label: 'ประเภทบริการ', value: 'Less-than-Truckload (LTL) ควบคุมอุณหภูมิ' },
      { label: 'อุณหภูมิ', value: '+2°C ถึง +8°C (Chilled), -18°C (Frozen)' },
      { label: 'น้ำหนักรับได้สูงสุด', value: '500 kg / เที่ยว' },
      { label: 'พื้นที่ให้บริการ', value: 'ในเขตกรุงเทพฯ และปริมณฑล' },
      { label: 'ระยะเวลาจัดส่ง', value: 'ภายใน 4 ชั่วโมง (Same-day)' },
      { label: 'ระบบติดตาม', value: 'GPS Real-time tracking พร้อม Dashboard' },
      { label: 'เอกสาร', value: 'ใบรับมอบสินค้า + รูปถ่ายก่อน/หลังส่ง' },
      { label: 'ประกันสินค้า', value: 'คุ้มครองสูงสุด 50,000 บาท / เที่ยว' },
      { label: 'SLA', value: 'ส่งตรงเวลา ≥ 95% หรือชดเชย 10% ของค่าบริการ' },
      { label: 'ช่องทางรับแจ้ง', value: 'Call Center 24/7, LINE Official' },
    ],
  },
};

const loadItem = async () => {
  const id = route.params.id as string;
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/catalog/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    item.value = res;
  } catch {
    item.value = mockItems[id] || mockItems['cat-01'];
    if (!mockItems[id]) item.value.item_id = id;
  }
};

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00';
  return Number(val).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => {
  loadItem();
});
</script>

<style scoped>
.catalog-detail {
  font-family: var(--font-sans);
}

.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-semibold);
  background: var(--gradient-brand-diagonal, #009245);
  color: white; border: none; cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.btn-primary:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,146,69,0.35); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-semibold);
  background: #f4f6f8; color: var(--fg-secondary);
  border: none; cursor: pointer;
  transition: background 0.15s;
}
.btn-outline:hover { background: #e9ecef; }

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
</style>
