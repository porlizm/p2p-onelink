<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div>
        <h2 class="text-xl font-bold text-[var(--foreground)]">ศูนย์จัดการและควบคุมสัญญาจัดซื้อ (Contract Management Console)</h2>
        <p class="text-sm text-[var(--muted-foreground)] mt-1">บริหารสัญญาจ้าง ทรัพยากรจัดจ้างภายนอก การเช่า ประกันภัย และควบคุมการแก้ไขเวอร์ชันสัญญา (Amendments)</p>
      </div>
      <div class="flex gap-2">
        <UButton 
          color="gray"
          variant="outline"
          icon="i-heroicons-arrow-path"
          class="cursor-pointer"
          @click="loadData"
        >
          รีเฟรชข้อมูล
        </UButton>
        <UButton 
          color="primary"
          icon="i-heroicons-plus-circle"
          class="cursor-pointer font-bold"
          @click="showCreateModal = true"
        >
          ร่างสัญญาใหม่ (Draft Contract)
        </UButton>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-[var(--primary)] flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">สัญญาทั้งหมด</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ contracts.length }} ฉบับ</span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">Active / Signed</span>
          <span class="text-lg font-bold text-green-600">
            {{ contracts.filter(c => c.status === 'Signed').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รอลงนามร่วม</span>
          <span class="text-lg font-bold text-orange-600">
            {{ contracts.filter(c => c.status === 'PendingSignature').length }} ฉบับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
          <UIcon name="i-heroicons-document-magnifying-glass" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">รออนุมัติภายใน</span>
          <span class="text-lg font-bold text-yellow-600">
            {{ contracts.filter(c => c.status === 'PendingApproval').length }} ฉbับ
          </span>
        </div>
      </div>
      <div class="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
        </div>
        <div>
          <span class="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">วงเงินสัญญารวม</span>
          <span class="text-lg font-bold text-[var(--foreground)]">{{ formatCurrency(totalContractsAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Console -->
    <div class="bg-slate-50 border border-[var(--border)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-600">ตัวกรองสถานะ:</span>
        <div class="flex gap-1">
          <button 
            v-for="st in statusFilters" 
            :key="st.val"
            @click="activeStatusFilter = st.val"
            class="px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition"
            :class="[
              activeStatusFilter === st.val 
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            ]"
          >
            {{ st.label }}
          </button>
        </div>
      </div>
      
      <!-- Expiration simulation triggers for UAT -->
      <div class="flex items-center gap-2 border-l border-slate-200 pl-4">
        <span class="text-[10px] font-bold text-slate-500 uppercase">UAT Expiry Sim:</span>
        <UButton size="xs" color="gray" @click="simulateExpirations(90)" class="font-bold">จำลองเตือน 90 วัน</UButton>
        <UButton size="xs" color="gray" @click="simulateExpirations(30)" class="font-bold">จำลองเตือน 30 วัน</UButton>
      </div>
    </div>

    <!-- Contracts Table -->
    <div class="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-[var(--border)] font-semibold text-[var(--muted-foreground)] uppercase">
              <th class="px-6 py-3">เลขที่สัญญา</th>
              <th class="px-6 py-3">ชื่อสัญญา / ประเภท</th>
              <th class="px-6 py-3">ผู้ขาย / Vendor</th>
              <th class="px-6 py-3 text-right">วงเงินรวม</th>
              <th class="px-6 py-3 text-right">คงเหลือคงคลัง</th>
              <th class="px-6 py-3 text-center">ระยะเวลา</th>
              <th class="px-6 py-3 text-center">ประเภท / Class</th>
              <th class="px-6 py-3 text-center">สถานะ</th>
              <th class="px-6 py-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)] text-sm">
            <tr v-for="c in filteredContracts" :key="c.contract_id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-[var(--primary)] text-xs">
                {{ c.contract_no }}
                <span v-if="c.version_no > 1" class="text-[10px] font-normal text-slate-400 block">เวอร์ชัน {{ c.version_no }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-slate-700">{{ c.title }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">ประเภท: {{ formatContractType(c.contract_type) }} ({{ c.contract_period }})</div>
              </td>
              <td class="px-6 py-4 text-slate-600 font-semibold text-xs">{{ c.vendor?.vendor_name }}</td>
              <td class="px-6 py-4 text-right font-bold text-slate-800">{{ formatCurrency(c.total_amount) }}</td>
              <td class="px-6 py-4 text-right font-extrabold text-indigo-600">{{ formatCurrency(c.remaining_amount) }}</td>
              <td class="px-6 py-4 text-center text-slate-500 text-[10px]">
                {{ formatDate(c.start_date) }} - {{ formatDate(c.end_date) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold border"
                  :class="[
                    c.contract_class === 'Amendment' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    c.contract_class === 'Addendum' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  ]"
                >
                  {{ c.contract_class || 'Original' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block border"
                  :class="[
                    c.status === 'Signed' ? 'bg-green-50 text-green-700 border-green-200' :
                    c.status === 'PendingSignature' ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' :
                    c.status === 'PendingApproval' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    c.status === 'Draft' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                    c.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-500 border-gray-200'
                  ]"
                >
                  {{ formatStatus(c.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <!-- Submit Draft for internal approval -->
                  <UButton 
                    v-if="c.status === 'Draft'"
                    size="xs" 
                    color="yellow"
                    icon="i-heroicons-paper-airplane"
                    class="cursor-pointer font-bold"
                    @click="submitForApproval(c.contract_id)"
                  >
                    ส่งขออนุมัติ
                  </UButton>

                  <!-- Internal DOA approvals simulator -->
                  <div v-else-if="c.status === 'PendingApproval'" class="flex gap-1">
                    <UButton 
                      size="xs" 
                      color="green"
                      icon="i-heroicons-check"
                      class="cursor-pointer font-bold"
                      @click="approveContract(c.contract_id)"
                    >
                      อนุมัติ
                    </UButton>
                    <UButton 
                      size="xs" 
                      color="red"
                      icon="i-heroicons-x-mark"
                      class="cursor-pointer font-bold"
                      @click="rejectContract(c.contract_id)"
                    >
                      ปฏิเสธ
                    </UButton>
                  </div>

                  <!-- Sign Agreement -->
                  <UButton 
                    v-if="c.status === 'PendingSignature' && !c.signatures?.buyer"
                    size="xs" 
                    color="primary"
                    icon="i-heroicons-pencil-square"
                    class="cursor-pointer font-bold"
                    @click="signAgreement(c.contract_id)"
                  >
                    ลงนามจัดซื้อ
                  </UButton>

                  <!-- Create Amendment (Amend) -->
                  <UButton 
                    v-else-if="c.status === 'Signed'"
                    size="xs" 
                    color="purple"
                    icon="i-heroicons-wrench-screwdriver"
                    class="cursor-pointer font-bold"
                    @click="openAmendModal(c)"
                  >
                    ขอแก้ไข (Amend)
                  </UButton>

                  <!-- View details drawer -->
                  <UButton 
                    size="xs" 
                    variant="outline"
                    color="gray"
                    icon="i-heroicons-eye"
                    class="cursor-pointer"
                    @click="viewAgreementDetail(c)"
                  >
                    เปิดดู
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="filteredContracts.length === 0">
              <td colspan="9" class="text-center py-10 text-xs text-[var(--muted-foreground)]">
                ไม่พบข้อมูลสัญญาสั่งซื้อในระบบตามตัวกรองที่เลือก
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Agreement Modal -->
    <UModal v-model="showCreateModal" prevent-close :ui="{ width: 'max-w-xl' }">
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-800 text-sm">ร่างสัญญากลางและ Blanket Agreement ใหม่</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showCreateModal = false" />
        </div>

        <div class="space-y-4 text-xs">
          <!-- Vendor & Title -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">คู่ค้าหลัก / Vendor</label>
              <USelect v-model="newVendorId" :options="vendorOptions" class="w-full" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ประเภทสัญญา</label>
              <USelect v-model="newContractType" :options="contractTypeOptions" class="w-full" />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">ชื่อสัญญา / วัตถุประสงค์จัดหา</label>
            <UInput v-model="newTitle" placeholder="เช่น สัญญาจัดหาทรัพยากรผู้พัฒนาซอฟต์แวร์..." />
          </div>

          <!-- Duration period -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ระยะสัญญาจ้าง</label>
              <USelect v-model="newContractPeriod" :options="contractPeriodOptions" class="w-full" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันเริ่มสัญญา (Start Date)</label>
              <UInput v-model="newStartDate" type="date" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันสิ้นสุดสัญญา (End Date)</label>
              <UInput v-model="newEndDate" type="date" />
            </div>
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">วงเงินสัญญารวมทั้งหมด (THB)</label>
            <UInput v-model.number="newAmount" type="number" placeholder="เช่น 1000000" />
          </div>

          <!-- TYPE-SPECIFIC DYNAMIC INPUTS -->
          <!-- 1. Outsourcing Resource Config -->
          <div v-if="newContractType === 'Outsourcing'" class="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <div class="font-bold text-slate-700 flex justify-between items-center mb-1">
              <span>ข้อมูลทรัพยากรจัดจ้างภายนอก (US-141)</span>
              <UButton size="xs" color="primary" @click="addResourceItem" icon="i-heroicons-plus">เพิ่มรายชื่อ</UButton>
            </div>
            <div v-for="(r, idx) in newResources" :key="idx" class="grid grid-cols-5 gap-2 items-center">
              <UInput v-model="r.role" placeholder="บทบาท/ตำแหน่ง" class="col-span-2" />
              <UInput v-model.number="r.rate" type="number" placeholder="ค่าจ้าง/หน่วย" />
              <USelect v-model="r.unit" :options="[{value:'hour', label:'ชม.'},{value:'day', label:'วัน'},{value:'month', label:'เดือน'}]" />
              <div class="flex items-center gap-1">
                <UInput v-model.number="r.quantity" type="number" placeholder="จำนวน" />
                <UButton size="xs" color="red" variant="ghost" icon="i-heroicons-trash" @click="removeResourceItem(idx)" />
              </div>
            </div>
            <div v-if="newResources.length === 0" class="text-center text-[10px] text-slate-400">กรุณาเพิ่มตำแหน่งที่ต้องการจ้าง</div>
          </div>

          <!-- 2. Rental Details Config -->
          <div v-if="newContractType === 'Rental'" class="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
            <div class="font-bold text-slate-700">ข้อมูลสัญญาการเช่าพัสดุ (US-142)</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 mb-1">รอบเวลาการวางบิลเช่า</label>
                <USelect v-model="newRentalDetails.billing_cycle" :options="['Monthly','Quarterly','Yearly','Custom']" />
              </div>
              <div>
                <label class="block text-slate-500 mb-1">ค่าเช่าต่องวด (THB)</label>
                <UInput v-model.number="newRentalDetails.installment_amount" type="number" />
              </div>
            </div>
            <div>
              <label class="block text-slate-500 mb-1">เงื่อนไขการส่งคืนสินทรัพย์เมื่อสิ้นสัญญา</label>
              <UInput v-model="newRentalDetails.return_conditions" placeholder="เช่น ต้องแจ้งล่วงหน้า 30 วันและส่งคืนในสภาพสมบูรณ์..." />
            </div>
          </div>

          <!-- 3. Warranty/Support details -->
          <div v-if="newContractType === 'Warranty' || newContractType === 'Service'" class="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3">
            <div class="font-bold text-slate-700">ขอบเขตการรับประกัน & SLA (US-142)</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 mb-1">ระดับ SLA (SLA Standard)</label>
                <UInput v-model="newWarrantyDetails.sla_level" placeholder="เช่น 24x7 Support, Response within 4 hours..." />
              </div>
              <div>
                <label class="block text-slate-500 mb-1">ผู้รับผิดชอบดูแลหลัก (Contact Person)</label>
                <UInput v-model="newWarrantyDetails.contact_person" placeholder="เช่น ทีม Support บริษัท..." />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showCreateModal = false" variant="ghost" color="gray">ยกเลิก</UButton>
          <UButton 
            color="primary"
            :loading="submitting"
            class="px-5 cursor-pointer font-bold"
            @click="submitContract"
          >
            บันทึกเป็นร่างสัญญา
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Amend Contract Modal -->
    <UModal v-model="showAmendModal" prevent-close :ui="{ width: 'max-w-xl' }">
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-purple-900 text-sm">ขอแก้ไขข้อมูลสัญญากลาง (Contract Amendment / Addendum)</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showAmendModal = false" />
        </div>

        <div class="space-y-4 text-xs" v-if="amendTargetContract">
          <div class="bg-purple-50 border border-purple-100 rounded-lg p-3 text-[10px] text-purple-900 leading-normal">
            <strong>ข้อมูลอ้างอิง:</strong> การแก้ไขจะทำการยกเลิกสัญญารหัสเก่า ({{ amendTargetContract.contract_no }}) และสร้างฉบับใหม่ปรับเวอร์ชันหลังจากผ่านอนุมัติ internal และลงนามคู่ค้าแล้ว
          </div>

          <div>
            <label class="block text-slate-600 font-semibold mb-1">ชื่อสัญญาจัดทำใหม่ (Title)</label>
            <UInput v-model="amendTitle" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันเริ่มสัญญาใหม่ (Start Date)</label>
              <UInput v-model="amendStartDate" type="date" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วันสิ้นสุดสัญญาใหม่ (End Date)</label>
              <UInput v-model="amendEndDate" type="date" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-600 font-semibold mb-1">วงเงินสัญญารวมใหม่ (Total Amount)</label>
              <UInput v-model.number="amendAmount" type="number" />
            </div>
            <div>
              <label class="block text-slate-600 font-semibold mb-1">ประเภทระยะเวลาสัญญา</label>
              <USelect v-model="amendContractPeriod" :options="contractPeriodOptions" />
            </div>
          </div>

          <!-- Type Specific parameters in Amendment -->
          <!-- 1. Outsourcing Resource -->
          <div v-if="amendContractType === 'Outsourcing'" class="border border-purple-100 rounded-xl p-3 bg-purple-50/30 space-y-2">
            <div class="font-bold text-purple-950 flex justify-between items-center mb-1">
              <span>ตำแหน่งและอัตราจ้างจัดซื้อใหม่</span>
              <UButton size="xs" color="purple" @click="addAmendResource" icon="i-heroicons-plus">เพิ่มรายชื่อ</UButton>
            </div>
            <div v-for="(r, idx) in amendResources" :key="idx" class="grid grid-cols-5 gap-2 items-center">
              <UInput v-model="r.role" placeholder="บทบาท/ตำแหน่ง" class="col-span-2" />
              <UInput v-model.number="r.rate" type="number" placeholder="ค่าจ้าง/หน่วย" />
              <USelect v-model="r.unit" :options="[{value:'hour', label:'ชม.'},{value:'day', label:'วัน'},{value:'month', label:'เดือน'}]" />
              <div class="flex items-center gap-1">
                <UInput v-model.number="r.quantity" type="number" placeholder="จำนวน" />
                <UButton size="xs" color="red" variant="ghost" icon="i-heroicons-trash" @click="removeAmendResource(idx)" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <UButton @click="showAmendModal = false" variant="ghost" color="gray">ยกเลิก</UButton>
          <UButton 
            color="purple"
            :loading="submitting"
            class="px-5 cursor-pointer font-bold text-white bg-purple-600 hover:bg-purple-800"
            @click="submitAmendment"
          >
            สร้างคำขอเสนออนุมัติแก้ไข (Submit Amendment)
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Contract Detail Slideover Drawer -->
    <USlideover v-model="showDetailDrawer" :ui="{ width: 'max-w-xl' }">
      <div class="p-6 h-full flex flex-col space-y-4 bg-white text-xs" v-if="activeContract">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <div class="font-bold text-slate-800 text-sm">รายละเอียดเอกสารสัญญากลาง</div>
            <div class="text-[10px] text-slate-400">Class: {{ activeContract.contract_class || 'Original' }} | Version: {{ activeContract.version_no }}</div>
          </div>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showDetailDrawer = false" />
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto pr-1">
          <!-- Card Info -->
          <div class="bg-slate-50 p-4 border rounded-xl space-y-3">
            <div class="flex justify-between font-bold text-slate-700 border-b pb-1.5">
              <span>เลขที่สัญญา:</span>
              <span class="text-[var(--primary)] font-mono">{{ activeContract.contract_no }}</span>
            </div>
            <div class="flex justify-between">
              <span>ชื่อสัญญา:</span>
              <span class="font-semibold text-slate-800 text-right">{{ activeContract.title }}</span>
            </div>
            <div class="flex justify-between">
              <span>ประเภทสัญญา:</span>
              <span class="font-bold text-slate-700">{{ formatContractType(activeContract.contract_type) }} ({{ activeContract.contract_period }})</span>
            </div>
            <div class="flex justify-between">
              <span>คู่ค้า / Vendor:</span>
              <span class="font-semibold text-slate-700">{{ activeContract.vendor?.vendor_name }}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span>วงเงินประกันสัญญา:</span>
              <span class="font-bold text-slate-800">{{ formatCurrency(activeContract.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>วงเงินคงเหลือคงคลัง:</span>
              <span class="font-extrabold text-indigo-600">{{ formatCurrency(activeContract.remaining_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>ระยะเวลากลางสัญญา:</span>
              <span>{{ formatDate(activeContract.start_date) }} - {{ formatDate(activeContract.end_date) }}</span>
            </div>
          </div>

          <!-- SPECIFIC VALUE VIEW DETAILS -->
          <!-- 1. Resource Outsourcing Details -->
          <div v-if="activeContract.contract_type === 'Outsourcing' && activeContract.resources" class="border rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div class="font-bold text-slate-800">รายการอัตราจ้างจัดซื้อทรัพยากรจัดจ้าง (Outsourcing Details)</div>
            <div class="divide-y divide-slate-100">
              <div v-for="(r, idx) in activeContract.resources" :key="idx" class="flex justify-between py-1.5 text-[11px]">
                <span class="font-semibold text-slate-700">{{ r.role }}</span>
                <span class="text-slate-600 font-mono">
                  {{ formatCurrency(r.rate) }} / {{ r.unit === 'hour' ? 'ชม.' : r.unit === 'day' ? 'วัน' : 'เดือน' }} (จำนวน {{ formatQuantity(r.quantity) }} ราย)
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Rental Details View -->
          <div v-if="activeContract.contract_type === 'Rental' && activeContract.rental_details" class="border rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div class="font-bold text-slate-800">ข้อมูลรอบการเช่ารายงวด</div>
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span>รอบการชำระเงินเช่า:</span>
                <span class="font-bold text-slate-700">{{ activeContract.rental_details.billing_cycle }}</span>
              </div>
              <div class="flex justify-between">
                <span>ยอดเงินงวดการเช่า:</span>
                <span class="font-extrabold text-indigo-600">{{ formatCurrency(activeContract.rental_details.installment_amount) }}</span>
              </div>
              <div v-if="activeContract.rental_details.return_conditions" class="text-slate-500 mt-1">
                <strong>เงื่อนไขการส่งคืน:</strong> {{ activeContract.rental_details.return_conditions }}
              </div>
            </div>
          </div>

          <!-- 3. Warranty details view -->
          <div v-if="(activeContract.contract_type === 'Warranty' || activeContract.contract_type === 'Service') && activeContract.warranty_details" class="border rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div class="font-bold text-slate-800">ข้อมูล SLA & ขอบเขตความคุ้มครอง</div>
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span>ระดับมาตรฐาน SLA:</span>
                <span class="font-semibold text-slate-700">{{ activeContract.warranty_details.sla_level || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span>ผู้ประสานงานหลัก (Contact Person):</span>
                <span class="font-semibold text-slate-700">{{ activeContract.warranty_details.contact_person || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Digital Signature Details -->
          <div class="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-4">
            <div class="font-bold text-indigo-900 flex items-center gap-1">
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 text-indigo-600" />
              <span>สถานะการลงนามอิเล็กทรอนิกส์ (E-Signatures Status)</span>
            </div>

            <!-- Buyer signature -->
            <div class="border-b pb-3 border-indigo-100/50">
              <div class="font-bold text-slate-700">ตัวแทนสั่งซื้อ (SCGJWD Buyer)</div>
              <div v-if="activeContract.signatures?.buyer" class="mt-1.5 space-y-1 text-slate-600 bg-white p-2 rounded border border-slate-100">
                <div class="flex justify-between">
                  <span>ผู้ลงนาม:</span>
                  <span class="font-semibold text-slate-800">{{ activeContract.signatures.buyer.name }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>IP Address:</span>
                  <span class="font-mono text-slate-400">{{ activeContract.signatures.buyer.ip }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>เวลาลงนาม:</span>
                  <span>{{ formatDateTime(activeContract.signatures.buyer.signed_at) }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-orange-600 font-semibold mt-1">ยังไม่มีการลงนาม ⏳</div>
            </div>

            <!-- Vendor signature -->
            <div>
              <div class="font-bold text-slate-700">ตัวแทนผู้ขาย (Vendor Representative)</div>
              <div v-if="activeContract.signatures?.vendor" class="mt-1.5 space-y-1 text-slate-600 bg-white p-2 rounded border border-slate-100">
                <div class="flex justify-between">
                  <span>ผู้ลงนาม:</span>
                  <span class="font-semibold text-slate-800">{{ activeContract.signatures.vendor.name }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>IP Address:</span>
                  <span class="font-mono text-slate-400">{{ activeContract.signatures.vendor.ip }}</span>
                </div>
                <div class="flex justify-between text-[10px]">
                  <span>เวลาลงนาม:</span>
                  <span>{{ formatDateTime(activeContract.signatures.vendor.signed_at) }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-orange-600 font-semibold mt-1">ยังไม่ได้รับการลงนามจากฝั่งคู่ค้า ⏳</div>
            </div>
          </div>
        </div>

        <div class="border-t pt-4 flex gap-2 justify-end bg-white">
          <UButton @click="showDetailDrawer = false" color="gray" variant="ghost">ปิด</UButton>
          <!-- Submit approval button if Draft -->
          <UButton 
            v-if="activeContract.status === 'Draft'"
            color="yellow"
            class="cursor-pointer font-bold px-4"
            @click="submitForApproval(activeContract.contract_id)"
          >
            ส่งอนุมัติร่างสัญญา
          </UButton>
          <!-- Sign Contract button if Pending signature -->
          <UButton 
            v-if="activeContract.status === 'PendingSignature' && !activeContract.signatures?.buyer"
            color="primary"
            class="cursor-pointer font-bold px-4"
            @click="signAgreement(activeContract.contract_id)"
          >
            ลงนามสัญญากลาง
          </UButton>
        </div>
      </div>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const contracts = ref<any[]>([]);
const vendorsList = ref<any[]>([]);

const showCreateModal = ref(false);
const showAmendModal = ref(false);
const showDetailDrawer = ref(false);
const submitting = ref(false);
const activeContract = ref<any | null>(null);
const amendTargetContract = ref<any | null>(null);

// Filter configs
const statusFilters = [
  { val: 'All', label: 'ทั้งหมด' },
  { val: 'Signed', label: 'ใช้งานหลัก (Signed)' },
  { val: 'PendingSignature', label: 'รอลงนามร่วม' },
  { val: 'PendingApproval', label: 'รออนุมัติภายใน' },
  { val: 'Draft', label: 'ร่างสัญญา (Draft)' },
  { val: 'Superceded', label: 'ถูกแก้ไขยกเลิก (Superceded)' }
];
const activeStatusFilter = ref('All');

// Create Form Refs
const newVendorId = ref('');
const newTitle = ref('');
const newStartDate = ref(new Date().toISOString().split('T')[0]);
const newEndDate = ref(new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]);
const newAmount = ref<number | null>(null);
const newContractType = ref('Sales');
const newContractPeriod = ref('1 Year');

const newResources = ref<{ role: string; rate: number; unit: 'hour' | 'day' | 'month'; quantity: number }[]>([]);
const newRentalDetails = ref({ billing_cycle: 'Monthly', installment_amount: 0, return_conditions: '' });
const newWarrantyDetails = ref({ sla_level: '', contact_person: '' });

// Amendment Form Refs
const amendTitle = ref('');
const amendStartDate = ref('');
const amendEndDate = ref('');
const amendAmount = ref<number | null>(null);
const amendContractType = ref('Sales');
const amendContractPeriod = ref('1 Year');
const amendResources = ref<any[]>([]);

const contractTypeOptions = [
  { value: 'Sales', label: 'สัญญาการขายพัสดุ (Sales Agreement)' },
  { value: 'Rental', label: 'สัญญาเช่าครุภัณฑ์/สินทรัพย์ (Rental Contract)' },
  { value: 'Service', label: 'สัญญาบริการทั่วไป (Service Contract)' },
  { value: 'Warranty', label: 'การบำรุงรักษา / ประกันภัย (Warranty SLA)' },
  { value: 'Outsourcing', label: 'จัดจ้างพนักงาน Outsource (Resource Outsourcing)' }
];

const contractPeriodOptions = [
  { value: '6 Months', label: '6 เดือน' },
  { value: '1 Year', label: '1 ปี' },
  { value: '3 Years', label: '3 ปี' },
  { value: 'Custom', label: 'กำหนดระยะเวลาเอง (Custom)' }
];

// Resource actions
const addResourceItem = () => {
  newResources.value.push({ role: '', rate: 0, unit: 'month', quantity: 1 });
};
const removeResourceItem = (idx: number) => {
  newResources.value.splice(idx, 1);
};
const addAmendResource = () => {
  amendResources.value.push({ role: '', rate: 0, unit: 'month', quantity: 1 });
};
const removeAmendResource = (idx: number) => {
  amendResources.value.splice(idx, 1);
};

const filteredContracts = computed(() => {
  if (activeStatusFilter.value === 'All') return contracts.value;
  return contracts.value.filter(c => c.status === activeStatusFilter.value);
});

const loadData = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/contract', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    contracts.value = res;
  } catch (err) {
    console.warn('API error, using fallback dashboard seed data.');
  }

  try {
    const vRes = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    vendorsList.value = vRes;
    if (vRes.length > 0 && !newVendorId.value) {
      newVendorId.value = vRes[0].vendor_id;
    }
  } catch (err) {
    vendorsList.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
      { vendor_id: '00000000-0000-0000-0000-000000000602', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' }
    ];
    newVendorId.value = '00000000-0000-0000-0000-000000000601';
  }
};

const vendorOptions = computed(() => {
  return vendorsList.value.map(v => ({ value: v.vendor_id, label: v.vendor_name }));
});

const totalContractsAmount = computed(() => {
  return contracts.value.reduce((sum, c) => sum + Number(c.total_amount), 0);
});

const viewAgreementDetail = (c: any) => {
  activeContract.value = c;
  showDetailDrawer.value = true;
};

// Create Contract Action
const submitContract = async () => {
  if (!newVendorId.value || !newTitle.value || !newAmount.value) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }
  submitting.value = true;
  const payload = {
    vendor_id: newVendorId.value,
    title: newTitle.value,
    start_date: newStartDate.value,
    end_date: newEndDate.value,
    total_amount: newAmount.value,
    contract_type: newContractType.value,
    contract_period: newContractPeriod.value,
    resources: newContractType.value === 'Outsourcing' ? newResources.value : null,
    rental_details: newContractType.value === 'Rental' ? newRentalDetails.value : null,
    warranty_details: (newContractType.value === 'Warranty' || newContractType.value === 'Service') ? newWarrantyDetails.value : null,
    contract_class: 'Original'
  };

  try {
    await $fetch('http://localhost:3001/api/contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: payload,
    });
    alert('ร่างเอกสัญญากลางใหม่เรียบร้อย! กรุณาส่งขออนุมัติภายใน');
    showCreateModal.value = false;
    await loadData();
  } catch (err) {
    alert('บันทึกร่างสัญญาจัดซื้อเรียบร้อย! (Simulated)');
    contracts.value.unshift({
      contract_id: `con_${Date.now()}`,
      contract_no: `CNT-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      title: newTitle.value,
      vendor: vendorsList.value.find(v => v.vendor_id === newVendorId.value),
      total_amount: newAmount.value,
      remaining_amount: newAmount.value,
      start_date: newStartDate.value,
      end_date: newEndDate.value,
      contract_type: newContractType.value,
      contract_period: newContractPeriod.value,
      resources: newContractType.value === 'Outsourcing' ? [...newResources.value] : null,
      rental_details: newContractType.value === 'Rental' ? { ...newRentalDetails.value } : null,
      warranty_details: (newContractType.value === 'Warranty' || newContractType.value === 'Service') ? { ...newWarrantyDetails.value } : null,
      status: 'Draft',
      contract_class: 'Original',
      version_no: 1,
      signatures: {}
    });
    showCreateModal.value = false;
  } finally {
    submitting.value = false;
  }
};

// submit approval
const submitForApproval = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/contract/${id}/submit-approval`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('ส่งขออนุมัติภายในตามสายงานสำเร็จ!');
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === id);
    if (c) c.status = 'PendingApproval';
    alert('ส่งเรื่องขออนุมัติภายใน (DOA Lane) สำเร็จ! (Simulated)');
  }
};

// Approve
const approveContract = async (id: string) => {
  try {
    await $fetch(`http://localhost:3001/api/contract/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('อนุมัติสัญญาสำเร็จ! สถานะเปลี่ยนเป็นรอคู่ค้าลงนามร่วม');
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === id);
    if (c) c.status = 'PendingSignature';
    alert('อนุมัติเอกสารเสร็จสิ้น! (DOA Simulation Approved)');
  }
};

// Reject
const rejectContract = async (id: string) => {
  if (!confirm('ต้องการปฏิเสธร่างสัญญานี้ใช่หรือไม่?')) return;
  try {
    await $fetch(`http://localhost:3001/api/contract/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('ปฏิเสธเอกสารสัญญาแล้ว');
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === id);
    if (c) c.status = 'Rejected';
    alert('ปฏิเสธร่างเอกสารเรียบร้อย! (Simulated)');
  }
};

// Open Amendment Modal
const openAmendModal = (c: any) => {
  amendTargetContract.value = c;
  amendTitle.value = `แก้ไข - ${c.title}`;
  amendStartDate.value = c.start_date.split('T')[0];
  amendEndDate.value = c.end_date.split('T')[0];
  amendAmount.value = c.total_amount;
  amendContractType.value = c.contract_type;
  amendContractPeriod.value = c.contract_period;
  amendResources.value = c.resources ? JSON.parse(JSON.stringify(c.resources)) : [];
  showAmendModal.value = false;
  showAmendModal.value = true;
};

// Submit Amendment Action
const submitAmendment = async () => {
  const c = amendTargetContract.value;
  if (!amendTitle.value || !amendAmount.value) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }
  submitting.value = true;

  const payload = {
    title: amendTitle.value,
    start_date: amendStartDate.value,
    end_date: amendEndDate.value,
    total_amount: amendAmount.value,
    contract_type: amendContractType.value,
    contract_period: amendContractPeriod.value,
    resources: amendContractType.value === 'Outsourcing' ? amendResources.value : null
  };

  try {
    await $fetch(`http://localhost:3001/api/contract/${c.contract_id}/amend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: payload
    });
    alert('บันทึกคำร้องขอแก้ไขสัญญา (Amendment) สำเร็จ! กรุณาส่งขออนุมัติภายใน');
    showAmendModal.value = false;
    await loadData();
  } catch (err) {
    const versionNo = Number(c.version_no) + 1;
    contracts.value.unshift({
      contract_id: `con_amend_${Date.now()}`,
      contract_no: `${c.contract_no}-REV${versionNo}`,
      title: amendTitle.value,
      vendor: c.vendor,
      total_amount: amendAmount.value,
      remaining_amount: amendAmount.value,
      start_date: amendStartDate.value,
      end_date: amendEndDate.value,
      contract_type: amendContractType.value,
      contract_period: amendContractPeriod.value,
      resources: amendContractType.value === 'Outsourcing' ? [...amendResources.value] : null,
      rental_details: c.rental_details,
      status: 'Draft',
      contract_class: 'Amendment',
      version_no: versionNo,
      parent_contract_id: c.contract_id,
      signatures: {}
    });
    alert('บันทึกสัญญากลางฉบับแก้ไขร่างใหม่สำเร็จ! (Simulated Draft)');
    showAmendModal.value = false;
  } finally {
    submitting.value = false;
  }
};

// Sign Contract
const signAgreement = async (contractId: string) => {
  if (!confirm('ยืนยันประทับตราและลงลายมือชื่อดิจิทัลสำหรับผู้จัดซื้อใช่หรือไม่? การทำงานนี้จะบันทึกเลข IP ของเครื่องคุณ')) return;
  const name = authStore.user?.username || 'คุณนันทพร ศิริวัฒน์';
  try {
    await $fetch(`http://localhost:3001/api/contract/${contractId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { role: 'buyer', name },
    });
    alert('ลงนามสัญญากลางเรียบร้อย!');
    showDetailDrawer.value = false;
    await loadData();
  } catch (err) {
    const c = contracts.value.find(item => item.contract_id === contractId);
    if (c) {
      c.signatures = c.signatures || {};
      c.signatures.buyer = {
        name,
        signed_at: new Date().toISOString(),
        ip: '192.168.1.100 (UAT-Network)',
      };
      if (c.signatures.vendor) {
        c.status = 'Signed';
        if (c.contract_class === 'Amendment' && c.parent_contract_id) {
          const parent = contracts.value.find(p => p.contract_id === c.parent_contract_id);
          if (parent) parent.status = 'Superceded';
        }
      }
      alert('ลงนามสัญญากลางเรียบร้อย! (Simulated)');
      showDetailDrawer.value = false;
    }
  }
};

// UAT Alert Simulation triggers
const simulateExpirations = async (days: number) => {
  try {
    const res = await $fetch<any>(`http://localhost:3001/api/contract/check-expirations?simulateDays=${days}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert(`ตรวจสอบแจ้งเตือนสำเร็จ!\nพบรายการเตือนใกล้หมดอายุ ${days} วัน จำนวน: ${res.triggered_alerts_count} รายการ\nข้อความอีเมล: ${JSON.stringify(res.logged_emails)}`);
  } catch (err) {
    alert(`[Simulated Alert Trigger] สำหรับรอบหมดอายุใน ${days} วัน: \nส่งเมลไปหาผู้ดูแลซื้อขายเพื่อแจ้งหมดอายุเรียบร้อย!`);
  }
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

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
};

const formatContractType = (t: string) => {
  switch (t) {
    case 'Sales': return 'การขายพัสดุ';
    case 'Rental': return 'เช่าสินทรัพย์/ครุภัณฑ์';
    case 'Service': return 'จ้างบริการ';
    case 'Warranty': return 'บำรุงรักษา/SLA';
    case 'Outsourcing': return 'Outsourcing พนักงาน';
    default: return t || 'ทั่วไป';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'Signed': return 'ประทับตราสมบูรณ์ ✅';
    case 'PendingSignature': return 'รอคู่ค้าลงนาม ⏳';
    case 'PendingApproval': return 'รออนุมัติภายใน ⏳';
    case 'Draft': return 'ร่างสัญญา (Draft)';
    case 'Rejected': return 'ปฏิเสธคำขออนุมัติ ❌';
    case 'Superceded': return 'สัญญาสิ้นสุด/ปรับปรุงแล้ว ⛔';
    default: return status || 'ร่าง';
  }
};

onMounted(() => {
  loadData();
});
</script>
