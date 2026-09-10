# Logo G in the desktop scene

This documents the first desktop G integration. The current facade G and final GREENTECH integration is described in [brand-scene.md](brand-scene.md); use its generator for the active scene variants.

The desktop scene now uses the exact `logo_G` geometry from the existing mobile GLB. No Blender export or reconstructed geometry is required.

## Files

- Original sources, kept unchanged: `public/glb/nuclear_staffing_noHumans.glb` and `public/glb/nuclear_staffing_noHumans_mobile.glb`.
- Extracted logo: `public/glb/greentech-logo-g.glb` (7,676 bytes). Contains Draco-compressed geometry, its material and the original placement parent; it is intentionally not recentered at the origin.
- Desktop variant: `public/glb/nuclear_staffing_noHumans_desktop_g.glb` (2,197,884 bytes).
- Generator: `scripts/build-desktop-logo.mjs`.

Run from the repository root:

```powershell
node scripts/build-desktop-logo.mjs
```

The script copies the original 6,226-byte compressed G payload without decoding or re-encoding. It replaces the desktop arrow node in place, preserving every camera and animation target index. Other nodes, meshes, textures, embedded images and the original binary data remain unchanged. The old arrow geometry is left as unused binary data to avoid rewriting shared buffers; it is no longer attached to a scene node.

Both desktop URLs in `public/_astro/CommonScripts.astro_astro_type_script_index_0_lang.CZTi642d.js` point to the desktop variant: `mo.desktopUrl` and the `pa` resource manifest. Keep these references aligned because the resource cache uses a shared slug. If regenerating from different source assets, also update the manifest's `fileSize` to match the generated file.

The runtime loads the composed desktop GLB directly; it does not fetch the entire mobile scene or the separate logo to assemble the desktop scene at runtime. The existing iOS-based model selection is retained. The `logo_G` node name activates the existing floor AO correction in `greentech-floor-ao.js`, removing the legacy arrow footprint while retaining floor effects and geometry reflections.

Keep the canonical CommonScripts import URL. Adding a query string to only one importer creates a duplicate module instance and breaks the renderer's shared scene state.

The generator deliberately supports these existing static assets. Its assertions reject incompatible exports that would require additional dependency copying or different placement logic.
