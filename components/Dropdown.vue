<script lang="ts">
import type { PropType } from 'vue'
export interface SelectOption {
  label: string
  value: string
}
</script>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String as PropType<string | null | undefined>,
    required: false,
    default: undefined,
  },
  options: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
})
const emit = defineEmits<{
  (event: 'update:modelValue', value: String | undefined): void
}>()

function onInput(event: Event) {
  if (event.target instanceof HTMLSelectElement)
    emit('update:modelValue', event.target.value)
}
</script>

<template>
  <select class="dropdown" name="select" w-full @input="onInput">
    <option value="" />
    <option v-for="option in options" :key="option.value" :value="option.value" :selected="option.value === props.modelValue">
      {{ option.label }}
    </option>
  </select>
</template>

<style lang="scss">
.dropdown {
  --at-apply: dark:bg-dark-500;
  &:focus-visible {
    --at-apply: outline-offset-2 z-1;
  }
}
</style>
