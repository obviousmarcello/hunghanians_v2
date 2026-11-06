import { t, getLang, onLangChange } from './i18n.js';
import { money } from './format.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const API_BASE = (document.querySelector('meta[name="api-base"]')?.content || '').replace(/\/$/, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: 'network' };
  }
  const data = await res.json().catch(() => ({}));
  return res.ok ? { ok: true, ...data } : { ok: false, error: data.error || 'generic', fields: data.fields };
}

/* ------------------------------------------------------ shared helpers */

function serialize(form) {
  const data = Object.fromEntries(new FormData(form));
  $$('input[type="checkbox"]', form).forEach((cb) => (data[cb.name] = cb.checked));
  $$('input[type="number"]', form).forEach((n) => (data[n.name] = Number(n.value)));
  data.lang = getLang();
  return data;
}

function clientErrors(form) {
  const errors = {};
  $$('input, textarea', form).forEach((el) => {
    if (!el.name || el.closest('.hp')) return;
    const v = el.type === 'checkbox' ? el.checked : el.value.trim();
    if (el.required && !v) errors[el.name] = 'required';
    else if (el.type === 'email' && v && !EMAIL_RE.test(v)) errors[el.name] = 'invalid_email';
  });
  return errors;
}

function showErrors(form, errors = {}) {
  $$('[data-error-for]', form).forEach((p) => {
    const code = errors[p.dataset.errorFor];
    p.textContent = code ? t(`error.${code}`) : '';
    const input = form.elements[p.dataset.errorFor];
    if (input?.setAttribute) {
      input.toggleAttribute('aria-invalid', Boolean(code));
      if (p.id === '') p.id = `err-${form.dataset.form}-${p.dataset.errorFor}`;
      code ? input.setAttribute('aria-describedby', p.id) : input.removeAttribute('aria-describedby');
    }
  });
  const first = Object.keys(errors)[0];
  if (first) form.elements[first]?.focus?.();
}

function setStatus(form, key) {
  const el = $('[data-form-status]', form);
  el.textContent = key ? t(`error.${key}`) : '';
  el.classList.toggle('is-error', Boolean(key));
}

function setBusy(form, busy) {
  const btn = $('button[type="submit"]', form);
  btn.disabled = busy;
  btn.classList.toggle('is-loading', busy);
  form.setAttribute('aria-busy', String(busy));
}

/** Validates, submits and handles errors. Calls onSuccess(result, payload) on success. */
function wire(form, path, onSuccess) {
  // Clear an error as soon as the field is edited.
  form.addEventListener('input', (e) => {
    const p = e.target.name && $(`[data-error-for="${e.target.name}"]`, form);
    if (p?.textContent) {
      p.textContent = '';
      e.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus(form, null);
    const errors = clientErrors(form);
    showErrors(form, errors);
    if (Object.keys(errors).length) return setStatus(form, 'fix');

    const payload = serialize(form);
    setBusy(form, true);
    const result = await post(path, payload);
    setBusy(form, false);

    if (result.ok) return onSuccess(result, payload);
    if (result.error === 'validation') {
      showErrors(form, result.fields);
      return setStatus(form, 'fix');
    }
    setStatus(form, result.error);
  });
}

/* ------------------------------------------------------------- contact */

export function initContact() {
  const form = $('[data-form="contact"]');
  const success = $('[data-form-success]', form);
  const fields = $$(':scope > :not([data-form-success])', form);

  wire(form, '/api/contact', () => {
    fields.forEach((el) => (el.hidden = true));
    success.hidden = false;
    $('[data-form-reset]', success).focus();
  });

  $('[data-form-reset]', form).addEventListener('click', () => {
    form.reset();
    fields.forEach((el) => (el.hidden = false));
    success.hidden = true;
    form.elements.name.focus();
  });
}

/* -------------------------------------------------------- registration */

export function initRegistration({ event, status, openDialog }) {
  const dialog = $('#registration');
  const form = $('[data-form="register"]', dialog);
  const success = $('[data-reg-success]', dialog);
  const total = $('[data-total]', form);
  const notice = $('[data-reg-closed]', form);

  const updateTotal = () => {
    const adults = Number(form.elements.adults.value) || 0;
    const children = Number(form.elements.children.value) || 0;
    total.textContent = money(adults * event.fees.adult + children * event.fees.child, event.fees.currency);
  };

  form.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-step]');
    if (!btn) return;
    const input = $('input', btn.parentElement);
    const next = Number(input.value || 0) + Number(btn.dataset.step);
    input.value = Math.min(Number(input.max), Math.max(Number(input.min), next));
    updateTotal();
  });
  form.addEventListener('input', updateTotal);
  onLangChange(updateTotal);
  updateTotal();

  if (status !== 'open') {
    notice.hidden = false;
    notice.textContent = t(status === 'past' ? 'reg.pastNotice' : 'reg.closedNotice');
    $$('input, textarea, button[type="submit"], [data-step]', form).forEach((el) => (el.disabled = true));
  }

  $$('[data-open-registration]').forEach((btn) =>
    btn.addEventListener('click', () => {
      openDialog(dialog);
      if (status === 'open' && !form.hidden) form.elements.name.focus();
    }),
  );

  dialog.addEventListener('close', () => {
    if (!success.hidden) {
      // Start fresh next time.
      form.reset();
      updateTotal();
      form.hidden = false;
      success.hidden = true;
    }
  });

  wire(form, '/api/register', (result, payload) => {
    $('[data-reg-ref]', success).textContent = result.reference;
    $('[data-reg-amount]', success).textContent = money(result.fee ?? 0, result.currency || event.fees.currency);
    $('[data-reg-email-note]', success).textContent = result.confirmationSent === false
      ? t('reg.emailFailed')
      : t('reg.emailSent', { email: payload.email });
    $$('[data-bank-row]', success).forEach((row) => (row.hidden = !result.bank));
    if (result.bank) {
      $('[data-bank-name]', success).textContent = result.bank.name;
      $('[data-bank-number]', success).textContent = result.bank.number;
    }
    form.hidden = true;
    success.hidden = false;
    success.scrollTop = 0;
    $('[data-copy-ref]', success).focus();
  });

  $('[data-copy-ref]', success).addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText($('[data-reg-ref]', success).textContent);
      btn.dataset.tooltip = t('reg.copied');
      setTimeout(() => delete btn.dataset.tooltip, 1500);
    } catch {}
  });
}
