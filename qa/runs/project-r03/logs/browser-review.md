# Integrated review — provisional content

Date: 2026-09-07. Browser: Codex in-app Chromium, local Vite preview on 4176.
Current build: index-CuEXUn_R.js / index-BmDfUMce.css. No external forms or
messages were sent. Synthetic form inputs were cleared by reloading the page.

## Implemented and observed

- All planned section IDs appear in Main, in the requested editorial sequence;
  the original Hero/Flow engine structure is preserved. Building Process remains
  the four company-process steps in Flow, with revised Romanian text.
- Stage selection changes its image/caption panel. Mouse selection of Structura
  and ArrowRight to Zidăria worked; Home returned to Terenul on a narrow viewport.
  All actual status values remain unknown; selecting an image is not presented
  as proof that it is the actual construction stage. No percentages or weekly
  updates were fabricated.
- Desktop 1440 x 1000 viewport captures were inspected in project-r02 for stage
  navigation, progress, materials, gallery empty state, engineering, comparison,
  next phases, journal, FAQ, quote and final statement. clientWidth/scrollWidth:
  1425/1425. These captures predate only the F01 wording correction.
- Mobile 390 x 844 captures inspected for stages, progress, materials, engineering,
  comparison, quote and final statement. The stage rail scrolls within its own
  width; it does not widen the document. Engineering stacks drawing above notes.
- Current-source r03 mobile comparison capture confirms F01 correction: no
  instruction to drag a nonexistent handle is present. It describes the two
  documented moments and explains that the real photo pair is missing.
- 320 x 720: document clientWidth/scrollWidth 305/305; no horizontal overflow in
  the new build-section, gt-craft, quote, FAQ or final-statement sections.
- 768 x 1024: document clientWidth/scrollWidth 753/753; engineering, quote and final
  statement screenshots inspected. The quote fields use two columns below its
  introduction, and the blueprint/notes remain legible in two columns.
- Reduced motion at 768px: computed animation names were all none for queried
  new entrances, final statement and principle text. Temporary media and viewport
  overrides were reset after inspection.
- FAQ: Enter opened the first native details element; Space closed it. No engine
  accordion selectors are used. Form labels, fieldsets and focus are present.
- Empty REQUEST A QUOTE did not show the review. Synthetic input for type, location,
  surface, stage, services, name and email produced the expected complete summary.
  The review received focus and sat at about 100px below the fixed navbar.
  Returning to the form retained the entered location. The code prepares mailto
  only for explicit email action; no email client was launched or delivery tested.
- Browser console showed no errors during inspection; the pre-existing Three.js
  renderAsync deprecation warning remains.

## Source review and corrections

Independent agent review confirmed integration after Flow is safe for the compiled
camera calculation. Four data edge cases were corrected and verified through
helpers plus React server rendering: confirmed completed project, impossible ISO
dates, missing dates in journal, and empty/null phase arrays. This was synthetic
data testing, not evidence of any real construction progress.

One visual repair was reserved: F01 comparison instruction mismatch. Its current
wording was verified in the browser on mobile after rebuild. No layout or other
behavior changed in that repair.

## Build and scope boundaries

The actual successful exec_command result is preserved verbatim in build-exec.json.
Direct npm.cmd run build succeeds (475 modules). The workflow Python child-process
build launcher failed in r01/r02 with sandbox parent-directory access errors while
resolving vite.config.js; these failed receipts were retained, not overwritten.

The browser emitted actual viewport images into the conversation. A complete
PNG capture manifest for every planned section/viewport was NOT_RUN. No saved
PNG files or screenshot hashes are claimed. This is a partial manual review;
the full ESA gate is therefore incomplete.

NOT_RUN: authentic-photo gallery/lightbox, actual before/current range interaction,
photographic parallax and stage transitions with owner assets, all-section full
capture matrix, physical phones, Safari, screen reader, performance/FPS profiling,
email delivery or clipboard integration. The photo-dependent code exists but
cannot be declared verified against missing authentic content.

The project name, current phase, completion percentage, dates, material specs and
photos remain unprovided. These are the outstanding inputs for final delivery.
The existing construction collage is explicitly labeled conceptual and is not
used as a before/after photo or proof of site progress.
