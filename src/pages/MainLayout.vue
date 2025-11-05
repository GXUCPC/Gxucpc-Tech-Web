<script setup lang="ts">
import FooterContent from '@/components/FotterBar.vue'
import HeaderNav from '@/components/HeaderBar.vue'
</script>

<template>
  <header-nav />
  <div class="contentContainer">
    <div class="content">
      <router-view />
    </div>
  </div>
  <footer-content />
</template>

<style scoped>
.contentContainer {
  width: 100%;
}

.content {
  margin: 0 auto;
  width: min(100%, 1920px);
  min-height: calc(100vh - 4em);
}
</style>
