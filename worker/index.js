// BTM Carrosserie — Worker : reçoit le formulaire de contact sur /api/contact,
// tout le reste est servi par les Static Assets.
import { validateContact } from './validate.js';

const TO = 'contact@btm-carrosserie.fr';
const FROM = 'BTM Carrosserie <site@btm-carrosserie.fr>';
const RATE_LIMIT = 10;      // requêtes
const RATE_WINDOW = 600;    // secondes
const LABELS = {
  sinistre: 'Réparation après sinistre', peinture: 'Peinture automobile', debosselage: 'Débosselage',
  'pare-chocs': 'Pare-chocs et plastiques', assureur: 'Dossier assureur',
  ouverture: "Être informé de l'ouverture", autre: 'Autre demande',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
      return handleContact(request, env, ctx);
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not Found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env, ctx) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const reply = (status, body) => {
    if (wantsJson) return Response.json(body, { status });
    const dest = body.ok ? '/contact/?envoye=1#form-success' : '/contact/?erreur=1#contact-form';
    return Response.redirect(new URL(dest, request.url).toString(), 303);
  };

  const ct = request.headers.get('Content-Type') || '';
  if (!ct.includes('application/x-www-form-urlencoded') && !ct.includes('multipart/form-data')) {
    return reply(415, { ok: false, errors: { _: 'Format de requête non pris en charge' } });
  }
  const form = await request.formData();
  const fields = Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));

  // Honeypot : un robot remplit le champ caché → on répond OK sans rien envoyer.
  if (fields.website) return reply(200, { ok: true });

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (await isRateLimited(ip, ctx)) {
    return reply(429, { ok: false, errors: { _: 'Trop de tentatives. Réessayez dans quelques minutes.' } });
  }

  const turnstileOk = await verifyTurnstile(fields['cf-turnstile-response'], ip, env.TURNSTILE_SECRET);
  if (!turnstileOk) return reply(400, { ok: false, errors: { turnstile: 'Vérification anti-robot échouée. Rechargez la page et réessayez.' } });

  const v = validateContact(fields);
  if (!v.ok) return reply(400, { ok: false, errors: v.errors });

  const sent = await sendEmail(v.data, env.RESEND_API_KEY);
  if (!sent) return reply(502, { ok: false, errors: { _: `Envoi impossible pour le moment. Écrivez-nous directement à ${TO}.` } });

  return reply(200, { ok: true });
}

// Compteur par IP dans le cache edge (best effort : jamais bloquant en cas d'erreur).
async function isRateLimited(ip, ctx) {
  try {
    const cache = caches.default;
    const key = new Request(`https://rate.btm-carrosserie.internal/${encodeURIComponent(ip)}`);
    const hit = await cache.match(key);
    const count = hit ? parseInt(await hit.text(), 10) || 0 : 0;
    if (count >= RATE_LIMIT) return true;
    ctx.waitUntil(cache.put(key, new Response(String(count + 1), { headers: { 'Cache-Control': `max-age=${RATE_WINDOW}` } })));
    return false;
  } catch {
    return false;
  }
}

async function verifyTurnstile(token, ip, secret) {
  if (!token || !secret) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

async function sendEmail(d, apiKey) {
  if (!apiKey) return false;
  const lines = [
    `Prestation : ${LABELS[d.prestation] || d.prestation}`,
    `Nom : ${d.prenom} ${d.nom}`,
    `Email : ${d.email}`,
    `Téléphone : ${d.tel || '—'}`,
    `Véhicule : ${d.vehicule || '—'}`,
    `Assureur : ${d.assureur || '—'}`,
    '',
    'Message :',
    d.message,
  ];
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: d.email,
        subject: `[Site] ${LABELS[d.prestation] || d.prestation} — ${d.prenom} ${d.nom}`,
        text: lines.join('\n'),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
