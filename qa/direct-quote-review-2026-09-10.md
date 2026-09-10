# Direct quote submission — 2026-09-10

Targeted ESA change: remove the second review screen. The original form now posts directly to `/api/quote` when the visitor selects `Trimite cererea`. Its summary is generated internally for compatibility with the existing validated API. Pending and successful requests disable the controls; failures preserve editable input; success exposes an explicit new-request reset. FAQ, factual privacy copy, server documentation and the email summary label match the direct flow.

- PASS: production build, 487 modules; `index-Dv4vZey6.js` and `index-f5UjC-QS.css`.
- PASS: diff whitespace and mailer syntax checks; no review component/state remains.
- PASS: live browser shows one form and one direct submit action, without an intermediate review page.
- PASS: empty submit invokes native required-field validation and focuses project type.
- PASS: isolated fake mailer on port 3012 exercises direct pending, forced failure and subsequent simulated success. Error is announced as an alert, retains the entered name and enables editing. Success disables resubmission and all input controls. Explicit new-request action clears input and focuses project type.
- PASS: mobile 393×852 screenshot inspected; readable single-column fields and no horizontal overflow. Browser viewport override reset after verification.

The controlled failure/success tests on port 3012 used a local fake mailer; that simulator was stopped. An earlier attempted simulator start on port 3002 encountered an already occupied port, but its Express listen callback printed a misleading readiness message because it did not inspect the callback error. A browser test submission consequently reached the existing service and returned success. Later process inspection identified that service as `node server.js` (PID 13544), not the intended inline fake mailer, so it was left untouched. Whether this first test caused external delivery cannot be confirmed; the user was informed and no further requests were submitted there. No claim of zero external delivery or verified SMTP receipt can be made for that attempt. This was an unintended test-target error, not an authorized real-delivery test. Future temporary previews must use a free port and a listener that fails explicitly on address conflicts. No full-site audit or physical-device test is claimed.
