<script setup lang="ts">
</script>

<template>
  <div class="header-toolbar" p-x-3>
    <div class="brand item">
      <img mb-1 src="/transfer.png">
      Some JS <i inline-block vertical-text-bottom i-mdi-transfer-right /> TS Thing
    </div>
  </div>
</template>

<style lang="scss">
.header-toolbar {
    .item {
        --at-apply: p-y-3;
    }
    .brand {
        --at-apply: text-xl ;
        img {
            --at-apply: w-7 h-7 inline-block;
        }
    }
}
</style>
