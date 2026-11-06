import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'node:crypto';
import { PUBLIC_DIR, loadEvent } from './config.js';
import {
  validateContact,
  validateRegistration,
  calculateFee,
  registrationStatus,
  isSpam,
} from './validation.js';
import { makeReference, toCsv } from './store.js';
import {
  contactToOrganisers,
  contactAcknowledgement,
  registrationConfirmation,
  registrationToOrganisers,
} from './templates.js';

/**
 * @param {object} deps
 * @param {ReturnType<import('./config.js').loadConfig>} deps.config
 * @param {ReturnType<import('./mailer.js').createMailer>} deps.mailer
 * @param {ReturnType<import('./store.js').createStore>} deps.store
 * @param {() => object} [deps.getEvent]   defaults to re-reading public/event.json
 * @param {() => Date}   [deps.now]
 */
export function createApp({ config, mailer, store, getEvent = loadEvent, now = () => new Date(), logger = console }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:'],
          'frame-src': ['https://www.google.com'],
          'connect-src': ["'self'"],
          'form-action': ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  /* ---------- CORS: only needed when the frontend is hosted elsewhere ---------- */
  app.use('/api', (req, res, next) => {
    const origin = req.get('origin');
    if (origin && config.corsOrigins.includes(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      });
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use('/api', express.json({ limit: '20kb' }));

  const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.formRateLimit ?? 8,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, error: 'rate_limited' },
  });

  const invalid = (res, fields) => res.status(422).json({ ok: false, error: 'validation', fields });

  /* ------------------------------------------------------------------ health */
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  /* ----------------------------------------------------------------- contact */
  app.post('/api/contact', formLimiter, async (req, res) => {
    // Pretend success so bots don't learn they were caught.
    if (isSpam(req.body)) return res.status(202).json({ ok: true });

    const { value: msg, errors } = validateContact(req.body);
    if (Object.keys(errors).length) return invalid(res, errors);

    try {
      await mailer.send({ to: config.mail.organisers, replyTo: `"${msg.name.replace(/"/g, '')}" <${msg.email}>`, ...contactToOrganisers(msg) });
    } catch (err) {
      logger.error('[contact] failed to email organisers:', err);
      return res.status(502).json({ ok: false, error: 'mail_failed' });
    }
    // The acknowledgement is a courtesy; don't fail the request if it bounces.
    mailer
      .send({ to: msg.email, replyTo: config.mail.organisers[0], ...contactAcknowledgement(msg) })
      .catch((err) => logger.warn('[contact] acknowledgement failed:', err.message));

    res.status(202).json({ ok: true });
  });

  /* ------------------------------------------------------------ registration */
  app.get('/api/event', (_req, res) => {
    const event = getEvent();
    res.json({ ok: true, status: registrationStatus(event, now()) });
  });

  app.post('/api/register', formLimiter, async (req, res) => {
    const event = getEvent();
    if (isSpam(req.body)) return res.status(201).json({ ok: true, reference: makeReference(event.referencePrefix) });

    const status = registrationStatus(event, now());
    if (status !== 'open') return res.status(409).json({ ok: false, error: `registration_${status}` });

    const { value, errors } = validateRegistration(req.body);
    if (Object.keys(errors).length) return invalid(res, errors);

    const { consent, ...fields } = value;
    const registration = {
      ...fields,
      reference: makeReference(event.referencePrefix),
      eventId: event.id,
      fee: calculateFee(event, value),
      currency: event.fees.currency,
      createdAt: now().toISOString(),
    };

    // Persist first: an email outage must never lose a registration.
    try {
      await store.add(registration);
    } catch (err) {
      logger.error('[register] could not save registration:', err);
      return res.status(500).json({ ok: false, error: 'storage_failed' });
    }

    const [confirmation, notification] = await Promise.allSettled([
      mailer.send({ to: registration.email, replyTo: config.mail.organisers[0], ...registrationConfirmation(registration, event, config.bank) }),
      mailer.send({ to: config.mail.organisers, replyTo: registration.email, ...registrationToOrganisers(registration, event) }),
    ]);
    if (confirmation.status === 'rejected') logger.error('[register] confirmation email failed:', confirmation.reason);
    if (notification.status === 'rejected') logger.error('[register] organiser email failed:', notification.reason);

    res.status(201).json({
      ok: true,
      reference: registration.reference,
      fee: registration.fee,
      currency: registration.currency,
      confirmationSent: confirmation.status === 'fulfilled',
      bank: config.bank.number ? config.bank : null,
    });
  });

  /* ------------------------------------------------------------------- admin */
  const requireAdmin = (req, res, next) => {
    const expected = Buffer.from(config.adminToken);
    const given = Buffer.from((req.get('authorization') || '').replace(/^Bearer\s+/i, ''));
    if (!config.adminToken || given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    next();
  };

  app.get('/api/admin/registrations.csv', requireAdmin, async (req, res) => {
    const eventId = req.query.event || getEvent().id;
    const records = (await store.all()).filter((r) => eventId === 'all' || r.eventId === eventId);
    res
      .type('text/csv; charset=utf-8')
      .attachment(`registrations-${eventId}.csv`)
      .send(toCsv(records));
  });

  app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));

  // Malformed JSON and other errors from middleware.
  app.use('/api', (err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ ok: false, error: 'bad_json' });
    if (err.type === 'entity.too.large') return res.status(413).json({ ok: false, error: 'too_large' });
    logger.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  });

  /* ----------------------------------------------------------------- website */
  app.use(
    express.static(PUBLIC_DIR, {
      extensions: ['html'],
      setHeaders(res, file) {
        if (/\.(webp|jpe?g|png|svg|woff2?)$/.test(file)) res.set('Cache-Control', 'public, max-age=604800');
        else res.set('Cache-Control', 'no-cache');
      },
    }),
  );

  return app;
}
