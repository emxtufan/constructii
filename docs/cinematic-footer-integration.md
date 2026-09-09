# Cinematic Footer

`src/components/Footer.jsx` now renders `CinematicFooter` from
`src/components/ui/motion-footer.jsx`, with scoped styles in `motion-footer.css`.
The ui directory contains reusable effects/components; page content stays in the
site's existing component structure.

The supplied component was adapted to the existing React 18 / JSX / Vite /
Tailwind 4 application. GSAP 3.15 and ScrollTrigger implement the entrance,
background parallax and magnetic links. No TypeScript migration, shadcn provider,
font replacement or global theme-token changes are needed by this component.

The original design's diagonal marquee, atmospheric grid, giant wordmark,
magnetic pills and desktop curtain are retained, with Green Tech colors, logo
and Romanian copy. All seven anchors target sections actually rendered on the
page. Demo app-store links, unrelated brand credits and stock photos are omitted.
The old `/privacy` and `/terms` links had no implemented pages and are not shown
as working destinations. Add these links when the actual documents/routes exist.

The fixed curtain is limited to screens at least 901 × 860 with no reduced-motion
preference. On mobile/tablet up to 900 px, a native CSS sticky surface recreates
the curtain without a JavaScript transform compensating for scroll. A track with
a negative margin and trailing spacer creates the reveal interval; all three
viewport dimensions use stable 100lvh sizing. Taller content scrolls naturally
after the curtain. Desktop keeps its fixed surface.

Decorative wordmark parallax runs on mobile too. ResizeObserver compares actual
dimensions and refreshes only owned decorative triggers after scrolling stops.
Font readiness requests the same idle update; there is no forced global refresh
from the observer. Reduced motion restores normal, unclipped document flow.
Keyboard-visible focus reveals and scrolls its wrapper/control into view;
pointer focus does not force-scroll the page. Navigation uses the site's Lenis
instance and focuses the destination heading. No internal scroll container is
created, and touch scrolling is not blocked.

Continuous decoration pauses outside the viewport, when the document is hidden,
or through the pause control. Reduced motion disables all decorative motion.
Magnetic movement requires a fine pointer and hover, measures a stable wrapper,
and cleans up listeners and tweens on media changes/unmount. GSAP contexts own
the entrance and ScrollTrigger lifecycle. No new scroll owner is created.
