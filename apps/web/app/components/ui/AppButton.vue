<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled || loading"
    class="app-btn"
    :class="[
      `app-btn--${variant}`,
      `app-btn--${size}`,
      { 'app-btn--icon-only': iconOnly },
      { 'app-btn--block': block },
      { 'app-btn--loading': loading },
    ]"
    v-bind="$attrs"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    </span>

    <!-- Icon slot (left) -->
    <span v-if="$slots.icon && !loading" class="app-btn__icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <!-- Label -->
    <span v-if="!iconOnly" class="app-btn__label">
      <slot />
    </span>

    <!-- Icon-only content -->
    <span v-if="iconOnly && !loading" aria-hidden="true">
      <slot />
    </span>

    <!-- Icon slot (right) -->
    <span v-if="$slots.iconRight && !iconOnly && !loading" class="app-btn__icon" aria-hidden="true">
      <slot name="iconRight" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-soft';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  loading?: boolean;
  block?: boolean;
  disabled?: boolean;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  iconOnly: false,
  loading: false,
  block: false,
  disabled: false,
  type: 'button',
});
</script>

<style scoped>
/* ---- Base ---- */
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-normal);
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease,
    opacity 0.15s ease;
  outline: none;
  position: relative;
  overflow: hidden;
}

.app-btn:focus-visible {
  box-shadow: var(--shadow-focus);
}

.app-btn:disabled,
.app-btn--loading {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.app-btn--block {
  width: 100%;
}

/* ---- Sizes ---- */
.app-btn--sm {
  font-size: 11px;
  padding: 4px 11px;
  height: 28px;
  line-height: 1;
}

.app-btn--md {
  font-size: 12px;
  padding: 6px 14px;
  height: 34px;
  line-height: 1;
}

.app-btn--lg {
  font-size: 13px;
  padding: 8px 18px;
  height: 40px;
  line-height: 1;
}

.app-btn--xl {
  font-size: 14px;
  padding: 10px 22px;
  height: 48px;
  line-height: 1;
}

/* ---- Icon-only sizes ---- */
.app-btn--icon-only.app-btn--sm { width: 28px; height: 28px; padding: 0; }
.app-btn--icon-only.app-btn--md { width: 34px; height: 34px; padding: 0; }
.app-btn--icon-only.app-btn--lg { width: 40px; height: 40px; padding: 0; }
.app-btn--icon-only.app-btn--xl { width: 48px; height: 48px; padding: 0; }

/* ---- Variants ---- */

/* Primary */
.app-btn--primary {
  background-color: var(--interactive-primary);
  color: var(--interactive-primary-text);
  border-color: transparent;
}
.app-btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
}

/* Secondary */
.app-btn--secondary {
  background-color: var(--bg-base);
  color: var(--fg-secondary);
  border-color: var(--border-default);
}
.app-btn--secondary:hover:not(:disabled) {
  background-color: var(--bg-subtle);
  border-color: var(--border-strong);
}

/* Outline */
.app-btn--outline {
  background-color: transparent;
  color: var(--fg-brand);
  border-color: var(--border-brand);
}
.app-btn--outline:hover:not(:disabled) {
  background-color: var(--color-green-50);
}

/* Ghost */
.app-btn--ghost {
  background-color: transparent;
  color: var(--fg-secondary);
  border-color: transparent;
}
.app-btn--ghost:hover:not(:disabled) {
  background-color: var(--bg-subtle);
}

/* Danger */
.app-btn--danger {
  background-color: var(--interactive-destructive);
  color: var(--color-white);
  border-color: transparent;
}
.app-btn--danger:hover:not(:disabled) {
  background-color: var(--interactive-destructive-hover);
}

/* Danger-soft */
.app-btn--danger-soft {
  background-color: var(--color-error-100);
  color: var(--color-error-700);
  border-color: var(--color-error-100);
}
.app-btn--danger-soft:hover:not(:disabled) {
  background-color: var(--color-error-50);
}

/* ---- Spinner animation ---- */
.app-btn__spinner svg {
  animation: btn-spin 0.7s linear infinite;
}

@keyframes btn-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
