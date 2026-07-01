<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div
        v-if="modelValue"
        class="app-modal-overlay"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="app-modal"
          :class="[sizeClass, { 'app-modal--danger': variant === 'danger' }]"
          role="dialog"
          :aria-labelledby="titleId"
        >
          <!-- Header -->
          <div class="app-modal__header" :class="headerClass">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Icon slot -->
              <div v-if="$slots.icon || icon" class="app-modal__icon" :class="iconBgClass">
                <slot name="icon">
                  <component :is="'span'" v-html="icon" />
                </slot>
              </div>
              <div class="min-w-0">
                <h3 :id="titleId" class="app-modal__title">{{ title }}</h3>
                <p v-if="subtitle" class="app-modal__subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <slot name="badge" />
              <button class="app-modal__close" @click="$emit('update:modelValue', false)" aria-label="ปิด">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="app-modal__body" :class="{ 'app-modal__body--noscroll': noScroll }">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="app-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  noScroll?: boolean;
}>(), {
  variant: 'default',
  size: 'md',
});

defineEmits(['update:modelValue']);

const titleId = `modal-title-${Math.random().toString(36).slice(2)}`;

const sizeClass = computed(() => ({
  sm: 'app-modal--sm',
  md: 'app-modal--md',
  lg: 'app-modal--lg',
  xl: 'app-modal--xl',
}[props.size]));

const headerClass = computed(() => ({
  default:  'app-modal__header--default',
  danger:   'app-modal__header--danger',
  warning:  'app-modal__header--warning',
  success:  'app-modal__header--success',
}[props.variant]));

const iconBgClass = computed(() => ({
  default:  'app-modal__icon--default',
  danger:   'app-modal__icon--danger',
  warning:  'app-modal__icon--warning',
  success:  'app-modal__icon--success',
}[props.variant]));
</script>

<style scoped>
/* ── Overlay ── */
.app-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
}

/* ── Modal shell ── */
.app-modal {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  width: 100%;
  overflow: hidden;
}

/* Size variants */
.app-modal--sm { max-width: 420px; }
.app-modal--md { max-width: 580px; }
.app-modal--lg { max-width: 720px; }
.app-modal--xl { max-width: 900px; }

/* ── Header ── */
.app-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eff1f5;
  flex-shrink: 0;
}

.app-modal__header--default { background: #ffffff; }
.app-modal__header--danger   { background: linear-gradient(135deg, #fff1f2 0%, #fff5f5 100%); border-color: #fecdd3; }
.app-modal__header--warning  { background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%); border-color: #fde68a; }
.app-modal__header--success  { background: linear-gradient(135deg, #f0fdf4 0%, #f0faf0 100%); border-color: #bbf7d0; }

/* ── Icon ── */
.app-modal__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.app-modal__icon--default { background: #f0faf0; color: #009245; }
.app-modal__icon--danger  { background: #fff1f2; color: #e11d48; }
.app-modal__icon--warning { background: #fffbeb; color: #d97706; }
.app-modal__icon--success { background: #f0fdf4; color: #16a34a; }

/* ── Title ── */
.app-modal__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.app-modal__subtitle {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* ── Close btn ── */
.app-modal__close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.app-modal__close:hover { background: #f1f5f9; color: #334155; }

/* ── Body ── */
.app-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.app-modal__body--noscroll { overflow: visible; }
.app-modal__body::-webkit-scrollbar { width: 4px; }
.app-modal__body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

/* ── Footer ── */
.app-modal__footer {
  padding: 16px 24px;
  border-top: 1px solid #eff1f5;
  background: #fafbfc;
  border-radius: 0 0 20px 20px;
  flex-shrink: 0;
}

/* ── Transitions ── */
.app-modal-enter-active,
.app-modal-leave-active {
  transition: opacity 0.2s ease;
}
.app-modal-enter-active .app-modal,
.app-modal-leave-active .app-modal {
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.app-modal-enter-from,
.app-modal-leave-to { opacity: 0; }
.app-modal-enter-from .app-modal { transform: scale(0.94) translateY(8px); opacity: 0; }
.app-modal-leave-to  .app-modal { transform: scale(0.96) translateY(4px); opacity: 0; }
</style>
