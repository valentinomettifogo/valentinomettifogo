<template>
  <footer>
    <p>&copy; {{ currentYear }} Portfolio. Made with passion and coffee ☕</p>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
footer {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #eee;
}
</style>