<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({ source: { type: String, default: '' } })

marked.setOptions({ gfm: true, breaks: true })

function setExternalLinkAttributes(node) {
  if (node.tagName !== 'A' || typeof window === 'undefined') return

  const href = node.getAttribute('href')
  if (!href) return

  try {
    const url = new URL(href, window.location.href)
    if (/^https?:$/.test(url.protocol) && url.origin !== window.location.origin) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  } catch {
    // Leave malformed links to DOMPurify's normal handling.
  }
}

const html = computed(() => {
  DOMPurify.addHook('afterSanitizeAttributes', setExternalLinkAttributes)
  try {
    return DOMPurify.sanitize(marked.parse(props.source ?? ''))
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes', setExternalLinkAttributes)
  }
})
</script>

<template>
  <div class="md" v-html="html"></div>
</template>
