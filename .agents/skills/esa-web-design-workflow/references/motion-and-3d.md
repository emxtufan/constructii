# Conditional motion, 3D, and media

Read when the brief or established concept warrants advanced motion, smooth scrolling, WebGL/GLB, or video. None is a default requirement. Use the smallest technical and visual complexity that achieves the intended experience.

## Justify and specify motion

- Give each animation an intent, trigger, target, duration, easing, and completion/exit behavior. Useful intents include feedback, orientation, hierarchy, continuity, and a specific narrative change.
- Establish a coherent brand motion language. Let hierarchy influence timing: micro feedback should feel immediate; a larger sequence may take longer only if it does not block reading or action.
- Distinguish micro, component, section, and whole-experience motion. Reserve cinematic intros, extensive scroll narratives, and page transitions for focal moments rather than applying them everywhere.
- A scroll narrative needs an intelligible start, transformation, and resolution. Do not equate constant movement with storytelling.
- Favor simple transitions and existing platform/stack capabilities for simple effects. Add a library only when its benefit justifies bundle cost, integration complexity, and maintenance.
- Respect explicit client technology and visual choices. If an effect harms accessibility or essential use, explain the conflict and offer a constrained accessible treatment.

## GSAP and scroll choreography

- GSAP is a candidate for complex timelines and coordinated choreography, not a requirement for hover feedback. Check the project's installed packages and authoritative documentation before choosing integration details; do not assume plugin availability or particular APIs.
- Scope animation ownership to the component or route lifecycle. Prevent duplicate initialization and restore mutated styles/DOM when the animation scope ends.
- Manage timelines, ScrollTriggers, listeners, observers, and animation-frame callbacks explicitly. Revert/stop/remove owned resources on unmount, route changes, and responsive reconfiguration.
- Where the installed integration supports it, use lifecycle-aware helpers and context-safe callbacks. Keep browser-dependent code inside appropriate client boundaries.
- Use ScrollTrigger pins, scrub, reveals, and stagger only where they clarify progression. Avoid overlapping pins, excessive independent triggers, constant parallax, layout shifts, and motion that prevents reading.
- Account for font/image loading and layout changes before measuring trigger positions. Verify restored scroll behavior after navigation and resizing.
- Use split text selectively when headline choreography materially improves hierarchy or storytelling. Preserve a coherent accessible text representation, prevent duplicate screen-reader output, and restore splits during cleanup.
- Do not hide essential content permanently while waiting for a trigger or leave it invisible if initialization fails.

## Lenis and nonstandard interactions

- Consider Lenis only if smooth scrolling improves the chosen experience. Native scrolling is a valid final choice.
- Validate touch, keyboard navigation, anchor links, focus-induced scrolling, browser history restoration, nested scroll regions, overlays, and any scroll-animation integration. Avoid competing animation loops or multiple scroll owners.
- Do not introduce noticeable input lag or trap users in a scroll effect. Restore native behavior and clean up the scroller/listeners/loops when disabled or unmounted.
- Horizontal storytelling requires understandable progression, keyboard access, and a deliberate mobile alternative; it is not a default portfolio pattern.
- Custom cursors, magnetic controls, marquees, and page transitions need a brand-specific purpose. Preserve ordinary pointer/focus feedback, touch alternatives, text readability, and prompt navigation.

## Reduced motion and graceful fallback

- Respect `prefers-reduced-motion`, including preference changes where supported. Remove or simplify large movement, parallax, scroll scrubbing, and nonessential looping; preserve hierarchy and visible content.
- Specify the static composition before relying on animation to reveal or arrange it. Reduced motion must look finished, not like a partially played timeline.
- Provide a suitable pause/stop or static treatment for nonessential continuous motion. Avoid unexpected autoplay sound; any sound must be intentional and controllable.
- Every advanced feature needs an explicit failure/unsupported-device state: WebGL to an appropriate still or lightweight alternative, heavy models to simpler content, video to a poster, animation to a readable static layout.
- Keep primary content and actions outside enhancement-dependent rendering when practical. Loading, initialization failure, and fallback must not produce a blank hero, trapped navigation, or unusable page.

## Three.js / WebGL art direction

- Use 3D when it improves product understanding, spatial interaction, storytelling, or a specific brand signature. Do not add an arbitrary floating object as proof of technical sophistication.
- Define materials, lighting, environment, camera, framing, movement, interaction, and relationship to typography. The model belongs to the composition, including at mobile sizes.
- Separate the meaningful product/content experience from optional rendering. Provide accessible text and controls for relevant information and interaction.
- Budget device pixel ratio, renderer resolution, geometry/material counts, texture resolution, draw calls, shadows, postprocessing, and animation complexity against measured target-device behavior.
- Render on demand when possible; pause unnecessary work offscreen or when the document is hidden. Do not leave continuous loops running for static content.
- On teardown dispose of owned geometries, materials, textures, render targets, controls, and renderer resources; stop loops and remove listeners. Respect shared-resource ownership rather than disposing assets another mounted view still uses.
- Test failure and recovery, including unavailable WebGL or context loss, without losing core content or actions.

## GLB preparation and loading

- Inspect geometry, scale/orientation, materials, texture paths, animations, cameras, lighting/environment assumptions, file size, and browser rendering before integrating the asset.
- Choose compatible optimizations based on the bottleneck: geometry simplification, texture resizing/compression, and appropriate glTF compression tooling such as Draco or Meshopt. Verify decoder support and compare visual quality and load/render cost after changes.
- Reserve the model's layout space and choose a loader, poster, progress indicator when meaningful, controlled reveal, and error fallback. Avoid sudden appearance, flashing textures, incorrect cameras, and unlit gray objects.
- Defer noncritical 3D/code/assets where useful; do not make essential copy or actions wait for model loading. Avoid artificial cinematic delays.
- Mobile may need lower DPR, fewer shadows/effects, lighter geometry/textures, simpler interactions, or a static composition. Select from observed capability and performance rather than assuming a desktop scene is acceptable everywhere.

## Video

- Choose video only when motion conveys something a still cannot. Define crop, compression, loading, responsive delivery, poster, controls, and fallback.
- Treat autoplay as conditional; support blocked playback without an empty surface. Use muted playback where required by the chosen behavior, and never start audible media unexpectedly.
- Provide accessible media alternatives such as captions or a transcript when the video's information requires them. Decorative media should not obscure text or create an uncontrollable distraction.

## Evidence before claiming performance

- Measure representative desktop and constrained mobile conditions. Record the test environment and observations instead of asserting universal smoothness or production readiness.
- Inspect image/font/model transfer size, JavaScript cost, critical-content appearance, layout shifts, long tasks, frame stability, GPU/render workload where observable, and memory over repeated navigation/remounts.
- Prefer transform/opacity for routine animation; profile effects that animate layout, filters, shadows, or large painted areas rather than assuming they are inexpensive.
- Exercise route changes, responsive changes, overlays, reduced motion, touch/keyboard use, slow/failed asset loads, and repeated mount/unmount. Check duplicate animations, stale triggers, retained listeners, active loops, and unreleased resources.
- If an effect causes missed input, unreadable content, persistent jank, or unacceptable loading, simplify it or use the fallback. Report unmeasured behavior as unverified; do not invent scores, frame rates, or benchmark results.
