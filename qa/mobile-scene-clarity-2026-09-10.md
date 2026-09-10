# Mobile scene: clarity and modest enlargement

Targeted ESA change, not a full website audit. User authorized editing after a read-only diagnosis of mobile pixelation.

## Changes

- Mobile DPR cap 2; physical device DPR still respected. Desktop cap unchanged.
- Camera zoom 1.12 on phones, held through the worker shot and released smoothly between progress .815 and .9. Original final wordmark framing retained.
- Existing resize lifecycle now resets cached mobile viewport height when width changes. This was a scoped repair after observing a portrait-height buffer in landscape.
- No changes to GLB files, texture assets, CSS scaling of the canvas, animation loops, or bloom settings.

## Evidence

Actual CUA browser screenshots were inspected inline in the conversation. They are not stored as PNG files in the repository. Emulated device user agents run in Chromium and do not constitute physical Safari/iPhone testing.

| Check | Result | Observation |
| --- | --- | --- |
| iPhone UA, 393×852, DPR3 | PASS | Before: canvas491×1065. After:786×1704. Loader dismissed normally; no error/warning entries in the inspected interval. |
| Mobile framing | PASS | Inspected city intro, centered worker, and complete GREENTECH wordmark with underline on iPhone emulation. No horizontal page overflow. |
| Android UA, 393×852, DPR3 | PASS | Canvas786×1704, larger city framing, loader dismissed; no error/warning entries in the inspected interval. |
| Orientation repair | PASS | Initially observed CSS852×393 with buffer1704×1704. After the width-change reset: buffer1704×786. Returning to393×852 restores786×1704. |
| Desktop1440×1000, DPR2 | PASS | Canvas2520×1750, matching the existing1.75 cap; full desktop composition inspected after restoring the viewport. No horizontal overflow. |
| Helper/resize math | PASS | Agent checked repeated zoom application, original zoom restoration, monotonic release, desktop/tablet exclusion, both orientations, and height-only updates. These were direct checks, not a new persisted test suite. |
| Syntax/build | PASS | Runtime/helper syntax checked. Final build: `npm.cmd run build -- --emptyOutDir false` (existing Windows directory-lock workaround),489modules. |
| Runtime identity | PASS | Both changed JS assets respond HTTP200 and are byte-identical across public,dist,and local server. |

Final runtime SHA256:

- CommonScripts: `ba79f116fb484536a9f875fea86e16eef84c32a37a69e8ee8950677c2828be96`.
- greentech-mobile-framing.js: `abf97725f6cb2cad0992da354aeb5335e6773ad389c8407c780e5f8c16b3ea30`.

The city/worker/wordmark screenshots preceded the final viewport-reset repair; orientation, portrait-buffer restoration, desktop, and served-file identity were checked on the final build. The final repair only changes resetting of the mobile height cache on width changes.

## Limits

Physical phone model/browser was not supplied beyond “a real phone.” Physical-device FPS, GPU time, battery/thermal behavior, real Safari, and reduced-motion regression are NOT_RUN. No universal smoothness claim or full ESA gate verdict. Public server deployment was not performed. Emulation overrides are restored after verification.
