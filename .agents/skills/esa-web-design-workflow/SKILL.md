---
name: esa-web-design-workflow
description: Design, build, and visually refine brand-specific websites using ESA Coder Solutions standards, executable phase gates, real screenshots, and bounded section repairs. Use for new websites, substantial visual redesigns, or requested frontend visual audits; not unrelated backend work or design-free code fixes.
---

# ESA Web Design Workflow

Turn a client-specific concept into a usable website, then demonstrate what was checked. The agent makes design decisions; scripts manage workflow and evidence, not aesthetic judgment.

## Scope

- Use the full workflow for a new website or substantial redesign. For a narrow visual change, preserve the existing system and use targeted inspection and regression checks; do not manufacture a full discovery exercise.
- For review-only requests, inspect and report. Do not modify application code or initialize files in the user's project without authorization. The complete-build gate is not an audit-only certificate.
- Preserve explicit user requirements, existing files, content, framework, and assets. Propose material changes instead of silently substituting your aesthetic preference.
- Follow the environment's applicable website-building/preview skill, including Sites where required. This skill adds design and QA discipline; it does not replace browser, authentication, deployment, or storage rules. Do not publish, install dependencies, submit live forms, or mutate external services merely to complete QA.
- If rendering or inspection is unavailable, record `NOT_RUN` and deliver a provisional result. Never invent screenshots, measurements, successful interactions, or business facts.

## References and tools

Read [design-principles.md](references/design-principles.md) before art direction. Read [execution-contract.md](references/execution-contract.md) completely before running helpers or writing QA records. Read [motion-and-3d.md](references/motion-and-3d.md) only when motion, video, smooth scrolling, or 3D is relevant.

Set `ESA_SKILL_DIR` to this skill's actual directory and `ESA_PROJECT` to the authorized application root. Commands do not install dependencies.

## Ordered workflow

| Phase | Required output | Exit condition |
|---|---|---|
| Understand | `design/brief.md` | Objective, audience, scope, verified facts, assumptions, missing inputs |
| Direct | `design/direction.md`, `design/tokens.json` | Client-specific concept; deliberate type, palette, imagery, rhythm; optional technology decisions |
| Architect | `design/sections.json`, `qa/plan.json` | Stable section IDs and route/component/selector mapping; responsive behavior, states, checks |
| Implement | Application source and relevant tests | Static semantic experience and critical journey work before optional effects |
| Audit | `qa/runs/<run>/source.json`, `captures.json`, `report.json`, screenshots/logs | Current-source evidence and actual visual, functional, accessibility and performance inspection |
| Repair | `qa/repairs.json`, scoped source edits | Fresh verification of failures and indirect effects; at most two attempts per section |
| Handoff | `qa/report.json`, `qa/summary.md` | Evidence-backed result and explicit limitations |

### 1–3. Establish the contract

Inspect the project, available commands, runtime, assets, and existing changes. Ask only for missing decisions that materially affect the result. Presentation assumptions are acceptable when stated; fabricated testimonials, clients, awards, statistics, addresses, or integrations are not.

Initialize only a project authorized for changes:

```bash
python3 "$ESA_SKILL_DIR/scripts/workflow.py" init --project "$ESA_PROJECT"
```

The initializer refuses overwrites. Fill each phase's files and review their meaning, then record the review in order:

```bash
python3 "$ESA_SKILL_DIR/scripts/workflow.py" approve --project "$ESA_PROJECT" --stage brief --note "Specific review rationale"
python3 "$ESA_SKILL_DIR/scripts/workflow.py" approve --project "$ESA_PROJECT" --stage direction --note "Specific review rationale"
python3 "$ESA_SKILL_DIR/scripts/workflow.py" approve --project "$ESA_PROJECT" --stage architecture --note "Specific review rationale"
```

Approval records your attestation and file hashes, not proof of design quality. Re-review affected downstream phases when earlier decisions change. For each section define purpose, relation to neighbors, mobile recomposition, and applicable states. Familiar patterns are allowed when justified; no mandatory centered hero, card grid, font, framework, GSAP, Lenis, or WebGL.

### 4. Implement progressively

Build semantic content and responsive composition first, then interactions and conditional effects. Use existing file conventions; map actual components in `sections.json`. Centralize the chosen tokens without imposing a universal visual style. Make navigation, primary actions, focus, forms, loading/errors, touch behavior, and fallbacks work. Preview success does not establish a real backend integration.

### 5. Capture and audit

After source and design changes settle, start a unique run:

```bash
python3 "$ESA_SKILL_DIR/scripts/workflow.py" start --project "$ESA_PROJECT" --run r01
python3 "$ESA_SKILL_DIR/scripts/workflow.py" check --project "$ESA_PROJECT" --run r01 --id build -- npm run build
node "$ESA_SKILL_DIR/scripts/capture.mjs" --project "$ESA_PROJECT" --run r01 --base-url http://127.0.0.1:3000
```

Replace the build example with the project's actual command. Start the preview through its supported workflow. Capture requires an already installed Playwright and browser; it neither starts the server nor installs dependencies. Where required, use the governed browser workflow instead and normalize actual evidence to the documented manifest, without claiming this helper ran.

Inspect full pages and readable section crops at mobile, tablet, and desktop sizes, including planned states and reduced motion. Exercise focus, navigation, menus, scrolling, forms, and animation separately; static screenshots do not demonstrate behavior.

Fill the run's `report.json` from actual inspection and test evidence. Keep `PASS`, `FAIL`, `NOT_RUN`, and justified `NA` distinct. Name the inspected images and hashes; record concrete observations, not “looks premium.” Each finding needs ID, section, severity, observed defect, and evidence.

```bash
python3 "$ESA_SKILL_DIR/scripts/workflow.py" gate --project "$ESA_PROJECT" --run r01
```

The gate checks integrity and completeness of recorded evidence; it cannot prove honesty or certify accessibility. Never substitute a successful build or existing PNG for visual inspection. Source changes invalidate a run: create a new run and recapture/retest.

### 6. Run bounded section repairs

1. Read the finding and image. State a specific cause hypothesis and expected improvement.
2. Reserve an attempt before editing:

   ```bash
   python3 "$ESA_SKILL_DIR/scripts/workflow.py" repair --project "$ESA_PROJECT" --run r01 --section hero --finding F01 --hypothesis "Observed cause and proposed scoped fix"
   ```

3. Patch the smallest relevant component/style. Preserve required content, direction, and unrelated user work.
4. Start a fresh run, recapture, and repeat the failed check. Recheck neighbors; shared token/component changes require rechecking every consumer in scope. The final gate requires full planned coverage at the current source state.
5. Record repair `outcome`, `verification_run`, and `note`; resolve findings only with fresh evidence. Unresolved findings carry forward.

Allow at most **two reserved attempts per section** across the project contract. Stop earlier for repeated ineffective fixes, regressions, missing required inputs, permission barriers, or material user decisions. Do not reset counters or rename sections to evade the budget. Ask for direction before further attempts. Budget exhaustion is not a pass.

### 7. Handoff

The gate generates `qa/report.json` and `qa/summary.md`; never edit their verdict manually. Deliver the implementation and relevant evidence through the environment's supported saving mechanism. State tested scope, unavailable checks, failures, and whether the result is complete or provisional. Do not claim production readiness from this gate, a screenshot, or a lab score alone.
