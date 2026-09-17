<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, loadContent } from '../api'
import MarkdownView from '../components/MarkdownView.vue'
import { user } from '../store/user'
import { toast } from '../store/toast'

const route = useRoute()
const router = useRouter()

const editId = computed(() => (route.path.startsWith('/edit/') ? Number(route.params.id) : null))
const form = ref({ title: '', author: '', description: '', content: '' })
const preview = ref(false)
const error = ref(null)
const saving = ref(false)
const loaded = ref(editId.value == null) // 新建时无需加载

onMounted(async () => {
  if (editId.value == null) {
    form.value.author = user.value?.username || ''
    return
  }
  try {
    const blog = await api.getBlog(editId.value)
    // 后端没有鉴权接口，前端拦截：只有作者本人能进入编辑页
    if (blog.author !== user.value?.username) {
      toast('只有作者本人才能编辑这篇文章', true)
      router.push(`/post/${editId.value}`)
      return
    }
    form.value = {
      title: blog.title,
      author: blog.author,
      description: blog.description || '',
      content: await loadContent(blog.content).catch(() => String(blog.content || '')),
    }
    loaded.value = true
  } catch (e) {
    toast(e.message, true)
    router.push('/')
  }
})

async function submit() {
  const f = form.value
  if (!f.title.trim() || !f.content.trim()) {
    error.value = '标题和正文不能为空'
    return
  }
  saving.value = true
  error.value = null
  // 前端没有写服务器 md 文件的能力，正文统一以 data: URI 形式保存，
  // 这样种子文章和前端创建的文章都支持编辑
  const content = `data:text/markdown;charset=utf-8,${encodeURIComponent(f.content)}`
  try {
    if (editId.value != null) {
      const orig = await api.getBlog(editId.value)
      await api.updateBlog(editId.value, {
        id: editId.value,
        title: f.title,
        author: f.author,
        description: f.description,
        content,
        createdAt: orig.createdAt,
        updatedAt: new Date().toISOString(),
      })
      toast('保存成功')
      router.push(`/post/${editId.value}`)
    } else {
      const created = await api.createBlog({
        title: f.title,
        author: f.author,
        description: f.description,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      toast('发布成功')
      router.push(`/post/${created.id}`)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div style="max-width: 860px; margin: 0 auto">
    <div class="section-head">
      <h1 class="page-title">{{ editId != null ? '编辑文章' : '写博客' }}</h1>
      <label class="preview-toggle" v-if="loaded">
        <input type="checkbox" v-model="preview"> 实时预览
      </label>
    </div>

    <div class="card" v-if="loaded">
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" required placeholder="文章标题">
        </div>
        <div class="row">
          <div class="form-group">
            <label>作者</label>
            <input v-model="form.author" required>
          </div>
          <div class="form-group">
            <label>摘要</label>
            <input v-model="form.description" placeholder="一句话介绍这篇文章">
          </div>
        </div>
        <div class="form-group">
          <label>正文（Markdown）</label>
          <div class="editor" :class="{ split: preview }">
            <textarea v-model="form.content" rows="16" required
              placeholder="# 标题&#10;&#10;支持 **加粗**、`行内代码`、列表、引用、```代码块```、表格等 Markdown 语法"></textarea>
            <div v-if="preview" class="preview card">
              <MarkdownView :source="form.content" />
            </div>
          </div>
          <div class="form-hint">支持 Markdown 语法，发布后按 Markdown 渲染</div>
        </div>
        <div class="form-error" v-if="error">{{ error }}</div>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? '保存中…' : (editId != null ? '保存修改' : '发布文章') }}
        </button>
        <button class="btn btn-ghost" type="button" style="margin-left: 8px"
          @click="router.back()">取消</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-title { font-size: 22px; margin: 4px 0 14px; }
.section-head { display: flex; align-items: center; justify-content: space-between; }
.preview-toggle { font-size: 13.5px; color: var(--text-light); cursor: pointer; display: flex; gap: 6px; align-items: center; }
.row { display: flex; gap: 16px; }
.row .form-group { flex: 1; }
.editor { display: flex; flex-direction: column; }
.editor.split { flex-direction: row; gap: 12px; align-items: stretch; }
.editor.split textarea { flex: 1; min-height: 380px; }
.preview { flex: 1; overflow-y: auto; max-height: 520px; padding: 14px 18px; background: #fafbfe; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
