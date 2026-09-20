<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({ source: { type: String, default: '' } })

marked.setOptions({ gfm: true, breaks: true })

const html = computed(() => DOMPurify.sanitize(marked.parse(props.source ?? '')))
</script>

<template>
  <div class="md" v-html="html"></div>
</template>
