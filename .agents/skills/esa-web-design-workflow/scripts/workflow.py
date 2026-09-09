#!/usr/bin/env python3
"""Evidence-bound website workflow. Standard library only; no aesthetic scoring."""
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,63}$")
STAGES = {"brief": ["design/brief.md"], "direction": ["design/direction.md", "design/tokens.json"],
          "architecture": ["design/sections.json", "qa/plan.json"]}
CORE = {"build", "interaction", "accessibility", "performance", "console", "responsive"}
IGNORED = {".git", "node_modules", ".next", "dist", "build", "coverage", "__pycache__", ".venv", ".cache", "qa"}
STATUSES = {"PASS", "FAIL", "NOT_RUN", "NA"}


def now():
    return datetime.now(timezone.utc).isoformat()


def ident(value):
    if not isinstance(value, str) or not ID.fullmatch(value):
        raise ValueError(f"Invalid identifier: {value!r}")
    return value


def inside(root, relative):
    p = Path(relative)
    if p.is_absolute() or ".." in p.parts or not p.parts:
        raise ValueError(f"Expected a project-relative path: {relative}")
    candidate = root / p
    if not candidate.resolve().is_relative_to(root):
        raise ValueError(f"Path escapes project: {relative}")
    current = root
    for part in p.parts:
        current = current / part
        if current.is_symlink():
            raise ValueError(f"Symlink not supported for contract/evidence: {relative}")
    return candidate


def read(root, path):
    return json.loads(inside(root, path).read_text(encoding="utf-8"))


def write(root, path, data, exclusive=False):
    target = inside(root, path)
    target.parent.mkdir(parents=True, exist_ok=True)
    content = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if exclusive:
        with target.open("x", encoding="utf-8") as stream:
            stream.write(content)
    else:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=target.parent, delete=False) as stream:
            stream.write(content)
            temporary = stream.name
        os.replace(temporary, target)


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def evidence(root, path):
    p = inside(root, path)
    if not p.is_file() or p.stat().st_size == 0:
        raise ValueError(f"Missing or empty evidence: {path}")
    return {"path": path, "sha256": sha(p)}


def check_evidence(root, items):
    if not isinstance(items, list) or not items:
        raise ValueError("At least one real evidence file is required")
    for item in items:
        if evidence(root, item["path"]) != {"path": item["path"], "sha256": item["sha256"]}:
            raise ValueError(f"Evidence changed: {item['path']}")


def fingerprint(root):
    files = {}
    total = 0
    for folder, directories, names in os.walk(root, followlinks=False):
        directories[:] = sorted(d for d in directories if d not in IGNORED)
        for d in directories:
            if (Path(folder) / d).is_symlink():
                raise ValueError(f"Source directory symlink requires an explicit project scope: {d}")
        for name in sorted(names):
            if name.startswith(".env") or name.endswith((".pyc", ".log")):
                continue
            path = Path(folder) / name
            if path.is_symlink():
                raise ValueError(f"Source symlink unsupported: {path.relative_to(root)}")
            if not path.is_file():
                continue
            total += path.stat().st_size
            if len(files) >= 10000 or total > 2_000_000_000:
                raise ValueError("Project snapshot exceeds 10,000 files / 2 GB; choose the application root")
            files[path.relative_to(root).as_posix()] = sha(path)
    return files


def required_text(value, label):
    if not isinstance(value, str) or not value.strip() or "TODO" in value or "[FILL" in value:
        raise ValueError(f"Fill {label} with an actual decision or observation")


def plan(root):
    data = read(root, "qa/plan.json")
    checks = data.get("checks", [])
    ids = [ident(c["id"]) for c in checks]
    if len(set(ids)) != len(ids) or not CORE.issubset(ids):
        raise ValueError("Plan needs unique checks including build, interaction, accessibility, performance, console, responsive")
    for c in checks:
        if c.get("kind") not in {"command", "manual"} or not isinstance(c.get("allow_na", False), bool):
            raise ValueError(f"Invalid planned check: {c['id']}")
    cases = data.get("cases", [])
    ids = [ident(c["id"]) for c in cases]
    if not cases or len(set(ids)) != len(ids):
        raise ValueError("Plan needs unique capture cases")
    for c in cases:
        if not isinstance(c.get("route"), str) or not c["route"].startswith("/") or c["route"].startswith("//"):
            raise ValueError("Cases require same-origin routes beginning with /")
        if type(c.get("width")) is not int or not 240 <= c["width"] <= 7680 or type(c.get("height")) is not int or not 200 <= c["height"] <= 4320:
            raise ValueError(f"Invalid viewport: {c['id']}")
    return data


def stage_files(root, stage):
    result = []
    for name in STAGES[stage]:
        item = evidence(root, name)
        required_text(inside(root, name).read_text(), name)
        result.append(item)
    if stage == "direction":
        tokens = read(root, "design/tokens.json")
        if any(not isinstance(tokens.get(k), dict) or not tokens[k] for k in ["colors", "typography", "spacing"]):
            raise ValueError("Tokens need nonempty colors, typography, and spacing objects")
    if stage == "architecture":
        p = plan(root)
        sections = read(root, "design/sections.json")["sections"]
        ids = [ident(s["id"]) for s in sections]
        if not sections or len(ids) != len(set(ids)) or "page" in ids:
            raise ValueError("Supply unique section IDs; 'page' is reserved")
        for s in sections:
            for key in ("route", "selector", "purpose", "component", "responsive"):
                required_text(s.get(key), f"section {s['id']}.{key}")
            matching = [c for c in p["cases"] if c["route"] == s["route"] and
                        any(x.get("id") == s["id"] and x.get("selector") == s["selector"] for x in c.get("sections", []))]
            widths = [c["width"] for c in matching]
            if not (any(w <= 480 for w in widths) and any(600 <= w <= 1024 for w in widths) and any(w >= 1280 for w in widths)):
                raise ValueError(f"Section {s['id']} needs planned mobile, tablet, and desktop captures")
    return result


def approvals(root, through="architecture"):
    data = read(root, "design/reviews.json")
    for stage in STAGES:
        entry = data.get(stage, {})
        if entry.get("files") != stage_files(root, stage):
            raise ValueError(f"Missing/stale {stage} approval; review it and all affected downstream phases")
        required_text(entry.get("note"), f"{stage} review note")
        if stage == through:
            break


def init(root):
    cases = []
    for label, width, height, reduced in [("mobile", 390, 844, True), ("tablet", 768, 1024, True), ("desktop", 1440, 1000, False)]:
        cases.append({"id": f"home-{label}", "route": "/", "width": width, "height": height,
                      "reduced_motion": reduced, "ready_selector": "main", "actions": [],
                      "sections": [{"id": "hero", "selector": "#hero"}]})
    templates = {
        "design/brief.md": "# Project brief\n\nTODO: Record company, audience, primary action, scope, verified content, assumptions, missing assets, and authorization limits.\n",
        "design/direction.md": "# Art direction\n\nTODO: Record client-specific concept, signatures, composition, type, palette, imagery, interactions, and optional technology decisions.\n",
        "design/tokens.json": {"colors": {}, "typography": {}, "spacing": {}},
        "design/sections.json": {"sections": [{"id": "hero", "route": "/", "selector": "#hero", "purpose": "TODO", "component": "TODO", "responsive": "TODO", "states": ["default"]}]},
        "design/reviews.json": {},
        "qa/plan.json": {"schema_version": 1, "checks": [{"id": c, "kind": "command" if c == "build" else "manual", "allow_na": c == "build"} for c in sorted(CORE)], "cases": cases},
        "qa/repairs.json": [], "qa/state.json": {"current_run": None}}
    for path in templates:
        if inside(root, path).exists():
            raise ValueError(f"Refusing to overwrite {path}; use the existing contract")
    for path, data in templates.items():
        write(root, path, data, exclusive=True)
    print("Initialized contract; fill and review brief, direction, and architecture in order.")


def approve(root, stage, note):
    required_text(note, "approval rationale")
    order = list(STAGES)
    index = order.index(stage)
    if index:
        approvals(root, order[index - 1])
    data = read(root, "design/reviews.json")
    data[stage] = {"at": now(), "note": note, "files": stage_files(root, stage)}
    for downstream in order[index + 1:]:
        data.pop(downstream, None)
    write(root, "design/reviews.json", data)
    print(f"Recorded {stage} review; downstream reviews require renewal.")


def runpath(run, name):
    return f"qa/runs/{ident(run)}/{name}"


def current_source(root, run):
    if read(root, runpath(run, "source.json"))["files"] != fingerprint(root):
        raise ValueError("Source changed since snapshot; start a NEW run and recapture/retest")


def verify_repair_record(root, row):
    verification = row["verification_run"]
    cursor = verification
    visited = set()
    while cursor != row["source_run"]:
        if not cursor or cursor in visited or len(visited) > 1000:
            raise ValueError("Verification run must descend from the repair's source run")
        visited.add(cursor)
        cursor = read(root, runpath(cursor, "source.json")).get("previous_run")
    if not visited:
        raise ValueError("Repair needs a fresh verification run")
    result = read(root, runpath(verification, "report.json"))
    finding = next((f for f in result.get("findings", []) if f["id"] == row["finding"] and f["section"] == row["section"]), None)
    if not finding:
        raise ValueError("Verification report lost the repaired finding")
    if row["outcome"] == "RESOLVED":
        if finding.get("status") != "RESOLVED":
            raise ValueError("Repair outcome conflicts with verification finding")
        check_evidence(root, finding.get("resolution_evidence"))
        if any(not e["path"].startswith(f"qa/runs/{verification}/") for e in finding["resolution_evidence"]):
            raise ValueError("Repair resolution must use its fresh verification evidence")
    elif finding.get("status") != "OPEN":
        raise ValueError("UNRESOLVED repair requires an OPEN finding in its verification run")


def start(root, run):
    ident(run)
    approvals(root)
    target = inside(root, f"qa/runs/{run}")
    if target.exists():
        raise ValueError("Run exists; choose a new identifier to preserve evidence")
    p = plan(root)
    state = read(root, "qa/state.json")
    findings = []
    if state["current_run"]:
        previous = read(root, runpath(state["current_run"], "report.json"))
        findings = copy.deepcopy(previous.get("findings", []))
        for f in findings:
            f["status"] = "OPEN"
            f.pop("resolution_evidence", None)
    report = {"schema_version": 1, "run": run, "checks": [], "visual_reviews": [], "findings": findings}
    for c in p["checks"]:
        report["checks"].append({"id": c["id"], "status": "NOT_RUN", "note": "", "evidence": []})
    for c in p["cases"]:
        report["visual_reviews"].append({"case_id": c["id"], "status": "NOT_RUN", "inspected": False, "reviewer": "", "note": "", "evidence": []})
    write(root, runpath(run, "source.json"), {"schema_version": 1, "run": run, "previous_run": state["current_run"], "created_at": now(), "files": fingerprint(root)}, exclusive=True)
    write(root, runpath(run, "report.json"), report, exclusive=True)
    write(root, "qa/state.json", {"current_run": run})
    print(f"Started {run}; all checks and visual reviews are NOT_RUN.")


def command_check(root, run, check_id, command, timeout):
    current_source(root, run)
    planned = next((c for c in plan(root)["checks"] if c["id"] == check_id), None)
    if not planned or planned["kind"] != "command":
        raise ValueError("Command must correspond to a planned command check")
    if command and command[0] == "--": command = command[1:]
    if not command: raise ValueError("Supply an actual command after --")
    log = runpath(run, f"logs/{ident(check_id)}.txt")
    receipt = runpath(run, f"logs/{check_id}.json")
    if inside(root, log).exists() or inside(root, receipt).exists():
        raise ValueError("Check already has evidence; start a new run to retry")
    try:
        result = subprocess.run(command, cwd=root, capture_output=True, text=True, errors="replace", timeout=timeout, shell=False)
        code, output = result.returncode, result.stdout + "\n" + result.stderr
    except (OSError, subprocess.TimeoutExpired) as exc:
        code, output = -1, str(exc)
    write(root, log, output.strip() + "\n" if output.strip() else "Command produced no output.\n", exclusive=True)
    record = {"command": command, "exit_code": code, "finished_at": now(), "source_unchanged": read(root, runpath(run, "source.json"))["files"] == fingerprint(root)}
    write(root, receipt, record, exclusive=True)
    report = read(root, runpath(run, "report.json"))
    item = next(c for c in report["checks"] if c["id"] == check_id)
    item.update(status="PASS" if code == 0 and record["source_unchanged"] else "FAIL", note="Recorded command result; inspect the log.", evidence=[evidence(root, log), evidence(root, receipt)])
    write(root, runpath(run, "report.json"), report)
    print(f"{check_id}: {item['status']} (exit {code})")
    return 0 if item["status"] == "PASS" else 1


def repair(root, run, section, finding, hypothesis):
    required_text(hypothesis, "repair hypothesis")
    if section not in [s["id"] for s in read(root, "design/sections.json")["sections"]]:
        raise ValueError("Unknown section")
    report = read(root, runpath(run, "report.json"))
    f = next((f for f in report["findings"] if f["id"] == finding and f["section"] == section and f["status"] == "OPEN"), None)
    if not f: raise ValueError("Repair needs an OPEN finding on this section in the specified run")
    check_evidence(root, f["evidence"])
    records = read(root, "qa/repairs.json")
    if sum(r["section"] == section for r in records) >= 2:
        raise ValueError("Repair budget exhausted: two attempts per section. Stop and request direction.")
    row = {"id": f"repair-{len(records) + 1}", "section": section, "finding": finding, "source_run": run, "hypothesis": hypothesis,
           "started_at": now(), "outcome": "PENDING", "verification_run": None, "note": ""}
    records.append(row)
    write(root, "qa/repairs.json", records)
    print(f"Reserved {row['id']}; patch, start a fresh run, recapture and record the outcome.")


def gate(root, run):
    errors = []
    def attempt(label, action):
        try: action()
        except (ValueError, KeyError, TypeError, OSError) as exc: errors.append(f"{label}: {exc}")
    attempt("Design approvals", lambda: approvals(root))
    attempt("Current source", lambda: current_source(root, run))
    p = plan(root)
    report = read(root, runpath(run, "report.json"))
    if report.get("run") != run: errors.append("Report run does not match requested run")
    checks = report.get("checks", [])
    if len({c["id"] for c in checks}) != len(checks): errors.append("Duplicate check IDs")
    if {c["id"] for c in checks} != {c["id"] for c in p["checks"]}: errors.append("Reported checks differ from reviewed plan")
    for required in p["checks"]:
        def validate_check(required=required):
            c = next((c for c in checks if c["id"] == required["id"]), {})
            if c.get("status") not in STATUSES or c.get("status") in {"FAIL", "NOT_RUN"}:
                raise ValueError(f"{c.get('status', 'MISSING')}")
            required_text(c.get("note"), "check observation")
            if c["status"] == "NA":
                if not required.get("allow_na", False): raise ValueError("NA not allowed by reviewed plan")
                return
            check_evidence(root, c["evidence"])
            if any(not e["path"].startswith(f"qa/runs/{run}/") for e in c["evidence"]):
                raise ValueError("Check evidence must belong to the current run")
            if required["kind"] == "command":
                name = runpath(run, f"logs/{required['id']}.json")
                recorded = read(root, name)
                if recorded["exit_code"] != 0 or not recorded["source_unchanged"] or evidence(root, name) not in c["evidence"]:
                    raise ValueError("Command receipt does not show a successful unchanged-source check")
        attempt(f"Check {required['id']}", validate_check)
    captures = {}
    try:
        manifest = read(root, runpath(run, "captures.json"))
        if manifest.get("run") != run: raise ValueError("Capture manifest run mismatch")
        captures = {c["id"]: c for c in manifest["cases"]}
        if len(captures) != len(manifest["cases"]): raise ValueError("Duplicate captured case IDs")
        if set(captures) != {c["id"] for c in p["cases"]}: raise ValueError("Captured cases differ from reviewed plan")
    except (ValueError, KeyError, TypeError, OSError) as exc:
        errors.append(f"Capture evidence: {exc}")
    reviews = report.get("visual_reviews", [])
    if len({r["case_id"] for r in reviews}) != len(reviews): errors.append("Duplicate visual review case IDs")
    if {r["case_id"] for r in reviews} != {c["id"] for c in p["cases"]}: errors.append("Visual reviews differ from reviewed plan")
    for planned in p["cases"]:
        def validate_visual(planned=planned):
            captured = captures.get(planned["id"], {})
            if captured.get("status") != "CAPTURED": raise ValueError("Missing or failed capture")
            for key in ("route", "width", "height"):
                if captured.get(key) != planned[key]: raise ValueError(f"Capture {key} differs from reviewed plan")
            if captured.get("reduced_motion") != planned.get("reduced_motion", True):
                raise ValueError("Reduced-motion mode differs from plan")
            observed = captured.get("observations", {})
            if not isinstance(observed.get("horizontal_overflow"), bool) or any(not isinstance(observed.get(k), list) for k in ("console_errors", "failed_requests", "broken_images")):
                raise ValueError("Missing browser observations")
            if observed["horizontal_overflow"] or any(observed[k] for k in ("console_errors", "failed_requests", "broken_images")):
                raise ValueError("Browser observations contain overflow, errors, failed requests, or broken images; investigate before passing")
            screenshots = captured.get("screenshots", [])
            expected_sections = {"page"} | {s["id"] for s in planned.get("sections", [])}
            if {s.get("section") for s in screenshots} != expected_sections: raise ValueError("Missing page or section screenshots")
            ev = [{"path": s["path"], "sha256": s["sha256"]} for s in screenshots]
            check_evidence(root, ev)
            for e in ev:
                if not e["path"].startswith(f"qa/runs/{run}/"): raise ValueError("Screenshot belongs to another run")
                with inside(root, e["path"]).open("rb") as stream:
                    if stream.read(8) != b"\x89PNG\r\n\x1a\n": raise ValueError("Screenshot is not a PNG")
            r = next((r for r in reviews if r["case_id"] == planned["id"]), {})
            if r.get("status") != "PASS" or r.get("inspected") is not True: raise ValueError("Visual review not inspected and passed")
            required_text(r.get("reviewer"), "reviewer")
            required_text(r.get("note"), "concrete visual observation")
            check_evidence(root, r.get("evidence"))
            if any(e not in r["evidence"] for e in ev): raise ValueError("Not all captured images were recorded as inspected")
        attempt(f"Visual {planned['id']}", validate_visual)
    known_sections = {s["id"] for s in read(root, "design/sections.json")["sections"]}
    findings = report.get("findings", [])
    if len({f["id"] for f in findings}) != len(findings): errors.append("Duplicate finding IDs")
    previous_run = read(root, runpath(run, "source.json")).get("previous_run")
    if previous_run:
        historical = read(root, runpath(previous_run, "report.json")).get("findings", [])
        if not {f["id"] for f in historical}.issubset({f["id"] for f in findings}):
            errors.append("Findings from the previous run were dropped instead of reverified")
    for f in findings:
        def validate_finding(f=f):
            if f["section"] not in known_sections or f.get("severity") not in {"blocker", "major", "minor"}:
                raise ValueError("Unknown section or severity")
            required_text(f.get("observed"), "finding observation")
            check_evidence(root, f["evidence"])
            if f.get("status") != "RESOLVED": raise ValueError("Unresolved finding")
            check_evidence(root, f["resolution_evidence"])
            if any(not e["path"].startswith(f"qa/runs/{run}/") for e in f["resolution_evidence"]):
                raise ValueError("Finding resolution needs evidence from this run")
        attempt(f"Finding {f.get('id', '?')}", validate_finding)
    repairs = read(root, "qa/repairs.json")
    for section in {r["section"] for r in repairs}:
        if sum(r["section"] == section for r in repairs) > 2: errors.append(f"Repair budget exceeded for {section}")
    for r in repairs:
        if r.get("outcome") == "PENDING": errors.append(f"Repair {r['id']} has no recorded outcome")
        elif r.get("outcome") not in {"RESOLVED", "UNRESOLVED"} or not r.get("verification_run") or not r.get("note"):
            errors.append(f"Repair {r['id']} needs outcome, verification_run, and note")
        else:
            attempt(f"Repair {r['id']} verification", lambda r=r: verify_repair_record(root, r))
    output = {"schema_version": 1, "run": run, "evaluated_at": now(), "status": "PASS" if not errors else "INCOMPLETE", "errors": errors,
              "scope": "Evidence integrity/completeness only; visual judgments and manual results are reviewer attestations.", "report": runpath(run, "report.json")}
    write(root, "qa/report.json", output)
    lines = [f"# QA summary — {output['status']}", "", f"Run: {run}", "", output["scope"], "", f"Cases: {len(p['cases'])}; required checks: {len(p['checks'])}.", ""]
    lines += [f"- {e}" for e in errors] if errors else ["No missing or failing requirements detected in recorded evidence. This is not a production-readiness or accessibility certification."]
    write(root, "qa/summary.md", "\n".join(lines) + "\n")
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    for name in ("init", "approve", "start", "check", "repair", "gate", "evidence"):
        p = sub.add_parser(name)
        p.add_argument("--project", required=True, type=Path)
        if name in {"start", "check", "repair", "gate"}: p.add_argument("--run", required=True)
        if name == "approve":
            p.add_argument("--stage", choices=list(STAGES), required=True)
            p.add_argument("--note", required=True)
        if name == "check":
            p.add_argument("--id", required=True)
            p.add_argument("--timeout", type=int, default=120)
            p.add_argument("command", nargs=argparse.REMAINDER)
        if name == "repair":
            for field in ("section", "finding", "hypothesis"): p.add_argument(f"--{field}", required=True)
        if name == "evidence": p.add_argument("paths", nargs="+")
    a = parser.parse_args()
    root = a.project.resolve()
    try:
        if not root.is_dir(): raise ValueError("Project root must already exist")
        if a.action == "init": init(root)
        elif a.action == "approve": approve(root, a.stage, a.note)
        elif a.action == "start": start(root, a.run)
        elif a.action == "check": return command_check(root, a.run, a.id, a.command, a.timeout)
        elif a.action == "repair": repair(root, a.run, a.section, a.finding, a.hypothesis)
        elif a.action == "gate": return gate(root, a.run)
        elif a.action == "evidence": print(json.dumps([evidence(root, p) for p in a.paths], indent=2))
        return 0
    except (ValueError, KeyError, TypeError, OSError, StopIteration) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        if a.action == "gate" and root.is_dir():
            try:
                output = {"schema_version": 1, "run": a.run, "evaluated_at": now(), "status": "INCOMPLETE", "errors": [f"Operational/input error: {exc}"]}
                write(root, "qa/report.json", output)
                write(root, "qa/summary.md", f"# QA summary — INCOMPLETE\n\nRun: {a.run}\n\nThe gate could not validate its inputs: {exc}\n")
            except (ValueError, OSError):
                print("Could not update the summary; any prior verdict is stale.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
