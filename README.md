# Hunghanians

Website for the Ghanaian community in Hungary. It is a static, bilingual (EN/HU) frontend with a small Node.js backend that sends the contact-form and event-registration emails itself, without Google Forms.

```
public/            the website (plain HTML/CSS/JS, no build step)
  event.json       ← edit this for each new event (shared by site + emails)
  index.html
  css/styles.css
  js/              main.js, i18n.js (all EN/HU text), forms.js, snake.js
  assets/
server/            Express API + static file server
test/              API tests (node --test)
```

## Running locally

```bash
npm install
cp .env.example .env      # MAIL_TRANSPORT=log prints emails to the console
npm run dev               # http://localhost:3000
npm test
```

## Setting up a new event

Edit `public/event.json`: change the `id`, `referencePrefix`, name, dates (ISO 8601 with the Budapest offset), fees, Facebook link and map. The page, countdown, registration form, fee calculator and confirmation emails all read from this file. Registration closes automatically once `end` has passed. You can also close it early with `"registrationOpen": false`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/contact` | Emails the organisers (Reply-To set to the visitor) and sends the visitor an acknowledgement. |
| `POST` | `/api/register` | Saves the registration to `DATA_DIR/registrations.jsonl`, emails the registrant a confirmation with a unique payment reference and bank details, and notifies the organisers. |
| `GET` | `/api/admin/registrations.csv` | Downloads the registrations as CSV (opens in Excel). Needs `Authorization: Bearer $ADMIN_TOKEN`. Add `?event=all` to include past events. |
| `GET` | `/api/health` | Health check. |

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://your-site/api/admin/registrations.csv -o registrations.csv
```

The forms are protected by a honeypot field, per-IP rate limiting, input validation, HTML escaping in emails, and a strict Content-Security-Policy. A registration is always saved before any email is sent, so an email outage never loses a sign-up.

## Email (SMTP)

Any SMTP provider works. Set `MAIL_TRANSPORT=smtp` and fill in `SMTP_*`, `MAIL_FROM`, and `ORGANISER_EMAIL`:

- **Gmail / Google Workspace:** `smtp.gmail.com`, port 465, `SMTP_SECURE=true`. Use an [app password](https://myaccount.google.com/apppasswords). Fine for low volume.
- **Brevo, Mailgun, Postmark, Amazon SES:** better deliverability. Verify your domain (SPF/DKIM) so confirmations don't land in spam.

## Deploying

The server serves both the website and the API, so it can go on any Node host (Render, Railway, Fly.io, a VPS):

```bash
docker build -t hunghanians .
docker run -p 3000:3000 --env-file .env -v hunghanians-data:/app/data hunghanians
```

Keep `DATA_DIR` on a persistent disk or volume. Set `TRUST_PROXY=1` behind a proxy or PaaS.

**Keeping the frontend on GitHub Pages:** publish `public/` to Pages, deploy the server somewhere else, set `<meta name="api-base" content="https://your-api-host">` in `index.html`, and add the Pages origin to `CORS_ORIGINS`.

## Easter egg

Press <kbd>G</kbd> three times (or tap the footer hint).
