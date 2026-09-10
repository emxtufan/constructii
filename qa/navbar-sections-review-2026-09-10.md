# Navbar section alignment — 2026-09-10

Targeted ESA workflow review of `src/components/Header.jsx` and `Header.css`.

## Implementation

- Build the full menu from rendered `main section[id]` and `footer[id]` elements, in DOM order. Internal heading/form IDs and commented-out sections are excluded.
- Romanian labels are mapped centrally; new sections may provide `data-nav-label`.
- Keep the desktop shortcuts and quote CTA, with the complete menu available on desktop and mobile.
- Use the same discovered section list for current-section highlighting. Preserve anchor offsets, focus transfer, loader-aware hash restoration, background scroll containment, and keyboard navigation.

## Actual verification

- PASS: `npm.cmd run build` (Vite 5.4.21, 487 modules); `git diff --check` (line-ending warnings only).
- PASS: the live preview at `http://127.0.0.1:4176` exposes 12 menu links, each resolving to an existing section: `acasa`, `proces`, `servicii`, `proiecte`, `ground-to-home`, `engineering-precision`, `before-current`, `de-ce-noi`, `intrebari`, `contact`, `final-statement`, `site-footer`.
- PASS: clicked all 12 actual menu links. Hash, selected menu item, target focus, and menu closure matched each destination. Section tops settled near 92px on desktop and 86px on mobile; home settled at 0. The footer title remained visible below the navbar.
- PASS: inspected real browser screenshots of the menu at 1440×1000, 901×650, 768×1024 and 393×852. Desktop has two columns; tablet/mobile has one scrollable column. No horizontal document overflow at these widths. The 393px panel scrolls to the final CTA.
- PASS: opening focuses the first menu link; Escape closes and restores focus to the toggle. Tab wraps from the final CTA to the brand; Shift+Tab wraps back. Destination navigation restores body overflow and keeps focus on the destination heading.
- PASS: changing from 393px to 901px while open closes the menu and restores body overflow/focus.
- PASS: at 768×1024 with reduced motion, panel animation is `none`; FAQ navigation succeeds. Reloading `#intrebari` restores its position and heading focus after the loader finishes.
- PASS: no new console error entries during this verification window.
- Browser media and viewport overrides were reset afterward. Screenshots were inspected through the governed browser tool; no screenshot files or full-site gate are claimed by this targeted note.

## Boundaries

Browser viewport emulation was used; physical phone, screen reader, performance profiling and a fresh whole-site audit were not run. The section list is discovered at mount; future asynchronously mounted sections would require refreshing that list. Existing commented-out sections and unrelated 3D changes were preserved.

Reviewed source SHA-256:

- Header.jsx: `E5BB047E2C98502FFF2EFB15D2D86DAC0413A5888BB96C10F1E925FCB4127A5B`
- Header.css: `4869F5EEFC587F8F8F7320FB3EEDF55D8321CC689B5AADA55ACE5276E79969BC`
