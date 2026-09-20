<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '../api'
import BlogCard from '../components/BlogCard.vue'
import { user } from '../store/user'
import { toast } from '../store/toast'

const blogs = ref([])
const loading = ref(true)
const keyword = ref('')
const slide = ref(0)

const slides = [
  { img: '/img/image.png', overlay: 'linear-gradient(100deg, rgba(23, 28, 46, 0.72) 30%, rgba(23, 28, 46, 0.18))', title: 'SAST 博客', sub: '记录、分享与成长', cta: true },
  { gradient: 'linear-gradient(120deg, #5b7cf0 0%, #8d6bf0 100%)', title: '写点东西吧', sub: '把学习足迹留在博客里' },
  { gradient: 'linear-gradient(120deg, #2fb7a5 0%, #5b7cf0 100%)', title: '技术 · 生活 · 随笔', sub: '与大家一起交流' },
]

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return blogs.value
  return blogs.value.filter(b =>
    [b.title, b.description, b.author].some(v => String(v || '').toLowerCase().includes(k)))
})

let timer = null
onMounted(async () => {
  timer = setInterval(() => { slide.value = (slide.value + 1) % slides.length }, 5000)
  try {
    blogs.value = (await api.listBlogs())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    toast(e.message, true)
  } finally {
    loading.value = false
  }
})
onUnmounted(() => clearInterval(timer))

async function del(blog) {
  if (!confirm(`确定删除文章《${blog.title}》吗？`)) return
  try {
    await api.deleteBlog(blog.id)
    toast('已删除')
    blogs.value = blogs.value.filter(b => b.id !== blog.id)
  } catch (e) {
    toast(e.message, true)
  }
}
</script>

<template>
  <div>
    <!-- 轮播横幅 -->
    <div class="banner">
      <transition-group name="fade">
        <div v-for="(s, i) in slides" v-show="i === slide" :key="i" class="slide" :style="s.gradient ? { background: s.gradient } : {}">
          <img v-if="s.img" :src="s.img" alt="">
          <div v-if="s.overlay" class="shade" :style="{ background: s.overlay }"></div>
          <div class="slide-text" :class="{ centered: !s.img }">
            <h2>{{ s.title }}</h2>
            <p>{{ s.sub }}</p>
            <router-link v-if="s.cta && user" to="/new" class="btn banner-btn">✏️ 开始创作</router-link>
            <router-link v-else-if="s.cta" to="/login" class="btn banner-btn">登录，开始创作</router-link>
          </div>
        </div>
      </transition-group>
      <div class="dots">
        <span v-for="(s, i) in slides" :key="i" class="dot" :class="{ active: i === slide }" @click="slide = i"></span>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="search-wrap">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="keyword" type="search" placeholder="搜索标题、摘要或作者…" />
        <button v-if="keyword" class="clear" @click="keyword = ''" title="清空">✕</button>
      </div>
    </div>

    <div class="section-head">
      <h2 class="section-title">{{ keyword ? '搜索结果' : '全部文章' }}</h2>
      <span class="section-sub" v-if="!loading">
        {{ keyword ? `${filtered.length} 篇与「${keyword}」相关` : `${blogs.length} 篇` }}
      </span>
    </div>

    <div v-if="loading" class="empty">文章加载中…</div>
    <div v-else-if="keyword && !filtered.length" class="empty card">
      没有找到与「{{ keyword }}」相关的文章，<a href="#" @click.prevent="keyword = ''">清除搜索</a>查看全部
    </div>
    <div v-else-if="!blogs.length" class="empty card">
      还没有文章，<router-link v-if="user" to="/new">去发布第一篇</router-link><template v-else>快登录发布第一篇吧～</template>
    </div>
    <div v-else class="list">
      <BlogCard v-for="b in filtered" :key="b.id" :blog="b" @delete="del" />
    </div>
  </div>
</template>

<style scoped>
.banner {
  position: relative;
  height: 260px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-hover);
}
.slide { position: absolute; inset: 0; }
.slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
.shade { position: absolute; inset: 0; }

.slide-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 48px;
  color: #fff;
}
.slide-text.centered { align-items: center; text-align: center; padding: 0; }
.slide-text h2 {
  font-size: 36px;
  margin: 0 0 6px;
  letter-spacing: 2px;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
}
.slide-text p { font-size: 16px; opacity: 0.95; margin: 0 0 16px; text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3); }
.banner-btn {
  background: rgba(255, 255, 255, 0.92);
  color: var(--primary-dark);
  font-weight: 600;
  width: fit-content;
}
.banner-btn:hover { background: #fff; color: var(--primary-dark); }

.dots {
  position: absolute;
  bottom: 14px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 5;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}
.dot.active { background: #fff; transform: scale(1.2); }

.search-wrap { display: flex; justify-content: center; margin: 22px 0 6px; }
.search-box {
  position: relative;
  width: min(560px, 100%);
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.55;
  pointer-events: none;
}
.search-box input {
  width: 100%;
  padding: 11px 40px 11px 40px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  box-shadow: var(--shadow);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(101, 133, 237, 0.12);
}
.search-box .clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: var(--bg);
  color: var(--text-light);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 11px;
}
.search-box .clear:hover { color: var(--danger); background: rgba(229, 72, 77, 0.1); }

.section-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 22px 4px 14px;
}
.section-title { font-size: 20px; margin: 0; }
.section-sub { color: var(--text-light); font-size: 13px; }

.list { display: flex; flex-direction: column; gap: 14px; }
</style>
