import csv
import html
from collections import Counter
from datetime import datetime
from pathlib import Path


def analyze_csv(path: Path) -> dict:
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        fields = reader.fieldnames or []
        rows = list(reader)
    null_counts = {field: sum(not (row.get(field) or "").strip() for row in rows) for field in fields}
    duplicate_urls = sum(count - 1 for count in Counter((row.get("url") or "").strip() for row in rows if (row.get("url") or "").strip()).values() if count > 1)
    duplicate_ids = sum(count - 1 for count in Counter((row.get("course_id") or "").strip() for row in rows if (row.get("course_id") or "").strip()).values() if count > 1)
    title_counts = Counter(html.unescape((row.get("title") or "").strip()).casefold() for row in rows if (row.get("title") or "").strip())
    duplicate_title_groups = sum(count > 1 for count in title_counts.values())
    duplicate_title_rows = sum(count - 1 for count in title_counts.values() if count > 1)
    invalid_shapes = sum(len(row) != len(fields) or None in row for row in rows)
    return {
        "path": str(path), "rows": len(rows), "fields": fields, "null_counts": null_counts,
        "duplicate_urls": duplicate_urls, "duplicate_ids": duplicate_ids,
        "duplicate_title_groups": duplicate_title_groups, "duplicate_title_rows": duplicate_title_rows,
        "invalid_shapes": invalid_shapes,
        "html_entity_titles": sum(html.unescape(row.get("title") or "") != (row.get("title") or "") for row in rows),
        "scraped_at_min": min((row.get("scraped_at") or "" for row in rows), default=""),
        "scraped_at_max": max((row.get("scraped_at") or "" for row in rows), default=""),
    }


def write_baseline_report(stats: dict, output_path: Path):
    total = stats["rows"]
    lines = [
        "# Baseline report", "", f"Generated: {datetime.now().astimezone().isoformat(timespec='seconds')}", "",
        f"- Source file: `{stats['path']}`", f"- Records: {total:,}", f"- Columns: {len(stats['fields'])}",
        f"- Invalid row shapes: {stats['invalid_shapes']}", f"- Duplicate URLs: {stats['duplicate_urls']}",
        f"- Duplicate source IDs: {stats['duplicate_ids']}", f"- Repeated title groups: {stats['duplicate_title_groups']} ({stats['duplicate_title_rows']} excess rows)",
        f"- Titles with HTML entities: {stats['html_entity_titles']}", f"- Scrape timestamp range: {stats['scraped_at_min']} — {stats['scraped_at_max']}",
        "", "## Null coverage", "", "| Field | Present | Null | Null % |", "|---|---:|---:|---:|",
    ]
    for field in stats["fields"]:
        nulls = stats["null_counts"][field]
        percentage = nulls / total * 100 if total else 0
        lines.append(f"| `{field}` | {total - nulls} | {nulls} | {percentage:.2f}% |")
    lines.extend(["", "## Interpretation", "", "This report describes the imported CSV only. It does not validate metadata against Udemy pages. Missing source fields remain missing; no synthetic values are introduced.", ""])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
