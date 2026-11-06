// Email templates. Each builder returns { subject, text, html }.
// Every user-supplied value goes through esc() before it reaches HTML.

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

export const formatMoney = (amount, currency, lang) =>
  new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

function layout(title, bodyHtml) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f6f1e3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1b16">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="height:6px;background:linear-gradient(90deg,#CE1126 0 33%,#FCD116 33% 66%,#006B3F 66%)"></td></tr>
        <tr><td style="padding:28px 28px 8px;font-size:22px;font-weight:700">${esc(title)}</td></tr>
        <tr><td style="padding:0 28px 28px;font-size:15px;line-height:1.6">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 28px;background:#1d1b16;color:#f6f1e3;font-size:12px">Hunghanians — Roots. Connect.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const table = (rows) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0">${rows
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#6b6456;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;font-weight:600">${nl2br(v)}</td></tr>`,
    )
    .join('')}</table>`;

const textTable = (rows) =>
  rows
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

/* ---------------------------------------------------------------- contact */

export function contactToOrganisers(msg) {
  const subject = `[Website] ${msg.subject}`;
  const rows = [
    ['From', `${msg.name} <${msg.email}>`],
    ['Subject', msg.subject],
    ['Language', msg.lang.toUpperCase()],
  ];
  return {
    subject,
    text: `${textTable(rows)}\n\n${msg.message}\n\n— Reply to this email to answer ${msg.name} directly.`,
    html: layout(
      'New message from the website',
      `${table(rows)}<div style="padding:16px;background:#f6f1e3;border-radius:12px;white-space:normal">${nl2br(msg.message)}</div>
       <p style="color:#6b6456;font-size:13px">Reply to this email to answer ${esc(msg.name)} directly.</p>`,
    ),
  };
}

const CONTACT_ACK = {
  en: {
    subject: 'We received your message',
    hi: (n) => `Hi ${n},`,
    body: 'Thanks for getting in touch with Hunghanians. This is a quick confirmation that your message reached us — one of the organisers will reply soon.',
    copy: 'Your message:',
  },
  hu: {
    subject: 'Megkaptuk az üzenetedet',
    hi: (n) => `Szia ${n}!`,
    body: 'Köszönjük, hogy írtál a Hunghanians csapatának. Ez egy automatikus visszaigazolás arról, hogy az üzeneted megérkezett — hamarosan válaszolunk.',
    copy: 'Az üzeneted:',
  },
};

export function contactAcknowledgement(msg) {
  const t = CONTACT_ACK[msg.lang];
  return {
    subject: t.subject,
    text: `${t.hi(msg.name)}\n\n${t.body}\n\n${t.copy}\n${msg.subject}\n\n${msg.message}`,
    html: layout(
      t.subject,
      `<p>${esc(t.hi(msg.name))}</p><p>${esc(t.body)}</p>
       <p style="color:#6b6456;margin-top:24px">${esc(t.copy)}</p>
       <div style="padding:16px;background:#f6f1e3;border-radius:12px"><strong>${esc(msg.subject)}</strong><br><br>${nl2br(msg.message)}</div>`,
    ),
  };
}

/* ----------------------------------------------------------- registration */

const REG = {
  en: {
    subject: (e) => `You're registered: ${e}`,
    hi: (n) => `Hi ${n},`,
    intro: (e) => `Thank you for registering for ${e}! Here are your details:`,
    reference: 'Reference',
    adults: 'Adults',
    children: (r) => `Children (${r})`,
    infants: 'Children under 6 (free)',
    total: 'Amount due',
    payTitle: 'How to pay',
    pay: (days) =>
      `Please pay by bank transfer within ${days} days. Your spot is confirmed once the payment arrives. Put your reference in the transfer comment so we can match it.`,
    beneficiary: 'Beneficiary',
    account: 'Account number',
    comment: 'Transfer comment',
    noBank: 'The organisers will send you the bank details separately.',
    where: 'Location',
    when: 'Date',
    outro: 'If anything changes, just reply to this email. See you there!',
  },
  hu: {
    subject: (e) => `Sikeres regisztráció: ${e}`,
    hi: (n) => `Szia ${n}!`,
    intro: (e) => `Köszönjük, hogy regisztráltál a(z) ${e} eseményre! Az adataid:`,
    reference: 'Azonosító',
    adults: 'Felnőttek',
    children: (r) => `Gyerekek (${r} év)`,
    infants: '6 év alatti gyerekek (ingyenes)',
    total: 'Fizetendő',
    payTitle: 'Fizetés',
    pay: (days) =>
      `Kérjük, a regisztrációt követő ${days} napon belül utald át a részvételi díjat. A helyed a befizetés beérkezése után válik véglegessé. A közleménybe írd be az azonosítódat.`,
    beneficiary: 'Kedvezményezett',
    account: 'Számlaszám',
    comment: 'Közlemény',
    noBank: 'A banki adatokat a szervezők külön elküldik.',
    where: 'Helyszín',
    when: 'Időpont',
    outro: 'Ha bármi változik, csak válaszolj erre az emailre. Találkozunk!',
  },
};

export function registrationConfirmation(reg, event, bank) {
  const t = REG[reg.lang];
  const eventName = event.name[reg.lang];
  const money = formatMoney(reg.fee, reg.currency, reg.lang);
  const details = [
    [t.reference, reg.reference],
    [t.when, event.dateLabel[reg.lang]],
    [t.where, event.location],
    [t.adults, reg.adults],
    [t.children(event.childAgeRange), reg.children || ''],
    [t.infants, reg.infants || ''],
    [t.total, money],
  ];
  const bankRows = bank.number
    ? [
        [t.beneficiary, bank.name],
        [t.account, bank.number],
        [t.total, money],
        [t.comment, reg.reference],
      ]
    : null;

  return {
    subject: t.subject(eventName),
    text: [
      t.hi(reg.name),
      '',
      t.intro(eventName),
      textTable(details),
      '',
      `${t.payTitle}`,
      t.pay(event.paymentDeadlineDays),
      bankRows ? textTable(bankRows) : t.noBank,
      '',
      t.outro,
    ].join('\n'),
    html: layout(
      t.subject(eventName),
      `<p>${esc(t.hi(reg.name))}</p><p>${esc(t.intro(eventName))}</p>${table(details)}
       <h3 style="margin:24px 0 8px;font-size:17px">${esc(t.payTitle)}</h3>
       <p>${esc(t.pay(event.paymentDeadlineDays))}</p>
       ${bankRows ? `<div style="padding:4px 16px;background:#f6f1e3;border-radius:12px">${table(bankRows)}</div>` : `<p>${esc(t.noBank)}</p>`}
       <p style="margin-top:24px">${esc(t.outro)}</p>`,
    ),
  };
}

export function registrationToOrganisers(reg, event) {
  const rows = [
    ['Reference', reg.reference],
    ['Name', reg.name],
    ['Email', reg.email],
    ['Phone', reg.phone],
    ['Adults', reg.adults],
    [`Children (${event.childAgeRange})`, reg.children],
    ['Under 6', reg.infants],
    ['Fee', formatMoney(reg.fee, reg.currency, 'en')],
    ['Dietary needs', reg.dietary],
    ['Notes', reg.notes],
    ['Language', reg.lang.toUpperCase()],
  ];
  const headcount = reg.adults + reg.children + reg.infants;
  return {
    subject: `[Registration] ${reg.name} — ${headcount} ${headcount === 1 ? 'person' : 'people'} (${reg.reference})`,
    text: textTable(rows),
    html: layout(`New registration: ${event.name.en}`, table(rows)),
  };
}
