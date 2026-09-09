#!/usr/bin/env python3
"""Portable contract tests; ALL screenshot/manual-review fixtures are synthetic.

These tests exercise bookkeeping, not a browser, visual quality, or accessibility.
Run: python3 scripts/test_workflow.py [--workspace /writable/temp-parent] [-v]
TemporaryDirectory otherwise honors Python's normal TMPDIR selection. No third-party
packages, network, browser, or external service is used.
"""
import argparse
import base64
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock


spec = importlib.util.spec_from_file_location("esa_workflow", Path(__file__).with_name("workflow.py"))
workflow = importlib.util.module_from_spec(spec)
spec.loader.exec_module(workflow)
TEST_WORKSPACE = None
SYNTHETIC_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1kAAAAASUVORK5CYII="
)


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="esa-workflow-test-", dir=TEST_WORKSPACE)
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        self.call(workflow.init, self.root)

    def call(self, function, *args):
        with contextlib.redirect_stdout(io.StringIO()):
            return function(*args)

    def load(self, name):
        return workflow.read(self.root, name)

    def save(self, name, value):
        workflow.write(self.root, name, value)

    def ready(self):
        self.save("design/brief.md", "# Synthetic test brief\nAudience: fixture maintainers. Action: inspect tests.\n")
        self.save("design/direction.md", "# Synthetic test direction\nSimple, legible single-section layout.\n")
        self.save("design/tokens.json", {"colors": {"ink": "#111111"}, "typography": {"body": "sans-serif"}, "spacing": {"unit": 8}})
        self.save("design/sections.json", {"sections": [{"id": "hero", "route": "/", "selector": "#hero", "purpose": "Synthetic fixture", "component": "index.html", "responsive": "Stack at mobile", "states": ["default"]}]})
        self.save("index.html", "<!doctype html><main id='hero'>Synthetic test source</main>\n")
        for stage in workflow.STAGES:
            self.call(workflow.approve, self.root, stage, "Synthetic test approval; not a client review.")

    def start(self, run="r01"):
        self.ready()
        self.call(workflow.start, self.root, run)
        return run

    def report(self, run="r01"):
        return self.load(workflow.runpath(run, "report.json"))

    def save_report(self, report, run="r01"):
        self.save(workflow.runpath(run, "report.json"), report)

    def gate(self, run="r01"):
        code = self.call(workflow.gate, self.root, run)
        return code, self.load("qa/report.json")

    def assert_incomplete(self, fragment, run="r01"):
        code, result = self.gate(run)
        self.assertEqual(1, code)
        self.assertEqual("INCOMPLETE", result["status"])
        self.assertIn(fragment, "\n".join(result["errors"]))

    def synthetic_complete(self, run="r01"):
        """Build a controlled *synthetic* successful gate fixture, never browser evidence."""
        self.assertEqual(0, self.call(workflow.command_check, self.root, run, "build",
                                     [sys.executable, "-c", "print('synthetic contract test command')"], 20))
        report = self.report(run)
        for check in report["checks"]:
            if check["id"] == "build":
                continue
            name = workflow.runpath(run, "logs/" + check["id"] + ".md")
            self.save(name, "SYNTHETIC TEST DATA: no real manual/browser inspection occurred.\n")
            check.update(status="PASS", note="Synthetic test attestation only.", evidence=[workflow.evidence(self.root, name)])
        manifest = {"schema_version": 1, "run": run, "cases": []}
        for case in self.load("qa/plan.json")["cases"]:
            captured = {key: case[key] for key in ("id", "route", "width", "height", "reduced_motion")}
            captured.update(status="CAPTURED", observations={"horizontal_overflow": False, "console_errors": [], "failed_requests": [], "broken_images": []}, screenshots=[], error=None)
            for section in ["page"] + [section["id"] for section in case["sections"]]:
                name = workflow.runpath(run, "captures/" + case["id"] + "-" + section + ".png")
                destination = workflow.inside(self.root, name)
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(SYNTHETIC_PNG)
                captured["screenshots"].append(dict(workflow.evidence(self.root, name), section=section))
            manifest["cases"].append(captured)
            review = next(row for row in report["visual_reviews"] if row["case_id"] == case["id"])
            review.update(status="PASS", inspected=True, reviewer="SYNTHETIC TEST REVIEWER", note="Synthetic image fixture; not an actual website inspection.", evidence=[{key: item[key] for key in ("path", "sha256")} for item in captured["screenshots"]])
        self.save(workflow.runpath(run, "captures.json"), manifest)
        self.save_report(report, run)

    def finding(self, run="r01"):
        report = self.report(run)
        report["findings"].append({"id": "F01", "section": "hero", "severity": "major", "observed": "Synthetic clipping fixture.", "status": "OPEN", "evidence": report["visual_reviews"][0]["evidence"]})
        self.save_report(report, run)

    def test_init_refuses_overwrite_without_modifying_existing_contract(self):
        self.save("design/brief.md", "Existing user decision\n")
        before = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        with self.assertRaisesRegex(ValueError, "Refusing to overwrite"):
            self.call(workflow.init, self.root)
        after = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.assertEqual(before, after)

    def test_approval_prerequisites_and_unfilled_templates_block(self):
        with self.assertRaises(ValueError):
            self.call(workflow.approve, self.root, "direction", "Attempt out of sequence")
        with self.assertRaisesRegex(ValueError, "Fill"):
            self.call(workflow.approve, self.root, "brief", "Template was not filled")
        with self.assertRaises(ValueError):
            self.call(workflow.start, self.root, "r01")

    def test_changed_approval_artifact_is_stale_and_reapproval_clears_downstream(self):
        self.ready()
        self.save("design/brief.md", "Changed synthetic decision\n")
        with self.assertRaisesRegex(ValueError, "stale brief approval"):
            workflow.approvals(self.root)
        self.call(workflow.approve, self.root, "brief", "Reviewed changed decision")
        self.assertEqual({"brief"}, set(self.load("design/reviews.json")))
        with self.assertRaisesRegex(ValueError, "stale direction approval"):
            self.call(workflow.start, self.root, "r01")

    def test_architecture_requires_mobile_tablet_desktop_coverage(self):
        self.ready()
        plan = self.load("qa/plan.json")
        plan["cases"] = [case for case in plan["cases"] if case["width"] != 768]
        self.save("qa/plan.json", plan)
        with self.assertRaisesRegex(ValueError, "mobile, tablet, and desktop"):
            self.call(workflow.approve, self.root, "architecture", "Incomplete coverage")

    def test_run_ids_are_unique_and_all_results_start_not_run(self):
        self.start()
        before = (self.root / workflow.runpath("r01", "report.json")).read_bytes()
        with self.assertRaisesRegex(ValueError, "Run exists"):
            self.call(workflow.start, self.root, "r01")
        self.assertEqual(before, (self.root / workflow.runpath("r01", "report.json")).read_bytes())
        self.assertTrue(all(row["status"] == "NOT_RUN" for row in self.report()["checks"]))
        self.assertTrue(all(row["status"] == "NOT_RUN" and not row["inspected"] for row in self.report()["visual_reviews"]))

    def test_source_drift_requires_new_run(self):
        self.start()
        self.save("index.html", "Changed synthetic implementation\n")
        with self.assertRaisesRegex(ValueError, "Source changed"):
            workflow.current_source(self.root, "r01")
        self.assert_incomplete("Source changed")
        self.call(workflow.start, self.root, "r02")
        workflow.current_source(self.root, "r02")
        self.assertEqual("r01", self.load(workflow.runpath("r02", "source.json"))["previous_run"])

    def test_missing_capture_and_not_run_checks_block(self):
        self.start()
        self.assert_incomplete("Capture evidence:")
        self.assert_incomplete("NOT_RUN")

    def test_full_gate_passes_only_controlled_synthetic_fixture(self):
        self.start()
        self.synthetic_complete()
        code, result = self.gate()
        self.assertEqual(0, code)
        self.assertEqual("PASS", result["status"])
        self.assertEqual([], result["errors"])
        self.assertIn("reviewer attestations", result["scope"])

    def test_evidence_hash_tampering_blocks(self):
        self.start()
        self.synthetic_complete()
        name = self.report()["visual_reviews"][0]["evidence"][0]["path"]
        (self.root / name).write_bytes(SYNTHETIC_PNG + b"tampered")
        self.assert_incomplete("Evidence changed")

    def test_missing_planned_check_blocks(self):
        self.start()
        self.synthetic_complete()
        report = self.report()
        report["checks"] = [row for row in report["checks"] if row["id"] != "accessibility"]
        self.save_report(report)
        self.assert_incomplete("Reported checks differ from reviewed plan")

    def test_visual_pass_without_inspection_blocks(self):
        self.start()
        self.synthetic_complete()
        report = self.report()
        report["visual_reviews"][0]["inspected"] = False
        self.save_report(report)
        self.assert_incomplete("Visual review not inspected and passed")

    def test_each_browser_anomaly_blocks(self):
        self.start()
        self.synthetic_complete()
        name = workflow.runpath("r01", "captures.json")
        for key, value in (("horizontal_overflow", True), ("console_errors", ["synthetic error"]), ("failed_requests", ["synthetic failure"]), ("broken_images", ["synthetic image failure"])):
            with self.subTest(observation=key):
                manifest = self.load(name)
                previous = manifest["cases"][0]["observations"][key]
                manifest["cases"][0]["observations"][key] = value
                self.save(name, manifest)
                self.assert_incomplete("Browser observations contain")
                manifest["cases"][0]["observations"][key] = previous
                self.save(name, manifest)

    def test_missing_section_screenshot_blocks(self):
        self.start()
        self.synthetic_complete()
        name = workflow.runpath("r01", "captures.json")
        manifest = self.load(name)
        manifest["cases"][0]["screenshots"].pop()
        self.save(name, manifest)
        self.assert_incomplete("Missing page or section screenshots")

    def test_command_receipt_preserved_and_failed_exit_blocks(self):
        self.start()
        self.assertEqual(1, self.call(workflow.command_check, self.root, "r01", "build", [sys.executable, "-c", "raise SystemExit(3)"], 20))
        receipt = self.load(workflow.runpath("r01", "logs/build.json"))
        self.assertEqual(3, receipt["exit_code"])
        self.assertEqual("FAIL", next(row for row in self.report()["checks"] if row["id"] == "build")["status"])
        with self.assertRaisesRegex(ValueError, "already has evidence"):
            self.call(workflow.command_check, self.root, "r01", "build", [sys.executable, "-c", "pass"], 20)

    def test_na_requires_explicit_plan_permission(self):
        self.start()
        self.synthetic_complete()
        report = self.report()
        item = next(row for row in report["checks"] if row["id"] == "accessibility")
        item.update(status="NA", note="Synthetic unsupported exemption")
        self.save_report(report)
        self.assert_incomplete("NA not allowed")

    def test_repair_requires_open_finding_and_stops_after_two_attempts(self):
        self.start()
        self.synthetic_complete()
        with self.assertRaisesRegex(ValueError, "OPEN finding"):
            self.call(workflow.repair, self.root, "r01", "hero", "missing", "Synthetic hypothesis")
        self.finding()
        for attempt in (1, 2):
            self.call(workflow.repair, self.root, "r01", "hero", "F01", "Synthetic hypothesis " + str(attempt))
        with self.assertRaisesRegex(ValueError, "budget exhausted"):
            self.call(workflow.repair, self.root, "r01", "hero", "F01", "Third synthetic hypothesis")
        self.assertEqual(2, len(self.load("qa/repairs.json")))
        self.assert_incomplete("has no recorded outcome")

    def test_repair_requires_fresh_verification_and_preserves_findings(self):
        self.start()
        self.synthetic_complete()
        self.finding()
        self.call(workflow.repair, self.root, "r01", "hero", "F01", "Synthetic scoped fix")
        report = self.report()
        report["findings"][0].update(status="RESOLVED", resolution_evidence=report["visual_reviews"][0]["evidence"])
        self.save_report(report)
        repairs = self.load("qa/repairs.json")
        repairs[0].update(outcome="RESOLVED", verification_run="r01", note="Synthetic result")
        self.save("qa/repairs.json", repairs)
        self.assert_incomplete("needs a fresh verification run")
        self.call(workflow.start, self.root, "r02")
        inherited = self.report("r02")["findings"][0]
        self.assertEqual("OPEN", inherited["status"])
        self.assertNotIn("resolution_evidence", inherited)
        self.synthetic_complete("r02")
        report = self.report("r02")
        report["findings"][0].update(status="RESOLVED", resolution_evidence=report["visual_reviews"][0]["evidence"])
        self.save_report(report, "r02")
        repairs[0]["verification_run"] = "r02"
        self.save("qa/repairs.json", repairs)
        self.assertEqual(0, self.gate("r02")[0])
        report["findings"] = []
        self.save_report(report, "r02")
        self.assert_incomplete("Findings from the previous run were dropped", "r02")

    def test_repair_verification_requires_descendant_finding_and_fresh_evidence(self):
        self.start()
        self.synthetic_complete()
        self.finding()
        self.call(workflow.start, self.root, "r02")
        row = {"source_run": "r01", "verification_run": "r02", "finding": "F01", "section": "hero", "outcome": "UNRESOLVED"}
        workflow.verify_repair_record(self.root, row)
        with self.assertRaisesRegex(ValueError, "must descend"):
            workflow.verify_repair_record(self.root, dict(row, source_run="r02", verification_run="r01"))
        report = self.report("r02")
        self.save_report(dict(report, findings=[]), "r02")
        with self.assertRaisesRegex(ValueError, "lost the repaired finding"):
            workflow.verify_repair_record(self.root, row)
        self.save_report(report, "r02")
        with self.assertRaisesRegex(ValueError, "outcome conflicts"):
            workflow.verify_repair_record(self.root, dict(row, outcome="RESOLVED"))
        report["findings"][0].update(status="RESOLVED", resolution_evidence=report["findings"][0]["evidence"])
        self.save_report(report, "r02")
        with self.assertRaisesRegex(ValueError, "fresh verification evidence"):
            workflow.verify_repair_record(self.root, dict(row, outcome="RESOLVED"))

    def test_cli_malformed_input_replaces_previous_pass_verdict(self):
        self.start()
        self.synthetic_complete()
        self.assertEqual(0, self.gate()[0])
        self.save("qa/plan.json", "{ malformed synthetic JSON\n")
        argv = ["workflow.py", "gate", "--project", str(self.root), "--run", "r01"]
        with mock.patch.object(sys, "argv", argv), contextlib.redirect_stderr(io.StringIO()):
            code = self.call(workflow.main)
        self.assertEqual(2, code)
        self.assertEqual("INCOMPLETE", self.load("qa/report.json")["status"])

    def test_paths_reject_absolute_parent_and_symlink_escapes(self):
        for name in ("../outside.txt", "/outside.txt", "qa/../../outside.txt"):
            with self.subTest(path=name), self.assertRaises(ValueError):
                workflow.inside(self.root, name)
        link = self.root / "escape"
        try:
            link.symlink_to(self.root.parent, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("Symlinks unavailable on this platform")
        with self.assertRaises(ValueError):
            workflow.inside(self.root, "escape/outside.txt")
        with self.assertRaisesRegex(ValueError, "symlink"):
            workflow.fingerprint(self.root)

    def test_identifier_rejects_run_path_escape(self):
        self.ready()
        for name in ("../r01", "/tmp/run", "run/child", "UPPERCASE", ""):
            with self.subTest(run=name), self.assertRaisesRegex(ValueError, "Invalid identifier"):
                self.call(workflow.start, self.root, name)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--workspace", type=Path, help="Existing writable parent for temporary test projects")
    options, remaining = parser.parse_known_args()
    if options.workspace is not None:
        TEST_WORKSPACE = options.workspace.resolve()
        if not TEST_WORKSPACE.is_dir():
            parser.error("--workspace must identify an existing directory")
    unittest.main(argv=[sys.argv[0]] + remaining)
