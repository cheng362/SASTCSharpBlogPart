import { ref } from 'vue'

// 后端登录接口只做校验，不返回 token，因此把用户信息保存在 localStorage
const saved = localStorage.getItem('blog_current_user')
export const user = ref(saved ? JSON.parse(saved) : null)

export function setUser(u) {
  user.value = u
  if (u) localStorage.setItem('blog_current_user', JSON.stringify(u))
  else localStorage.removeItem('blog_current_user')
}
