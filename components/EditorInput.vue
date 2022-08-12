<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits<{
  (event: 'update:modelValue', args: Event): void
}>()
</script>

<template>
  <textarea :value="modelValue" :readonly="readonly" dark:bg-dark-800 resize-none p-2px @input="emit('update:modelValue', $event.target?.value)" />
</template>
