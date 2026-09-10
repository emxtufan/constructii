# Featured worker colors — targeted ESA review

Request: make the central worker recognizable against the light scene through color. Preserve the user's current scale of 4, overhead camera focus and the final wordmark/underline.

Direction: yellow hard hat, orange vest with pale reflective bands, dark teal workwear, dark boots and warm skin tones. Only the featured worker receives the treatment.

## Asset inspection

The supplied workers.glb has separate hat_helmet and shoes_worker meshes, while the body, head, arms, hands and trousers share _man. It has no materials, textures or vertex colors. Draco geometry was inspected read-only. In bind pose Y is height and Z is lateral; masks must distinguish low hands from trousers. No GLB changes are needed.

## Repair: preserve the renderer's vertex-buffer budget

The initial implementation added one vertex color buffer and one instance appearance buffer. Build and syntax checks passed, but a real 1440 × 1000 browser capture showed the worker missing. The console reported: "Vertex buffer count (10) exceeds the maximum number of vertex buffers (8)."

Cause: the original animated instancing pipeline already uses eight vertex buffers. Reserved bounded repair: compute the palette from the existing raw POSITION attribute in the shader and pack appearance into the fourth component of the existing tint instance buffer. This retains the original eight-buffer layout, geometry, skinning and instance count. Recheck live rendering, angled/overhead color placement, desktop/mobile, and console errors.

## Repair 2: correct the compiled color adapter

The buffer-limit error was removed, but the next browser run reported invalid fragment shader modules. Independent inspection traced this to the compiled alias `j`: it is TSL vec3, not color(). Reserved second repair: convert hex values through the existing Three Color constructor `xe`, then supply the Color to vec3. This also performs the correct sRGB-to-linear conversion. No layout, lighting strength or palette changes are required. Recheck the actual rendered shader and console before accepting the result.

Adapter correction detail: this bundled TSL requires the three numeric Color components, `vec3(rgb.r, rgb.g, rgb.b)`. Passing the Color object directly tags it as a vec3 constant with missing x/y/z and renders black. The completed adapter explicitly supplies the linear RGB channels.

## Final verification

- Production build: PASS (`npm.cmd run build`, Vite 5.4.21, 487 modules).
- Syntax checks on the palette helper and CommonScripts: PASS.
- Independent read-only review: verified the packed vec4 instance lifecycle, raw bind-position masks and final numeric RGB adapter. The original eight vertex buffers are retained; no asset positions, skinning, animation data or GLBs are changed.
- Real CUA screenshots, 1440 × 1000: at progress .72 the worker displays a yellow helmet, orange vest with light bands, dark sleeves/trousers/boots, and skin-colored hands. At .8 the helmet, raised hands and orange torso remain clearly distinguishable from the cream squares in the centered overhead view.
- Real CUA screenshot, 393 × 852: the angled view retains a recognizable colored worker and the clothing follows the cheering pose. Document scroll width is 378 pixels, with no horizontal overflow.
- Error log checks after the final corrected reload returned no new errors. Earlier failed-run errors remain in the browser's log history and are documented above; they were not treated as errors from the corrected source.
- Final 393 × 852 overhead capture: the yellow helmet and two raised hands are clearly visible against the square platform. The scene continues animating without material compilation errors. Normal viewport restored after checks.

Result: color treatment verified on desktop and in mobile viewport emulation after completing the two scoped renderer/adapter repairs. Original GLB files, camera focus and underline code are unchanged by this color task. Physical mobile hardware, Safari/WebGL-specific execution and performance benchmarking were not tested.
