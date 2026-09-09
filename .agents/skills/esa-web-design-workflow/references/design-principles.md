# ESA design principles

Use for art direction, composition, content, and visual critique. The target is a site that feels designed for this client, works in use, and remains maintainable—not merely a distinctive screenshot.

## Client-specific direction

- Connect design choices to the actual offer, audience, positioning, desired emotion, and primary user action. An industry label is not a visual concept.
- Express the direction in one concrete sentence describing composition, typography, imagery, and pacing. “Modern and premium” does not decide anything.
- Preserve explicit client choices and the established design system. Treat these principles as judgment aids, not permission to replace requested fonts, colors, layouts, content, or technology. Explain a consequential usability conflict and propose a scoped alternative.
- Accessibility is a hard constraint, not a lower-priority aesthetic preference. Do not trade it away for visual novelty, motion, or conversion.
- Spend the page's complexity budget selectively: expressive typography, intricate layout, rich imagery, motion, and 3D need not all compete. One or two coherent brand signatures usually have more effect than many decorations.

## Content, trust, and conversion

- Organize information around user questions and objections. Make the primary objective clear; subordinate secondary actions rather than repeating equally prominent CTAs throughout the page.
- Give every section a specific purpose, message, visual role, and relationship to its neighbors. Do not infer a mandatory hero/cards/testimonials/pricing/FAQ sequence from the business category.
- Write concrete benefits, real features, and supported differentiators in the client's voice. Generic claims such as “unlock your potential” are not substitutes for knowing the offer.
- Never fabricate clients, reviews, testimonials, certifications, awards, statistics, addresses, guarantees, project results, or other trust signals. Omit unsupported claims or ask for the missing evidence.
- Clearly distinguish temporary development fixtures from approved content; do not leave placeholders or fictional trust signals in a claimed production-ready result.
- Portfolio case studies should explain the problem, approach, design/technical decisions, and substantiated outcome. Reuse infrastructure without forcing every project's story into an identical composition.

## Visual system

- Choose typography for brand personality and reading requirements. Familiar fonts are allowed when deliberate; an unfamiliar font is not inherently better.
- Define meaningful display, heading, body, caption, navigation, and action roles. Control measure, line height, weight contrast, and important headline breaks; review widows and awkward wrapping at different widths.
- Build a palette with semantic roles: backgrounds/surfaces, primary/secondary text, accent, borders, interactive states, and feedback. Test contrast across real imagery and interactive states, not just swatches.
- Centralize project-specific typography, color, spacing, container widths, radii, shadows, and transition tokens. Use consistent spatial relationships without forcing all clients into the same token values.
- Let radius, borders, shadows, and texture communicate the chosen visual language. Avoid identical rounding, containment, or shadows on unrelated elements.
- Use a coherent icon family and only add icons when they clarify meaning or interaction. Do not use icon decoration to compensate for weak content.
- Load only the font families, weights, and subsets the design needs; account for font loading in line wrapping and layout stability.

## Composition and rhythm

- Establish a clear focal point and reading path. Secondary text, decoration, and actions must remain secondary.
- Use grids as organizing tools. Asymmetry, offset columns, overlap, full-bleed imagery, or editorial rows should express a reason—not random irregularity.
- Alternate density, scale, image/text emphasis, and quiet/active moments when the content benefits. Preserve system-level consistency without repeating the same section silhouette.
- Use negative space to group, separate, emphasize, or pace content; neither fill every gap nor add empty space simply to imply luxury.
- Before using a card, ask whether containment improves comprehension or interaction. Consider rows, lists, timelines, numbered sections, and image/text compositions when it does not.
- Connect sections through alignment, typography, color, imagery, or a recurring motif. Avoid isolated visual systems within one page.
- Backgrounds must support legibility and hierarchy. Depth may come from scale, overlap, imagery, or typography, not just shadows.

## Header, hero, and navigation

- Design the header in relation to the hero: identity, navigation, primary action, initial contrast, scroll behavior, and menu-open state. Animate or transform it only when the behavior helps orientation or space use.
- Navigation must make the current location and available destinations understandable. Keep essential navigation discoverable and active states clear.
- The hero should answer what visitors see first, understand first, feel, and do next; plan the transition into the first scroll. Centered, split, editorial, image-led, or other layouts are choices, not defaults or bans.
- Use one dominant hero action when appropriate. Complete default, hover, focus, active, and disabled states where applicable; use links for navigation and buttons for actions.
- Design mobile navigation as its own usable interaction. Provide keyboard/touch operation, an accessible toggle state, Escape dismissal when appropriate, deliberate focus handling, and scroll locking that is released on close/unmount.
- For modal menus, contain focus while open and return it to the opener when closed. Do not hide essential links behind decorative gestures.

## Imagery and responsive composition

- Select imagery by subject, authenticity, emotional tone, quality, color, and its role in the composition. Treat it as content rather than filler.
- Set aspect ratios and focal points intentionally; review responsive crops instead of applying `object-fit: cover` blindly. Do not crop away the subject or place unreadable copy over it.
- Deliver suitable dimensions, compression, formats, and responsive sources. Reserve media space to avoid layout shifts; do not defer the critical hero image in a way that harms its appearance time.
- Redesign composition across desktop, tablet, and mobile: order, navigation, headline breaks, image ratios, CTA placement, spacing, and interactions. Merely eliminating overflow is insufficient.
- Test narrow phones, tablets, large screens, and widths between breakpoints. Treat source-manual widths as examples, not a substitute for content-driven breakpoints.
- Essential interactions need keyboard and touch equivalents; never depend exclusively on hover. Keep touch targets comfortably operable and interactive content reachable with zoom/reflow.

## Forms, states, and footer

- Keep forms proportionate to the objective. Use persistent labels; placeholders are optional hints, not labels.
- Design validation, pending, success, failure/retry, and disabled states where applicable. Preserve user input on recoverable failures and clearly connect errors to their fields.
- Do not represent a disconnected form as successfully submitted. Only show confirmed outcomes supported by the actual integration.
- Finish the footer as part of the same composition. Decide what visitors should do at the end and reinforce that action with relevant, real contact/navigation/location information.
- A large wordmark, final CTA, or social links are optional choices, not a mandatory footer checklist. Avoid dead links and invented contact details.

## Accessibility and anti-template critique

- Use semantic structure, a coherent heading hierarchy, descriptive links, appropriate image alternatives, visible focus, accessible labels, keyboard operation, sufficient contrast, and reduced-motion support. Prefer native semantics to unnecessary ARIA.
- Keep content understandable when enhancement fails or motion is disabled; ensure menus, forms, and controls have usable non-default states.
- Mentally remove the logo: identify which typography, imagery, language, layout, or detail still belongs to this client. Weak differentiation prompts a targeted improvement, not an unsolicited wholesale redesign.
- Question repeated card grids, pills, gradients, glass, glow, stock imagery, decorative icons, and arbitrary dark themes when they lack a client-specific reason. These are heuristics, not forbidden styles.
- Check whether every visual flourish improves communication, emotion, hierarchy, or interaction. Remove unsupported decoration and unnecessary complexity within the agreed scope.
- Judge the whole page in use: reading order, recognizable identity, visual rhythm, responsive decisions, complete states, and speed. Fix specific defects rather than declaring it “modern and professional.”
