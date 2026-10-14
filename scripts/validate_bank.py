#!/usr/bin/env python3
"""Audit a structured UPSC CSAT question-bank JSON file without inventing data.

Usage:
  python scripts/validate_bank.py data/papers/csat-2023.json

Accepted shapes: {"year": 2023, "questions": [...]},
{"papers": {"2023": [...]}} or {"papers": {"2023": {"questions": [...]}}}.
The script checks structure and completeness, not whether the transcribed wording or
answer key is factually correct against the official PDF; that requires manual review.
"""
import json
import re
import sys
from pathlib import Path

YEARS = {2021, 2022, 2023, 2024, 2025, 2026}
LETTERS = {"A", "B", "C", "D"}


def load_papers(data):
    out = {}
    if isinstance(data, dict) and isinstance(data.get("papers"), dict):
        for year, payload in data["papers"].items():
            try:
                year_int = int(year)
            except (TypeError, ValueError):
                raise ValueError(f"Invalid paper year key: {year!r}")
            questions = payload if isinstance(payload, list) else payload.get("questions", []) if isinstance(payload, dict) else None
            if not isinstance(questions, list):
                raise ValueError(f"Paper {year} must contain a questions array.")
            out[year_int] = questions
    elif isinstance(data, dict) and isinstance(data.get("papers"), list):
        for paper in data["papers"]:
            if not isinstance(paper, dict) or "year" not in paper:
                raise ValueError("Each paper entry must be an object with a year.")
            year_int = int(paper["year"])
            questions = paper.get("questions", [])
            if not isinstance(questions, list):
                raise ValueError(f"Paper {year_int} must contain a questions array.")
            out[year_int] = questions
    elif isinstance(data, dict) and "year" in data:
        year_int = int(data["year"])
        questions = data.get("questions", [])
        if not isinstance(questions, list):
            raise ValueError("The questions property must be an array.")
        out[year_int] = questions
    else:
        raise ValueError("Unsupported JSON shape.")
    return out


def validate(year, questions):
    issues = []
    ids, nums, fingerprints = set(), set(), set()
    counts = {"questions": len(questions), "valid_text": 0, "valid_options": 0,
              "valid_keys": 0, "explanations": 0, "topics": 0}
    for pos, q in enumerate(questions, 1):
        label = f"{year} row {pos}"
        if not isinstance(q, dict):
            issues.append(f"{label}: not an object")
            continue
        qid = str(q.get("id") or f"{year}-Q{q.get('question_number', pos)}").strip()
        if not qid:
            issues.append(f"{label}: missing id")
        if qid in ids:
            issues.append(f"{label}: duplicate id {qid}")
        ids.add(qid)
        try:
            num = int(q.get("question_number", pos))
            if str(q.get("question_number", pos)).strip() != str(num):
                raise ValueError
        except (TypeError, ValueError):
            num = None
            issues.append(f"{label}: question_number must be an integer")
        if num is not None:
            if num in nums:
                issues.append(f"{label}: duplicate question number {num}")
            nums.add(num)
        text = str(q.get("question_text", "")).strip()
        if text:
            counts["valid_text"] += 1
        else:
            issues.append(f"{label}: missing question_text")
        normalized = re.sub(r"\s+", " ", text).casefold()
        if normalized and normalized in fingerprints:
            issues.append(f"{label}: duplicate question text detected")
        fingerprints.add(normalized)
        opts = q.get("options")
        valid_options = False
        option_ids = []
        if isinstance(opts, list) and len(opts) == 4:
            option_texts = []
            for ix, opt in enumerate(opts):
                if isinstance(opt, dict):
                    oid = str(opt.get("id", "")).upper().strip()
                    otxt = str(opt.get("text", "")).strip()
                else:
                    oid = "ABCD"[ix]
                    otxt = str(opt).strip()
                option_ids.append(oid)
                option_texts.append(otxt)
            valid_options = set(option_ids) == LETTERS and len(set(option_ids)) == 4 and all(option_texts)
            if valid_options:
                counts["valid_options"] += 1
            else:
                issues.append(f"{label}: options must have unique A/B/C/D ids and non-empty text")
        else:
            issues.append(f"{label}: expected exactly four options")
        key = str(q.get("correct_option", q.get("correctOption", ""))).upper().strip()
        if key in LETTERS and valid_options and key in option_ids:
            counts["valid_keys"] += 1
        else:
            issues.append(f"{label}: missing or invalid correct_option")
        if str(q.get("explanation", q.get("solution", ""))).strip():
            counts["explanations"] += 1
        else:
            issues.append(f"{label}: missing explanation/solution")
        if q.get("topic") or q.get("subtopic"):
            counts["topics"] += 1
        try:
            if int(q.get("year", year)) != year:
                issues.append(f"{label}: question year disagrees with containing paper")
        except (TypeError, ValueError):
            issues.append(f"{label}: invalid question year")
    if year not in YEARS:
        issues.append(f"Unsupported year: {year}")
    if len(questions) != 80:
        issues.append(f"Expected 80 questions for a complete full paper; found {len(questions)}")
    if nums and sorted(nums) != list(range(1, 81)):
        issues.append("Question numbering must be exactly 1 through 80 with no gaps, duplicates or out-of-range values")
    complete = (len(questions) == 80 and all(counts[k] == 80 for k in
                ("valid_text", "valid_options", "valid_keys", "explanations")) and not issues)
    return {"year": year, **counts, "complete": complete, "issues": issues}


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    path = Path(sys.argv[1])
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        papers = load_papers(data)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(json.dumps({"error": str(exc), "complete": False}, indent=2))
        return 2
    reports = [validate(y, qs) for y, qs in sorted(papers.items())]
    result = {"source_file": str(path), "complete_years": sum(bool(r["complete"]) for r in reports),
              "year_reports": reports}
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if reports and all(r["complete"] for r in reports) else 1


if __name__ == "__main__":
    raise SystemExit(main())
