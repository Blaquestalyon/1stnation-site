/* ============================================================
   1ST NATION FOUNDATION — server.js
   Zero-dependency Node server for Railway.
   1. Serves the static site.
   2. Provides POST /api/contact — a secure proxy that forwards
      form submissions to Airtable using a server-side token,
      so the token is NEVER exposed in browser code.

   Required Railway environment variables:
     AIRTABLE_TOKEN  — your Airtable Personal Access Token (PAT)
     AIRTABLE_BASE   — your base ID (starts with "app...")
     AIRTABLE_TABLE  — your table name or ID (e.g. "Inquiries")
   ============================================================ */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

/* ---------- Airtable proxy ---------- */
function handleContact(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 50_000) req.destroy(); // basic abuse guard
  });
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }

    const token = process.env.AIRTABLE_TOKEN;
    const base = process.env.AIRTABLE_BASE;
    const table = process.env.AIRTABLE_TABLE;

    if (!token || !base || !table) {
      console.error('[contact] Airtable env vars not configured.');
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Form backend not configured' }));
    }

    const data = JSON.stringify({ records: [{ fields: payload.fields || {} }], typecast: true });

    const atReq = https.request(
      {
        hostname: 'api.airtable.com',
        path: `/v0/${base}/${encodeURIComponent(table)}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (atRes) => {
        let atBody = '';
        atRes.on('data', (c) => (atBody += c));
        atRes.on('end', () => {
          if (atRes.statusCode >= 200 && atRes.statusCode < 300) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          } else {
            console.error('[contact] Airtable error', atRes.statusCode, atBody);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Upstream error' }));
          }
        });
      }
    );
    atReq.on('error', (err) => {
      console.error('[contact] Request failed:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Upstream unavailable' }));
    });
    atReq.write(data);
    atReq.end();
  });
}

/* ---------- Static server ---------- */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // API route
  if (url.pathname === '/api/contact' && req.method === 'POST') {
    return handleContact(req, res);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }

  // Resolve file path safely
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  // Pretty URLs: /history -> /history.html
  if (!path.extname(pathname)) pathname += '.html';

  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // 404 — send the homepage shell with a 404 status fallback
      fs.readFile(path.join(ROOT, '404.html'), (e2, notFound) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(e2 ? '<h1>404 — Page not found</h1><p><a href="/">Return home</a></p>' : notFound);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`1st Nation Foundation site running on port ${PORT}`);
});
