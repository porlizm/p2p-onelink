<template>
  <div class="ui-alert" :class="`ui-alert--${tone}`" role="alert">
    <!-- Icon -->
    <span class="ui-alert__icon" aria-hidden="true">
      <svg v-if="tone === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <svg v-else-if="tone === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <svg v-else-if="tone === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </span>

    <!-- Content -->
    <div class="ui-alert__content">
      <p v-if="title" class="ui-alert__title">{{ title }}</p>
      <div class="ui-alert__body">
        <slot />
      </div>
      <div v-if="$slots.action" class="ui-alert__action">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  tone?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
}

withDefaults(defineProps<Props>(), {
  tone: 'info',
});
</script>

<style scoped>
.ui-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 3px solid currentColor;
}

.ui-alert__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.ui-alert__content {
  flex: 1;
  min-width: 0;
}

.ui-alert__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-1);
  line-height: var(--leading-snug);
}

.ui-alert__body {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.ui-alert__action {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-decoration: underline;
  cursor: pointer;
}

/* Tones */
.ui-alert--success {
  background-color: var(--color-success-50);
  color: var(--color-success-700);
}

.ui-alert--warning {
  background-color: var(--color-warning-50);
  color: var(--color-warning-700);
}

.ui-alert--error {
  background-color: var(--color-error-50);
  color: var(--color-error-700);
}

.ui-alert--info {
  background-color: var(--color-info-50);
  color: var(--color-info-700);
}
</style>
