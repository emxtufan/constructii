# Scene branding: building G and GREENTECH

The central building uses the original raised G geometry. The last scene stage uses the GREENTECH lettering from the existing `public/img/greentech-logo.svg`, extruded into a 3D mesh. No Blender export, replacement font or extra runtime dependency is needed.

## Regeneration

From the repository root:

```powershell
node scripts/build-brand-scene.mjs
npm.cmd run build
```

Run the build as a separate PowerShell command. The generator creates `public/glb/nuclear_staffing_desktop_greentech.glb` and `public/glb/nuclear_staffing_mobile_greentech.glb`, and updates their byte counts in the existing CommonScripts resource manifest. Both the prefetch URLs and resource URLs must continue to refer to these variants.

Original `nuclear_staffing_noHumans.glb`, `nuclear_staffing_noHumans_mobile.glb` and the SVG stay unchanged. The older `build-desktop-logo.mjs` remains the extraction utility for the standalone G and the first desktop-only variant; it is also imported by the current generator without executing its CLI.

## Source preservation

- The source mobile city matches the desktop city except for the 126 removed triangles of the old radial building badge. `building-badge.mjs` copies its original compressed geometry and AO atlas into the desktop variant, preserving the rest of the city. The old badge's buried rear faces remain behind the wall.
- The G on the facade instances the exact original Draco G. Its transform matches the existing G footprint in the mobile AO atlas. It sits slightly ahead of the wall, facing outward.
- `wordmark-geometry.mjs` reads the first outer SVG group, including 21 original letter shapes and their transforms. It flattens curves within 0.005 SVG units and extrudes them with outward normals. Runtime typography does not depend on a downloaded font. The generator validates cap area, face winding, nondegenerate Float32 triangles and extrusion volume.
- Cameras, animation targets and unrelated nodes remain unchanged. Original buffer bytes are kept as prefixes; unused old geometry is intentionally retained to avoid rewriting shared source data.

## Placement and runtime

The wordmark's default width is 16 scene units. It sits at X 59, Z 23, two units above the beam so bloom does not obscure the leading letters. It uses the scene's material and gold activation; only the wordmark bypasses the old circular letter-color mask. Floor lighting, dots, the original gold radius and other materials are unchanged.

`public/_astro/greentech-wordmark-layout.js` adjusts the wordmark and its reflection together through the existing scene initialization/resize lifecycle. It adds no event listener or animation loop. Non-iOS narrow viewports reduce the wordmark proportionally; iOS retains the original wider camera treatment and base wordmark scale. The model-selection logic is unchanged.

The same helper extends the last luminous tube and its reflection to the wordmark's actual rightmost world-space bound. It scales the straight tube around its original X24 start, preserving UV progress. Past the grid's X36.55 edge, the tube tapers smoothly over three world units to 28% of its original radius; its color/emissive gain also transitions to 60% so the thinner line remains luminous. Geometry is recalculated from the original positions on resize, preventing cumulative tapering, and the reflection shares the same geometry. The camera path retains its original X24–55.5 curve; only the visible line and floor-light points extend. Floor-light samples use `getPointAt()` to match the tube's arc-length UV animation. Resizing recomputes the endpoint from the text bounds, so the entire wordmark remains underlined on both desktop and mobile.

`public/_astro/greentech-scene-focus.js` holds the featured worker and underline settings. Only the cheering worker at [24, 1.1, 25.3] changes scale; its current user-selected scale is 4. After sampling the camera path, `focusWorkerStage()` blends its target toward a stable anchor .75 world units behind the worker's placement along Z, centering the visible figure during the overhead view. Focus ramps up over progress .68–.74, remains full through .815, then blends back by .9. Pointer parallax uses the inverse focus weight, preventing drift while the worker is centered. No animated bone tracking, extra listener, or animation loop is introduced; the city intro and final wordmark frame retain their existing camera targets.

The facade node retains the name `logo_G`, so the existing floor AO helper continues to clear the old arrow footprint. Keep the canonical CommonScripts import URL shared by App and renderer; do not introduce a second ESM instance through a one-sided query string.

## Featured worker colors

The featured worker keeps the user-selected `scale: 4` and sets `appearance: 'construction'` in `greentech-scene-focus.js`. `greentech-worker-colors.js` contains the editable palette: yellow hard hat, orange vest with pale bands, dark teal workwear, dark boots and skin tones. Body masks use the original POSITION attribute before skinning (Y is height, Z is lateral), so the clothing follows the animated figure. Hat and footwear use their existing separate mesh parts.

The worker material packs the appearance switch into the fourth component of the existing `aWorkerTint` instance buffer. Add/update/swap-remove preserve all four components. The original pipeline already uses eight vertex buffers; do not add separate clothing or appearance buffers. The shader mixes the new material only for the featured worker, leaving surrounding people and the existing monochrome reflection unchanged. Hex palette values are converted through Three Color and passed to TSL vec3 as three numeric linear RGB channels; this bundled TSL does not read a Color object as a vec3 constant. No GLB edits, extra draws, animation loops or dependencies are needed for the color treatment.

## Foot contact shadows

`greentech-worker-shadows.js` replaces the original small baked footprints on the central `blocks` platform (world center [24, 1, 25]) with two animated contact shadows. A localized top-surface mask clears the old marks using a clean AO sample from the same atlas, preserving the tile bevel and surrounding shadows.

`WorkerContactShadows` precomputes heel/toe tracks from `shoes_worker` sole vertices and the existing bone texture. The worker's existing RAF updates three vec4 uniforms with the same time offset, FPS, interpolation and modulo used by GPU skinning. The calculation handles both float and half-float bone textures and applies the configured worker scale and rotation. Soft shadow capsules darken only the platform top and become softer as the sole moves away from it. This does not add mesh draws, vertex attributes, textures or shadow maps. The receiving platform height is currently fixed at world Y=1; update that constant and the cleanup bounds if the platform itself is relocated.

The conservative desktop variant is approximately 5.23 MB because it includes the original mobile PNG atlas and retains the original desktop buffers. The mobile variant is approximately 3.19 MB. These are transfer sizes, not a performance certification.
