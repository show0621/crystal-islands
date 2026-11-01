const PUBLIC = new Set([
  '/login.html',
  '/login.css',
  '/api/login',
  '/api/logout',
  '/favicon.ico'
]);

function b64urlToBytes(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(buf) {
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmacSha256(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', key, enc.encode(message));
}

function getCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  const parts = raw.split(';');
  for (const part of parts) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    if (k === name) return part.slice(i + 1).trim();
  }
  return '';
}

async function verifyToken(token, secret) {
  if (!token || !secret || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = bytesToB64url(await hmacSha256(secret, payload));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    if (!json?.u || !json?.e) return false;
    if (json.e * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: '/:path*'
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (PUBLIC.has(path) || path.startsWith('/api/')) {
    return;
  }

  const secret = process.env.AUTH_SECRET || '';
  const token = getCookie(request, 'ci_auth');
  if (await verifyToken(token, secret)) return;

  if (path === '/' || path.endsWith('.html') || !path.includes('.')) {
    return Response.redirect(new URL('/login.html', request.url), 302);
  }

  return new Response('Unauthorized', { status: 401 });
}
