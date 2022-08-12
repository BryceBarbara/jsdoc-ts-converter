<script setup lang="ts">
const color = useColorMode()

function toggleDark() {
  const newValue = color.value === 'dark' ? 'light' : 'dark'
  color.value = newValue
  color.preference = newValue
}
</script>

<template>
  <button class="!outline-none" @click="toggleDark">
    <div class="dark:i-carbon-moon i-carbon-sun" />
  </button>
</template>
