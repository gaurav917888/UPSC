#!/usr/bin/env python3
"""Rebuild standalone index.html from the structured JSON files in ../data."""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((BASE/'data'/path).read_text(encoding='utf-8'))

def safe_json(data):
    # Escape script-closing sequences so source text cannot terminate a JSON script element.
    return json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')

html=(BASE/'index.template.html').read_text(encoding='utf-8')
replacements={
 '__HANDBOOK_DATA__': safe_json(load('embedded_handbook.json')),
 '__GS_DATA__': safe_json(load('gs1_taxonomy.json')),
 '__CSAT_DATA__': safe_json(load('csat_taxonomy.json')),
 '__PAPERS_DATA__': safe_json(load('official_papers.json')),
 '__PRACTICE_DATA__': safe_json(load('original_practice_questions.json')),
}
for key,val in replacements.items():
    if key not in html: raise SystemExit(f'Missing placeholder: {key}')
    html=html.replace(key,val)
(BASE/'index.html').write_text(html,encoding='utf-8')
print(f'Built {BASE / "index.html"} ({len(html):,} characters)')
