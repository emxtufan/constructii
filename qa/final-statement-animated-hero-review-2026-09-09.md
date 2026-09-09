# FinalStatement — Animated Hero

Targeted ESA review, 2026-09-09. Scope: the closing statement and its two links.
This is not a whole-site audit or a complete workflow-gate certificate.

## Implementation

- Reusable `src/components/ui/animated-hero.jsx` and local CSS, consumed by FinalStatement.
- Existing Motion dependency, rotating brand phrases, vertical spring transitions and reserved text height.
- Pause/resume control, viewport gating, document visibility listener and live reduced-motion fallback.
- Stable accessible heading. CTA links update the hash and focus the destination heading without conflicting with global smooth scrolling.

## Current-source evidence

- PASS: `npm.cmd run build` (Vite 5.4.21, 478 modules).
- Preview: `http://127.0.0.1:4176/`, verified bundle `index-D6TajRNF.js`.
- Actual browser screenshots inspected in the conversation at 1440 × 1000, 768 × 1024, 393 × 852 and 320 × 852. Screenshots were emitted by the governed browser tool; no local PNG files or image hashes were recorded.
- PASS: no horizontal document overflow at the inspected widths. At 320 px, longer phrases wrap into two lines; the reserved title height remained 246.40625 px across different phrases. Desktop title height remained 462.15625 px across multiple phrases.
- PASS: active words changed while visible; playback reported `idle` outside the viewport and `playing` inside it.
- PASS: clicking pause set `aria-pressed=true`; ON TRUST remained unchanged in a later read. Enter resumed playback, followed by FOR GENERATIONS.
- PASS: changing the emulated motion preference live produced a static WHAT COMES NEXT phrase, no inline motion style and no pause button. Resetting the preference restored playback.
- PASS: Enter on the quote link set `#contact`, focused `build-quote-title` and placed the section below the navbar. Enter on the stages link set `#ground-to-home` and focused `build-story-title`.
- PASS: both tablet CTA controls measured 52 px high; mobile controls stack and remain inside their container.
- Browser log inspection returned no errors and the existing THREE.QuadMesh renderAsync deprecation warnings from the compiled vendor runtime.
- Independent read-only source review found no concrete timer/cleanup or navigation integration defect.

## Verification boundaries

- Actual hidden-tab suspension, physical touch devices and a screen-reader session were NOT_RUN; their relevant source paths were inspected.
- No form was submitted, dependencies installed or website published for this check.
- The surrounding 3D runtime and other site sections were not fully re-audited.
