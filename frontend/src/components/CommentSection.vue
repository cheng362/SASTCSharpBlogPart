<script setup>
import { ref, onMounted } from 'vue'
import { api, fmtDate } from '../api'
import { user } from '../store/user'
import { toast } from '../store/toast'

const props = defineProps({ blogId: { type: Number, required: true } })

const comments = ref([])
const loading = ref(true)
const draft = ref('')
const replyTo = ref(null) // 正在回复的评论 id
const replyDraft = ref('')

const total = () => comments.value.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0)

async function load() {
  loading.value = true
  try {
    comments.value = await api.listComments(props.blogId)
  } catch (e) {
    toast(e.message, true)
  } finally {
    loading.value = false
  }
}

async function submit(parentId = null, text) {
  const content = text.trim()
  if (!content) { toast('评论内容不能为空', true); return }
  try {
    await api.addComment({ content, blogItmId: props.blogId, userId: user.value.id, parentId })
    toast(parentId ? '回复成功' : '评论成功')
    if (parentId) { replyTo.value = null; replyDraft.value = '' }
    else draft.value = ''
    await load()
  } catch (e) {
    toast(e.message, true)
  }
}

function startReply(c) {
  replyTo.value = replyTo.value === c.id ? null : c.id
  replyDraft.value = ''
}

onMounted(load)
</script>

<template>
  <section class="card">
    <h2 class="c-title">评论 <span class="count">{{ total() }}</span></h2>

    <div v-if="user" class="editor">
      <textarea v-model="draft" rows="3" placeholder="写下你的评论…"></textarea>
      <button class="btn btn-sm" @click="submit(null, draft)">发表评论</button>
    </div>
    <p v-else class="hint">💬 <router-link to="/login">登录</router-link> 后即可发表评论</p>

    <div v-if="loading" class="empty">评论加载中…</div>
    <div v-else-if="!comments.length" class="empty">暂无评论，快来抢沙发～</div>

    <div v-else class="list">
      <div v-for="c in comments" :key="c.id" class="comment">
        <img class="avatar" :src="c.user?.avatarUrl" alt="">
        <div class="body">
          <div class="head">
            <span class="name">{{ c.user?.username || '未知用户' }}</span>
            <span>{{ fmtDate(c.createdAt) }}</span>
          </div>
          <p class="text">{{ c.content }}</p>
          <div class="foot" v-if="user">
            <button @click="startReply(c)">回复</button>
          </div>

          <div v-if="replyTo === c.id" class="reply-box">
            <textarea v-model="replyDraft" rows="2" :placeholder="`回复 @${c.user?.username || ''}…`"></textarea>
            <div class="reply-actions">
              <button class="btn btn-sm" @click="submit(c.id, replyDraft)">回复</button>
              <button class="btn btn-ghost btn-sm" @click="replyTo = null">取消</button>
            </div>
          </div>

          <div v-if="c.replies?.length" class="replies">
            <div v-for="r in c.replies" :key="r.id" class="comment reply">
              <img class="avatar" :src="r.user?.avatarUrl" alt="">
              <div class="body">
                <div class="head">
                  <span class="name">{{ r.user?.username || '未知用户' }}</span>
                  <span>{{ fmtDate(r.createdAt) }}</span>
                </div>
                <p class="text">{{ r.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.c-title { margin: 2px 0 14px; font-size: 19px; }
.count { color: var(--primary); }
.editor textarea { margin-bottom: 10px; }
.hint { color: var(--text-light); font-size: 14px; }

.comment { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.comment:last-child { border-bottom: none; }
.comment .avatar { width: 38px; height: 38px; }
.body { flex: 1; min-width: 0; }
.head { font-size: 13px; color: var(--text-light); display: flex; gap: 10px; }
.head .name { color: var(--text); font-weight: 600; }
.text { margin: 4px 0; white-space: pre-wrap; word-break: break-word; }
.foot button {
  background: none; border: none; color: var(--text-light);
  cursor: pointer; font-size: 13px; padding: 0;
}
.foot button:hover { color: var(--primary); }
.reply-box { margin-top: 10px; }
.reply-box textarea { margin-bottom: 8px; }
.reply-actions { display: flex; gap: 8px; }
.replies { margin-top: 10px; padding-left: 12px; border-left: 2px solid var(--border); }
.reply { padding: 10px 0 0; border-bottom: none; }
.reply .avatar { width: 30px; height: 30px; }
</style>
