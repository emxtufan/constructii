import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';

let mailer;
try {
  mailer = createMailer(loadConfig());
  await mailer.verify();
  console.log('SMTP: conexiune TLS și autentificare reușite. Nu a fost trimis niciun email.');
} catch (error) {
  console.error('Verificarea SMTP a eșuat. Verifică .env și accesul la rețea. Cod:', /^[A-Z_]+$/.test(error.code || '') ? error.code : 'CONFIG_OR_SMTP_ERROR');
  process.exitCode = 1;
} finally {
  mailer?.close();
}
