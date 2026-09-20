import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// 前端与后端同仓库同根目录：开发服务器把 /api 代理到 ASP.NET Core 后端，
// 后端的 wwwroot（博客 md 正文、图片）由 publicDir 直接托管
const backend = process.env.BACKEND_URL || 'http://localhost:5253'

export default defineConfig({
  plugins: [vue()],
  publicDir: path.resolve(__dirname, 'wwwroot'),
  server: {
    port: 8080,
    proxy: {
      '/api': backend,
    },
  },
  build: {
    // 构建产物不要包含 publicDir 拷贝出的 blogs/img（它们始终由后端 wwwroot 提供）
    copyPublicDir: false,
  },
})
