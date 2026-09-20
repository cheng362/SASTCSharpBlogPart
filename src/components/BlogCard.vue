<script setup>
import { fmtDate, coverStyle, isOwner } from '../api'

defineProps({ blog: { type: Object, required: true } })
defineEmits(['delete'])
</script>

<template>
  <article class="blog-row">
    <router-link :to="`/post/${blog.id}`" class="thumb" :style="coverStyle(blog.title)">
      <span class="thumb-char">{{ (blog.title || '文')[0] }}</span>
    </router-link>
    <div class="body">
      <router-link :to="`/post/${blog.id}`" class="title">{{ blog.title }}</router-link>
      <p class="desc">{{ blog.description || '（暂无摘要）' }}</p>
      <div class="meta">
        <span class="author">👤 {{ blog.author }}</span>
        <span class="dot">·</span>
        <span>🕒 {{ fmtDate(blog.createdAt) }}</span>
        <span v-if="isOwner(blog)" class="actions">
          <router-link class="btn btn-ghost btn-sm" :to="`/edit/${blog.id}`">编辑</router-link>
          <button class="btn btn-danger btn-sm" @click="$emit('delete', blog)">删除</button>
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.blog-row {
  display: flex;
  gap: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px 20px;
  transition: transform 0.16s, box-shadow 0.16s, border-color 0.16s;
}
.blog-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(101, 133, 237, 0.35);
}

.thumb {
  width: 86px;
  height: 86px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.thumb-char {
  font-size: 34px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  user-select: none;
}

.body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title:hover { color: var(--primary); }
.desc {
  margin: 5px 0 0;
  color: var(--text-2);
  font-size: 13.5px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-light);
  font-size: 12.5px;
  margin-top: 8px;
}
.author { color: var(--text-2); font-weight: 500; }
.dot { color: var(--border); }
.actions { margin-left: auto; display: flex; gap: 6px; }
</style>
