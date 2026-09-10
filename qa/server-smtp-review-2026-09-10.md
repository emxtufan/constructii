# Server dist + SMTP — 2026-09-10

Scope: Node/Express server serving only `dist`, Nodemailer configuration from ignored `.env`, existing quote form connected to `/api/quote`. Targeted ESA checks; no site redesign or full-site gate claimed.

## Verified

- `npm.cmd run build`: PASS, Vite 5.4.21, 487 modules. Final bundle `index-CNziegxp.js`; stylesheet `index-DUkMCtyZ.css`.
- `npm.cmd run test:server`: PASS, 10 tests. Actual HTTP with a temporary static fixture and fake mailer covers homepage and SPA routes, asset MIME/cache/ranges, private-file and missing-asset protection, normalized valid payload, malformed/oversized/injected/recipient-override rejection, same-origin policy, client/global limits, concurrency, awaiting delivery and sanitized SMTP failure.
- A test exposed `/%2eenv` receiving SPA HTML (no secret exposure); the fallback now decodes and validates the path. The regression test passes.
- `npm.cmd run smtp:verify`: PASS with actual Gmail TLS and authentication, using authorized network access. The initial sandbox connection failed with `ESOCKET`; the network-enabled verification succeeded. This command sends no message.
- Actual server `http://127.0.0.1:3001/api/health`: `{ok:true, service:"greentech-web", emailConfigured:true}`.
- `.env` is ignored by Git; an exact-secret scan of client source and build files returned no matches. SMTP credentials were not printed or put in the example file.
- Browser on the actual server: website and quote-review form rendered; the test request could be prepared without opening an email application.
- Isolated browser test at port 3002 used an in-memory fake mailer, with no SMTP configuration: pending disabled all relevant buttons; forced failure produced `role=alert` and preserved fields/summary; next simulated success removed the send button; explicit new-request action cleared name/email. Mobile screenshot at 393×852 showed a readable single-column form without horizontal overflow.
- Temporary simulation server stopped; viewport override reset. Actual server remains on port 3001.

## Delivery boundary

The automatic approval review rejected the browser action that would send the concrete technical test message to `contact@greentechrealestate.ro`, stating that explicit approval of this payload was required. No external email was sent, no alternate delivery path was attempted. Real recipient acceptance, Inbox receipt and end-to-end delivery remain NOT_RUN pending that approval. Simulated success is not evidence of actual email delivery.

No attachment uploads, persistent request database, physical-phone test, deployment, whole-site performance measurement or formal accessibility audit were performed. Startup/configuration instructions are in `docs/server.md`.
