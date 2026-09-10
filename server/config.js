import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function loadConfig() {
  const envFile = path.join(projectRoot, '.env');
  if (existsSync(envFile)) loadEnvFile(envFile);
  const required = name => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Lipsește ${name} din configurația serverului.`);
    return value;
  };
  const integer = (name, fallback, min, max) => {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} are o valoare invalidă.`);
    return value;
  };
  const boolean = (name, fallback) => {
    const value = process.env[name] ?? String(fallback);
    if (!['true', 'false'].includes(value)) throw new Error(`${name} trebuie să fie true sau false.`);
    return value === 'true';
  };
  const email = name => {
    const value = required(name);
    if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value)) throw new Error(`${name} trebuie să conțină o singură adresă de email.`);
    return value;
  };
  const publicOrigin = process.env.PUBLIC_ORIGIN?.trim() || '';
  if (publicOrigin && (!/^https?:\/\//.test(publicOrigin) || new URL(publicOrigin).origin !== publicOrigin)) {
    throw new Error('PUBLIC_ORIGIN trebuie să fie o origine completă, fără cale sau slash final.');
  }
  return {
    host: process.env.HOST || '127.0.0.1',
    port: integer('PORT', 3001, 1, 65535),
    distDir: path.join(projectRoot, 'dist'),
    publicOrigin,
    smtp: {
      host: required('SMTP_HOST'),
      port: integer('SMTP_PORT', 587, 1, 65535),
      secure: boolean('SMTP_SECURE', false),
      requireTLS: boolean('SMTP_REQUIRE_TLS', true),
      auth: {
        user: required('SMTP_USER'),
        // Gmail displays app passwords in four groups for readability.
        pass: required('SMTP_HOST') === 'smtp.gmail.com' ? required('SMTP_PASSWORD').replace(/\s/g, '') : required('SMTP_PASSWORD'),
      },
      connectionTimeout: integer('SMTP_CONNECTION_TIMEOUT_MS', 12000, 1000, 60000),
      greetingTimeout: 12000,
      socketTimeout: 30000,
      dnsTimeout: 12000,
      tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      disableFileAccess: true,
      disableUrlAccess: true,
      logger: false,
      debug: false,
    },
    from: { name: required('SMTP_FROM_NAME'), address: email('SMTP_FROM_EMAIL') },
    to: email('SMTP_TO'),
  };
}
