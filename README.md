# UPSC CSE Command Centre — v1

**The Complete Beginner's Guide & Prelims Analysis Lab**  
Research cutoff shown in the site: **12 October 2026**

This is a responsive, self-contained educational website built from the two supplied UPSC CSE beginner handbooks. The generated `index.html` contains its styles, JavaScript and embedded content; it does not need a server, build tool, API key or internet connection for its core local features. Official source links do need an internet connection.

## Start using the website

1. Download and extract `UPSC_CSE_Command_Centre_v1.zip`.
2. Open `index.html` in a current browser (Chrome, Edge, Firefox or Safari).
3. Use the navigation menu to read handbook chapters, explore the GS-I/CSAT syllabus taxonomies, take original practice quizzes, use calculators, or track preparation.
4. Progress is stored in that browser's `localStorage`. It is **not** automatically synced to another device or browser. Use **Export my progress JSON** for a portable backup.

The website is intentionally usable as a local file. If your browser restricts local file storage, run it from a simple local web server instead (for example, from the extracted folder: `python3 -m http.server 8000`, then visit `http://localhost:8000`).

## What's included

- All **24 main handbook chapters**, plus the executive summary, source material and relevant appendices from the two supplied PDFs.
- Chapter reader with key takeaways, next-action prompts and completion tracking.
- Eligibility self-check (2026 notification reference only), application checklist, syllabus taxonomy, study planner and 30-day launch checklist.
- Separate GS Paper I and CSAT topic explorers, with taxonomy-based filters and progress status.
- Official UPSC paper-source links listed for the **2017–2026** cycles. Direct PDF links are included where verified; other years link to the official archive/listing.
- A question-bank import/export workflow with a documented question schema.
- **20 original practice questions** across GS-I and CSAT, separately labelled as original practice—not official previous-year questions.
- Mini-mock interface with timer, navigation, marking for review, submission, scoring and answer review.
- GS-I/CSAT score calculators, preparation budget estimator, revision scheduler, historical cutoff comparison, weak-topic prioritisation and local progress export/reset.
- Responsive desktop/mobile navigation, global search and methodology/source inventory.

## Important limits in this version

This is a **working first release**, not a completed ten-year question-by-question research corpus.

- The official question bank starts empty by design. Individual official questions, answer options, answers and explanations have not been imported into it because the build process did not successfully retrieve and cross-check all large official PDF files and matching keys.
- No fabricated official question text, answer keys, topic counts or difficulty labels are included.
- The site provides the topic taxonomy and the analysis methodology, but ten-year GS-I/CSAT subject-count charts, current-affairs-linkage shares, volatility calculations and per-question difficulty assessments have **not** yet been computed.
- Official-answer availability has not been reconciled question by question. The source status table says so rather than assuming a key exists or does not exist.
- Historical cutoffs shown in the tool are a limited General-category comparison (2023–2025), as documented in the site. They are not future predictions.
- The site does not auto-update. Rebuild or replace data only after checking the relevant official source and updating the research date.

## Project structure

```text
upsc_command_centre/
├── index.html                         # Standalone site to open
├── index.template.html                # UI, styling and application logic
├── README.md
├── METHODOLOGY_AND_QA.md
├── scripts/
│   ├── build_site.py                  # Rebuild index.html from structured data
│   └── qa_check.py                    # Static/data sanity checks
└── data/
    ├── embedded_handbook.json         # Page-aware handbook text and rendered chapter HTML
    ├── handbook_chapters.json         # Normalised extracted handbook text/metadata
    ├── gs1_taxonomy.json              # GS-I taxonomy; no fabricated statistics
    ├── csat_taxonomy.json             # CSAT taxonomy; no fabricated statistics
    ├── official_papers.json           # Official source links and verified availability metadata
    ├── official_question_bank.template.json # Import schema and controlled status values
    └── original_practice_questions.json      # 20 original practice items
```

## Rebuild the standalone website

Requires Python 3 only; no third-party Python packages are needed.

```bash
cd upsc_command_centre
python3 scripts/build_site.py
python3 scripts/qa_check.py
```

Edit the JSON data or `index.template.html`, then rebuild. `index.html` is generated output; direct edits to it are overwritten by the next build.

## Import verified official question records

1. Transcribe text/options from an official UPSC question paper and reconcile numbering against that paper's actual version.
2. Match the answer only after checking the relevant official answer key or a defensible correction. Record uncertainty explicitly.
3. Fill records following `data/official_question_bank.template.json`.
4. In the site, go to **Previous-Year Questions** and use the JSON import control.

Import supports a JSON array or `{ "questions": [...] }`. Basic required fields are `id`, `year`, `paper`, `text`, `options` and `sourceUrl`. Do not treat successful import as verification: the importer checks structure only. Recommended `paper` values are `GS-I` and `CSAT`; `answerStatus` values should be `official-key-verified`, `key-not-available` or `disputed-or-ambiguous`. Keep original practice questions in their separate dataset.

## Browser storage and privacy

The site stores your progress, bookmarks, notes, imported question records, checklist state and mock history in the browser's local storage. No account or backend is provided; data may be lost if browser storage is cleared and will not sync between devices. Export a JSON backup before resetting browser data.

## Primary official web sources

- UPSC CSE Prelims 2026 examination page: <https://www.upsc.gov.in/examinations/Civil%20Services%20(Preliminary)%20Examination,%202026>
- UPSC previous question papers: <https://www.upsc.gov.in/examinations/previous-question-papers>
- UPSC previous question paper archives: <https://www.upsc.gov.in/examinations/previous-question-papers/archives>
- UPSC answer keys: <https://www.upsc.gov.in/examinations/answer-keys>

Use the active-cycle UPSC notification as the controlling source for eligibility and examination rules. The site's eligibility/pattern examples use the CSE 2026 notification and must be rechecked for a later cycle.
