# Execution contract

## Contents

1. Runtime and outputs
2. Design and test plan
3. Capture and inspection
4. Report schema and findings
5. Repairs and completion

## 1. Runtime and outputs

`scripts/workflow.py` uses Python 3.10+ standard library. `scripts/capture.mjs` uses Node with an **already installed** Playwright package and compatible browser. Package lookup checks the project's installation and `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Do not automatically install packages or browser binaries. `--help` documents arguments. If the environment has no usable temporary directory, configure `TMPDIR` to an explicitly created, writable task directory outside the application source.

After modifying workflow helpers, run `python3 -B scripts/test_workflow.py --workspace /existing/writable/temp-parent` from the skill directory. Its fixtures are explicitly synthetic: a passing unit suite validates bookkeeping, not browser capture or website quality.

Helpers support one application root at a time. Source fingerprints include application files, assets, lockfiles, and design decisions. They exclude generated/cache directories `.git`, `node_modules`, `.next`, `dist`, `build`, `coverage`, `__pycache__`, `.venv`, `.cache`, and `qa`, plus `.env*`, `.pyc`, and `.log` files. Symlinked source paths are rejected; select an explicit supported project root rather than silently omitting source. Limit: 10,000 files / 2 GB. Fingerprints are change detection, not tamper-proof signatures or proof of the running server's deployment identity.

Run the preview from the same project and verify that it serves the intended build. Changed runtime configuration, dependencies, environment, or generated build can invalidate observations even when the fingerprint is unchanged: start a fresh run after such changes. Do not put application source in excluded directories.

Generated files:

- `design/brief.md`: verified facts, audience, conversion, scope, assumptions, inputs.
- `design/direction.md`: concept, signatures, rhythm, visual/motion choices and their reasons.
- `design/tokens.json`: nonempty `colors`, `typography`, `spacing` objects; additional token groups allowed.
- `design/sections.json`: `{"sections": [...]}` mapping stable, unique section IDs to actual implementation.
- `design/reviews.json`: helper-owned review attestations and artifact hashes.
- `qa/plan.json`: planned capture cases and required checks.
- `qa/state.json`: helper-owned current-run pointer.
- `qa/repairs.json`: attempt reservations and agent-recorded outcomes.
- `qa/runs/<run>/source.json`: helper-owned source snapshot and previous-run link.
- `qa/runs/<run>/captures.json`, `captures/`: capture evidence. Never overwrite.
- `qa/runs/<run>/report.json`: agent-filled check results, visual reviews, findings.
- `qa/runs/<run>/logs/`: command receipts/logs and additional actual inspection evidence.
- `qa/report.json`, `qa/summary.md`: latest gate verdict and limitations; helper-generated.

Do not hand-edit source snapshots, review hashes, command receipts, or generated verdicts to manufacture a pass. Preserve old runs and findings. Use a new run ID for retries. If initialization finds existing contract files, use the existing contract; do not delete it to get a clean state.

## 2. Design and test plan

A section entry has `id`, `route`, `selector`, `purpose`, `component`, `responsive`, and `states`. IDs match lowercase letters/digits/hyphens, start with a letter/digit, and are at most 64 characters. `page` is reserved for the full-page screenshot. Example:

```json
{"id":"hero","route":"/","selector":"#hero","purpose":"Explain the studio's restoration service and lead to project enquiry","component":"src/components/Hero.tsx","responsive":"Stack image below the headline on mobile; preserve the subject crop","states":["default","focus","reduced-motion"]}
```

Replace the initializer's example hero and selectors with the actual section inventory. Include header/footer where visually significant. Every inventoried section requires capture coverage at mobile (width <=480), tablet (600–1024), and desktop (>=1280). Defaults: 390×844, 768×1024, 1440×1000. Add the project's breakpoint boundaries and affected widths; do not claim the original manual's ten widths were tested unless they actually were.

`qa/plan.json` contains `schema_version: 1`, `checks`, and `cases`. Required check IDs: `build`, `interaction`, `accessibility`, `performance`, `console`, `responsive`. Each check has `kind: "command" | "manual"` and `allow_na: boolean`. Add project-specific checks such as `lint`, `types`, `seo`, or `motion`. A static HTML project with no build can record a justified build `NA`; unavailable tools are `NOT_RUN`, not `NA`. Keep functional, accessibility and responsive checks applicable to usable websites.

Decide the check method and meaningful performance budgets before approving architecture. Manual accessibility evidence should include actual keyboard/focus/labels/contrast/reduced-motion observations in scope, not a blanket conformance claim. Automated scans are supporting evidence, not full accessibility certification. Performance evidence needs measured conditions/results; do not invent scores or use bundle size alone as proof of user experience.

A capture case:

```json
{"id":"home-mobile-menu","route":"/","width":390,"height":844,"reduced_motion":true,"ready_selector":"main","actions":[{"type":"click","selector":"button[aria-controls='mobile-menu']"}],"sections":[{"id":"header","selector":"header"}]}
```

Supported actions: `click` with `selector`, `press` with `selector` and `key`, `scroll` with `selector`. Use only controlled previews with mocked/disconnected external integrations. The helper blocks non-GET/HEAD requests and cross-origin navigation, but a GET, a websocket, or third-party page behavior can still have side effects. Permission and controlled fixtures remain necessary. Routes must stay same-origin. Remote base URLs require an explicit `--allow-remote` flag **and** authorization; the flag alone grants none.

Define normal and reduced-motion cases where motion applies. Add menu-open, focus, loading, empty, error, validation, and fallback cases as appropriate; use controlled fixture routes rather than real submissions. Some behavior requires the supported browser tools or project tests instead of the small capture action vocabulary.

## 3. Capture and inspection

Run `start` only after approving the three design phases. It resets all results to `NOT_RUN`, preserves findings for reverification, and refuses an existing run ID. Run the actual build via `check`; it records the command, exit code, output, and source stability without invoking a shell. Commands must be authorized and safe for the project. A command that changes included source requires a new run after reviewing those changes.

Capture waits for DOM readiness, the readiness selector, and fonts; performs bounded reveal scrolling; returns to the top; captures full pages and sections. Capture disables screenshot animations for stable stills. That is not a motion test. Long/infinite pages or pinned narratives may need additional targeted browser evidence.

Manifest shape (generated by helper; normalize real governed-browser outputs to this schema only when needed):

```json
{"schema_version":1,"run":"r01","cases":[{"id":"home-mobile","route":"/","width":390,"height":844,"reduced_motion":true,"status":"CAPTURED","screenshots":[{"path":"qa/runs/r01/captures/home-mobile-page.png","sha256":"actual SHA-256","section":"page"}],"observations":{"horizontal_overflow":false,"console_errors":[],"failed_requests":[],"broken_images":[]},"error":null}]}
```

Each case must also include every section screenshot promised by its plan. Status `CAPTURED` means capture succeeded, **not** that the page passed QA. Capture/setup failures yield `ERROR` and nonzero exit. Retain the failed evidence and retry under a new run after resolving the cause.

Open the actual images with the available image-inspection tool. Review hierarchy, brand-specific choices, text wrapping/readability, image crops, spacing, rhythm, CTA clarity, and state behavior. Inspect readable section crops, not only a tiny full-page image. Check browser observations separately. The final gate blocks recorded overflow, console errors, failed requests, or broken images; investigate them rather than emptying the arrays. If an environmental issue is outside scope, report the result as incomplete with that limitation.

## 4. Report schema and findings

The run report is pre-created with all planned checks and cases. Edit it with actual results; do not remove failed checks, cases, or inherited findings. Use these status semantics:

| Status | Meaning |
|---|---|
| `PASS` | Performed and met the planned criterion, with evidence |
| `FAIL` | Performed and found a defect |
| `NOT_RUN` | Missing tool/input, blocked, or not attempted |
| `NA` | Truly inapplicable, allowed by the reviewed plan, with rationale |

A check record: `{"id":"interaction","status":"PASS","note":"Actual tested journey and outcome","evidence":[{"path":"qa/runs/r01/logs/interaction.md","sha256":"actual SHA-256"}]}`. Manual evidence files contain exact actions, conditions, observations, and limitations. Command checks use the generated receipts; do not invent them. PASS evidence must belong to the current run. Compute hashes without retyping:

```bash
python3 "$ESA_SKILL_DIR/scripts/workflow.py" evidence --project "$ESA_PROJECT" qa/runs/r01/logs/interaction.md
```

A visual review has `case_id`, `status`, `inspected`, `reviewer`, `note`, and `evidence`. Set `inspected: true` only after opening the images. Copy the actual image paths/hashes from the manifest, omitting the `section` key in evidence entries. Include **all** captured images for that case and a concrete review note; do not auto-fill visual PASS in a script.

A finding:

```json
{"id":"F01","section":"hero","severity":"major","observed":"At 390px the enquiry label is clipped by the fixed-width button","status":"OPEN","evidence":[{"path":"qa/runs/r01/captures/home-mobile-hero.png","sha256":"actual SHA-256"}]}
```

Severity: `blocker` for unusable critical journeys or severe accessibility faults; `major` for material communication/layout/behavior defects; `minor` for concrete polish defects. Optional aesthetic alternatives are notes, not invented defects. To resolve, set `status: "RESOLVED"` and add `resolution_evidence` from the new current run. Preserve original observations and evidence.

## 5. Repairs and completion

`repair` requires an OPEN finding on the specified section with real evidence and reserves one of two attempts. It does **not** edit code: the agent applies the scoped change, starts a new run, inspects fresh captures, and records outcomes. This is agent-orchestrated automatic repair, not a deterministic aesthetic rewriting script.

Update the reserved repair row: `outcome` is `RESOLVED` or `UNRESOLVED`; `verification_run` is a fresh descendant of the source run; `note` describes observed improvement or failure. Its report must retain the same finding and agree with the outcome (`RESOLVED` with fresh resolution evidence, or `OPEN` for `UNRESOLVED`). Keep both attempts and their evidence even when a later run succeeds. Resolve the finding only after verification. Stop on budget exhaustion, repeated failure, regression, missing inputs, or new authority needs; do not reset history.

The gate checks approved artifacts, unchanged included source, planned coverage, current evidence hashes, capture observations, inspection attestations, carried findings, and repair records. Exit codes: 0 means recorded contract passed; 1 means incomplete/failed contract; 2 means malformed input or operational error. Fix malformed records and rerun; never interpret exit 2 as a pass. Missing runtime tools are a legitimate provisional outcome.

Generated summaries explicitly distinguish evidence validation from production readiness. Deliver limitations with the implementation. A full gate requires the complete current-run plan, not merely the last repaired section.
