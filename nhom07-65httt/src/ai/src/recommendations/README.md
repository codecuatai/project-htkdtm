# Recommendation rankers

## Shared candidate set

`LearnerProfile.candidate_course_ids` is the candidate set after the caller has
applied the same approved-course, eligibility, purchase/enrollment, and
prerequisite hard filters for every model. `null` means use the full supplied
catalog; an empty list means no eligible courses. M0, M1, and M2 resolve and
sort these IDs with the same helper. They do not independently infer a different
hard-filter result.

The current ranker input deliberately excludes price and commission. They are
not ranking features and cannot increase an M2 score. Popularity is used only
when no usable M2 component exists for any candidate; it is not part of the M2
formula.

## M1 semantic embedding

M1 encodes the shared M0 `CourseDocument.text` and learner query with
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, pinned to
revision `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`. The returned model version
includes both model ID and immutable revision. Cosine similarity is mapped from
`[-1, 1]` to `[0, 1]`; it is not a probability.

Call `precompute_catalog()` when publishing a dataset version to cache course
embeddings before serving requests. Compressed JSON cache files default to
`%USERPROFILE%\.cache\smartedu\m1`; set `AI_M1_CACHE_DIR` to override. Cache
keys include the dataset version, model revision, and cache schema. A content
hash rejects a changed catalog under an already-published version.

The caller supplies the same pre-filtered candidate IDs through
`LearnerProfile.candidate_course_ids`. An empty query uses popularity fallback
and returns a null semantic score. Tests inject a fake encoder so the lightweight
test environment does not need the large model dependencies.

## M2 hybrid and prerequisite roadmap

`M2HybridRanker` uses the required score when components are known:

`Score = 100 × (0.50 × S + 0.35 × G + 0.15 × L)`

- `S` is M1 cosine mapped to `[0, 1]`.
- `G` is the total target-skill weight covered by a course, divided by the
  total weight of target skills not already held by the learner. A known empty
  skill list is distinct from unknown (`null`) skill metadata.
- `L` is level proximity across `BEGINNER`, `INTERMEDIATE`, and `ADVANCED`;
  exact match is `1`, one level apart is `0.5`, and two levels apart is `0`.
  `ALL_LEVELS` is `1`. Unknown levels remain `null`.

The result records each component, its effective weight, completeness, model
version, and a 0–100 score. If a positive-weight component is unknown for a
candidate, remaining known weights are normalized and the result is marked
partial; unknowns are never silently converted to zero. If all components are
unknown, score is `null` and candidates use the deterministic popularity
fallback. The default weights are `0.50/0.35/0.15`.

`tune_m2_weights_on_dev()` evaluates supplied weight candidates using only a
split explicitly named `dev`; it rejects `test` and other split names. Use the
selected configuration for final test reporting, without further tuning.
Synthetic/unit-test labels verify mechanics only and must not be reported as
model-quality evidence.

`build_skill_roadmap()` takes target skill IDs, completed skill IDs, and
`skill_id -> prerequisite_skill_ids`. It returns a stable topological order,
omits completed prerequisites, and raises explicit errors for unknown graph
nodes, unknown prerequisite data, or cycles. The taxonomy and prerequisite
mapping must come from an approved, versioned source; the ranker does not invent
or infer that graph.

## Fair offline evaluation

Use the same held-out learner profiles, dataset version, and filtered candidate
IDs for M0, M1, and M2. `compare_model_runs()` rejects runs with different
candidate sets or dataset versions, duplicate results, or results outside the
shared candidate set. It reports macro `NDCG@K`, `Precision@K`, profiles
returning fewer than K items, and P50/P95 latency. `benchmark_latency()`
collects end-to-end timings after warmup; precompute the M1 catalog before
benchmarking and use at least 100 measured calls for a P95 report.

The repository includes M0 and the shared metric comparator, but no approved
held-out relevance labels or production prerequisite taxonomy. Therefore no
real M0/M1/M2 quality comparison or group consensus is claimed until those
inputs are supplied and evaluated on the same splits.
