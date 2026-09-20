<script setup>
import { toasts } from '../store/toast'
</script>

<template>
  <div class="toast-wrap">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="{ error: t.isError }">
      {{ t.msg }}
    </div>
  </div>
</template>
