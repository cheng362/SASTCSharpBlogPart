/*
 * 前端生产构建启动器（可选，开发时直接用 `npm run dev`）：
 *   1. 构建前端：cd frontend && npm run build   （输出到 frontend/dist）
 *   2. 启动后端：dotnet run                     （默认 http://localhost:5253）
 *   3. 运行本脚本：node serve.js
 *   4. 浏览器打开 http://localhost:8080
 *
 * 作用：托管 frontend/dist 静态文件，并把 /api、/blogs、/img 反向代理到后端，
 * 使前端与接口同源，避免浏览器 CORS 限制。
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5253';
const DIST = path.join(__dirname, 'frontend', 'dist');
const WWWROOT = path.join(__dirname, 'wwwroot');
const backendPort = new URL(BACKEND).port || 5253;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function proxy(req, res) {
  const upstream = http.request(
    { host: 'localhost', port: backendPort, method: req.method, path: req.url, headers: { ...req.headers, host: `localhost:${backendPort}` } },
    up => { res.writeHead(up.statusCode, up.headers); up.pipe(res); },
  );
  upstream.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: '无法连接后端，请先运行 dotnet run 启动 API 服务' }));
  });
  req.pipe(upstream);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.normalize(path.join(DIST, urlPath));
  // SPA 路由回退：非资源路径一律回退到 index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('dist 不存在，请先在 frontend 目录执行 npm run build');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

// 后端 wwwroot 中的博客正文与图片（后端没有静态文件中间件，由这里直接提供）
function serveWwwroot(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const filePath = path.normalize(path.join(WWWROOT, urlPath));
  if (!filePath.startsWith(WWWROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'text/markdown; charset=utf-8' });
    res.end(data);
  });
}

if (!fs.existsSync(DIST)) {
  console.log('未找到 frontend/dist，请先执行：cd frontend && npm run build');
  console.log('开发调试请直接执行：cd frontend && npm run dev');
  process.exit(1);
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) proxy(req, res);
  else if (req.url.startsWith('/blogs/') || req.url.startsWith('/img/')) serveWwwroot(req, res);
  else serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`前端已启动:  http://localhost:${PORT}`);
  console.log(`后端 API:    ${BACKEND} （请确保已运行 dotnet run）`);
});
