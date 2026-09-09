# Cinematic Footer — targeted ESA review

Scope: replace Footer with the supplied cinematic component, adapted to Green Tech.
This is a section review, not a complete website audit or workflow-gate certificate.

## Repair reservation

- F01, footer, medium: at 1440 × 1000 and 1440 × 860, keyboard/click focus caused the fixed surface to scroll internally by 63 px. Browser DOM evidence: `.gt-cinematic-footer__surface.scrollTop === 63` after focus; content visibly shifted upward.
- Attempt 1 reserved before the repair. Hypothesis: `overflow: hidden` makes the surface a scroll container, and focus scrolls its decorative overflow. Replace it with `overflow: clip` so decorations remain clipped without creating an internally scrollable surface. Expected: scrollTop remains zero and controls stay consistently positioned after focus.
- Verification: PASS on final bundle `index-D3OqEnRi.js`, CSS `index-B3aiZLi8.css`. At 901 × 860, 1440 × 860 and 1440 × 1000, Tab/click focus leaves surface scrollTop at zero; all controls remain visible. F01 resolved after one attempt.

## Evidence and checks

- PASS: `npm.cmd run build`, Vite 5.4.21, 484 modules. GSAP is the only added dependency.
- Actual browser screenshots inspected in the conversation: 1440 × 1000, 1440 × 860, 901 × 860, 768 × 1024, 393 × 852 and 320 × 852. Final-source screenshots were recaptured after the repair. These are governed browser captures, not saved local PNGs; no screenshot hashes are claimed.
- PASS: no horizontal document overflow at these sizes. Mobile primary links stack; secondary links wrap. Controls have at least 44 px height. The 901 × 860 fixed footer's last control ends at y=830, within the viewport.
- PASS: 1440 × 700 uses a relative surface with natural 832.25 px document height. Tablet/mobile also use normal flow, with content and bottom controls reachable.
- PASS: desktop curtain and decorative parallax inspected while scrolling from FinalStatement; no legacy footer markup remains. All seven footer anchor targets exist in the currently rendered DOM.
- PASS: Tab from the last quote-form button moves to the first footer link, reveals the content and brings the clipped wrapper into view. Shift+Tab returns to the form. No form was submitted.
- PASS: Enter on the quote link updates #contact, focuses build-quote-title, and offsets the section below the navbar. The project link on mobile focuses its H2 and sets #proiecte. Back-to-top sets #acasa, scrolls to y=0 and focuses the hero H1.
- PASS: magnetic pointer movement produced translate(8.4956px, -1.225px) and returned to translate(0px, 0px) on pointer exit. This was tested before the CSS-only clip repair; its unchanged logic was reviewed afterward.
- PASS: pause froze the marquee transform across separate reads; Enter resumed motion. The pause test was repeated after the repair. Continuous effects report paused when the footer is offscreen.
- PASS: live reduced-motion emulation removes marquee/aurora animations, clears GSAP transforms, keeps heading opacity 1, hides the pause control, and changes the fixed surface to normal flow. Reset restores normal behavior.
- PASS: mobile menu applies inert to the new semantic footer. Escape closes the menu and removes inert.
- Browser error log query returned an empty list on the final source. Existing compiled 3D runtime deprecation warnings were outside the changed component.
- Independent source review verified optional legacy selectors, local animation ownership, listener/tween cleanup, focus management and Lenis integration.

## Boundaries

- Physical touch devices, a screen-reader session, hidden-tab suspension and memory/performance profiling were NOT_RUN. Relevant source paths were inspected; no frame-rate or production-readiness claim is made.
- No external form submission or publishing occurred. Unimplemented /privacy and /terms routes from the old footer were not turned into invented documents.
- Unrelated user changes, including current Romanian FinalStatement content and hidden journal sections, were preserved.
