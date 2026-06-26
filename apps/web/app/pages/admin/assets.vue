<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ระบบบริหารจัดการและติดตามสินทรัพย์ (Asset Management & Allocation Console)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">
          ควบคุมและตรวจสอบสินทรัพย์ในครอบครอง การส่งมอบครุภัณฑ์ หรือการเช่าครุภัณฑ์ข้ามฝ่ายงาน (BU-to-BU Asset Rental) ในเครือ SCGJWD
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton 
          @click="showCreateModal = true"
          color="primary"
          icon="i-heroicons-plus"
          class="font-bold text-xs cursor-pointer"
        >
          ลงทะเบียนสินทรัพย์ใหม่ (Acquisition)
        </UButton>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UIcon name="i-heroicons-cube" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รายการสินทรัพย์ทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatQuantity(stats.totalAssets) }} รายการ</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">มูลค่าสินทรัพย์รวม</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(stats.totalVal) }} THB</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
          <UIcon name="i-heroicons-key" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">สิทธิ์ใช้งานซอฟต์แวร์ (Licenses)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatQuantity(stats.totalLicenseSeats) }} Seats</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รายการเช่าข้ามหน่วยงาน (Active)</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatQuantity(stats.activeRentals) }} เครื่อง/หน่วย</span>
        </div>
      </div>
    </div>

    <!-- Allocation Flow Visual Simulation (User's Laptop Example) -->
    <div class="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)] space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
          <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--primary)]" />
          ภาพรวมการกระจายสินทรัพย์จัดซื้อแล็ปท็อป ( Lenovo ThinkPad 100 เครื่อง )
        </h3>
        <span class="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
          การเช่าภายในเครือ SCGJWD
        </span>
      </div>

      <!-- Horizontal Visual Track -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        <div class="bg-slate-50 border rounded-lg p-3 text-center">
          <div class="text-[10px] text-slate-400 font-semibold">จัดซื้อส่วนกลาง</div>
          <div class="text-base font-extrabold text-slate-800 mt-1">100 เครื่อง</div>
          <div class="text-[9px] text-slate-500 mt-0.5">ราคา 35,000 THB/เครื่อง</div>
        </div>
        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-center relative">
          <div class="text-[10px] text-blue-600 font-semibold">เช่าโดย 3 BU (SCGJWD)</div>
          <div class="text-base font-extrabold text-blue-800 mt-1">60 เครื่อง</div>
          <div class="text-[9px] text-blue-500 mt-0.5">เฉลี่ย 20 เครื่อง / BU</div>
          <div class="absolute -right-2 top-4 hidden md:block text-slate-300">➜</div>
        </div>
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-center relative">
          <div class="text-[10px] text-indigo-600 font-semibold">เช่าโดย บริษัทในเครือ</div>
          <div class="text-base font-extrabold text-indigo-800 mt-1">30 เครื่อง</div>
          <div class="text-[9px] text-indigo-500 mt-0.5">ส่งต่อโอนสิทธิ์ใช้งาน</div>
          <div class="absolute -right-2 top-4 hidden md:block text-slate-300">➜</div>
        </div>
        <div class="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-center relative">
          <div class="text-[10px] text-emerald-600 font-semibold">สำรองคงคลัง (HQ)</div>
          <div class="text-base font-extrabold text-emerald-800 mt-1">10 เครื่อง</div>
          <div class="text-[9px] text-emerald-500 mt-0.5">พร้อมจัดสรรเพิ่มเติม</div>
        </div>
        <div class="bg-slate-800 text-white rounded-lg p-3 text-center">
          <div class="text-[10px] text-slate-300 font-semibold">รายได้ค่าเช่าสะสมภายใน</div>
          <div class="text-base font-extrabold text-yellow-400 mt-1">{{ formatCurrency(90 * 500) }} THB</div>
          <div class="text-[9px] text-slate-400 mt-0.5">อัตรา 500.- / เครื่อง / เดือน</div>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-wrap gap-4 items-center justify-between">
      <div class="flex items-center gap-3 flex-1 min-w-[280px]">
        <UInput 
          v-model="searchQuery" 
          placeholder="ค้นหาชื่อสินทรัพย์ หรือ รหัส Tag..." 
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </div>
      <div class="flex items-center gap-3">
        <div>
          <label class="text-[10px] text-slate-400 font-semibold block mb-1">ประเภทสินทรัพย์</label>
          <USelect 
            v-model="filterType"
            :options="['All', 'Goods', 'Service', 'Rental', 'License']"
            size="sm"
          />
        </div>
        <div>
          <label class="text-[10px] text-slate-400 font-semibold block mb-1">สถานะ</label>
          <USelect 
            v-model="filterStatus"
            :options="['All', 'In Stock', 'Distributed', 'Rented', 'Scrapped']"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- Assets Registry Table -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div class="font-bold text-slate-700">ทะเบียนคลังสินทรัพย์กลาง (Central Asset Registry)</div>
        <div class="text-xs text-[var(--muted-foreground)]">แสดงข้อมูลสินทรัพย์ที่จัดซื้อและสัดส่วนการส่งต่อ</div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">รหัสสินทรัพย์ (Tag)</th>
              <th class="px-6 py-3">ชื่อสินทรัพย์</th>
              <th class="px-6 py-3">ประเภท</th>
              <th class="px-6 py-3 text-right">ราคาทุนต่อหน่วย</th>
              <th class="px-6 py-3 text-center">จำนวนจัดซื้อ</th>
              <th class="px-6 py-3 text-center">ส่งมอบ/เช่า</th>
              <th class="px-6 py-3 text-center">คงเหลือที่ HQ</th>
              <th class="px-6 py-3">สถานะ</th>
              <th class="px-6 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="asset in filteredAssets" :key="asset.asset_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-mono font-bold text-slate-500 text-xs">{{ asset.asset_tag }}</td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-800">{{ asset.asset_name }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5" v-if="asset.license_key">Key: {{ asset.license_key }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5" v-else-if="asset.po">อ้างอิง PO: {{ asset.po.po_no }}</div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="[
                    asset.asset_type === 'Goods' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    asset.asset_type === 'License' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    asset.asset_type === 'Rental' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-50 text-slate-700 border border-slate-200'
                  ]"
                >
                  {{ asset.asset_type }}
                </span>
              </td>
              <td class="px-6 py-4 text-right font-medium text-slate-600">{{ formatCurrency(asset.unit_price) }}</td>
              <td class="px-6 py-4 text-center font-bold text-slate-700">{{ formatQuantity(asset.total_qty) }}</td>
              <td class="px-6 py-4 text-center text-indigo-600 font-extrabold">{{ formatQuantity(asset.distributed_qty) }}</td>
              <td class="px-6 py-4 text-center font-bold text-emerald-600">{{ formatQuantity(asset.remaining_qty) }}</td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="[
                    asset.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                    asset.status === 'Distributed' ? 'bg-blue-100 text-blue-800' :
                    asset.status === 'Rented' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ asset.status === 'In Stock' ? 'พร้อมใช้งาน' : asset.status === 'Distributed' ? 'ส่งมอบแล้ว' : asset.status === 'Rented' ? 'ให้เช่าทั้งหมด' : asset.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <UButton 
                  size="xs" 
                  variant="outline" 
                  color="gray"
                  class="cursor-pointer"
                  @click="openDetails(asset.asset_id)"
                >
                  ดูรายละเอียด
                </UButton>
                <UButton 
                  v-if="asset.remaining_qty > 0"
                  size="xs" 
                  color="indigo" 
                  class="cursor-pointer font-bold"
                  @click="openAllocateForm(asset)"
                >
                  จัดสรร/ให้เช่า
                </UButton>
              </td>
            </tr>
            <tr v-if="filteredAssets.length === 0">
              <td colspan="9" class="text-center py-8 text-slate-400">ไม่พบข้อมูลสินทรัพย์ตามเงื่อนไขที่กรอง</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: VIEW ASSET DETAILS & ALLOCATIONS -->
    <UModal v-model="showDetailsModal" :ui="{ width: 'max-w-3xl' }">
      <div class="p-6 space-y-5" v-if="selectedAsset">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-800">ข้อมูลสินทรัพย์: {{ selectedAsset.asset_name }}</h3>
            <span class="text-xs text-slate-400">Tag: {{ selectedAsset.asset_tag }}</span>
          </div>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            @click="showDetailsModal = false" 
          />
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div class="bg-slate-50 p-2.5 rounded-lg border">
            <span class="text-slate-400 block font-semibold mb-0.5">ประเภท</span>
            <span class="font-bold text-slate-800">{{ selectedAsset.asset_type }}</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border">
            <span class="text-slate-400 block font-semibold mb-0.5">ราคาทุนต่อหน่วย</span>
            <span class="font-bold text-slate-800">{{ formatCurrency(selectedAsset.unit_price) }} THB</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border">
            <span class="text-slate-400 block font-semibold mb-0.5">ผู้ถือครองเจ้าของ</span>
            <span class="font-bold text-slate-800">{{ selectedAsset.owner_bu?.bu_name || 'ส่วนกลาง' }}</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border">
            <span class="text-slate-400 block font-semibold mb-0.5">ยอดคงคลัง (HQ)</span>
            <span class="font-extrabold text-emerald-600">{{ formatQuantity(selectedAsset.remaining_qty) }} / {{ formatQuantity(selectedAsset.total_qty) }}</span>
          </div>
        </div>

        <!-- Technical key details if exists -->
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1" v-if="selectedAsset.license_key || selectedAsset.expiry_date">
          <div class="font-bold text-slate-700 mb-1 border-b pb-0.5">รายละเอียดสัญญา/คีย์ลิขสิทธิ์เพิ่มเติม</div>
          <div class="flex justify-between" v-if="selectedAsset.license_key">
            <span class="text-slate-500">License Activation Key:</span>
            <span class="font-mono font-bold text-slate-800">{{ selectedAsset.license_key }}</span>
          </div>
          <div class="flex justify-between" v-if="selectedAsset.expiry_date">
            <span class="text-slate-500">วันสิ้นสุดสัญญาบริการ / สิทธิ์ลิขสิทธิ์:</span>
            <span class="font-bold text-red-600">{{ formatDate(selectedAsset.expiry_date) }}</span>
          </div>
        </div>

        <!-- Allocations / Distribution History List -->
        <div class="space-y-2">
          <div class="font-bold text-slate-700 text-xs">ประวัติการจัดส่งและแบ่งเช่าข้ามหน่วยงาน (Inter-BU Allocation Logs)</div>
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-100 border-b text-[10px] font-semibold text-slate-500 uppercase">
                  <th class="px-4 py-2">หน่วยงานปลายทาง (BU / Affiliate)</th>
                  <th class="px-4 py-2">ประเภทการจัดสรร</th>
                  <th class="px-4 py-2 text-center">จำนวน</th>
                  <th class="px-4 py-2 text-right">ค่าเช่าสะสมต่อรอบบิล</th>
                  <th class="px-4 py-2">วันที่เริ่มต้นเช่า</th>
                  <th class="px-4 py-2">สถานะ</th>
                </tr>
              </thead>
              <tbody class="divide-y text-slate-600">
                <tr v-for="al in selectedAsset.allocations" :key="al.allocation_id" class="hover:bg-slate-50/50">
                  <td class="px-4 py-2.5 font-semibold text-slate-800">{{ al.to_bu?.bu_name || 'บริษัทในเครือ' }}</td>
                  <td class="px-4 py-2.5">
                    <span 
                      class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      :class="al.allocation_type === 'Rental' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                    >
                      {{ al.allocation_type === 'Rental' ? 'เช่าใช้งานภายใน' : 'โอนจัดส่งมอบ' }}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-center font-bold text-slate-800">{{ formatQuantity(al.allocated_qty) }}</td>
                  <td class="px-4 py-2.5 text-right font-medium font-mono text-slate-700">
                    {{ al.rental_rate > 0 ? formatCurrency(al.rental_rate) + ' THB' : '-' }}
                  </td>
                  <td class="px-4 py-2.5">{{ formatDate(al.start_date) }}</td>
                  <td class="px-4 py-2.5">
                    <span class="px-1.5 py-0.5 rounded-full text-[9px] bg-green-100 text-green-800 font-bold" v-if="al.status === 'Active'">
                      กำลังใช้งาน
                    </span>
                    <span class="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-700" v-else>
                      ส่งคืนแล้ว
                    </span>
                  </td>
                </tr>
                <tr v-if="!selectedAsset.allocations || selectedAsset.allocations.length === 0">
                  <td colspan="6" class="text-center py-6 text-slate-400">ยังไม่มีประวัติการส่งมอบหรือเช่าสินทรัพย์นี้</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UModal>

    <!-- MODAL 2: ALLOCATE / LEASE ASSET FORM -->
    <UModal v-model="showAllocateModal">
      <div class="p-6 space-y-4" v-if="allocateTarget">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-800">จัดสรรหรือแบ่งเช่าสินทรัพย์</h3>
            <span class="text-xs text-slate-500">สินทรัพย์: {{ allocateTarget.asset_name }} (คงเหลือ: {{ formatQuantity(allocateTarget.remaining_qty) }})</span>
          </div>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            @click="showAllocateModal = false" 
          />
        </div>

        <form @submit.prevent="submitAllocation" class="space-y-4 text-xs">
          <!-- Select Target BU -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">ส่งมอบให้กับ Business Unit (BU) หรือ Affiliates ในเครือ JWD</label>
            <USelect 
              v-model="allocForm.to_bu_id"
              :options="buOptions"
              class="w-full"
            />
          </div>

          <!-- Quantity to allocate -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">จำนวนที่จัดสรร (เครื่อง/หน่วย)</label>
            <UInput 
              v-model.number="allocForm.allocated_qty"
              type="number"
              min="1"
              :max="allocateTarget.remaining_qty"
              class="w-full"
              placeholder="กรอกจำนวนที่จะจัดสรร"
            />
          </div>

          <!-- Allocation Type -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">ประเภทการจัดสรร</label>
            <USelect 
              v-model="allocForm.allocation_type"
              :options="['Rental', 'Distribution']"
              class="w-full"
            />
          </div>

          <!-- Rental rate (only for Rental type) -->
          <div v-if="allocForm.allocation_type === 'Rental'">
            <label class="font-bold text-slate-700 block mb-1">อัตราค่าเช่าภายใน (Internal Rate per Month / THB)</label>
            <UInput 
              v-model.number="allocForm.rental_rate"
              type="number"
              min="0"
              class="w-full"
              placeholder="เช่น 500"
            />
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">วันที่เริ่มต้นจัดสรร</label>
              <UInput 
                v-model="allocForm.start_date"
                type="date"
                class="w-full"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">วันที่สิ้นสุดจัดสรร (ถ้ามี)</label>
              <UInput 
                v-model="allocForm.end_date"
                type="date"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex justify-end pt-3 gap-2 border-t">
            <UButton 
              type="button" 
              variant="outline" 
              color="gray"
              class="cursor-pointer"
              @click="showAllocateModal = false"
            >
              ยกเลิก
            </UButton>
            <UButton 
              type="submit" 
              color="primary"
              class="cursor-pointer font-bold"
              :loading="submitting"
            >
              ยืนยันการจัดสรรครุภัณฑ์
            </UButton>
          </div>
        </form>
      </div>
    </UModal>

    <!-- MODAL 3: MANUAL ACQUISITION REGISTER -->
    <UModal v-model="showCreateModal">
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-slate-800">ลงทะเบียนจัดซื้อสินทรัพย์ใหม่ (Manual Entry)</h3>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            @click="showCreateModal = false" 
          />
        </div>

        <form @submit.prevent="submitCreateAsset" class="space-y-4 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">ชื่อรายการสินค้า หรือ สัญญาบริการ</label>
            <UInput 
              v-model="createForm.asset_name"
              placeholder="เช่น อุปกรณ์เครือข่าย หรือ โน้ตบุ๊คทีมจัดซื้อ"
              class="w-full"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">ประเภทสินทรัพย์</label>
              <USelect 
                v-model="createForm.asset_type"
                :options="['Goods', 'Service', 'Rental', 'License']"
                class="w-full"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">ผู้ครอบครองผู้ถือสิทธิ์</label>
              <USelect 
                v-model="createForm.owner_bu_id"
                :options="buOptions"
                class="w-full"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">ราคาทุนต่อหน่วย (THB)</label>
              <UInput 
                v-model.number="createForm.unit_price"
                type="number"
                min="0"
                class="w-full"
                required
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">จำนวนหน่วยจัดซื้อทั้งหมด</label>
              <UInput 
                v-model.number="createForm.total_qty"
                type="number"
                min="1"
                class="w-full"
                required
              />
            </div>
          </div>

          <div v-if="createForm.asset_type === 'License'">
            <label class="font-bold text-slate-700 block mb-1">License Product Key (ถ้ามี)</label>
            <UInput 
              v-model="createForm.license_key"
              placeholder="M365-XXXX-XXXX-XXXX"
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">วันที่เริ่มสั่งซื้อ/ส่งมอบ</label>
              <UInput 
                v-model="createForm.acquisition_date"
                type="date"
                class="w-full"
              />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">วันหมดอายุประกัน/สัญญาบริการ (ถ้ามี)</label>
              <UInput 
                v-model="createForm.expiry_date"
                type="date"
                class="w-full"
              />
            </div>
          </div>

          <div class="flex justify-end pt-3 gap-2 border-t">
            <UButton 
              type="button" 
              variant="outline" 
              color="gray"
              class="cursor-pointer"
              @click="showCreateModal = false"
            >
              ยกเลิก
            </UButton>
            <UButton 
              type="submit" 
              color="primary"
              class="cursor-pointer font-bold"
              :loading="submitting"
            >
              ลงทะเบียนสินทรัพย์
            </UButton>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

// UI States
const searchQuery = ref('');
const filterType = ref('All');
const filterStatus = ref('All');
const showDetailsModal = ref(false);
const showAllocateModal = ref(false);
const showCreateModal = ref(false);
const submitting = ref(false);

// Core Data
const assets = ref<any[]>([]);
const selectedAsset = ref<any>(null);
const allocateTarget = ref<any>(null);
const stats = ref({
  totalAssets: 0,
  totalVal: 0,
  totalLicenseSeats: 0,
  activeRentals: 0,
});

// Dropdown Options
const buOptions = [
  { value: '00000002-0000-0000-0000-000000000002', label: 'IT - ฝ่ายเทคโนโลยีสารสนเทศ' },
  { value: '00000002-0000-0000-0000-000000000001', label: 'PROC - ฝ่ายจัดซื้อกลาง' },
  { value: '00000002-0000-0000-0000-000000000003', label: 'WH - คลังสินค้าและปฏิบัติการ' },
  { value: '00000002-0000-0000-0000-000000000004', label: 'FIN - ฝ่ายบัญชีและการเงิน' },
  { value: '00000002-0000-0000-0000-000000000005', label: 'B2C - ฝ่ายขายและบริการลูกค้า B2C' },
];

// Forms DTO mapping
const allocForm = ref({
  to_bu_id: '00000002-0000-0000-0000-000000000001',
  allocated_qty: 1,
  allocation_type: 'Rental',
  rental_rate: 500,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
});

const createForm = ref({
  asset_name: '',
  asset_type: 'Goods',
  owner_bu_id: '00000002-0000-0000-0000-000000000002', // Default IT
  unit_price: 35000,
  total_qty: 10,
  license_key: '',
  acquisition_date: new Date().toISOString().split('T')[0],
  expiry_date: '',
});

// Fetch APIs
const loadData = async () => {
  try {
    const data = await $fetch<any[]>('http://localhost:3001/api/asset', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    assets.value = data;

    const summary = await $fetch<any>('http://localhost:3001/api/asset/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    stats.value = summary;
  } catch (err) {
    console.error('Failed to load asset data from backend', err);
  }
};

const openDetails = async (id: string) => {
  try {
    const details = await $fetch<any>(`http://localhost:3001/api/asset/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    selectedAsset.value = details;
    showDetailsModal.value = true;
  } catch (err) {
    console.error('Failed to load asset detail', err);
  }
};

const openAllocateForm = (asset: any) => {
  allocateTarget.value = asset;
  allocForm.value = {
    to_bu_id: '00000002-0000-0000-0000-000000000001', // PROC
    allocated_qty: 1,
    allocation_type: 'Rental',
    rental_rate: 500,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  };
  showAllocateModal.value = true;
};

// Submissions
const submitAllocation = async () => {
  if (!allocateTarget.value) return;
  submitting.value = true;
  try {
    await $fetch(`http://localhost:3001/api/asset/${allocateTarget.value.asset_id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: allocForm.value,
    });
    showAllocateModal.value = false;
    await loadData();
    alert('จัดสรรสินทรัพย์ข้ามฝ่ายสำเร็จเรียบร้อยแล้ว!');
  } catch (err: any) {
    alert(err.data?.message || 'เกิดข้อผิดพลาดในการจัดสรรสินทรัพย์');
  } finally {
    submitting.value = false;
  }
};

const submitCreateAsset = async () => {
  submitting.value = true;
  try {
    await $fetch('http://localhost:3001/api/asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: createForm.value,
    });
    showCreateModal.value = false;
    await loadData();
    alert('ลงทะเบียนสินทรัพย์ใหม่สำเร็จ!');
  } catch (err: any) {
    alert(err.data?.message || 'เกิดข้อผิดพลาดในการบันทึกสินทรัพย์');
  } finally {
    submitting.value = false;
  }
};

// Filtered List
const filteredAssets = computed(() => {
  return assets.value.filter((a) => {
    const matchesSearch = 
      a.asset_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.asset_tag.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesType = filterType.value === 'All' || a.asset_type === filterType.value;
    const matchesStatus = filterStatus.value === 'All' || a.status === filterStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

// Format Helpers (Thai, Decimals, Commas)
const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatQuantity = (val?: number | string) => {
  if (val === undefined || val === null || val === '') return '0';
  const num = Number(val);
  return isNaN(num) ? '0' : Math.round(num).toLocaleString('th-TH');
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

onMounted(async () => {
  await loadData();
});
</script>
