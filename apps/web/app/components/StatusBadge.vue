<template>
  <!-- Delegate to UiStatusPill — HILI Design System v1.1.0 -->
  <UiStatusPill :status="status">
    <slot>{{ status }}</slot>
  </UiStatusPill>
</template>

<script setup lang="ts">
/**
 * StatusBadge — Legacy wrapper, now delegates to UiStatusPill.
 * Kept for backward compatibility across all existing pages.
 */
defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>
