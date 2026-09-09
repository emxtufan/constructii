# Mobile cinematic footer — targeted follow-up

User request: reproduce the desktop curtain animation on mobile.

## Repair reservation

F02, footer, medium: the first mobile preview used a stale reveal distance after
the pause control/font layout changed the footer height. At 393 × 852 the actual
height was 802.765625 px but the pinned surface top was 84.953125 px, instead of
the expected 49.234375 px. At wrapper top 418.953125 the surface transform was
-334 px. The reveal therefore ended early.

Footer repair attempt 2 reserved before editing (attempt 1 is recorded in
cinematic-footer-review-2026-09-09.md). Refresh this component's ScrollTriggers
after ResizeObserver layout changes and fonts settle. Expected: the reveal
distance follows the final geometry, including orientation and motion changes.
Verification PASS on bundle `index-D3P20q19.js` / CSS `index-t3TI2DyO.css`:
at 393 × 852, wrapper top 368.953125 px corresponds to surface translateY(-320px)
and surface top 48.953125 px. At the page bottom the transform is zero. F02
resolved; both reserved footer repairs now have verified outcomes.

## Final-source verification

- PASS: `npm.cmd run build`, Vite 5.4.21, 484 modules. No new dependencies.
- Actual browser screenshots inspected in this conversation at 393 × 852 during
  the curtain, 393 × 932 fully revealed, and 320 × 667 scrolled to the footer end.
  No local screenshot files/hashes or full workflow-gate verdict are claimed.
- PASS: at 393 × 932 the footer is shorter than the viewport (802.765625 px);
  transform reaches zero at the page bottom and all content is visible.
- PASS: at 320 × 667 the footer is taller than the viewport (797.453125 px).
  After the reveal the surface remains at transform zero and scrolls normally;
  the last control ends at y=633.734375, inside the viewport. No horizontal overflow.
- PASS: orientation changed to 667 × 375. Tab brought the first action into the
  visible y=290.515625–350.515625 range; the final back-to-top control remained
  visible at y=296.625–344.625. No horizontal overflow.
- PASS: clicking the visible quote CTA during partial reveal navigated to #contact,
  focused build-quote-title and positioned the section at y=86.296875. Tab from
  the quote form to the footer was exercised without submitting the form.
- PASS: during partial reveal (wrapper top 389.953125, translateY(-341px)), changing
  reduced motion live cleared the surface and wordmark transforms, removed
  clip-path, kept heading opacity 1 and removed the marquee animation. Resetting
  the preference restored the mobile curtain.
- PASS: desktop regression at 1440 × 1000 retains the fixed surface, no residual
  mobile transform, scrollTop zero, and correct keyboard focus on the quote link.
- Browser error log query returned an empty list on the final source.
- Source review covered the height-limited travel distance, natural overflow
  scrolling and focus geometry. ResizeObserver/font refresh owns and cleans up
  its animation frame and observer; the font promise is guarded after unmount.

## Boundaries

Physical touch devices, mobile browser address-bar behavior, screen readers,
hidden-tab suspension and performance profiling were NOT_RUN. Mobile interaction
checks used browser viewport emulation with pointer/keyboard controls. The
existing hover-only magnetic effect remains specific to fine pointers.
