/*
 * 前端生产构建启动器（开发调试直接用 `cd frontend && npm run dev`）：
 *   1. 构建前端：cd frontend && npm run build   （输出到 frontend/dist）
 *   2. 启动后端：dotnet run                     （默认 http://localhost:5253）
 *   3. 运行本脚本：node serve.js                 （默认 http://localhost:8080）
 *
 * 职责：托管 frontend/dist 静态文件（SPA 路由回退到 index.html）、
 * 直接提供后端 wwwroot 中的博客正文与图片（后端没有静态文件中间件）、
 * 并把 /api 反向代理到后端，使前端与接口同源，避免浏览器 CORS 限制。
 */
'use strict';

const http = require('http');
const fsp = require('fs/promises');
const { createReadStream } = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const BACKEND = new URL(process.env.BACKEND_URL || 'http://localhost:5253');
const DIST = path.join(__dirname, 'frontend', 'dist');
const WWWROOT = path.join(__dirname, 'wwwroot');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

/* 解析 URL 并把路径安全地限制在 root 内：
 * - 解码后的路径分段里出现 .. / 反斜杠 / 盘符一律拒绝（防目录穿越）
 * - 返回 null 表示非法或越界 */
function safeJoin(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null; // 非法百分号编码
  }
  if (decoded.includes('\\') || /^[a-zA-Z]:/.test(decoded)) return null;
  const segments = decoded.split('/');
  if (segments.some(s => s === '..' || s === '.')) return null;
  const filePath = path.join(root, ...segments.filter(Boolean));
  // path.sep 兜底校验，避免 root 前缀相同的兄弟目录（如 dist-x）绕过
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return null;
  return filePath;
}

async function sendFile(req, res, filePath, extraHeaders = {}) {
  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    return false; // 不存在
  }
  if (!stat.isFile()) return false;

  const headers = {
    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Content-Length': stat.size,
    ...extraHeaders,
  };
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  createReadStream(filePath).pipe(res);
  return true;
}

function notFound(res, msg = 'Not Found') {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(msg);
}

/* /api 反向代理：目标主机与端口都取自 BACKEND_URL */
function proxy(req, res) {
  const upstream = http.request(
    {
      hostname: BACKEND.hostname,
      port: BACKEND.port || 80,
      method: req.method,
      path: req.url,
      headers: { ...req.headers, host: BACKEND.host },
    },
    up => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ message: `无法连接后端 ${BACKEND.href}，请先运行 dotnet run 启动 API 服务` }));
  });
  req.pipe(upstream);
}

/* dist 静态文件；未命中的路径回退到 index.html（SPA 前端路由） */
async function serveDist(req, res, urlPath) {
  const filePath = safeJoin(DIST, urlPath);
  if (filePath && (await sendFile(req, res, filePath, { 'Cache-Control': 'no-cache' }))) return;

  const isAsset = path.extname(urlPath) !== '';
  if (isAsset) return notFound(res); // 带扩展名的资源 404，不吞掉拼写错误
  // SPA 路由（/post/2 等）回退
  if (!(await sendFile(req, res, path.join(DIST, 'index.html'), { 'Cache-Control': 'no-store' }))) {
    notFound(res);
  }
}

/* 后端 wwwroot 中的博客 md 与图片（后端未启用静态文件中间件，由这里直接提供） */
async function serveWwwroot(req, res, urlPath) {
  const filePath = safeJoin(WWWROOT, urlPath);
  if (filePath && (await sendFile(req, res, filePath, { 'Cache-Control': 'no-cache' }))) return;
  notFound(res);
}

async function main() {
  try {
    await fsp.access(path.join(DIST, 'index.html'));
  } catch {
    console.log('未找到 frontend/dist/index.html，请先执行：cd frontend && npm run build');
    console.log('开发调试请直接执行：cd frontend && npm run dev');
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && !req.url.startsWith('/api/')) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }

    let urlPath;
    try {
      urlPath = new URL(req.url, 'http://localhost').pathname;
    } catch {
      res.writeHead(400);
      return res.end('Bad Request');
    }

    if (urlPath.startsWith('/api/')) return proxy(req, res);
    if (urlPath.startsWith('/blogs/') || urlPath.startsWith('/img/')) {
      return serveWwwroot(req, res, urlPath);
    }
    return serveDist(req, res, urlPath);
  });

  server.listen(PORT, () => {
    console.log(`前端已启动:  http://localhost:${PORT}`);
    console.log(`后端 API:    ${BACKEND.href} （请确保已运行 dotnet run）`);
  });
}

main();
