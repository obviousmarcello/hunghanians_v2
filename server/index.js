import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';
import { createStore } from './store.js';
import { createApp } from './app.js';

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err.message);
  console.error('Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const mailer = createMailer(config.mail);
const store = createStore(config.dataDir);
const app = createApp({ config, mailer, store });

try {
  await mailer.verify();
} catch (err) {
  console.warn(`⚠️  SMTP check failed (${err.message}). The site will run, but emails will fail until this is fixed.`);
}

const server = app.listen(config.port, () => {
  console.log(`Hunghanians running on http://localhost:${config.port}  (mail: ${config.mail.transport})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
