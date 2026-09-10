# Worker focus and thinner underline — targeted ESA review

Request: center the featured worker during the overhead view, enlarge it, and thin the luminous line after it exits the square grid while retaining the full GREENTECH underline.

## Initial implementation

- Featured cheering worker scale: 2.5. Its original placement and the surrounding workers remain unchanged.
- Camera target blends toward the worker over progress .68–.74, holds through .815 (the original overhead rotation finishes at .785), and blends back by .9. Pointer parallax fades out with the same weight.
- Final tube tapers from its original radius to 28% over world X36.55–39.55, after the grid edge. The reflected tube shares the same geometry. UV reveal and the responsive endpoint at the H remain unchanged.
- Syntax checks and standalone production build passed. Independent read-only source review found no correctness issue.

## Repair 1 — framing and underline visibility

Observed through real CUA screenshots of the built preview:

- Desktop 1440 × 1000, progress .72: enlarged worker stands on the raised square; no visible floating feet or clipping.
- Desktop and 393 × 852 overhead: horizontal centering is fixed, but the cheering figure's visible center sits above its placement origin. Camera targeting the feet leaves the figure roughly 35–45 pixels high in the frame.
- Desktop and mobile final wordmark: the 28% radius is suitably thin, but the initial 24% light gain makes its far end hard to distinguish against the illuminated floor.

Bounded repair: target a stable point .75 world units toward the top of the figure (Z), without following animated bones or moving the worker; increase the final light gain to 60%, retaining the 28% radius. Recheck overhead centering, the angled transition, and underline visibility at desktop and phone sizes, including the iOS model selection.

## Final source verification

- Standalone `npm.cmd run build`: PASS, Vite 5.4.21, 487 modules.
- `node --check` on the focus helper, wordmark helper and CommonScripts: PASS.
- Independent source/numeric review after the repair: PASS. Focus is a stateless function of progress and is continuous at all four boundaries; forward and reverse scroll produce the same target. The anchor is fixed at [24, 1.1, 24.55]. Original camera targets are fully restored at .9, leaving the final wordmark framing intact.
- Both branded GLB SHA-256 hashes still match the brand-scene review: desktop `C4CD3C204C9FAA63E434B1A4FED9C7A6B10A28EB6F789BDA06BE1578B07DA06E`, mobile `2269F0E9C68DE301CDC85491598550DB86292FF0677CED5A3F9F18ECECD0E676`.

## Final browser verification

Real screenshots of the built preview were captured and inspected inline through CUA.

- 393 × 852, desktop user-agent: overhead figure is centered horizontally and sits close to the vertical midpoint after the fixed-anchor adjustment. Helmet and arms are distinguishable. At the final stage, the thin luminous line remains visible beneath the entire GREENTECH wordmark and ends at H. Document scroll width: 378 pixels; no horizontal overflow.
- 393 × 852, iPhone user-agent: scrollY3872 shows the worker centered during the overhead view; the existing iOS camera remains wider than the non-iOS camera. Reverse scrolling back from the final wordmark passes through the enlarged standing worker and returns to the same centered overhead stage. The final wordmark and thinner underline were also inspected at scrollY4462. Console error queries returned no errors. This checks the iOS asset/camera branch in Chromium emulation, not execution on physical Safari hardware.
- 1440 × 1000 after the repair: the enlarged worker's silhouette is centered near the viewport midpoint in the overhead frame. The final thin line remains luminous, runs under the complete wordmark and ends at H. Console error query: empty.

Result: PASS after one bounded refinement. Normal user-agent and viewport restored after verification. No physical-device testing or performance benchmark was performed.
