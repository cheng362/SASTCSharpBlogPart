import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

export function toast(msg, isError = false) {
  const id = ++seq
  toasts.push({ id, msg, isError })
  setTimeout(() => {
    const i = toasts.findIndex(t => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }, 2600)
}
