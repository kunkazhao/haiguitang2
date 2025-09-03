const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

// Resolve port (env, cli, default)
let PORT = parseInt(process.env.PORT, 10);
const argPort = process.argv.slice(2).find(
  (a) => a.startsWith('--port=') || /^\d+$/.test(a)
);
if (Number.isNaN(PORT) || !PORT) PORT = 5173;
if (argPort) {
  const p = parseInt(argPort.split('=')[1] || argPort, 10);
  if (!Number.isNaN(p)) PORT = p;
}
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function safeJoin(base, target) {
  const unsafePath = decodeURI(target); // handle %20 etc.
  const normalized = path.normalize(unsafePath).replace(/^\\|^\//, '');
  const finalPath = path.join(base, normalized);
  if (!finalPath.startsWith(base)) {
    return null; // path traversal attempt
  }
  return finalPath;
}

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url);
    let pathname = parsed.pathname || '/';

    if (pathname === '/') {
      pathname = '/index.html';
    }

    let filePath = safeJoin(ROOT, pathname);
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }

    // If directory is requested, try to serve its index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Serve custom 404 page if exists, otherwise a friendly default
        const notFoundPath = path.join(ROOT, '404.html');
        if (fs.existsSync(notFoundPath)) {
          const html = fs.readFileSync(notFoundPath);
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>404 未找到</title><body style="font-family:system-ui;-webkit-font-smoothing:antialiased;padding:2rem">
            <h1>404 未找到</h1>
            <p>无法找到资源：<code>${pathname}</code></p>
            <p><a href="/" style="color:#8b5cf6;text-decoration:none">返回首页</a></p>
          </body></html>`
        );
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal server error');
  }
});

function openBrowser(urlToOpen) {
  try {
    const platform = process.platform;
    if (platform === 'darwin') {
      spawn('open', [urlToOpen], { stdio: 'ignore', detached: true });
    } else if (platform === 'win32') {
      spawn('cmd', ['/c', 'start', '""', urlToOpen], { stdio: 'ignore', detached: true });
    } else {
      // linux and others
      spawn('xdg-open', [urlToOpen], { stdio: 'ignore', detached: true });
    }
  } catch (_) {
    // ignore failures to open browser
  }
}

server.listen(PORT, () => {
  const urlStr = `http://localhost:${PORT}`;
  console.log(`Static server running at ${urlStr}`);
  if (!process.env.CI && !process.env.NO_OPEN) {
    openBrowser(urlStr);
  }
});
