<template>
  <div class="vnd-page">
    <!-- ── Page Header ── -->
    <div class="page-header">
      <div>
        <h1 class="page-header__title">ทะเบียนคู่ค้า</h1>
        <p class="page-header__subtitle">จัดการ ตรวจสอบ และควบคุมสถานะผู้ค้าทุกราย</p>
      </div>
      <NuxtLink to="/vendors/new-mock">
        <button class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
          เพิ่มคู่ค้าภายใน
        </button>
      </NuxtLink>
    </div>

    <!-- ── KPI Summary Row ── -->
    <div class="kpi-row">
      <div class="kpi-card">
        <span class="kpi-card__value">{{ vendors.length }}</span>
        <span class="kpi-card__label">คู่ค้าทั้งหมด</span>
      </div>
      <div class="kpi-card kpi-card--warning">
        <span class="kpi-card__value">{{ countByStatus('PendingRegistration') }}</span>
        <span class="kpi-card__label">รอตรวจอนุมัติ</span>
      </div>
      <div class="kpi-card kpi-card--success">
        <span class="kpi-card__value">{{ countByStatus('Active') }}</span>
        <span class="kpi-card__label">ใช้งานอยู่</span>
      </div>
      <div class="kpi-card kpi-card--error">
        <span class="kpi-card__value">{{ countByStatus('Suspended') + countByStatus('Blocked') + countByStatus('Blacklisted') }}</span>
        <span class="kpi-card__label">ระงับ / ปิดกั้น</span>
      </div>
    </div>

    <!-- ── Search + Filter ── -->
    <div class="toolbar">
      <div class="toolbar__search">
        <svg class="toolbar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          type="text"
          class="toolbar__search-input"
          placeholder="ค้นหาชื่อผู้ค้า หรือ Tax ID..."
        />
      </div>
      <select v-model="filterType" class="toolbar__select">
        <option>ทั้งหมด</option>
        <option>ผู้ขาย</option>
        <option>ผู้ให้บริการ</option>
      </select>
    </div>

    <!-- ── Status Tabs ── -->
    <div class="ds-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.status"
        class="ds-tab"
        :class="{ 'ds-tab--active': activeStatus === tab.status }"
        @click="activeStatus = tab.status"
      >
        {{ tab.label }}
        <span v-if="countByStatus(tab.status) > 0" class="ds-tab__badge">
          {{ countByStatus(tab.status) }}
        </span>
      </button>
    </div>

    <!-- ── Table Card ── -->
    <div class="table-card">
      <!-- Empty state -->
      <div v-if="filteredVendors.length === 0" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-state__icon">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p class="empty-state__title">ไม่พบรายการคู่ค้า</p>
        <p class="empty-state__desc">ยังไม่มีผู้ค้าที่ตรงตามเงื่อนไขที่เลือก</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ชื่อบริษัทคู่ค้า</th>
              <th>ประเภท / หมวดหมู่</th>
              <th>วันที่ลงทะเบียน</th>
              <th>สถานะ</th>
              <th class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in filteredVendors"
              :key="v.vendor_id"
              class="data-table__row"
            >
              <!-- Name + Avatar -->
              <td>
                <div class="vendor-name-cell">
                  <div class="vendor-avatar" :class="`vendor-avatar--${statusTone(v.status)}`">
                    {{ v.vendor_name.charAt(0) }}
                  </div>
                  <div>
                    <div class="vendor-name-cell__name">{{ v.vendor_name }}</div>
                    <div class="vendor-name-cell__tax">{{ v.tax_id }}</div>
                    <div v-if="v.score && v.score > 0" class="vendor-name-cell__score">
                      <span class="score-stars">{{ starRating(v.score) }}</span>
                      <span class="score-value">{{ v.score.toFixed(1) }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <!-- Type + Category (merged) -->
              <td>
                <div class="cell-primary">{{ v.vendor_type }}</div>
                <div class="cell-secondary">{{ v.business_category }}</div>
              </td>
              <!-- Date -->
              <td class="cell-secondary">{{ formatDate(v.registered_date) }}</td>
              <!-- Status -->
              <td>
                <StatusBadge :status="v.status" />
              </td>
              <!-- Action — สม่ำเสมอ: ทุก row ใช้รูปแบบเดียวกัน
                   PendingRegistration เป็น amber เพราะต้อง "ทำอะไรบางอย่าง"
                   ที่เหลือทั้งหมดเป็น green ghost เหมือนกัน -->
              <td class="text-center">
                <NuxtLink
                  :to="`/vendors/${v.vendor_id}`"
                  :class="v.status === 'PendingRegistration' ? 'row-btn row-btn--amber' : 'row-btn row-btn--green'"
                >
                  <svg v-if="v.status === 'PendingRegistration'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ v.status === 'PendingRegistration' ? 'ตรวจอนุมัติ' : 'ดูรายละเอียด' }}
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import StatusBadge from '~/components/StatusBadge.vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const search = ref('');
const filterType = ref('ทั้งหมด');
const activeStatus = ref('ALL');
const vendors = ref<any[]>([]);

const tabs = [
  { status: 'ALL', label: 'ทั้งหมด' },
  { status: 'PendingRegistration', label: 'รอตรวจอนุมัติ' },
  { status: 'Active', label: 'ใช้งานอยู่' },
  { status: 'Suspended', label: 'ระงับชั่วคราว' },
  { status: 'Blocked', label: 'บล็อก' },
  { status: 'Blacklisted', label: 'แบล็คลิสต์' },
];

const loadVendors = async () => {
  try {
    const res = await $fetch<any[]>('http://localhost:3001/api/vendor', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    vendors.value = res;
  } catch {
    vendors.value = [
      { vendor_id: '00000000-0000-0000-0000-000000000601', tax_id: '0105561012345', vendor_name: 'บริษัท ดีจิทัล โซลูชั่น ซัพพลาย จำกัด', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์ไอที', status: 'Active', registered_date: '2026-06-10', score: 4.6 },
      { vendor_id: '00000000-0000-0000-0000-000000000602', tax_id: '0105562023456', vendor_name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์ไอที/บริการ', status: 'Active', registered_date: '2026-06-15', score: 4.3 },
      { vendor_id: '00000000-0000-0000-0000-000000000603', tax_id: '0105563034567', vendor_name: 'บริษัท เฟอร์นิเจอร์ ดีไซน์ จำกัด', vendor_type: 'ผู้ขาย', business_category: 'เฟอร์นิเจอร์สำนักงาน', status: 'Active', registered_date: '2026-06-16', score: 4.5 },
      { vendor_id: '00000000-0000-0000-0000-000000000607', tax_id: '0105567078901', vendor_name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด', vendor_type: 'ผู้ขาย', business_category: 'อุปกรณ์เซฟตี้', status: 'PendingRegistration', registered_date: '2026-06-18', score: 0 },
      { vendor_id: '00000000-0000-0000-0000-000000000608', tax_id: '0105568089012', vendor_name: 'บริษัท ก่อสร้างแปซิฟิก จำกัด', vendor_type: 'ผู้ให้บริการ', business_category: 'งานก่อสร้างและโยธา', status: 'Blocked', registered_date: '2026-06-11', score: 2.8 },
      { vendor_id: '00000000-0000-0000-0000-000000000609', tax_id: '0105569090123', vendor_name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด', vendor_type: 'ผู้ให้บริการ', business_category: 'บำรุงรักษา/วิศวกรรม', status: 'Suspended', registered_date: '2026-06-12', score: 3.5 },
      { vendor_id: '00000000-0000-0000-0000-000000000611', tax_id: '0105561112345', vendor_name: 'บริษัท สมาร์ท ปริ้นติ้ง จำกัด', vendor_type: 'ผู้ขาย', business_category: 'บริการสิ่งพิมพ์', status: 'Blacklisted', registered_date: '2026-06-14', score: 1.2 },
    ];
  }
};

onMounted(loadVendors);

const countByStatus = (status: string) => {
  if (status === 'ALL') return vendors.value.length;
  return vendors.value.filter((v) => v.status === status).length;
};

const filteredVendors = computed(() =>
  vendors.value.filter((v) => {
    if (activeStatus.value !== 'ALL' && v.status !== activeStatus.value) return false;
    if (search.value) {
      const q = search.value.toLowerCase();
      if (!v.vendor_name.toLowerCase().includes(q) && !v.tax_id.includes(q)) return false;
    }
    if (filterType.value !== 'ทั้งหมด' && v.vendor_type !== filterType.value) return false;
    return true;
  })
);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const starRating = (score: number) => {
  const full = Math.round(score);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

type StatusTone = 'success' | 'warning' | 'error' | 'neutral';
const statusTone = (status: string): StatusTone => {
  if (status === 'Active') return 'success';
  if (status === 'PendingRegistration') return 'warning';
  if (['Blacklisted', 'Blocked'].includes(status)) return 'error';
  return 'neutral';
};
</script>

<style scoped>
/* ── Page Shell ── */
.vnd-page { display: flex; flex-direction: column; gap: var(--space-5); font-family: var(--font-sans); }

/* ── Page Header ── */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4);
}
.page-header__title {
  font-size: var(--text-xl); font-weight: var(--weight-bold);
  color: var(--fg-primary); letter-spacing: var(--tracking-tight);
}
.page-header__subtitle {
  margin-top: 4px; font-size: var(--text-sm); color: var(--fg-tertiary);
}

/* ── Primary Button ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 9px var(--space-4);
  background: var(--gradient-brand-diagonal);
  color: white; border: none; cursor: pointer;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-semibold);
  box-shadow: 0 2px 8px rgba(0,146,69,0.28);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
  white-space: nowrap;
  text-decoration: none;
}
.btn-primary:hover {
  box-shadow: 0 4px 14px rgba(0,146,69,0.38);
  transform: translateY(-1px);
}

/* ── KPI Row ── */
.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);
}
@media (max-width: 768px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }

.kpi-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  display: flex; flex-direction: column; gap: 4px;
  box-shadow: var(--shadow-1);
}
.kpi-card__value { font-size: 28px; font-weight: var(--weight-bold); color: var(--fg-primary); line-height: 1; }
.kpi-card__label { font-size: var(--text-xs); color: var(--fg-tertiary); font-weight: var(--weight-medium); }

.kpi-card--warning { border-left: 3px solid var(--color-warning-400); }
.kpi-card--warning .kpi-card__value { color: var(--color-warning-700); }
.kpi-card--success { border-left: 3px solid var(--color-success-500); }
.kpi-card--success .kpi-card__value { color: var(--color-success-700); }
.kpi-card--error { border-left: 3px solid var(--color-error-400); }
.kpi-card--error .kpi-card__value { color: var(--color-error-700); }

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center; gap: var(--space-3);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-1);
}
.toolbar__search {
  flex: 1; display: flex; align-items: center; gap: var(--space-2);
}
.toolbar__search-icon { color: var(--fg-tertiary); flex-shrink: 0; }
.toolbar__search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: var(--text-sm); color: var(--fg-primary);
  font-family: var(--font-sans);
}
.toolbar__search-input::placeholder { color: var(--fg-tertiary); }
.toolbar__select {
  border: 1px solid var(--border-default); border-radius: var(--radius-md);
  padding: var(--space-1-5) var(--space-3);
  font-size: var(--text-sm); color: var(--fg-secondary);
  background: var(--bg-surface); outline: none;
  font-family: var(--font-sans); cursor: pointer;
}

/* ── Table Card ── */
.table-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}
.table-wrap { overflow-x: auto; }

/* ── Data Table ── */
.data-table {
  width: 100%; border-collapse: collapse; text-align: left;
}
.data-table thead tr {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}
.data-table th {
  padding: 12px 20px;
  font-size: 11px; font-weight: var(--weight-bold);
  color: var(--fg-tertiary);
  text-transform: uppercase; letter-spacing: var(--tracking-wider);
  white-space: nowrap;
}
.data-table td {
  padding: 16px 20px;
  vertical-align: middle;
}
.data-table__row {
  border-bottom: 1px solid #f1f3f5;
  transition: background-color var(--transition-base);
}
.data-table__row td {
  padding: 18px 20px;
  vertical-align: middle;
}
.data-table__row:last-child { border-bottom: none; }
.data-table__row:hover { background-color: #f8fffe; }
/* Highlight pending rows with a very subtle left border */
.data-table__row--pending {
  background: rgba(245, 158, 11, 0.03);
}

/* ── Vendor Name Cell ── */
.vendor-name-cell {
  display: flex; align-items: center; gap: 14px;
}
.vendor-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700;
  flex-shrink: 0; color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}
.vendor-avatar--success { background: linear-gradient(135deg, #009245, #6CCB5F); }
.vendor-avatar--warning { background: linear-gradient(135deg, #F59E0B, #FCD34D); color: #78350F; }
.vendor-avatar--error   { background: linear-gradient(135deg, #EF4444, #F87171); }
.vendor-avatar--neutral { background: linear-gradient(135deg, #6B7280, #9CA3AF); }

.vendor-name-cell__name {
  font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--fg-primary);
}
.vendor-name-cell__tax {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--color-green-700); margin-top: 1px; letter-spacing: 0.03em;
}
.vendor-name-cell__score {
  display: flex; align-items: center; gap: 4px; margin-top: 2px;
}
.score-stars { font-size: 11px; color: #F59E0B; letter-spacing: -1px; }
.score-value { font-size: 11px; color: var(--fg-tertiary); font-weight: var(--weight-medium); }

/* ── Cell styles ── */
.cell-primary { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--fg-secondary); }
.cell-secondary { font-size: var(--text-xs); color: var(--fg-tertiary); margin-top: 2px; }

/* ── Row Buttons — 2 variants only, samesized padding ── */
.row-btn {
  display: inline-flex; align-items: center; gap: 6px;
  /* เพิ่ม padding ซ้าย-ขวาให้หายใจได้ */
  padding: 6px 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-xs); font-weight: var(--weight-semibold);
  cursor: pointer; border: 1px solid; white-space: nowrap;
  text-decoration: none;
  transition: background-color var(--transition-base), transform var(--transition-base),
              box-shadow var(--transition-base);
}
.row-btn:hover { transform: translateY(-1px); }

/* ดูรายละเอียด — green ghost, ทุก row ที่ไม่ต้องการ action */
.row-btn--green {
  background: var(--color-green-50);
  color: var(--color-green-700);
  border-color: var(--color-green-200);
}
.row-btn--green:hover {
  background: var(--color-green-100);
  box-shadow: 0 2px 8px rgba(0,146,69,0.16);
}

/* ตรวจอนุมัติ — amber solid, เฉพาะ PendingRegistration */
.row-btn--amber {
  background: var(--color-warning-500);
  color: white;
  border-color: var(--color-warning-500);
  box-shadow: 0 2px 6px rgba(245,158,11,0.25);
}
.row-btn--amber:hover {
  background: var(--color-warning-600);
  box-shadow: 0 4px 12px rgba(245,158,11,0.35);
}

/* ── Empty State ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 64px var(--space-4); gap: var(--space-2);
}
.empty-state__icon { color: var(--fg-tertiary); margin-bottom: var(--space-2); }
.empty-state__title { font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--fg-secondary); }
.empty-state__desc { font-size: var(--text-sm); color: var(--fg-tertiary); }
</style>
