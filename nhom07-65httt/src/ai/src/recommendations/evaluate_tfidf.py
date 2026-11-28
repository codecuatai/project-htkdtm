"""Run M0 over every profile in a JSON evaluation set and export ranked results."""

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import platform
from typing import Mapping, Sequence

import sklearn

from src.recommendations.tfidf_baseline import (
    MODEL_VERSION,
    VECTORIZER_CONFIG,
    CourseDocument,
    LearnerProfile,
    TfidfBaseline,
    terms_from_value,
)


def _read_json_records(path: Path, collection_name: str) -> list[Mapping[str, object]]:
    with path.open(encoding="utf-8-sig") as file:
        data = json.load(file)
    if not isinstance(data, list):
        raise ValueError(f"{path} must contain a JSON array of {collection_name}")
    if any(not isinstance(item, dict) for item in data):
        raise ValueError(f"every {collection_name} record in {path} must be an object")
    return data


def _required_string(record: Mapping[str, object], field: str, source: str) -> str:
    value = record.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{source}.{field} must be a non-empty string")
    return value.strip()


def _optional_string(
    record: Mapping[str, object], field: str, source: str
) -> str | None:
    value = record.get(field)
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"{source}.{field} must be a string or null")
    return value


def _popularity_score(record: Mapping[str, object], source: str) -> float | None:
    value = record.get("popularity_score")
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{source}.popularity_score must be a number or null")
    score = float(value)
    if not math.isfinite(score) or score < 0:
        raise ValueError(f"{source}.popularity_score must be finite and non-negative")
    return score


def _parse_courses(records: Sequence[Mapping[str, object]]) -> tuple[CourseDocument, ...]:
    courses = []
    for index, record in enumerate(records):
        source = f"courses[{index}]"
        courses.append(
            CourseDocument(
                course_id=_required_string(record, "course_id", source),
                title=_required_string(record, "title", source),
                description=_optional_string(record, "description", source),
                skills=terms_from_value(record.get("skills"), field_name=f"{source}.skills"),
                direct_skills=terms_from_value(
                    record.get("direct_skills"), field_name=f"{source}.direct_skills"
                ),
                inferred_skills=terms_from_value(
                    record.get("inferred_skills"),
                    field_name=f"{source}.inferred_skills",
                ),
                popularity_score=_popularity_score(record, source),
            )
        )
    return tuple(courses)


def _parse_profiles(
    records: Sequence[Mapping[str, object]],
) -> tuple[LearnerProfile, ...]:
    profiles = []
    for index, record in enumerate(records):
        source = f"profiles[{index}]"
        candidate_ids = record.get("candidate_course_ids")
        if candidate_ids is not None and (
            not isinstance(candidate_ids, list)
            or any(not isinstance(course_id, str) for course_id in candidate_ids)
        ):
            raise ValueError(
                f"{source}.candidate_course_ids must be a list of strings or null"
            )
        profiles.append(
            LearnerProfile(
                learner_key=_required_string(record, "learner_key", source),
                goals=terms_from_value(record.get("goals"), field_name=f"{source}.goals"),
                current_skills=terms_from_value(
                    record.get("current_skills"), field_name=f"{source}.current_skills"
                ),
                target_text=_optional_string(record, "target_text", source),
                candidate_course_ids=(
                    tuple(candidate_ids) if candidate_ids is not None else None
                ),
            )
        )
    keys = [profile.learner_key for profile in profiles]
    if len(keys) != len(set(keys)):
        raise ValueError("learner_key values must be unique")
    return tuple(profiles)


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _candidate_set_hash(course_ids: Sequence[str]) -> str:
    payload = "\n".join(sorted(course_ids)).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def evaluate(
    *,
    courses_path: Path,
    profiles_path: Path,
    output_path: Path,
    dataset_version_id: str,
    top_k: int = 5,
) -> Path:
    """Evaluate every profile and write CSV recommendations plus a reproducibility manifest."""
    if not dataset_version_id.strip():
        raise ValueError("dataset_version_id must not be empty")
    if top_k < 1:
        raise ValueError("top_k must be at least 1")

    courses = _parse_courses(_read_json_records(courses_path, "courses"))
    profiles = _parse_profiles(_read_json_records(profiles_path, "profiles"))
    ranker = TfidfBaseline(courses)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_path = output_path.with_suffix(".metadata.json")
    protected_paths = {
        courses_path.resolve(),
        profiles_path.resolve(),
    }
    if output_path.resolve() in protected_paths or metadata_path.resolve() in protected_paths:
        raise ValueError("output paths must not overwrite the course or profile inputs")

    profile_results = []
    fallback_profile_count = 0
    with output_path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=(
                "learner_key",
                "model",
                "model_version",
                "dataset_version_id",
                "candidate_set_hash",
                "rank",
                "course_id",
                "score",
                "score_scale",
                "ranking_method",
                "fallback_reason",
                "popularity_score",
            ),
        )
        writer.writeheader()
        for profile in profiles:
            candidates = (
                tuple(course.course_id for course in courses)
                if profile.candidate_course_ids is None
                else profile.candidate_course_ids
            )
            candidate_hash = _candidate_set_hash(candidates)
            ranked = ranker.rank(profile, top_k=top_k)
            fallback_reason = (
                ranked[0].fallback_reason if ranked else "no_eligible_candidates"
            )
            if fallback_reason is not None and ranked:
                fallback_profile_count += 1
            profile_results.append(
                {
                    "learner_key": profile.learner_key,
                    "candidate_set_hash": candidate_hash,
                    "candidate_count": len(candidates),
                    "result_count": len(ranked),
                    "fallback_reason": fallback_reason,
                }
            )
            if not ranked:
                writer.writerow(
                    {
                        "learner_key": profile.learner_key,
                        "model": "M0",
                        "model_version": MODEL_VERSION,
                        "dataset_version_id": dataset_version_id,
                        "candidate_set_hash": candidate_hash,
                        "score_scale": "cosine_0_to_1",
                        "ranking_method": "no_eligible_candidates",
                        "fallback_reason": "no_eligible_candidates",
                    }
                )
                continue
            for result in ranked:
                writer.writerow(
                    {
                        "learner_key": profile.learner_key,
                        "model": "M0",
                        "model_version": MODEL_VERSION,
                        "dataset_version_id": dataset_version_id,
                        "candidate_set_hash": candidate_hash,
                        "rank": result.rank,
                        "course_id": result.course.course_id,
                        "score": f"{result.score:.12f}",
                        "score_scale": "cosine_0_to_1",
                        "ranking_method": result.ranking_method,
                        "fallback_reason": result.fallback_reason or "",
                        "popularity_score": (
                            result.course.popularity_score
                            if result.course.popularity_score is not None
                            else ""
                        ),
                    }
                )

    metadata_path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "model": "M0",
                "model_version": MODEL_VERSION,
                "dataset_version_id": dataset_version_id,
                "score_scale": "cosine_0_to_1; popularity fallback rows retain score 0",
                "top_k": top_k,
                "deterministic": True,
                "python_version": platform.python_version(),
                "scikit_learn_version": sklearn.__version__,
                "vectorizer_config": VECTORIZER_CONFIG,
                "courses": {
                    "path": str(courses_path),
                    "sha256": _sha256_file(courses_path),
                    "count": len(courses),
                },
                "profiles": {
                    "path": str(profiles_path),
                    "sha256": _sha256_file(profiles_path),
                    "count": len(profiles),
                },
                "output": {
                    "path": str(output_path),
                    "sha256": _sha256_file(output_path),
                    "recommendation_rows": sum(
                        result["result_count"] for result in profile_results
                    ),
                    "profiles_with_fallback": fallback_profile_count,
                    "profiles": profile_results,
                },
            },
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )
    return metadata_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--courses", type=Path, required=True, help="Approved course JSON array")
    parser.add_argument("--profiles", type=Path, required=True, help="Offline test profile JSON array")
    parser.add_argument("--output", type=Path, required=True, help="Top-K CSV output path")
    parser.add_argument("--dataset-version", required=True, help="Immutable course dataset version")
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()
    metadata_path = evaluate(
        courses_path=args.courses,
        profiles_path=args.profiles,
        output_path=args.output,
        dataset_version_id=args.dataset_version,
        top_k=args.top_k,
    )
    print(f"M0 recommendations: {args.output}")
    print(f"Reproducibility manifest: {metadata_path}")


if __name__ == "__main__":
    main()
