// All UI strings live here. HTML elements opt in with data-i18n="key".
// Strings may contain {placeholders}; elements with data-i18n-vars get them
// filled from the event config (see main.js).

export const strings = {
  en: {
    skip: 'Skip to content',
    'nav.menu': 'Menu',
    'nav.event': 'Event',
    'nav.gallery': 'Gallery',
    'nav.faq': 'FAQ',
    'nav.community': 'Community',
    'nav.contact': 'Contact',

    'hero.eyebrow': 'Ghanaian community in Hungary',
    'hero.lead': 'Celebrating Ghanaian culture & community in Hungary.',
    'hero.discover': 'Discover our next event',
    'cta.register': 'Register now',
    'cta.facebook': 'Facebook event',

    'event.kicker': 'Upcoming event',
    'event.intro':
      "Hello dear friend! If you'd like to take part in the Ghanaian Get Together Party, please register below — it only takes a minute. It helps us plan food and drinks for the event.",
    'event.when': 'When',
    'event.where': 'Where',
    'event.fee': 'Participation fee',
    'event.adults': 'Adults',
    'event.children': 'Children ({childAgeRange})',
    'event.payment': 'Payment',
    'event.paymentText': "Bank transfer within {days} days of registering. Without payment we can't confirm your spot.",

    'status.open': 'Registration open',
    'status.closed': 'Registration closed',
    'status.past': 'This event has ended',

    'countdown.label': 'Starts in',
    'countdown.days': 'days',
    'countdown.hours': 'hours',
    'countdown.minutes': 'min',
    'countdown.seconds': 'sec',
    'countdown.live': "It's happening now — see you there! 🎉",
    'countdown.past': 'Thank you to everyone who came! Details of the next Get Together will be announced soon.',

    'map.load': 'Show map',
    'map.note': 'Loads Google Maps',
    'map.open': 'Open in Google Maps',

    'gallery.kicker': 'Memories',
    'gallery.title': 'Gallery',
    'gallery.lead': 'Moments from our previous Get Together events.',
    'gallery.empty': 'Photos from the last Get Together are coming soon.',

    'faq.kicker': 'Good to know',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'How do I register?',
    'faq.a1': 'Click "Register now", fill in the short form and you\'ll get a confirmation email with your reference number and payment details.',
    'faq.q2': 'How and when do I pay?',
    'faq.a2': 'By bank transfer within {days} days of registering. Please put your reference number in the transfer comment so we can match your payment.',
    'faq.q3': 'How much does it cost for children?',
    'faq.a3': 'Children aged {childAgeRange} pay the reduced fee. Let us know about younger children in the form so we can plan for them too.',
    'faq.q4': 'Can I change or cancel my registration?',
    'faq.a4': 'Yes — just reply to your confirmation email or use the contact form below, and mention your reference number.',

    'community.kicker': 'Who we are',
    'community.title': 'Community',
    'community.historyTitle': 'Our history',
    'community.history': 'Coming soon.',
    'community.partyTitle': 'Annual Get Together',
    'community.party': "Our annual Get Together Party is the centre of our community's life in Hungary.",
    'community.bridgeTitle': 'Two homes',
    'community.bridge': 'Ghanaians, Hungarians and friends of both — everyone is welcome.',

    'contact.kicker': 'Stay connected',
    'contact.title': 'Get in touch',
    'contact.lead': 'Questions about the event, ideas, or just want to say hello? Send us a message and an organiser will reply by email.',
    'contact.sentTitle': 'Message sent!',
    'contact.sentText': "Thanks for writing to us. We've emailed you a copy and will get back to you soon.",
    'contact.another': 'Send another message',

    'form.name': 'Name',
    'form.fullName': 'Full name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.subject': 'Subject',
    'form.message': 'Message',
    'form.optional': 'optional',
    'form.send': 'Send message',
    'form.sending': 'Sending…',

    'reg.title': 'Register',
    'reg.who': "Who's coming?",
    'reg.infants': 'Children under 6',
    'reg.free': 'free',
    'reg.total': 'Total',
    'reg.dietary': 'Dietary needs or allergies',
    'reg.notes': 'Anything else we should know?',
    'reg.consent': 'I agree that the organisers store my details to organise this event and contact me about it.',
    'reg.submit': 'Complete registration',
    'reg.doneTitle': "You're registered!",
    'reg.emailSent': 'We sent a confirmation to {email}. Check your spam folder if you can\'t find it.',
    'reg.emailFailed': "We saved your registration, but couldn't send the confirmation email. Please note the details below.",
    'reg.payTitle': 'Next step: pay by bank transfer',
    'reg.reference': 'Reference',
    'reg.amount': 'Amount',
    'reg.beneficiary': 'Beneficiary',
    'reg.account': 'Account number',
    'reg.payNote': 'Please transfer within {days} days and put your reference in the comment.',
    'reg.close': 'Done',
    'reg.closedNotice': 'Registration for this event is closed.',
    'reg.pastNotice': 'This event has already taken place. Registration for the next one will open here soon.',
    'reg.copied': 'Copied!',

    'footer.egg': 'Psst… press G three times',

    'error.required': 'Please fill this in.',
    'error.invalid_email': "That doesn't look like an email address.",
    'error.invalid_phone': "That doesn't look like a phone number.",
    'error.invalid_number': 'Please enter a valid number.',
    'error.too_long': 'This is too long.',
    'error.too_short': 'Please write a little more.',
    'error.rate_limited': 'Too many attempts. Please wait a few minutes and try again.',
    'error.mail_failed': "We couldn't send your message right now. Please try again later.",
    'error.network': 'Network problem — check your connection and try again.',
    'error.registration_closed': 'Registration for this event is closed.',
    'error.registration_past': 'This event has already taken place.',
    'error.generic': 'Something went wrong. Please try again.',
    'error.fix': 'Please fix the highlighted fields.',

    'snake.score': 'Score',
    'snake.best': 'Best',
    'snake.help': 'Arrow keys or swipe to move · Eat the black stars',
    'snake.over': 'Game over!',
    'snake.again': 'Play again',
  },

  hu: {
    skip: 'Ugrás a tartalomra',
    'nav.menu': 'Menü',
    'nav.event': 'Esemény',
    'nav.gallery': 'Galéria',
    'nav.faq': 'GYIK',
    'nav.community': 'Közösség',
    'nav.contact': 'Kapcsolat',

    'hero.eyebrow': 'Ghánai közösség Magyarországon',
    'hero.lead': 'A ghánai kultúra és közösség ünneplése Magyarországon.',
    'hero.discover': 'Fedezd fel a következő eseményünket',
    'cta.register': 'Regisztrálok',
    'cta.facebook': 'Facebook esemény',

    'event.kicker': 'Közelgő esemény',
    'event.intro':
      'Kedves érdeklődő! Ha szeretnél részt venni a ghánai összejövetelen, regisztrálj lent — csak egy perc. Ez segít nekünk megtervezni az ételeket és italokat.',
    'event.when': 'Mikor',
    'event.where': 'Hol',
    'event.fee': 'Részvételi díj',
    'event.adults': 'Felnőttek',
    'event.children': 'Gyerekek ({childAgeRange} év)',
    'event.payment': 'Fizetés',
    'event.paymentText': 'Banki átutalással a regisztrációt követő {days} napon belül. Fizetés nélkül nem tudjuk megerősíteni a helyedet.',

    'status.open': 'Regisztráció nyitva',
    'status.closed': 'Regisztráció lezárva',
    'status.past': 'Az esemény véget ért',

    'countdown.label': 'Kezdésig',
    'countdown.days': 'nap',
    'countdown.hours': 'óra',
    'countdown.minutes': 'perc',
    'countdown.seconds': 'mp',
    'countdown.live': 'Most zajlik — találkozunk! 🎉',
    'countdown.past': 'Köszönjük mindenkinek, aki eljött! A következő találkozó részleteit hamarosan közzétesszük.',

    'map.load': 'Térkép megjelenítése',
    'map.note': 'Google Maps betöltése',
    'map.open': 'Megnyitás Google Mapsben',

    'gallery.kicker': 'Emlékek',
    'gallery.title': 'Galéria',
    'gallery.lead': 'Pillanatok a korábbi ghánai találkozókról.',
    'gallery.empty': 'A legutóbbi találkozó fotói hamarosan érkeznek.',

    'faq.kicker': 'Jó tudni',
    'faq.title': 'Gyakran ismételt kérdések',
    'faq.q1': 'Hogyan tudok regisztrálni?',
    'faq.a1': 'Kattints a „Regisztrálok” gombra, töltsd ki a rövid űrlapot, és emailben elküldjük az azonosítódat és a fizetési adatokat.',
    'faq.q2': 'Hogyan és mikor kell fizetni?',
    'faq.a2': 'Banki átutalással, a regisztrációt követő {days} napon belül. A közleménybe írd be az azonosítódat, hogy be tudjuk azonosítani a befizetést.',
    'faq.q3': 'Mennyibe kerül a részvétel gyerekeknek?',
    'faq.a3': 'A {childAgeRange} éves gyerekek kedvezményes díjat fizetnek. A kisebb gyerekeket is jelezd az űrlapon, hogy velük is tervezhessünk.',
    'faq.q4': 'Módosíthatom vagy lemondhatom a regisztrációmat?',
    'faq.a4': 'Igen — válaszolj a visszaigazoló emailre vagy írj nekünk az alábbi űrlapon, és add meg az azonosítódat.',

    'community.kicker': 'Kik vagyunk',
    'community.title': 'Közösség',
    'community.historyTitle': 'Történetünk',
    'community.history': 'Hamarosan.',
    'community.partyTitle': 'Éves ghánai találkozó',
    'community.party': 'Az éves ghánai találkozó közösségünk életének központja Magyarországon.',
    'community.bridgeTitle': 'Két otthon',
    'community.bridge': 'Ghánaiak, magyarok és mindkettőjük barátai — mindenkit szeretettel várunk.',

    'contact.kicker': 'Maradjunk kapcsolatban',
    'contact.title': 'Írj nekünk',
    'contact.lead': 'Kérdésed van az eseménnyel kapcsolatban, ötleted van, vagy csak köszönnél? Írj nekünk, és egy szervező emailben válaszol.',
    'contact.sentTitle': 'Üzenet elküldve!',
    'contact.sentText': 'Köszönjük, hogy írtál! Emailben elküldtük az üzeneted másolatát, és hamarosan válaszolunk.',
    'contact.another': 'Új üzenet küldése',

    'form.name': 'Név',
    'form.fullName': 'Teljes név',
    'form.email': 'Email',
    'form.phone': 'Telefonszám',
    'form.subject': 'Tárgy',
    'form.message': 'Üzenet',
    'form.optional': 'nem kötelező',
    'form.send': 'Üzenet küldése',
    'form.sending': 'Küldés…',

    'reg.title': 'Regisztráció',
    'reg.who': 'Kik jönnek?',
    'reg.infants': '6 év alatti gyerekek',
    'reg.free': 'ingyenes',
    'reg.total': 'Összesen',
    'reg.dietary': 'Étkezési igények, allergiák',
    'reg.notes': 'Van még valami, amit tudnunk kellene?',
    'reg.consent': 'Hozzájárulok, hogy a szervezők az esemény megszervezéséhez tárolják az adataimat, és ezzel kapcsolatban felvegyék velem a kapcsolatot.',
    'reg.submit': 'Regisztráció véglegesítése',
    'reg.doneTitle': 'Sikeres regisztráció!',
    'reg.emailSent': 'Visszaigazolást küldtünk a(z) {email} címre. Ha nem találod, nézd meg a spam mappát is.',
    'reg.emailFailed': 'A regisztrációdat elmentettük, de a visszaigazoló emailt nem sikerült elküldeni. Kérjük, jegyezd fel az alábbi adatokat.',
    'reg.payTitle': 'Következő lépés: banki átutalás',
    'reg.reference': 'Azonosító',
    'reg.amount': 'Összeg',
    'reg.beneficiary': 'Kedvezményezett',
    'reg.account': 'Számlaszám',
    'reg.payNote': 'Kérjük, {days} napon belül utald át, és a közleménybe írd be az azonosítódat.',
    'reg.close': 'Kész',
    'reg.closedNotice': 'Erre az eseményre a regisztráció lezárult.',
    'reg.pastNotice': 'Ez az esemény már lezajlott. A következőre hamarosan itt lehet regisztrálni.',
    'reg.copied': 'Másolva!',

    'footer.egg': 'Pszt… nyomd meg háromszor a G-t',

    'error.required': 'Kérjük, töltsd ki ezt a mezőt.',
    'error.invalid_email': 'Ez nem tűnik email címnek.',
    'error.invalid_phone': 'Ez nem tűnik telefonszámnak.',
    'error.invalid_number': 'Kérjük, adj meg egy érvényes számot.',
    'error.too_long': 'Ez túl hosszú.',
    'error.too_short': 'Kérjük, írj egy kicsit többet.',
    'error.rate_limited': 'Túl sok próbálkozás. Várj néhány percet, és próbáld újra.',
    'error.mail_failed': 'Most nem sikerült elküldeni az üzenetet. Kérjük, próbáld újra később.',
    'error.network': 'Hálózati hiba — ellenőrizd az internetkapcsolatot, és próbáld újra.',
    'error.registration_closed': 'Erre az eseményre a regisztráció lezárult.',
    'error.registration_past': 'Ez az esemény már lezajlott.',
    'error.generic': 'Valami hiba történt. Kérjük, próbáld újra.',
    'error.fix': 'Kérjük, javítsd a megjelölt mezőket.',

    'snake.score': 'Pont',
    'snake.best': 'Rekord',
    'snake.help': 'Nyilak vagy húzás a mozgáshoz · Edd meg a fekete csillagokat',
    'snake.over': 'Játék vége!',
    'snake.again': 'Újra',
  },
};

const STORAGE_KEY = 'hg-lang';
let current = 'en';
let vars = {};
const listeners = new Set();

export const getLang = () => current;

export function t(key, extra = {}) {
  const template = strings[current][key] ?? strings.en[key] ?? key;
  const all = { ...vars, ...extra };
  return template.replace(/\{(\w+)\}/g, (m, name) => (name in all ? all[name] : m));
}

export function setVars(newVars) {
  vars = { ...vars, ...newVars };
  apply();
}

export function onLangChange(fn) {
  listeners.add(fn);
}

function apply(root = document) {
  document.documentElement.lang = current;
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === current));
  });
  listeners.forEach((fn) => fn(current));
}

export function setLang(lang) {
  if (!strings[lang]) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  apply();
}

export function initI18n() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {}
  const browser = (navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  current = strings[saved] ? saved : browser;

  document.querySelectorAll('[data-lang]').forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
  apply();
}
