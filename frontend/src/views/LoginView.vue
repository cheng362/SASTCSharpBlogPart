<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import { setUser } from '../store/user'
import { toast } from '../store/toast'

const route = useRoute()
const router = useRouter()

const mode = ref('login')
const form = ref({ username: '', email: '', password: '' })
const error = ref(null)
const busy = ref(false)

function switchMode(m) {
  mode.value = m
  error.value = null
}

async function submit() {
  busy.value = true
  error.value = null
  try {
    if (mode.value === 'login') {
      const data = await api.login(form.value.email, form.value.password)
      setUser(data.user)
      toast(`欢迎回来，${data.user.username}！`)
    } else {
      const data = await api.register(form.value.username, form.value.email, form.value.password)
      setUser(data)
      toast('注册成功，已自动登录！')
    }
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="card login-card">
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <form @submit.prevent="submit">
        <div class="form-group" v-if="mode === 'register'">
          <label>用户名</label>
          <input v-model="form.username" required placeholder="你的用户名">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" type="email" required placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" required placeholder="密码">
        </div>
        <div class="form-error" v-if="error">{{ error }}</div>
        <button class="btn submit" type="submit" :disabled="busy">
          {{ busy ? '请稍候…' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrap { display: flex; justify-content: center; padding-top: 36px; }
.login-card { width: 100%; max-width: 400px; padding: 26px 30px; }
.tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.tabs button {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  color: var(--text-light);
  transition: all 0.15s;
}
.tabs button.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.submit { width: 100%; justify-content: center; }
.submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
