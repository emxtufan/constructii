# Footer scroll stability — user-reported regression

The user reports shaking while dragging in mobile browser emulation. This new
request explicitly asks us to investigate the regression after the previous two
footer repairs; continue the counter rather than resetting it. Attempt 3 is
authorized by this follow-up and reserved before source changes.

## Findings / hypothesis

- F03: the mobile surface counteracts viewport scrolling with a GSAP transform
  on every frame. Native/compositor scrolling and main-thread animation can be
  rendered at different times, producing visible shaking. This mechanism is
  confirmed in source; physical touch-frame jitter is not yet measured.
- The ResizeObserver also forces global ScrollTrigger.refresh() immediately;
  installed GSAP source reverts/recalculates/restores scroll during that path.
  This can amplify jumps when layout changes during a gesture. Transform alone
  does not fire ResizeObserver, so we do not claim a per-frame observer loop.
- Focus capture can initiate immediate scrolling for pointer focus as well as
  keyboard focus. It should only reposition the keyboard-visible focus target.

Proposed repair: reproduce the curtain using a native sticky track/spacer with
stable viewport sizing; remove all surface GSAP transforms. Refresh only owned
decorative triggers after actual size changes and while scrolling is idle.
Preserve desktop, decorative animations, reduced motion and keyboard access.
## Implementation and verification

- Removed the GSAP tween of the complete surface. Mobile now uses a native sticky
  track, negative margin, trailing spacer and minimum surface height based on
  100lvh. Both short and tall content remain in document flow.
- Removed the forced global refresh. Size changes are deduplicated; only owned
  decorative triggers refresh when ScrollTrigger reports scrolling idle. Observer,
  scrollEnd listener, pending frame and GSAP contexts are cleaned up on unmount.
- Pointer focus does not invoke the footer's programmatic scroll correction;
  keyboard focus retains it. Existing fine-pointer-only magnetism is unchanged.
- PASS: npm.cmd run build, 484 modules, final bundle index-DJwxDCuQ.js and
  stylesheet index-DVbTfDq4.css.
- Browser screenshots and DOM inspected at 393 × 852 and 320 × 667. No local
  capture files or image hashes were created; screenshots are in the conversation.
- At 393 × 852 the footer is 852 px and the native track is 1704 px. During
  forward/backward scroll checks wrapper tops included 399.953125, 289.953125,
  249.953125 and 179.953125 while surface top stayed 0 and CTA top stayed
  424.875. The surface's computed transform remained none.
- A transient jump occurred during an initial combined input sequence. It was
  not attributed to a cause without evidence. A subsequent isolated CDP test
  separated mousePressed and mouseReleased: scrollY remained 15053 before press,
  while pressed, after release/pausing, and after resuming. Pointer focus was
  not focus-visible; the button label changed correctly without a scroll jump.
- PASS: at 320 × 667, Tab reached the first CTA with focus-visible=true and its
  bottom at 454.953125. Tab reached the last control at bottom 633.734375; the
  taller footer scrolled naturally and surface scrollTop remained zero. No
  horizontal overflow was measured.
- PASS: live reduced motion changes the track to display:contents, the surface
  to position:relative, clip-path to none and marquee animation to none, with
  heading opacity 1. Reset restores the normal configuration.
- Independent read-only review found no concrete cleanup, geometry or focus
  defects. No unsupported attribution to the number of active Lenis instances:
  the compiled engine's mobile detection depends on userAgent, not viewport width.
- PASS: desktop regression at 1440 × 1000 retained position:fixed and
  display:contents on the track; Tab focused the quote link, surface scrollTop
  stayed zero, and there was no horizontal overflow. Browser error log was empty.

## Boundaries / outcome

The hypothesized scroll/transform race is removed structurally and the controlled
pointer/keyboard checks above passed. The browser tool does not support synthetic
touch drag gestures on this surface; a touch-drag recording/frame trace was not
captured. Therefore this is an implemented stability correction with desktop
browser emulation evidence, not a claim that the user's exact touch gesture or a
physical phone was fully reproduced. User recheck after reload remains useful.
No whole-site accessibility or performance certification is claimed.
