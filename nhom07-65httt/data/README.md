# SmartEdu course data pipeline

The project keeps the existing Udemy CSV as a read-only legacy input and builds auditable raw, staging, approved, release, and database-load artifacts around it. It does not fetch source pages during audit, ingest, transform, release, or database dry-run.

## Current collection boundary

The legacy file `data/udemy_courses.csv` contains 3,001 rows. The local crawler config caps the total at 3,001 and has `source_authorized: false`; the pipeline config also has Udemy authorization disabled. The crawler exits before making a request unless documented authorization is configured. Use its dry-run to inspect the settings without network access:

```powershell
cd D:\source_cua_Huy\crawl_topcv\udemy_course_scraper
python data/crawl.py --config config.udemy.yaml --max-pages 1 --max-courses 10 --dry-run
```

The reported `network_requests` value must be `0`. Do not enable collection until Udemy provides written authorization or an approved API agreement and the source review is updated. Robots rules alone do not establish that authorization. The crawler’s `max_total_courses` remains 3,001 to preserve the existing cap.

## Install

```powershell
cd D:\source_cua_Huy\crawl_topcv\udemy_course_scraper
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Offline pipeline

Run these in order. `audit` analyzes the original CSV; `ingest` copies it into a content-hashed raw batch without modifying the source; `transform` produces staging records and quality reports; `release` contains only records that satisfy the approval checks; `db-load` validates a release in dry-run mode. Use the batch ID printed by `ingest` for the later steps.

```powershell
python pipeline_cli.py audit
python pipeline_cli.py ingest
python pipeline_cli.py transform --batch-id <batch-id>
python pipeline_cli.py release --batch-id <batch-id> --version 0.1.0
python pipeline_cli.py db-load --version 0.1.0
```

Current legacy data is incomplete: description, skills, and level are absent, and many other fields are sparse. Those records are marked `needs_review`; they are not silently enriched or promoted. Therefore the current release is expected to be empty until required fields are reviewed and populated from an authorized source. No taxonomy, external database schema, endpoint, or credentials have been invented. The database adapter is dry-run only until those are supplied.

Original internal demo course content is kept separately in `data/internal/courses.json`; it is not mixed into Udemy records or release candidates. Source review and the field dictionary are in `data/sources.md` and `data/schema_dictionary.md`.

## Tests

```powershell
python -m unittest discover -s tests -v
```
