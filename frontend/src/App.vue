<script setup>
import NavBar from './components/NavBar.vue'
import Toasts from './components/Toasts.vue'
</script>

<template>
  <NavBar />
  <main class="container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </main>
  <footer class="footer">
    SAST C# 博客 · Vue 3 前端演示（样式参考 月幕Galgame）
  </footer>
  <Toasts />
</template>
