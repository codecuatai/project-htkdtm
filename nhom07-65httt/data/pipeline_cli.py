import argparse
import json
from pathlib import Path

from pipeline.baseline import analyze_csv, write_baseline_report
from pipeline.config import load_settings, resolve_path
from pipeline.database_loader import load_release
from pipeline.raw_ingest import ingest_legacy_csv
from pipeline.release import create_release
from pipeline.transform import transform_batch


def _latest_batch(root: Path) -> Path:
    if not root.exists():
        raise FileNotFoundError(f"Batch directory does not exist: {root}")
    batches = sorted(path for path in root.iterdir() if path.is_dir())
    if not batches:
        raise FileNotFoundError(f"No batch exists under {root}")
    return batches[-1]


def main(argv=None):
    parser = argparse.ArgumentParser(description="SmartEdu offline course data pipeline")
    parser.add_argument("--config", default="data/config.yaml")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("audit", help="Analyze the legacy CSV without network access")
    subparsers.add_parser("ingest", help="Create immutable raw batch from the existing CSV")
    transform = subparsers.add_parser("transform", help="Normalize, map skills, deduplicate and quality-check a raw batch")
    transform.add_argument("--batch-id")
    release = subparsers.add_parser("release", help="Create a versioned release from approved records only")
    release.add_argument("--batch-id")
    release.add_argument("--version")
    db_load = subparsers.add_parser("db-load", help="Validate a release; dry-run is default")
    db_load.add_argument("--version", required=True)
    db_load.add_argument("--write", action="store_true", help="Attempt configured adapter (currently unavailable without schema/credentials)")
    args = parser.parse_args(argv)

    settings, root = load_settings(args.config)
    paths = settings.get("paths", {})
    legacy_csv = resolve_path(root, settings.get("sources", {}).get("legacy_csv"), "data/udemy_courses.csv")
    raw_root = resolve_path(root, paths.get("raw"), "data/raw")
    staging_root = resolve_path(root, paths.get("staging"), "data/staging")
    approved_root = resolve_path(root, paths.get("approved"), "data/approved")
    releases_root = resolve_path(root, paths.get("releases"), "data/releases")
    reports_root = resolve_path(root, paths.get("reports"), "data/reports")
    taxonomy_path = resolve_path(root, paths.get("taxonomy"))

    if args.command == "audit":
        stats = analyze_csv(legacy_csv)
        output = reports_root / "baseline_report.md"
        write_baseline_report(stats, output)
        print(json.dumps({"report": str(output), **{key: stats[key] for key in ("rows", "duplicate_urls", "duplicate_ids", "invalid_shapes")}}, indent=2))
    elif args.command == "ingest":
        batch_id, batch_dir = ingest_legacy_csv(legacy_csv, raw_root)
        print(json.dumps({"batch_id": batch_id, "raw_dir": str(batch_dir), "source_file_preserved": True}, indent=2))
    elif args.command == "transform":
        batch = raw_root / args.batch_id if args.batch_id else _latest_batch(raw_root)
        summary = transform_batch(batch, staging_root, approved_root, reports_root, taxonomy_path)
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    elif args.command == "release":
        version = args.version or settings.get("project", {}).get("dataset_version", "0.1.0")
        metadata = create_release(approved_root, releases_root, version, args.batch_id, settings.get("project", {}).get("reviewer"))
        print(json.dumps(metadata, indent=2, ensure_ascii=False))
    elif args.command == "db-load":
        release_dir = releases_root / args.version
        database = dict(settings.get("database", {}))
        result = load_release(release_dir, database, dry_run=not args.write)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
