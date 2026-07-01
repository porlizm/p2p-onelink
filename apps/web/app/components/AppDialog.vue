<template>
  <Teleport to="body">
    <Transition name="app-dialog">
      <div v-if="state.open" class="app-dialog-overlay" @click.self="handleCancel">
        <div class="app-dialog" :class="`app-dialog--${state.variant}`" role="alertdialog" :aria-labelledby="titleId" :aria-describedby="descId">

          <!-- Icon -->
          <div class="app-dialog__icon-wrap" :class="`app-dialog__icon-wrap--${state.variant}`">
            <!-- success -->
            <svg v-if="state.variant === 'success'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <!-- danger -->
            <svg v-else-if="state.variant === 'danger'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <!-- warning -->
            <svg v-else-if="state.variant === 'warning'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <!-- info (default) -->
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>

          <!-- Content -->
          <div class="app-dialog__content">
            <h4 :id="titleId" class="app-dialog__title">{{ state.title }}</h4>
            <p :id="descId" class="app-dialog__message">{{ state.message }}</p>
          </div>

          <!-- Actions -->
          <div class="app-dialog__actions" :class="state.type === 'alert' ? 'app-dialog__actions--center' : ''">
            <button
              v-if="state.type === 'confirm'"
              class="app-dialog__btn app-dialog__btn--ghost"
              @click="handleCancel"
            >
              {{ state.cancelLabel }}
            </button>
            <button
              class="app-dialog__btn"
              :class="`app-dialog__btn--${state.variant}`"
              @click="handleConfirm"
              autofocus
            >
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { dialogState as state } from '~/composables/useDialog';

const titleId = 'app-dialog-title';
const descId = 'app-dialog-desc';

const handleConfirm = () => {
  state.open = false;
  state.resolve?.(true);
  state.resolve = null;
};

const handleCancel = () => {
  if (state.type === 'alert') {
    handleConfirm();
    return;
  }
  state.open = false;
  state.resolve?.(false);
  state.resolve = null;
};
</script>

<style scoped>
/* ── Overlay ── */
.app-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
}

/* ── Dialog card ── */
.app-dialog {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 32px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  padding: 32px 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  border-top: 4px solid transparent;
}

.app-dialog--success { border-top-color: #16a34a; }
.app-dialog--danger  { border-top-color: #e11d48; }
.app-dialog--warning { border-top-color: #d97706; }
.app-dialog--info    { border-top-color: #0ea5e9; }

/* ── Icon ── */
.app-dialog__icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.app-dialog__icon-wrap--success { background: #dcfce7; color: #16a34a; }
.app-dialog__icon-wrap--danger  { background: #ffe4e6; color: #e11d48; }
.app-dialog__icon-wrap--warning { background: #fef9c3; color: #ca8a04; }
.app-dialog__icon-wrap--info    { background: #e0f2fe; color: #0284c7; }

/* ── Content ── */
.app-dialog__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.app-dialog__title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
}

.app-dialog__message {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

/* ── Actions ── */
.app-dialog__actions {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: flex-end;
  padding-top: 4px;
}
.app-dialog__actions--center { justify-content: center; }

/* ── Buttons ── */
.app-dialog__btn {
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  min-width: 90px;
}
.app-dialog__btn:hover { transform: translateY(-1px); }
.app-dialog__btn:active { transform: translateY(0); }

.app-dialog__btn--ghost {
  background: #f1f5f9;
  color: #475569;
}
.app-dialog__btn--ghost:hover { background: #e2e8f0; }

.app-dialog__btn--success {
  background: #16a34a;
  color: #fff;
  box-shadow: 0 2px 8px rgba(22,163,74,0.3);
}
.app-dialog__btn--success:hover { background: #15803d; box-shadow: 0 4px 12px rgba(22,163,74,0.4); }

.app-dialog__btn--danger {
  background: #e11d48;
  color: #fff;
  box-shadow: 0 2px 8px rgba(225,29,72,0.3);
}
.app-dialog__btn--danger:hover { background: #be123c; box-shadow: 0 4px 12px rgba(225,29,72,0.4); }

.app-dialog__btn--warning {
  background: #d97706;
  color: #fff;
  box-shadow: 0 2px 8px rgba(217,119,6,0.3);
}
.app-dialog__btn--warning:hover { background: #b45309; }

.app-dialog__btn--info {
  background: #0284c7;
  color: #fff;
  box-shadow: 0 2px 8px rgba(2,132,199,0.3);
}
.app-dialog__btn--info:hover { background: #0369a1; }

/* ── Transitions ── */
.app-dialog-enter-active,
.app-dialog-leave-active { transition: opacity 0.2s ease; }

.app-dialog-enter-active .app-dialog,
.app-dialog-leave-active .app-dialog {
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
}
.app-dialog-enter-from,
.app-dialog-leave-to { opacity: 0; }
.app-dialog-enter-from .app-dialog { transform: scale(0.88) translateY(12px); opacity: 0; }
.app-dialog-leave-to  .app-dialog  { transform: scale(0.95) translateY(4px);  opacity: 0; }
</style>
