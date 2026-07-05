<template>
  <div class="kpi-card" :style="accent ? `--kpi-accent: ${accent}` : ''">
    <!-- Header row -->
    <div class="kpi-card__header">
      <span class="kpi-card__label">{{ label }}</span>
      <span v-if="icon" class="kpi-card__icon" aria-hidden="true" v-html="icon" />
    </div>

    <!-- Value row -->
    <div class="kpi-card__value-row">
      <span class="kpi-card__value">{{ value }}</span>
      <span v-if="unit" class="kpi-card__unit">{{ unit }}</span>
    </div>

    <!-- Delta row -->
    <div v-if="delta || sub" class="kpi-card__meta">
      <span v-if="delta" class="kpi-card__delta" :class="`kpi-card__delta--${dir || 'flat'}`">
        <!-- Arrow -->
        <svg v-if="dir === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        <svg v-else-if="dir === 'down'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {{ delta }}
      </span>
      <span v-if="sub" class="kpi-card__sub">{{ sub }}</span>
    </div>

    <!-- Progress bar -->
    <div v-if="bar !== undefined" class="kpi-card__bar-track">
      <div
        class="kpi-card__bar-fill"
        :style="{
          width: `${Math.min(100, Math.max(0, bar))}%`,
          backgroundColor: barColor || 'var(--kpi-accent, var(--interactive-primary))',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  dir?: 'up' | 'down' | 'flat';
  sub?: string;
  icon?: string;
  accent?: string;
  bar?: number;
  barColor?: string;
}

defineProps<Props>();
</script>

<style scoped>
.kpi-card {
  --kpi-accent: var(--interactive-primary);

  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-6);
  background: var(--glass-surface-bg);
  backdrop-filter: blur(var(--glass-surface-blur)) saturate(115%);
  -webkit-backdrop-filter: blur(var(--glass-surface-blur)) saturate(115%);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-surface-shadow);
  transition: box-shadow var(--transition-slow), transform var(--transition-slow);
}

.kpi-card:hover {
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 12px 32px -8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* Header */
.kpi-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.kpi-card__label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--fg-tertiary);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  line-height: var(--leading-normal);
}

.kpi-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-surface);
  color: var(--kpi-accent);
  flex-shrink: 0;
}

/* Value */
.kpi-card__value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-1-5);
}

.kpi-card__value {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-black);
  color: var(--fg-primary);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.kpi-card__unit {
  font-size: var(--text-sm);
  color: var(--fg-tertiary);
  font-weight: var(--weight-medium);
}

/* Meta row */
.kpi-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.kpi-card__delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.kpi-card__delta--up {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.kpi-card__delta--down {
  color: var(--color-error-700);
  background-color: var(--color-error-100);
}

.kpi-card__delta--flat {
  color: var(--fg-tertiary);
  background-color: var(--bg-surface);
}

.kpi-card__sub {
  font-size: var(--text-xs);
  color: var(--fg-tertiary);
}

/* Progress bar */
.kpi-card__bar-track {
  height: 4px;
  background-color: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-1);
}

.kpi-card__bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-slower) var(--ease-out);
}
</style>
