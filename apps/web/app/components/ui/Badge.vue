<template>
  <span
    class="ui-badge"
    :class="[
      `ui-badge--${tone}`,
      { 'ui-badge--square': square },
    ]"
  >
    <span v-if="dot" class="ui-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';
  square?: boolean;
  dot?: boolean;
}

withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  square: false,
  dot: false,
});
</script>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
  border-radius: var(--radius-full);
  white-space: nowrap;
  letter-spacing: var(--tracking-wide);
}

.ui-badge--square {
  border-radius: var(--radius-sm);
}

/* Dot indicator */
.ui-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  background-color: currentColor;
}

/* Tones */
.ui-badge--success {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.ui-badge--warning {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.ui-badge--error {
  color: var(--color-error-700);
  background-color: var(--color-error-100);
}

.ui-badge--info {
  color: var(--color-info-700);
  background-color: var(--color-info-100);
}

.ui-badge--neutral {
  color: var(--fg-secondary);
  background-color: var(--bg-surface);
}

.ui-badge--brand {
  color: var(--color-white);
  background-color: var(--color-green-600);
}
</style>
