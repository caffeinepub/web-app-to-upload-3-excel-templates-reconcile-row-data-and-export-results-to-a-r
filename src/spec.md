# Specification

## Summary
**Goal:** Switch reconciliation from key-based matching to row-wise, full-row comparison across Sheet A, Sheet B, and Sheet C.

**Planned changes:**
- Remove all key-column concepts from reconciliation configuration, types, validation, and workflow.
- Implement row-index-based reconciliation that compares full rows across all three sheets and flags mismatches when any compared column differs.
- Derive the compared columns automatically from common headers across all three sheets (or template-defined headers when available) and use this consistently in reconciliation, UI, and export.
- Update UI copy and controls to remove key-based selection and present results using a row identifier (row number/index) while still showing per-sheet values and mismatched columns.
- Update XLSX export to output row-wise results (row identifier, per-sheet presence, mismatched columns, and A/B/C values for each compared column).

**User-visible outcome:** Users reconcile three sheets by comparing each row position as a whole (no key selection), see matches/mismatches and missing rows by row number, can search/filter results without relying on a key field, and export row-wise reconciliation results to XLSX.
