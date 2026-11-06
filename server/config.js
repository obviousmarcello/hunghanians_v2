import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const PUBLIC_DIR = path.resolve(here, '..', 'public');

const list = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const bool = (value, fallback = false) =>
  value === undefined || value === '' ? fallback : ['1', 'true', 'yes'].includes(String(value).toLowerCase());

/** The event details are shared with the frontend so there is one place to edit them. */
export function loadEvent(file = path.join(PUBLIC_DIR, 'event.json')) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function loadConfig(env = process.env) {
  const transport = (env.MAIL_TRANSPORT || 'log').toLowerCase();
  const config = {
    port: Number(env.PORT) || 3000,
    trustProxy: bool(env.TRUST_PROXY) ? 1 : false,
    corsOrigins: list(env.CORS_ORIGINS),
    dataDir: path.resolve(env.DATA_DIR || './data'),
    adminToken: env.ADMIN_TOKEN || '',
    // Form submissions allowed per IP per 15 minutes.
    formRateLimit: Number(env.FORM_RATE_LIMIT) || 8,
    mail: {
      transport,
      from: env.MAIL_FROM || 'Hunghanians <no-reply@localhost>',
      organisers: list(env.ORGANISER_EMAIL),
      smtp: {
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 587,
        secure: bool(env.SMTP_SECURE),
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      },
    },
    bank: {
      name: env.BANK_ACCOUNT_NAME || '',
      number: env.BANK_ACCOUNT_NUMBER || '',
    },
  };

  const problems = [];
  if (transport === 'smtp' && !config.mail.smtp.host) problems.push('SMTP_HOST is required when MAIL_TRANSPORT=smtp');
  if (!['smtp', 'log', 'memory'].includes(transport)) problems.push(`Unknown MAIL_TRANSPORT "${transport}"`);
  if (config.mail.organisers.length === 0) problems.push('ORGANISER_EMAIL is required');
  if (problems.length) {
    const err = new Error(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
    err.problems = problems;
    throw err;
  }
  return config;
}
