# Footer legal modals — targeted ESA review

Scope: three text buttons beside the existing Esa Coder Solutions copyright, opening Romanian Cookies, Privacy and GDPR documents. Existing footer artwork, curtain behavior, user-commented controls and other sections were preserved. This is a targeted feature review, not a whole-site workflow gate or legal compliance certificate.

## Implementation and facts

- `src/data/legal-policies.js` contains all document copy, official references and the user-confirmed `contact@greentechrealestate.ro` address.
- `legal-modal.jsx` uses a native dialog in a body portal, rendered as a React sibling of the footer so modal focus does not bubble through its reveal handler.
- Native modal behavior makes the background inert. Explicit Tab/Shift+Tab boundary handling keeps keyboard navigation inside; Escape, both close buttons and backdrop click dismiss the dialog. Focus returns to the invoker.
- Internal scrolling has Lenis prevention and contained overscroll. Capture listeners prevent the legacy second scroller from consuming wheel/touchmove events. Previous overflow, scrollbar gutter and Lenis state are restored on cleanup. Gutter reservation must happen before Lenis.stop(), which itself hides the scrollbar.
- No dependency or form submission integration was added.

Read-only source audit: the quote form generates a React-state summary; clipboard writes occur only on the copy action; mailto opens an email draft and the user sends it externally. No active analytics/marketing integration was identified in examined application/runtime code. This is not a claim that every future production host sets no cookies.

The runtime uses a sessionStorage recovery marker, `vectr-loader-reload-once`. The imported apply stylesheet includes Google Fonts Roboto. Legacy localStorage form helpers are guarded by absent `.apply-modal` / `#request-crew-form` elements and are not the current quote form.

## Current-source verification

Build: **PASS**, `npm.cmd run build`, Vite 5.4.21, 487 modules. Served bundle verified through page script DOM: `index-CX6QcUq_.js`; CSS `index-C28pDB3g.css`.

Real IAB screenshots were captured and inspected inline in the task; no on-disk screenshot manifest was generated. These are actual visual checks, not build-derived claims.

| Check | Result / observations |
| --- | --- |
| Desktop 1440 × 1000 | Cookie and Privacy modal headers, text region, close controls and email visible. All three footer triggers exercised. Copyright and legal links share a row. |
| Tablet 768 × 1024 | GDPR dialog inspected at 713 × 840, inside viewport, with no horizontal overflow. |
| Mobile 393 × 852 | Privacy document readable; internal wheel scroll reached 1156 while background scrollY stayed 15131. Extra wheel at text boundary and on backdrop left background unchanged. |
| Narrow 320 × 740 | GDPR dialog 281 × 716 inside viewport. Footer legal links wrap; email and lower close button wrap without clipping. Dialog horizontal overflow false. |
| Scroll lock regression | At 320px, body width stayed 305 and scrollY stayed 14965 on close; gutter returned to previous empty inline value. At desktop, open-dialog body width remained 1425. |
| Keyboard | Tab from final close returns to top close; Shift+Tab from top close returns to final close. Both observed inside dialog. Escape closes and restores triggering footer button. |
| Dismissal | X, lower close, Escape and backdrop click exercised. Restored body overflow and focus verified. |
| Reduced motion | Computed modal animation `none`, transform `none`; title focused; Escape worked. Media/viewport overrides reset afterward. |
| Console | Current preview error log returned an empty list. |

Integration findings resolved during implementation: (1) a semantic header inherited legacy global fixed/translated header styles and clipped the modal title; a scoped div preserves heading semantics without that selector collision; (2) scrollbar removal changed page width on emulated mobile; gutter reservation now precedes stopping Lenis and is released after scroll restoration. Native focus initially traversed browser chrome at dialog boundaries; explicit internal cycling was added and verified.

## Limits and remaining content inputs

- Hardware touch gestures and screen-reader testing: **NOT_RUN**. This environment does not expose touch dispatch; mobile viewport layout plus mouse-wheel/keyboard interaction were tested.
- No live email was sent and no quote submitted during QA.
- Legal operator name/address, processing bases, actual hosting/email providers, recipients, transfer arrangements and retention rules remain unconfirmed. Privacy explicitly identifies itself as a version in progress until these facts are supplied. Copyright is not used as proof of operator identity.
- Official links embedded in the documents: ANSPDCP rights/complaints pages, Your Europe cookie guidance, EDPB rights guidance. Their use supports the rights explanation; it does not verify this company's undisclosed processing practices.
- Existing 300px mobile logo / marquee composition at 320px was not redesigned by this limited legal-links task.

Final source SHA-256 for policy data: `A446791C2533DDFF345604BF5775C3A0BEE6E4279D551D745AA8C27FE599B443`.
