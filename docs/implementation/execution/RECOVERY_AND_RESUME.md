# SalesFortis — Recovery & Resume Instructions

## 1. Quick Resume Protocol
If a session is interrupted:
1. Inspect `docs/implementation/execution/EXECUTION_STATE.json` to identify the current phase, checkpoint, and next action.
2. Inspect `git status --short` to confirm that files have not been corrupted or wiped.
3. Rerun the focused test suite to ensure the environment is green:
   `python -m pytest tests/test_construction_suite.py tests/test_clinical_suite.py tests/test_maritime_suite.py tests/test_vertical_ai_pipeline.py tests/test_crm_crud.py`
4. Pick up the next pending checkpoint without repeating prior phases.

## 2. Invariants
- Never use `industry="all"` default.
- Fail-closed security: unassigned industry denies access to all vertical endpoints.
- Preserve 33 existing database tables.

