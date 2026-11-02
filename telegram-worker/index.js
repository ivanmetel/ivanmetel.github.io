export default {
  async fetch(request, env) {
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');
    if (!origin || !allowedOrigins.includes(origin)) return new Response('Forbidden', { status: 403 });
    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ error: 'Contact endpoint is not configured' }, 503, headers);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: 'Invalid request' }, 400, headers);
    }

    if (typeof data.website === 'string' && data.website.trim()) {
      return json({ ok: true }, 200, headers);
    }

    const name = clean(data.name, 150);
    const contact = clean(data.contact, 200);
    const message = clean(data.message, 3000);
    if (!name || !contact || !message) return json({ error: 'Fill in all fields' }, 400, headers);

    const text = `Новое сообщение с сайта\n\nИмя: ${name}\nКонтакт: ${contact}\n\nСообщение:\n${message}`;
    const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    });

    if (!telegramResponse.ok) return json({ error: 'Message delivery failed' }, 502, headers);
    return json({ ok: true }, 200, headers);
  },
};

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}
