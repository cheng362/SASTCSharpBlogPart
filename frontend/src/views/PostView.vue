<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, loadContent, fmtDate, isOwner } from '../api'
import MarkdownView from '../components/MarkdownView.vue'
import CommentSection from '../components/CommentSection.vue'
import { user } from '../store/user'
import { toast } from '../store/toast'

const route = useRoute()
const router = useRouter()

const blog = ref(null)
const content = ref('加载中…')
const error = ref(null)

onMounted(async () => {
  const id = route.params.id
  try {
    blog.value = await api.getBlog(id)
    content.value = await loadContent(blog.value.content)
  } catch (e) {
    error.value = e.message
    content.value = ''
  }
})

async function del() {
  if (!confirm(`确定删除文章《${blog.value.title}》吗？`)) return
  try {
    await api.deleteBlog(blog.value.id)
    toast('已删除')
    router.push('/')
  } catch (e) {
    toast(e.message, true)
  }
}
</script>

<template>
  <div v-if="error" class="empty card">
    文章加载失败：{{ error }}
    <div style="margin-top: 12px"><router-link to="/">← 返回首页</router-link></div>
  </div>

  <div v-else-if="!blog" class="empty">加载中…</div>

  <div v-else>
    <div class="post-header">
      <h1>{{ blog.title }}</h1>
      <div class="meta">
        <span class="chip">👤 {{ blog.author }}</span>
        <span class="chip">🕒 发布于 {{ fmtDate(blog.createdAt) }}</span>
        <span class="chip">✏️ 更新于 {{ fmtDate(blog.updatedAt) }}</span>
        <span v-if="isOwner(blog)" class="actions">
          <router-link class="btn btn-ghost btn-sm" :to="`/edit/${blog.id}`">编辑</router-link>
          <button class="btn btn-danger btn-sm" @click="del">删除</button>
        </span>
      </div>
    </div>

    <div class="card post-body">
      <MarkdownView :source="content" />
    </div>

    <CommentSection :blog-id="blog.id" />
  </div>
</template>

<style scoped>
.post-header { padding: 6px 4px 16px; }
.post-header h1 {
  margin: 0 0 12px;
  font-size: 30px;
  line-height: 1.35;
  letter-spacing: 0.3px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.actions { margin-left: auto; display: flex; gap: 8px; }
.post-body { margin: 0 0 18px; padding: 32px 40px; }
</style>
