# Methodology, source coverage and QA report

**Build:** UPSC CSE Command Centre v1  
**Research cutoff represented in the handbook/site:** 12 October 2026

## 1. Handbook-source handling

The site was built from these user-supplied PDFs:

- `UPSC_CSE_Complete_Beginners_Handbook(1).pdf` — 48 pages.
- `UPSC_CSE_Beginners_Handbook.pdf` — 47 pages.

Both were text-extracted and their chapter structures were reconciled. The Complete Handbook edition supplies the 24-part chapter framework, executive summary, source appendix and appendices; the companion edition adds alternate/overlapping explanations and study timetables/research notes. Repeated material is consolidated into the main 24 chapters; distinct supplement/appendix material is retained as reference chapters. Source page references are retained in the chapter metadata.

Because PDF extraction can flatten table cells, many tabular blocks are preserved as readable preformatted, horizontally scrollable source-table text instead of being silently reinterpreted as data. The original concepts, examples, cautions and source claims are preserved in the reader; this is a rendering transformation, not a new authority for claims in the handbooks.

## 2. Official question-paper source coverage

The paper registry lists the ten cycles **2017 through 2026** and points to the official UPSC paper listing/archive. Direct official PDF URLs are included for the recent years where the official URL was verified during research. The 2026 page lists the General Studies Paper I and Paper II question papers, with the exam held on 24 May 2026 and the papers uploaded to the UPSC page on 25 May 2026.

Official URLs:

- 2026 exam page: <https://www.upsc.gov.in/examinations/Civil%20Services%20(Preliminary)%20Examination,%202026>
- Previous question papers: <https://www.upsc.gov.in/examinations/previous-question-papers>
- Archives: <https://www.upsc.gov.in/examinations/previous-question-papers/archives>
- Answer keys: <https://www.upsc.gov.in/examinations/answer-keys>

### Why the question-level database is empty

The large official PDF files could not be retrieved and independently parsed/compared in the build environment. Therefore a defensible, question-by-question reconciliation of official wording, numbering, answer keys, withdrawn/disputed questions and classifications was not completed. The site intentionally imports **zero** official PYQs by default. Its import mechanism and JSON schema are implemented for later verified records.

This means the build does **not** claim to have completed:

- Exact primary-subject counts, shares and annual distribution charts for all years.
- Static versus current-affairs-linked splits.
- Difficulty distributions by year/subject.
- Comprehension, quantitative and reasoning counts per CSAT year.
- Per-question answer-key reconciliation.
- Ten-year average frequency/volatility rankings.

Those values are absent, not zero. They must not be inferred from a taxonomy or a coaching-site chart without source-level checking.

## 3. Classification policy intended for future data

Each official question must receive one mutually exclusive **primary category**. Optional secondary tags may capture interdisciplinary content, subject overlap, current-affairs linkage or specific skill. Primary-category totals must reconcile exactly to the verified number of questions in the paper. Multi-tag visuals must be explicitly labelled as multi-tag counting.

Difficulty is a site-authored analytical estimate unless UPSC publishes an official difficulty label. The rubric should consider required reasoning steps, factual specificity, option ambiguity, cross-domain dependencies, elimination burden and concept familiarity. Candidate/mock accuracy is not an official difficulty label.

Static/current-affairs linkage should be assigned using an explicit rule: a contemporary development is considered linked only if it materially supplies the question's hook or changes the relevant knowledge needed to answer. Each imported record should preserve the decision, rationale, confidence and a source URL.

Answer status should be one of:

- `official-key-verified`
- `key-not-available`
- `disputed-or-ambiguous`

Do not infer answers from coaching keys without labelling their status. For withdrawn or disputed items, record the reason and applicable official communication.

## 4. Historical data and labels

The site distinguishes:

- **Official fact:** supported by an official notice/source for a specified cycle.
- **Historical data:** a result from a named past cycle, not a forecast.
- **Analysis / classification:** a site-authored, transparent judgement.
- **Recommendation:** a suggested preparation method, not a guarantee.
- **Estimate:** a planning value with visible assumptions.
- **Candidate account:** reported individual experience, not general causal evidence.

The eligibility self-check is based on the **CSE 2026** notification reference represented in the uploaded handbook. It is not a determination of legal eligibility and must not be carried into later cycles without checking the then-current notice. The limited General-category Prelims cutoff comparison uses the handbook's cited official results for 2023 (75.41/200), 2024 (87.98/200) and 2025 (92.66/200); these historical marks are not a forecast.

## 5. Implemented functions

- Responsive navigation, search, chapter reader, chapter completion and next-action prompts.
- Source chapter content and appendices extracted from both handbooks.
- GS-I and CSAT taxonomy explorers and syllabus progress states.
- Links to official papers listed for 2017–2026.
- Official-question import, search/filter, answer reveal/status, bookmarks, attempt status, notes and export workflow.
- Separate original practice data (20 items), with answer explanations/traps.
- Timed original mini mock interface, question navigation, mark-for-review, score, answer review and mock history.
- GS-I/CSAT score calculators, budget estimator, revision-date scheduler, historical cutoff comparison and weak-topic ranking heuristic.
- 30-day checklist, application checklist, weekly review, 12/18/24-month plan generator, progress export/reset.
- Browser local-storage persistence. No cross-device sync or automatic content updates.

## 6. QA checks actually run

Static/data checks completed on the generated `index.html` and packaged datasets:

- Python build script runs and produces the standalone HTML file.
- JavaScript syntax check with `node --check` passed on the extracted executable script.
- Parsed JSON data files to verify validity.
- Confirmed 33 handbook reader items, of which exactly 24 are the numbered main chapters.
- Confirmed 10 official paper registry entries, years 2017–2026.
- Confirmed 20 original practice records, unique IDs, four options per item and answer indices within the 0–3 range.
- Confirmed no duplicate static HTML IDs.
- Checked all statically referenced `$()` element IDs against the HTML; the only exception is `restartMock`, which is created dynamically after mock submission and is therefore expected not to exist in the initial markup.
- Confirmed embedded build placeholders are all resolved and checked score calculations independently against the stated marking formula.
- Rebuilt HTML from template/data after the last template update.

### Tests not completed

A full browser rendering/interaction test was attempted with local Chromium but the headless process timed out before returning DOM output in this container. No claim is made that every UI state has passed end-to-end browser automation or mobile-device testing. Core event wiring and static content were inspected, but a real-world browser smoke test by the user is still advisable.

## 7. Known issues and deferred requirements

1. Full official question-by-question database and verified explanations are not populated.
2. Ten-year analytical distribution charts/tables are not computed.
3. The handbook reader includes all major chapters and source text, but complex PDF tables are preserved as source-formatted blocks rather than rebuilt into native sortable data tables.
4. Full-year/category cutoffs and candidate-count history are not populated beyond the limited official data supported in this release.
5. Toppers module remains source/interpretation-led through handbook content; it is not a large candidate-by-candidate interview archive.
6. The site runs without a server, so local progress lives only in that browser profile and is not synced.
7. Links are sourced from the official UPSC site, but the build does not run a recurring automated link monitor.

## 8. Recommended next research pass

Download each official GS-I and CSAT paper for each intended cycle, maintain the exact official paper and set numbering, extract the questions, reconcile with applicable official keys and correction notices, manually review mixed-topic/difficulty classifications, then import the validated records. Before displaying charts, test that every paper's primary-category totals reconcile to the verified total question count, document disputed/withdrawn questions and rerun the QA checks.
