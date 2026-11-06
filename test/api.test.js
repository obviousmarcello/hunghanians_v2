import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';

import { createApp } from '../server/app.js';
import { createMailer } from '../server/mailer.js';
import { createStore, toCsv } from '../server/store.js';
import { loadConfig } from '../server/config.js';
import { validateRegistration } from '../server/validation.js';

const EVENT = {
  id: 'test-event',
  referencePrefix: 'TST',
  name: { en: 'Test Party', hu: 'Teszt buli' },
  dateLabel: { en: 'August 8, 2030', hu: '2030. augusztus 8.' },
  start: '2030-08-08T00:00:00+02:00',
  end: '2030-08-09T23:59:00+02:00',
  registrationOpen: true,
  location: 'Somewhere',
  fees: { currency: 'HUF', adult: 10000, child: 5000 },
  childAgeRange: '6–14',
  paymentDeadlineDays: 5,
};

const silent = { info() {}, warn() {}, error() {} };
const dirs = [];

async function setup({ event = EVENT, now = new Date('2030-01-01T12:00:00Z'), env = {}, mailer } = {}) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'hg-test-'));
  dirs.push(dataDir);
  const config = loadConfig({
    MAIL_TRANSPORT: 'memory',
    ORGANISER_EMAIL: 'org@example.com',
    MAIL_FROM: 'Site <site@example.com>',
    BANK_ACCOUNT_NAME: 'Hunghanians',
    BANK_ACCOUNT_NUMBER: 'HU00 1111 2222 3333',
    ADMIN_TOKEN: 'secret-token',
    FORM_RATE_LIMIT: '1000',
    DATA_DIR: dataDir,
    ...env,
  });
  mailer ??= createMailer(config.mail, silent);
  const store = createStore(dataDir);
  const app = createApp({ config, mailer, store, getEvent: () => event, now: () => now, logger: silent });
  return { app, mailer, store };
}

after(() => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));

const validContact = { name: 'Kofi', email: 'kofi@example.com', subject: 'Hello', message: 'Akwaaba to everyone!', lang: 'en' };
const validReg = { name: 'Ama Mensah', email: 'AMA@example.com', phone: '+36 30 123 4567', adults: 2, children: 1, infants: 1, consent: true, lang: 'hu' };

describe('POST /api/contact', () => {
  test('emails organisers and acknowledges the sender', async () => {
    const { app, mailer } = await setup();
    const res = await request(app).post('/api/contact').send(validContact);
    assert.equal(res.status, 202);
    // acknowledgement is fire-and-forget; give it a tick
    await new Promise((r) => setImmediate(r));
    assert.equal(mailer.outbox.length, 2);
    const [toOrg, ack] = mailer.outbox;
    assert.deepEqual(toOrg.to, ['org@example.com']);
    assert.match(toOrg.replyTo, /kofi@example\.com/);
    assert.match(toOrg.subject, /Hello/);
    assert.equal(ack.to, 'kofi@example.com');
  });

  test('rejects invalid input with field errors', async () => {
    const { app, mailer } = await setup();
    const res = await request(app).post('/api/contact').send({ name: '', email: 'nope', subject: 'x', message: '' });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.fields, { name: 'required', email: 'invalid_email', message: 'required' });
    assert.equal(mailer.outbox.length, 0);
  });

  test('escapes HTML in user input', async () => {
    const { app, mailer } = await setup();
    await request(app).post('/api/contact').send({ ...validContact, message: '<script>alert(1)</script>' });
    assert.doesNotMatch(mailer.outbox[0].html, /<script>/);
    assert.match(mailer.outbox[0].html, /&lt;script&gt;/);
  });

  test('silently drops honeypot submissions', async () => {
    const { app, mailer } = await setup();
    const res = await request(app).post('/api/contact').send({ ...validContact, website: 'http://spam' });
    assert.equal(res.status, 202);
    assert.equal(mailer.outbox.length, 0);
  });

  test('returns 502 when the organiser email cannot be sent', async () => {
    const failing = { outbox: [], send: async () => { throw new Error('SMTP down'); } };
    const { app } = await setup({ mailer: failing });
    const res = await request(app).post('/api/contact').send(validContact);
    assert.equal(res.status, 502);
    assert.equal(res.body.error, 'mail_failed');
  });

  test('rate limits repeated submissions', async () => {
    const { app } = await setup({ env: { FORM_RATE_LIMIT: '2' } });
    await request(app).post('/api/contact').send(validContact);
    await request(app).post('/api/contact').send(validContact);
    const res = await request(app).post('/api/contact').send(validContact);
    assert.equal(res.status, 429);
    assert.equal(res.body.error, 'rate_limited');
  });

  test('handles malformed JSON', async () => {
    const { app } = await setup();
    const res = await request(app).post('/api/contact').set('Content-Type', 'application/json').send('{bad');
    assert.equal(res.status, 400);
  });
});

describe('POST /api/register', () => {
  test('stores the registration, computes the fee and sends both emails', async () => {
    const { app, mailer, store } = await setup();
    const res = await request(app).post('/api/register').send(validReg);
    assert.equal(res.status, 201);
    assert.match(res.body.reference, /^TST-[2-9A-HJ-NP-Z]{6}$/);
    assert.equal(res.body.fee, 25000);
    assert.equal(res.body.confirmationSent, true);
    assert.equal(res.body.bank.number, 'HU00 1111 2222 3333');

    const [saved] = await store.all();
    assert.equal(saved.email, 'ama@example.com');
    assert.equal(saved.eventId, 'test-event');
    assert.equal(saved.consent, undefined);

    assert.equal(mailer.outbox.length, 2);
    const confirmation = mailer.outbox.find((m) => m.to === 'ama@example.com');
    assert.match(confirmation.subject, /Sikeres regisztráció/); // Hungarian, as requested
    assert.match(confirmation.text, new RegExp(res.body.reference));
    assert.match(confirmation.text, /HU00 1111 2222 3333/);
  });

  test('still succeeds (and keeps the record) when email fails', async () => {
    const failing = { outbox: [], send: async () => { throw new Error('SMTP down'); } };
    const { app, store } = await setup({ mailer: failing });
    const res = await request(app).post('/api/register').send(validReg);
    assert.equal(res.status, 201);
    assert.equal(res.body.confirmationSent, false);
    assert.equal((await store.all()).length, 1);
  });

  test('requires consent and at least one adult', async () => {
    const { app } = await setup();
    const res = await request(app).post('/api/register').send({ ...validReg, consent: false, adults: 0 });
    assert.equal(res.status, 422);
    assert.equal(res.body.fields.consent, 'required');
    assert.equal(res.body.fields.adults, 'invalid_number');
  });

  test('refuses registrations after the event', async () => {
    const { app } = await setup({ now: new Date('2031-01-01') });
    const res = await request(app).post('/api/register').send(validReg);
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'registration_past');
  });

  test('refuses registrations when closed', async () => {
    const { app } = await setup({ event: { ...EVENT, registrationOpen: false } });
    const res = await request(app).post('/api/register').send(validReg);
    assert.equal(res.body.error, 'registration_closed');
  });
});

describe('admin export', () => {
  test('requires the admin token', async () => {
    const { app } = await setup();
    assert.equal((await request(app).get('/api/admin/registrations.csv')).status, 401);
    assert.equal((await request(app).get('/api/admin/registrations.csv').set('Authorization', 'Bearer wrong')).status, 401);
  });

  test('returns registrations as CSV', async () => {
    const { app } = await setup();
    await request(app).post('/api/register').send(validReg);
    const res = await request(app).get('/api/admin/registrations.csv').set('Authorization', 'Bearer secret-token');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /text\/csv/);
    const lines = res.text.trim().split('\r\n');
    assert.equal(lines.length, 2);
    assert.match(lines[1], /Ama Mensah/);
  });

  test('is disabled when no token is configured', async () => {
    const { app } = await setup({ env: { ADMIN_TOKEN: '' } });
    const res = await request(app).get('/api/admin/registrations.csv').set('Authorization', 'Bearer ');
    assert.equal(res.status, 401);
  });
});

describe('helpers', () => {
  test('CSV export neutralises spreadsheet formulas', () => {
    const csv = toCsv([{ name: '=HYPERLINK("http://evil")', notes: 'a, "b"' }]);
    assert.match(csv, /'=HYPERLINK/);
    assert.match(csv, /"a, ""b"""/);
  });

  test('validation trims, normalises and caps values', () => {
    const { value, errors } = validateRegistration({ ...validReg, name: '  Ama \n Mensah ', adults: '3', notes: 'x'.repeat(2000) });
    assert.equal(value.name, 'Ama Mensah');
    assert.equal(value.adults, 3);
    assert.equal(errors.notes, 'too_long');
  });

  test('config requires an organiser address', () => {
    assert.throws(() => loadConfig({ MAIL_TRANSPORT: 'log' }), /ORGANISER_EMAIL/);
  });

  test('static site is served with security headers', async () => {
    const { app } = await setup();
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-security-policy'], /frame-src https:\/\/www\.google\.com/);
  });
});
