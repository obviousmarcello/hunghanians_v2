import { initI18n, setVars, t, getLang, onLangChange } from './i18n.js';
import { initContact, initRegistration } from './forms.js';
import { money } from './format.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------ event data */

async function loadEvent() {
  try {
    const res = await fetch('event.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn('Could not load event.json', err);
    return null;
  }
}

export function eventStatus(event, now = new Date()) {
  if (now > new Date(event.end)) return 'past';
  if (!event.registrationOpen) return 'closed';
  return 'open';
}

function renderEvent(event) {
  const lang = getLang();
  $$('[data-event-field]').forEach((el) => {
    const v = event[el.dataset.eventField];
    el.textContent = typeof v === 'object' ? v[lang] ?? v.en : v;
  });
  $$('[data-event-href]').forEach((el) => (el.href = event[el.dataset.eventHref]));
  $$('[data-price]').forEach((el) => (el.textContent = money(event.fees[el.dataset.price], event.fees.currency)));
  $('[data-maps-link]').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  const status = eventStatus(event);
  const badge = $('[data-reg-badge]');
  badge.dataset.state = status;
  badge.textContent = t(`status.${status}`);
  $$('[data-open-registration]').forEach((b) => (b.hidden = status !== 'open'));
}

/* ------------------------------------------------------------- countdown */

function startCountdown(event) {
  const card = $('[data-countdown]');
  const units = Object.fromEntries($$('[data-unit]', card).map((el) => [el.dataset.unit, el]));
  const done = $('[data-countdown-done]', card);
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  let timer;

  function tick() {
    const now = Date.now();
    if (now >= start) {
      clearInterval(timer);
      card.classList.add('is-done');
      $('.countdown', card).hidden = true;
      $('[data-countdown-label]', card).hidden = true;
      done.hidden = false;
      done.textContent = t(now > end ? 'countdown.past' : 'countdown.live');
      return;
    }
    let s = Math.floor((start - now) / 1000);
    const d = Math.floor(s / 86400);
    s -= d * 86400;
    const h = Math.floor(s / 3600);
    s -= h * 3600;
    const m = Math.floor(s / 60);
    s -= m * 60;
    units.days.textContent = d;
    units.hours.textContent = String(h).padStart(2, '0');
    units.minutes.textContent = String(m).padStart(2, '0');
    units.seconds.textContent = String(s).padStart(2, '0');
  }

  tick();
  timer = setInterval(tick, 1000);
  onLangChange(tick);
}

/* -------------------------------------------------------------- header */

function initHeader() {
  const header = $('[data-header]');
  const toggle = $('[data-menu-toggle]');
  const nav = $('#site-nav');

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => !header.contains(e.target) && setOpen(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

  // Shrink + solidify the header once the hero is scrolled past.
  const sentinel = document.createElement('div');
  sentinel.className = 'scroll-sentinel';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);

  // Highlight the nav link of the section in view.
  const links = new Map($$('a[href^="#"]', nav).map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.get(entry.target.id);
        if (link && entry.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((_, id) => document.getElementById(id) && spy.observe(document.getElementById(id)));
}

/* ------------------------------------------------------- scroll reveal */

function initReveal() {
  const items = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/* ----------------------------------------------------- map (click to load) */

function initMap(event) {
  const frame = $('[data-map]');
  $('[data-map-load]').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = event?.mapEmbedUrl || '';
    iframe.title = event?.location || 'Map';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
  });
}

/* ------------------------------------------------------------- dialogs */

function initDialogs() {
  $$('dialog').forEach((dialog) => {
    $$('[data-dialog-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
    // Close when clicking the backdrop.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => document.documentElement.classList.remove('has-dialog'));
  });
}

export function openDialog(dialog) {
  document.documentElement.classList.add('has-dialog');
  dialog.showModal();
}

/* ------------------------------------------------------------- gallery */

function initGallery() {
  const list = $('[data-gallery]');
  const empty = $('[data-gallery-empty]');
  const lightbox = $('#lightbox');
  const big = $('[data-lightbox-img]');

  const refresh = () => (empty.hidden = list.children.length > 0);

  // Drop tiles whose image is missing instead of showing broken icons.
  $$('img', list).forEach((img) => {
    const remove = () => {
      img.closest('li')?.remove();
      refresh();
    };
    if (img.complete && img.naturalWidth === 0) remove();
    else img.addEventListener('error', remove);
  });
  refresh();

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lightbox]');
    if (!btn) return;
    const img = $('img', btn);
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    openDialog(lightbox);
  });
}

/* ---------------------------------------------------------- easter egg */

function initSnakeTrigger() {
  let presses = 0;
  let timer;
  const launch = async () => {
    const { startSnake } = await import('./snake.js');
    startSnake();
  };
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key.toLowerCase() !== 'g' || e.repeat) return;
    clearTimeout(timer);
    if (++presses === 3) {
      presses = 0;
      launch();
    } else timer = setTimeout(() => (presses = 0), 600);
  });
  $('[data-snake-open]').addEventListener('click', (e) => {
    e.preventDefault();
    launch();
  });
}

/* ---------------------------------------------------------------- boot */

async function main() {
  initI18n();
  $('[data-year]').textContent = new Date().getFullYear();
  initHeader();
  initReveal();
  initDialogs();
  initGallery();
  initSnakeTrigger();
  initContact();

  const event = await loadEvent();
  initMap(event);
  if (!event) return;

  setVars({
    childAgeRange: event.childAgeRange,
    days: event.paymentDeadlineDays,
  });
  renderEvent(event);
  onLangChange(() => renderEvent(event));
  startCountdown(event);
  initRegistration({ event, status: eventStatus(event), openDialog });
}

main();
