// Small, dependency-free validators for the two public forms.
// Each returns { value, errors } where errors maps field -> error code
// (codes are translated on the frontend).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s./-]{6,25}$/;
const LANGS = new Set(['en', 'hu']);

function text(input, field, { required = false, max = 200, singleLine = true } = {}, errors) {
  let value = typeof input[field] === 'string' ? input[field] : '';
  value = value.replace(/\r\n?/g, '\n').trim();
  if (singleLine) value = value.replace(/\s+/g, ' ');
  if (required && !value) errors[field] = 'required';
  else if (value.length > max) errors[field] = 'too_long';
  return value;
}

function count(input, field, { min = 0, max = 20 } = {}, errors) {
  const raw = input[field] ?? 0;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim() || 0);
  if (!Number.isInteger(n) || n < min || n > max) {
    errors[field] = 'invalid_number';
    return 0;
  }
  return n;
}

function email(input, field, errors) {
  const value = text(input, field, { required: true, max: 254 }, errors).toLowerCase();
  if (!errors[field] && !EMAIL_RE.test(value)) errors[field] = 'invalid_email';
  return value;
}

const lang = (input) => (LANGS.has(input.lang) ? input.lang : 'en');

/** Bots fill in every field; humans never see this one. */
export const isSpam = (input) => typeof input?.website === 'string' && input.website.trim() !== '';

export function validateContact(input = {}) {
  const errors = {};
  const value = {
    name: text(input, 'name', { required: true, max: 100 }, errors),
    email: email(input, 'email', errors),
    subject: text(input, 'subject', { required: true, max: 150 }, errors),
    message: text(input, 'message', { required: true, max: 5000, singleLine: false }, errors),
    lang: lang(input),
  };
  if (!errors.message && value.message.length < 5) errors.message = 'too_short';
  return { value, errors };
}

export function validateRegistration(input = {}) {
  const errors = {};
  const value = {
    name: text(input, 'name', { required: true, max: 100 }, errors),
    email: email(input, 'email', errors),
    phone: text(input, 'phone', { max: 25 }, errors),
    adults: count(input, 'adults', { min: 1, max: 20 }, errors),
    children: count(input, 'children', { min: 0, max: 20 }, errors),
    infants: count(input, 'infants', { min: 0, max: 20 }, errors),
    dietary: text(input, 'dietary', { max: 500, singleLine: false }, errors),
    notes: text(input, 'notes', { max: 1000, singleLine: false }, errors),
    consent: input.consent === true || input.consent === 'on' || input.consent === 'true',
    lang: lang(input),
  };
  if (value.phone && !errors.phone && !PHONE_RE.test(value.phone)) errors.phone = 'invalid_phone';
  if (!value.consent) errors.consent = 'required';
  return { value, errors };
}

export function calculateFee(event, { adults, children }) {
  return adults * event.fees.adult + children * event.fees.child;
}

export function registrationStatus(event, now = new Date()) {
  if (!event.registrationOpen) return 'closed';
  if (now > new Date(event.end)) return 'past';
  return 'open';
}
