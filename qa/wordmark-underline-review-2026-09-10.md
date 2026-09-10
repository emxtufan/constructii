# GREENTECH luminous underline — targeted ESA review

Request: extend the existing final luminous line to underline the full GREENTECH wordmark on desktop and mobile.

## Change

The last tube previously stopped at world X55.5, before the wordmark's right edge. `GreentechWordmarkLayout` now reads the live wordmark's world-space bounding box after its responsive scale is applied. It stretches the last straight tube and the matching reflected tube around their X24 start, ending at the text's right edge (approximately X67 at full size).

The tubes retain their shared geometry, radius, materials and UV0–1 reveal. The original curve and camera calls are unchanged. Only the final segment's floor-light head/tail are sampled by arc length (`getPointAt`, as used by TubeGeometry) and mapped through the same extension. No GLB regeneration, new mesh, material, listener or animation loop is added.

## Source checks

- Standalone `npm.cmd run build`: PASS, Vite 5.4.21, 487 modules.
- JavaScript syntax checks for CommonScripts and the layout helper: PASS.
- Independent read-only review of the implemented helper and runtime hooks: PASS. The line/reflection share geometry, the pivot stays fixed, resizing does not accumulate scale, floor samples follow the drawn line, and camera samples remain unchanged.
- Both branded GLB SHA-256 values remain identical to the previous brand-scene review; this task changes only runtime line layout/lighting and documentation.

## Browser verification

Built preview inspected through IAB. Real screenshots captured and reviewed inline through CUA.

- 1440 × 1000: scrollY3700 shows the line extending as the wordmark enters the camera view. At scrollY4000, the full GREENTECH wordmark is visible and the line reaches below the final H. Text framing remains consistent with the prior scene; the line remains below the letters.
- 393 × 852, desktop user-agent: after resizing and scrolling to scrollY4424, the line reaches the H of the proportionally smaller wordmark. Full text and underline endpoint fit within the viewport; document scroll width is 378 pixels.
- 768 × 1024: after a second resize and scrolling to scrollY5233, the line again reaches the final H. No cumulative stretching was observed across desktop → phone → tablet resizing.
- 393 × 852, iPhone user-agent: reloaded the existing iOS scene selection and scrolled to the final process stage. The full-size iOS wordmark and beam end align at H; the beam underlines every letter.
- Console error queries returned empty arrays. User-agent and viewport overrides were reset and the normal preview was reloaded after verification.

Result: requested extension verified in desktop, tablet and both mobile viewport/model-selection cases. No repair iteration needed. Physical phone/Safari execution and performance benchmarking were not run; this is a scoped runtime/visual verification.
