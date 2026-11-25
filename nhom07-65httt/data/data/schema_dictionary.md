# SmartEdu course schema (v1.0)

CSV uses UTF-8 BOM for spreadsheet compatibility. JSONL uses UTF-8 and JSON `null` for unknown values. The legacy source file is preserved unchanged; normalized records use this schema.

| Field | Type | Required | Meaning / normalization | Inference |
|---|---|---:|---|---|
| `course_id` | string | yes | Stable dataset key: `<source_name>:<source_course_id>` | Deterministic ID only |
| `source_name` | string | yes | Origin, currently `udemy` for legacy rows | Derived from validated source URL |
| `source_course_id` | string | yes | Source ID/slug from legacy record | Source field |
| `title` | string | yes | HTML entities removed, tags stripped, Unicode NFC, whitespace collapsed | No semantic edits |
| `canonical_url` | string | yes | HTTPS course URL with tracking parameters removed | URL normalization only |
| `source_url` | string | yes | Original URL as stored in legacy CSV | None |
| `description` | string/null | no | Public course description, if authorized and supplied | Never synthesized |
| `raw_description` | string/null | no | Exact source description before cleaning | Never synthesized |
| `clean_description` | string/null | no | HTML-stripped, normalized description | Derived only from raw description |
| `provider` | string/null | no | Instructor/provider | Source field only |
| `language` | string/null | no | ISO 639-1 code when explicitly mapped | No guessing |
| `level` | string/null | no | Beginner / Intermediate / Advanced / All Levels / Unknown | No guessing; absent stays null |
| `skills` | array/null | no | Taxonomy-mapped skill view | Derived; source is retained separately |
| `direct_skills` | array/null | no | Skills explicitly supplied by the source | No inference |
| `inferred_skills` | array/null | no | Skill candidates from configured taxonomy rules | Must include confidence and review flag |
| `prerequisites` | string/array/null | no | Explicit source prerequisites | No guessing |
| `duration_minutes` | integer/null | no | Duration converted only when source units are explicit | Deterministic conversion |
| `price_amount` | number/null | no | Numeric amount in original currency | No conversion; missing is null, not zero |
| `price_currency` | string/null | no | ISO currency code if source supplies one | No guessing |
| `image_url` | string/null | no | Course image URL | Source field |
| `rating` | number/null | no | Source rating | Numeric parse only |
| `rating_count` | integer/null | no | Number of ratings/reviews | Numeric parse only |
| `student_count` | integer/null | no | Enrolment count | Numeric parse only |
| `category`, `subcategory` | string/null | no | Source taxonomy labels | Source field only |
| `lecture_count`, `section_count` | integer/null | no | Course counts | Numeric parse only |
| `last_updated` | string/null | no | Source update date | Source field only |
| `offer_type` | enum | yes | `EXTERNAL_REFERENCE` or `INTERNAL` | Explicit source class |
| `crawled_at` | ISO-8601 string/null | no | Original scrape time if present | Not regenerated during import |
| `quality_status` | enum | yes | `approved_candidate`, `needs_review`, `rejected` | Quality rules |
| `quality_flags` | array | yes | Missing/invalid/review flags | Quality rules |
| `duplicate_status` | enum | yes | `unique`, `exact_duplicate`, `near_duplicate` | Deduplication only |
| `dataset_version` | string/null | no | Release version | Release process |
| `source_metadata` | object | yes | Other original source columns, preserved without loss | Verbatim legacy values |

### Legacy mapping notes

`course_id` in the old CSV is a URL slug and maps to `source_course_id`. The new stable `course_id` is prefixed with `udemy:`. Existing scraped rows have no description or skill data; those fields remain null and produce review flags. Existing values are strings in CSV; normalization produces numeric JSON values where parsing is unambiguous.
