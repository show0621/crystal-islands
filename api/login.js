const crypto = require('crypto');

function timingSafeEqualStr(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function signToken(user, secret, ttlSec = 60 * 60 * 24 * 7) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = b64url(JSON.stringify({ u: user, e: exp }));
  const sig = b64url(crypto.createHmac('sha256', secret).update(payload).digest());
  return `${payload}.${sig}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const type = String(req.headers['content-type'] || '');
        if (type.includes('application/json')) resolve(JSON.parse(raw || '{}'));
        else {
          const params = new URLSearchParams(raw);
          resolve(Object.fromEntries(params.entries()));
        }
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  const user = process.env.AUTH_USER || '';
  const salt = process.env.AUTH_PASS_SALT || '';
  const hash = process.env.AUTH_PASS_HASH || '';
  const secret = process.env.AUTH_SECRET || '';

  if (!user || !salt || !hash || !secret) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: '伺服器尚未設定登入憑證。' }));
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: '無法讀取登入資料。' }));
    return;
  }

  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const userOk = timingSafeEqualStr(username, user);
  const passOk = timingSafeEqualStr(derived, hash);

  if (!userOk || !passOk) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: '帳號或密碼不正確。' }));
    return;
  }

  const token = signToken(user, secret);
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Set-Cookie',
    `ci_auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure}`
  );
  res.end(JSON.stringify({ ok: true }));
};
