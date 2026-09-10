import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';

const acceptedFields = new Set(['projectType', 'location', 'surface', 'stage', 'services', 'budget', 'name', 'email', 'phone', 'message', 'summary', 'website']);

export function validateQuote(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !acceptedFields.has(key))) return null;
  const quote = {};
  for (const [key, limit, required] of [
    ['projectType', 120, true], ['location', 160, true], ['surface', 20, false],
    ['stage', 120, true], ['budget', 120, false], ['name', 120, true],
    ['email', 254, true], ['phone', 40, false], ['message', 4000, false],
    ['summary', 12000, true], ['website', 200, false],
  ]) {
    if (body[key] !== undefined && typeof body[key] !== 'string') return null;
    const value = (body[key] || '').trim();
    if ((required && !value) || value.length > limit || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return null;
    if (!['message', 'summary'].includes(key) && /[\r\n]/.test(value)) return null;
    quote[key] = value;
  }
  if (quote.website || !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(quote.email)) return null;
  if (quote.surface && (!Number.isFinite(Number(quote.surface)) || Number(quote.surface) < 1 || Number(quote.surface) > 10000000)) return null;
  if (body.services !== undefined && (!Array.isArray(body.services) || body.services.length > 6 || body.services.some(item => typeof item !== 'string' || !item.trim() || item.length > 120 || /[\x00-\x1f\x7f]/.test(item)))) return null;
  quote.services = [...new Set((body.services || []).map(item => item.trim()))];
  return quote;
}

export function createApp({ distDir, mailer, publicOrigin = '', rateLimit = 5, rateWindowMs = 15 * 60 * 1000, globalLimit = 30 }) {
  const indexPath = path.join(distDir, 'index.html');
  if (!existsSync(indexPath)) throw new Error('Lipsește dist/index.html. Rulează mai întâi npm.cmd run build.');
  const app = express();
  const clients = new Map();
  let globalWindow = { until: 0, count: 0 };
  let inFlight = 0;
  app.disable('x-powered-by');
  // Do not trust arbitrary X-Forwarded-For headers. A proxy needs an explicit deployment policy.
  app.set('trust proxy', false);
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'greentech-web', emailConfigured: Boolean(mailer) }));
  app.post('/api/quote', (req, res, next) => {
    const origin = req.get('origin');
    const sameOrigin = `${req.protocol}://${req.get('host')}`;
    if ((origin && origin !== sameOrigin && origin !== publicOrigin) || req.get('sec-fetch-site') === 'cross-site') {
      return res.status(403).json({ ok: false, message: 'Trimiterea este permisă numai din formularul acestui site.' });
    }
    const now = Date.now();
    for (const [key, value] of clients) if (value.until <= now) clients.delete(key);
    if (globalWindow.until <= now) globalWindow = { until: now + rateWindowMs, count: 0 };
    const client = clients.get(req.ip) || { until: now + rateWindowMs, count: 0 };
    if (client.count >= rateLimit || globalWindow.count >= globalLimit) {
      res.set('Retry-After', String(Math.ceil(Math.max(client.until - now, globalWindow.until - now) / 1000)));
      return res.status(429).json({ ok: false, message: 'Au fost trimise prea multe cereri. Încearcă din nou peste 15 minute sau contactează-ne prin email.' });
    }
    client.count += 1;
    globalWindow.count += 1;
    clients.set(req.ip, client);
    if (!req.is('application/json')) return res.status(415).json({ ok: false, message: 'Cererea trebuie trimisă în format JSON.' });
    next();
  }, express.json({ limit: '64kb', strict: true }), async (req, res) => {
    const quote = validateQuote(req.body);
    if (!quote) return res.status(400).json({ ok: false, message: 'Verifică datele obligatorii, adresa de email și lungimea câmpurilor.' });
    if (inFlight >= 2) return res.status(503).json({ ok: false, message: 'Serverul este ocupat. Reîncearcă în câteva momente.' });
    inFlight += 1;
    try {
      await mailer.sendQuote(quote);
      res.json({ ok: true, message: 'Cererea ta a fost trimisă. Îți mulțumim!' });
    } catch (error) {
      // Never log SMTP responses, credentials or the visitor's message.
      console.error('Trimitere email nereușită:', /^[A-Z_]+$/.test(error.code || '') ? error.code : 'SMTP_ERROR');
      res.status(502).json({ ok: false, message: 'Nu am putut confirma trimiterea cererii. Datele sunt păstrate în pagină; poți reîncerca sau ne poți contacta prin email.' });
    } finally {
      inFlight -= 1;
    }
  });
  app.use('/api', (_req, res) => res.status(404).json({ ok: false, message: 'Adresă API inexistentă.' }));
  app.use(express.static(distDir, {
    dotfiles: 'deny',
    setHeaders(res, filePath) {
      res.set('Cache-Control', filePath.startsWith(path.join(distDir, 'assets') + path.sep) ? 'public, max-age=31536000, immutable' : 'no-cache');
    },
  }));
  app.use((req, res) => {
    let requestedPath;
    try { requestedPath = decodeURIComponent(req.path); } catch {
      return res.status(400).type('text').send('Adresă invalidă.');
    }
    if (['GET', 'HEAD'].includes(req.method) && req.accepts('html') && !path.extname(requestedPath) && !requestedPath.split(/[\\/]/).some(segment => segment.startsWith('.'))) {
      res.set('Cache-Control', 'no-cache');
      return res.sendFile(indexPath);
    }
    res.status(404).type('text').send('Resursă inexistentă.');
  });
  app.use((error, _req, res, _next) => {
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : error.status >= 400 && error.status < 500 ? error.status : 500;
    res.status(status).json({ ok: false, message: status === 413 ? 'Cererea este prea mare.' : 'Cererea nu a putut fi procesată.' });
  });
  return app;
}
