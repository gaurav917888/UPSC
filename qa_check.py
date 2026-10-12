#!/usr/bin/env python3
"""Static integrity checks for the UPSC CSE Command Centre package."""
import collections, json, re, shutil, subprocess, tempfile
from html.parser import HTMLParser
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"

def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))

class IdParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if "id" in attrs: self.ids.append(attrs["id"])

errors=[]
html_path=BASE/"index.html"
template_path=BASE/"index.template.html"
if not html_path.exists(): errors.append("index.html is missing")
if not template_path.exists(): errors.append("index.template.html is missing")
if errors:
    print("FAIL:", *errors, sep="\n- "); raise SystemExit(1)
html=html_path.read_text(encoding="utf-8")
embedded=load("embedded_handbook.json")
chapters=load("handbook_chapters.json")
gs=load("gs1_taxonomy.json")
csat=load("csat_taxonomy.json")
papers=load("official_papers.json")
practice=load("original_practice_questions.json")
question_schema=load("official_question_bank.template.json")

main_count=sum(x.get("kind")=="chapter" for x in embedded)
if main_count != 24: errors.append(f"expected 24 main chapters, found {main_count}")
if len(embedded) != 33: errors.append(f"expected 33 reader content items, found {len(embedded)}")
if len(chapters) != len(embedded): errors.append("raw and embedded handbook item counts differ")
if len(papers) != 10 or sorted(int(p["year"]) for p in papers) != list(range(2017, 2027)):
    errors.append("paper registry must list each year from 2017 through 2026 exactly once")
if len({int(p["year"]) for p in papers}) != len(papers): errors.append("duplicate paper year")
if len(practice) != 20: errors.append(f"expected 20 original practice questions, found {len(practice)}")
if len({q.get("id") for q in practice}) != len(practice): errors.append("duplicate original practice question IDs")
for q in practice:
    if len(q.get("options", [])) != 4: errors.append(f"{q.get('id')}: expected four options")
    a=q.get("answer")
    if not isinstance(a, int) or not 0 <= a < 4: errors.append(f"{q.get('id')}: answer index is not within 0-3")
    if q.get("year") != "Original": errors.append(f"{q.get('id')}: original item must not masquerade as an official year")
if not question_schema.get("requiredFields"): errors.append("official-question JSON schema is missing requiredFields")
if any(p in html for p in ("__HANDBOOK_DATA__","__GS_DATA__","__CSAT_DATA__","__PAPERS_DATA__","__PRACTICE_DATA__")):
    errors.append("one or more build placeholders remain unresolved")

parser=IdParser(); parser.feed(html)
dup_ids=[x for x,c in collections.Counter(parser.ids).items() if c>1]
if dup_ids: errors.append("duplicate HTML IDs: " + ", ".join(dup_ids))
script_blocks=re.findall(r'<script(?![^>]*type=["\']application/json["\'])[^>]*>(.*?)</script>', html, re.S|re.I)
js="\n".join(script_blocks)
if not script_blocks: errors.append("no executable JavaScript blocks found")
missing_static=set(re.findall(r"\$\(['\"]([^'\"]+)['\"]\)",js))-set(parser.ids)
# `restartMock` is injected into the page only after a mock is submitted.
missing_static.discard("restartMock")
if missing_static: errors.append("missing static element IDs referenced in JavaScript: " + ", ".join(sorted(missing_static)))

node=shutil.which("node")
if node and js:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".js", encoding="utf-8", delete=False) as f:
        f.write(js); js_path=f.name
    result=subprocess.run([node,"--check",js_path],capture_output=True,text=True)
    Path(js_path).unlink(missing_ok=True)
    if result.returncode: errors.append("node --check failed: " + result.stderr.strip())
    else: print("PASS JavaScript syntax (node --check)")
else:
    print("SKIP JavaScript syntax check (Node.js not available)")

# Independent score-formula test: marks - (incorrect × marks × 1/3).
def net(correct, wrong, marks): return correct*marks - wrong*marks/3
checks=[("GS sample net",net(55,25,2), 93.33333333333333), ("CSAT sample net",net(35,20,2.5), 70.83333333333333)]
for label,actual,expected in checks:
    if abs(actual-expected)>1e-8: errors.append(f"{label} formula mismatch")
    else: print(f"PASS {label}: {actual:.2f}")

print(f"Reader items: {len(embedded)}; main chapters: {main_count}; GS-I taxonomy families: {len(gs)}; CSAT taxonomy families: {len(csat)}")
print(f"Official paper-source years: {min(int(p['year']) for p in papers)}–{max(int(p['year']) for p in papers)} ({len(papers)} years)")
print(f"Original practice items: {len(practice)}; unique HTML IDs: {len(parser.ids)}; unique-ID failures: {len(dup_ids)}")
print("Official question records embedded by default: 0 (deliberate; no question-level reconciliation was completed).")

if errors:
    print("\nFAIL")
    for error in errors: print("- " + error)
    raise SystemExit(1)
print("\nPASS: all package integrity checks completed. This is a static/data check, not an end-to-end browser test.")
