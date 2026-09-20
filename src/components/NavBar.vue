<script setup>
import { useRouter } from 'vue-router'
import { user, setUser } from '../store/user'
import { toast } from '../store/toast'

const router = useRouter()

function logout() {
  setUser(null)
  toast('已退出登录')
  router.push('/')
}
</script>

<template>
  <header class="nav">
    <div class="nav-inner">
      <router-link to="/" class="brand">
        <span class="brand-mark"></span>
        <span class="brand-name">SAST 博客</span>
      </router-link>

      <nav class="links">
        <router-link to="/">首页</router-link>
        <router-link v-if="user" to="/new">✏️ 写博客</router-link>
      </nav>

      <div class="right">
        <template v-if="user">
          <img class="avatar" :src="user.avatarUrl" alt="">
          <span class="uname">{{ user.username }}</span>
          <button class="btn btn-ghost btn-sm" @click="logout">退出</button>
        </template>
        <router-link v-else to="/login" class="btn btn-ghost btn-sm">登录</router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
  height: 62px;
  display: flex;
  align-items: center;
  gap: 28px;
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 34%, #4a4f5c, #171a21 68%);
  box-shadow: 0 0 0 3px rgba(101, 133, 237, 0.15);
}
.brand-name {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: 0.5px;
}
.links { display: flex; gap: 4px; flex: 1; }
.links a {
  color: var(--text-2);
  font-size: 15px;
  padding: 6px 13px;
  border-radius: 9px;
  transition: all 0.15s;
}
.links a:hover { color: var(--primary); background: var(--primary-soft); }
.links a.router-link-active { color: var(--primary); font-weight: 600; background: var(--primary-soft); }

.right { display: flex; align-items: center; gap: 10px; }
.uname { font-size: 14px; font-weight: 600; }
</style>
