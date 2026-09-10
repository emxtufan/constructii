# Desktop G integration — targeted ESA review

The approved change reuses the existing G on desktop without editing the Blender scene. This is a scoped asset integration, not a redesign or a full-site QA certification.

## Implementation and structural verification

- `node scripts/build-desktop-logo.mjs`: PASS. Generates a standalone G and a composed desktop scene from the unchanged original GLBs.
- Standalone `npm.cmd run build`: PASS (Vite 5.4.21, 487 modules).
- Independent read-only agent review: PASS. The only replaced scene node is desktop index 1 (`arrow` → `logo_G`). Cameras, animation channels and targets, all other nodes, scenes, images, textures and samplers are identical. Original mesh/accessor/material/bufferView arrays remain exact prefixes.
- All 2,174,864 original binary bytes are preserved. G's 6,226-byte Draco payload is identical in the mobile source, extracted logo and desktop variant. Material and accessor data match after index remapping. No separate Draco decode test was run; actual browser rendering below exercises the existing decoder.
- Original GLBs have no Git diff. Generated GLB headers, lengths, bufferView ranges and alignment passed independent checks.
- World placement calculated from the parent and logo transforms differs from the original mobile placement by less than 0.000001 scene units.
- Desktop variant size: 2,197,884 bytes; 7,180 bytes larger than the original desktop GLB. Both loader references and the resource manifest size match.
- SHA-256 of desktop variant: `42adee27be48d7efec1fb251d7b5b7fa2f9e13c10a328c6ae5113fcc4b5db4e2`.

## Live browser verification

Built site served at `http://127.0.0.1:4176/` and inspected in IAB. The old tab initially showed connection refused because the preview process had stopped; after restarting the server, HTTP 200 and a fresh browser tab confirmed the current build.

- Desktop, 1440 × 1000: Network response confirms `nuclear_staffing_noHumans_desktop_g.glb`, status 200, content length 2,197,884. Initial city/buildings and workers render. No mobile scene download is needed for desktop.
- ScrollY 3700: existing tiled stage, illuminated line and dots transition toward G. At scrollY 4000 and 4250, the full G is visible with the existing gold effect, in place of the arrow. Backward scrolling updates the camera as before. No old arrow-shaped AO footprint is visible beneath G; surrounding tile shading and light effects remain.
- Responsive viewport, 393 × 852, default desktop user-agent: the desktop asset remains active according to the existing model-selection logic. The G stage renders after scrolling; document scroll width 378 is within the 393-pixel viewport. Existing overlay text and camera layout were not redesigned.
- iPhone user-agent, 393 × 852: Network confirms the original mobile GLB, status 200, content length 3,056,284. Initial city scene renders; scrollY 4400 shows the original mobile G, dots and illuminated line without the legacy arrow shadow.
- Console error queries after desktop and both mobile viewport checks returned empty arrays.
- Screenshots were captured and inspected inline through CUA. No fabricated screenshots, hardware phone/Safari test, performance benchmark or new full reduced-motion audit. User-agent and viewport overrides were reset after testing.

This change supersedes the final desktop-arrow note in `hero-shadow-review-2026-09-09.md`: desktop now contains `logo_G`, so the existing floor AO correction also runs for that variant. The helper itself and the worker path were not changed in this task.
