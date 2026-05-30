<script setup>
// leave these mounted - if you v-if them screen readers miss the updates
defineProps({
  polite: { type: String, default: "" },
  assertive: { type: String, default: "" },
});
</script>

<template>
  <div class="visually-hidden">
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ polite }}
    </div>
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {{ assertive }}
    </div>
  </div>
</template>
