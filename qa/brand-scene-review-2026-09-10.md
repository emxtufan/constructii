# Building G and final GREENTECH — targeted ESA review

Scope: replace the central building's radial badge with the supplied G and replace the final floor G with the existing GREENTECH vector lettering, extruded into the scene. Preserve the original city, cameras, scroll journey, colors and unrelated site content.

## Initial inspection and bounded adjustment

Initial candidate built successfully. IAB desktop 1440 × 1000 at scrollY 800 and 1200 showed the correct raised G on the building, without the previous radial badge. At scrollY 4000 the full wordmark rendered, but the original line bloom obscured the leading letters and the original 7-unit gold mask left the outermost stems white. At 393 × 852, scrollY 4400, the wordmark fit the viewport but the line still washed out the initial G.

Final-stage repair attempt 1, reserved before editing: move the wordmark two scene units above the line (world Z 25 → 23), retaining its center X and width; apply the existing gold activation to every wordmark glyph while keeping the floor's light radius and all other materials unchanged. Expected result: readable leading G and consistent gold across the full wordmark, with the original beam/dots retained below it. Recheck desktop, tablet, narrow desktop viewport and iPhone selection after build.

## Final verification

Repair attempt 1: RESOLVED. Fresh build and inline CUA screenshots confirm the complete G and H are readable and receive the same gold activation. The beam remains below the wordmark. No second repair was needed.

- `node scripts/build-brand-scene.mjs`: PASS. Both generated GLBs round-trip, original binary prefixes match and non-target nodes/camera/animation data are preserved. Loader manifest sizes are synchronized by the generator.
- `npm.cmd run build`: PASS, Vite 5.4.21, 487 modules. Run separately after final source/asset edits.
- Syntax checks for CommonScripts and the new responsive helper: PASS. Original source GLBs and source SVG have no Git diff.
- Independent scene review: desktop/mobile city triangles match outside the 126 removed badge triangles; the copied Draco city, original G payload and AO PNG are byte-identical to their mobile sources. G's front starts about 0.005 scene units ahead of the wall. Its orientation matches the G footprint in the atlas. The old badge rear triangles remain hidden inside the wall.
- Wordmark geometry review: 21 original SVG shapes, 22 contours after splitting a tiny existing C self-intersection, 4,692 vertices, 3,040 triangles. Cap areas, outward unit normals, triangle winding, nondegenerate Float32 output and signed extrusion volume passed. Curves retain the original paths within the configured flattening tolerance.
- IAB desktop 1440 × 1000: building G inspected at scrollY 800/1200; city buildings, turbines, workers, beam and dots remain. Final wordmark inspected at scrollY 4000 after repair: full GREENTECH lettering, gold across all glyphs, beam below the letters. Reverse scroll also exercised while framing the building.
- Tablet 768 × 1024: final stage inspected at scrollY 5233 after resize. Full wordmark fits above the beam. The existing white phase was also observed. Document scroll width 753 stays within the viewport.
- Default desktop user-agent at 393 × 852: final stage inspected at scrollY 4424 after resize. Full lettering fits with clear margins, leading G visible, beam separate; document scroll width 378 stays within the viewport. No scene reload is needed for proportional wordmark resizing.
- iPhone user-agent at 393 × 852: network confirms `nuclear_staffing_mobile_greentech.glb`, HTTP 200, 3,188,012 bytes. Building G inspected at scrollY 800 and final GREENTECH at the end of the process section. The full wordmark is visible above the beam, with the existing camera treatment retained.
- Console error queries after desktop/mobile checks returned empty arrays. Screenshots were real captures inspected inline through CUA. Viewport and user-agent overrides were reset after testing.

Final file sizes and SHA-256:

- Desktop: 5,228,408 bytes — `C4CD3C204C9FAA63E434B1A4FED9C7A6B10A28EB6F789BDA06BE1578B07DA06E`.
- Mobile: 3,188,012 bytes — `2269F0E9C68DE301CDC85491598550DB86292FF0677CED5A3F9F18ECECD0E676`.

The desktop file is larger because it conservatively preserves old buffers and adds the original 2.58 MB mobile PNG atlas. No performance benchmark, hardware-phone/Safari test or full-site reduced-motion audit was run. This review covers the requested scene branding and its responsive integration, not a whole-site certification.
