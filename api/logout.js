module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST');
    res.end('Method Not Allowed');
    return;
  }
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Set-Cookie', `ci_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  res.end(JSON.stringify({ ok: true }));
};
