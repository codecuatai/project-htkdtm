# Source inventory

## Udemy

- Base URL: <https://www.udemy.com/>
- Robots: <https://www.udemy.com/robots.txt>
- Terms portal: <https://www.udemy.com/terms/terms-of-use/>
- Sitemap advertised by robots: <https://www.udemy.com/sitemap.xml>
- Current local data: `data/udemy_courses.csv`, 3,001 records captured on 2026-11-18.
- Metadata seen in the existing CSV: title, canonical course URL/slug, rating, rating count, duration, lecture/section counts, image URL, and scrape timestamp.
- Audit status: **blocked for further automated collection pending written authorization**. Udemy's currently indexed Terms of Use text prohibits scraping or other automated access. Robots advertises a sitemap and allows some URL patterns, but robots permission does not override the Terms. No API credential or written authorization was supplied.
- Collection method for the existing CSV: legacy import only. This pipeline does not fetch Udemy pages.
- Limitations: no raw HTML/JSON response was retained; price, instructor, category, language, level, description, and skill fields are missing from all or nearly all existing rows.

## khoahocre.com

- Base URL: <https://khoahocre.com/>
- Status: **not assessed; not used**. The current robots resource could not be verified from the available source. No terms or authorization were provided, so this source is not crawled or included in the dataset.

## Additional sources

No additional source has been added. A source must pass robots and terms review and have an authorized public metadata path before integration.

## Legal and operational references

- Udemy robots currently advertises a sitemap, disallows most query-string URLs, and allows selected paths. This is recorded as URL guidance only, not as permission to scrape.
- The indexed Udemy Terms of Use text states that automated scraping/spidering is not allowed. Recheck the official Terms and obtain written authorization or an approved API agreement before enabling collection.
- The exact audit time and source statuses are included in each pipeline run's manifest/report.
