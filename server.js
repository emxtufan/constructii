import { createServer } from 'node:http';
import { createApp } from './server/app.js';
import { loadConfig } from './server/config.js';
import { createMailer } from './server/mailer.js';

try {
  const config = loadConfig();
  const mailer = createMailer(config);
  const app = createApp({ ...config, mailer });
  const server = createServer(app);
  server.requestTimeout = 20000;
  server.headersTimeout = 15000;
  server.listen(config.port, config.host, () => {
    console.log(`Green Tech: http://127.0.0.1:${config.port}`);
    console.log('Servește dist; formularul trimite prin SMTP. Oprire: Ctrl+C.');
  });
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `Portul ${config.port} este ocupat. Schimbă PORT în .env.` : 'Serverul nu a putut porni. Verifică HOST și PORT.');
    mailer.close();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    server.close(() => { mailer.close(); process.exit(0); });
    setTimeout(() => { mailer.close(); process.exit(0); }, 10000).unref();
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
