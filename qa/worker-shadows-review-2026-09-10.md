# Featured worker foot shadows — targeted ESA review

Request: replace the small, misplaced original footprints beneath the enlarged animated worker.

## Inspection and implementation

- The old marks are baked into the `blocks` mesh's AO atlas. The central platform is at world Y=1, X≈23–25, Z≈24–26; the old footprint centroid is [24.05, 1, 24.96]. Independent read-only pixel inspection found the dark marks and halo within radius .7 of XZ [24,25].
- The two real soles were measured from `shoes_worker` geometry and its `cheer` animation. At scale 4 their contact footprints are approximately .64 × 1.03 world units; their centers move during the 126-frame animation.
- `greentech-worker-shadows.js` removes only the old central footprints, sampling nearby clean AO from the same atlas to preserve its tone. A top-surface and world-height mask preserves platform edges and neighboring tiles.
- Heel/toe tracks are precomputed from the same skinning matrices and weighted sole vertices used by the animated worker. The existing worker RAF interpolates the tracks with the same clock, frame wrapping and time offset; half-float bone textures are decoded when used.
- Two soft contact shadows follow those sole segments, scale with the worker and soften with distance from the platform. They are applied in the existing block material with three vec4 uniforms. No new draw calls, vertex attributes, textures, animation loops or GLB edits are introduced.

## Verification

- Standalone `npm.cmd run build`: PASS, Vite 5.4.21, 487 modules.
- JavaScript syntax checks for the helper and modified CommonScripts: PASS.
- Real 1440 × 1000 CUA screenshot of the built preview at camera progress .72: the two small original spots are gone; contact shading sits directly beneath the enlarged boots, while the platform bevels and neighboring square shadows remain intact. Worker clothing, size and camera framing are unchanged.
- Browser error query after the new build's reload: no new errors.
- Real 393 × 852 CUA screenshots with desktop and iPhone user agents: both scene variants render the colored worker and corrected platform without the two detached old marks. Existing wider iPhone framing is preserved. No new console errors were reported after either reload.
- Independent execution of the actual shadow controller on the decoded sole geometry and all 126 reconstructed animation frames: all uniforms finite. Negative time wrapping matches a full-cycle offset, and sampling the same time produces identical output independent of history. Shadow radii are approximately .352–.365, opacity .364–.400; projected capsule centers remain inside the corresponding real sole footprints.
- Half-float path tested using the bundled DataUtils conversion functions: 378 frame/interpolation samples remained finite. Maximum endpoint deviation from float32 was .000876 world units, radius deviation .00000777, and opacity deviation .00001979. Negative-time cycle equivalence was exact. This verifies the mobile texture decode path independently of browser framing.

Result: requested correction verified on desktop and mobile emulation. No visual repair iteration was required. Physical-phone/Safari execution and performance benchmarking were not run.
