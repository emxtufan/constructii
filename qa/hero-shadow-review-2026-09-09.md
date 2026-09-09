# G model — legacy arrow shadow removal

Targeted ESA scene correction requested by the user: remove the previous arrow's shadow below the replacement G, or adapt that shadow. Implemented local removal; no new synthetic G shadow was added.

## Finding and change

The active replacement GLB contains `logo_G`, but its embedded `AO_Bake_Floor` texture retains the previous arrow footprint. The original texture was extracted without alteration to `qa/hero-shadow-inspection/original-1.webp` and visually inspected. The arrow is isolated in the lower-left atlas region, away from the other buildings' baked shadows.

`public/_astro/greentech-floor-ao.js` neutralizes only that footprint in the floor shader, using a feathered UV mask (U 0.10–0.26; V 0.87–0.98). The shader samples the texture's actual UV channel. `class ka` in CommonScripts activates this correction only when `logo_G` exists and the floor has a texture. Other scene materials, current geometry reflection, floor lights and animated dots remain on their original paths.

The GLB, its geometry, embedded image bytes, and original desktop asset were not edited. SHA-256 of `nuclear_staffing_noHumans_mobile.glb`: `DC5158F0F8B941E1FF2F643DADEEF06F74C11FA74BADFB91D15C75102B8AFEF4`.

Keep the canonical CommonScripts URL: renderer.C_wI7OdU.js imports that same module. An initial query-string cache-busting attempt created a second ESM instance and a blank scene; it was removed, the project rebuilt, and actual scene rendering reverified. Future deployment cache changes must account for both import directions.

## Verification

- `node --check` passed for the helper and modified CommonScripts.
- The unique import, scene detection and floor shader hook were asserted against current source. The model still contains `logo_G`.
- Standalone `npm.cmd run build`: PASS, Vite 5.4.21, 487 modules. A preceding multi-command shell invocation hit the environment's esbuild access error; the supported standalone build succeeded.
- IAB with an iPhone user-agent selected the existing G asset. At 1280 × 900 and scrollY 3500, real before/after screenshots were inspected: the original dark arrow footprint inside and behind G disappeared. The surrounding tiled objects, their shading, dots and illuminated line remained visible.
- At 393 × 852, scrollY 3500 showed the adjacent tiled stage still shaded. At scrollY 4400, the G stage was visible without the old arrow footprint; its color animation and dots remained active.
- Current preview console error query returned an empty list. Existing no-camera/deprecation warnings were not addressed by this scoped task.
- Screenshots were captured and inspected inline through CUA, not fabricated or replaced by build evidence. No hardware phone/Safari test or performance benchmark was performed.

The existing model-selection logic is preserved. The desktop GLB still contains the original arrow and does not satisfy the `logo_G` guard; its valid shadow is not erased. The worker path is not enabled by the current bootstrap. This task does not replace that desktop asset or enable the missing worker bundle.
