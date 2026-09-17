import { user } from './store/user'

async function request(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    throw new Error(data && data.message ? data.message : `请求失败 (${res.status})`)
  }
  return data
}

export const api = {
  listBlogs: () => request('/api/blogitem/'),
  getBlog: id => request(`/api/blogitem/${id}`),
  createBlog: blog => request('/api/blogitem/', { method: 'POST', body: JSON.stringify(blog) }),
  updateBlog: (id, blog) => request(`/api/blogitem/${id}`, { method: 'PUT', body: JSON.stringify(blog) }),
  deleteBlog: id => request(`/api/blogitem/${id}`, { method: 'DELETE' }),

  listComments: blogId => request(`/api/comments/blog/${blogId}`),
  addComment: c => request('/api/comments/', { method: 'POST', body: JSON.stringify(c) }),

  login: (email, password) => request('/api/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (username, email, password) =>
    request('/api/users/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
}

/* 正文内容加载：
 * 种子数据把正文存为相对 Uri（/wwwroot/blogs/xxx.md），后端静态目录 wwwroot
 * 映射为站点根目录，因此把前缀 /wwwroot/ 换成 / 再去抓取；
 * 前端新建的文章把 Markdown 文本直接存成 data: URI。 */
export async function loadContent(content) {
  content = String(content ?? '')
  if (content.startsWith('data:')) {
    const comma = content.indexOf(',')
    const header = content.slice(0, comma)
    let body = content.slice(comma + 1)
    if (/;base64/i.test(header)) {
      const bytes = Uint8Array.from(atob(body), c => c.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    }
    return decodeURIComponent(body)
  }
  const path = content.replace(/^\/?(wwwroot\/)?/, '/')
  const res = await fetch(path)
  if (!res.ok) throw new Error(`正文文件加载失败 (${res.status})`)
  return res.text()
}

export function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d)) return String(s)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* 按标题生成稳定的渐变色封面（博客没有配图时使用） */
export function coverStyle(title) {
  let h = 0
  for (const c of String(title ?? '')) h = (h * 31 + c.codePointAt(0)) % 360
  const a = `hsl(${h}, 62%, 62%)`
  const b = `hsl(${(h + 46) % 360}, 66%, 48%)`
  return { background: `linear-gradient(135deg, ${a}, ${b})` }
}

/* 后端没有鉴权接口，仅在前端限制：只有文章作者本人才能编辑/删除 */
export function isOwner(blog) {
  return !!user?.value && blog?.author === user.value.username
}
