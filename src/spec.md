# Specification

## Summary
**Goal:** Provide a web app to download three Excel templates, upload and validate three matching .xlsx files, reconcile their row data with configurable keys/compare columns, view results in a dedicated Results tab, and export the output to an Excel “Results” worksheet.

**Planned changes:**
- Build an Upload UI with three distinct template download links and three required .xlsx upload inputs (Sheet A/Sheet B/Sheet C), with per-file validation (missing file, wrong type, wrong sheet name, missing required headers).
- Parse uploaded Excel files in the browser, normalize cell values (trim whitespace, convert empty cells to null), and show a preview table (first 20 rows) per file with loading indicators for large files.
- Add a reconciliation configuration panel to select matching key column(s) and select columns to compare; block reconciliation until configuration is valid.
- Implement a single backend Motoko canister method to run reconciliation on the three datasets + config and return a results dataset and summary counts (Matched, Mismatch, Missing in A/B/C, Duplicate key).
- Create a tabbed UI with an Upload tab and a “Results” tab showing summary metrics and a filterable/sortable/searchable results table with row-level detail for A/B/C values.
- Add a browser-generated export to .xlsx with a worksheet named exactly “Results”, containing the summary section and full results table.
- Apply a consistent visual theme suitable for a data/reconciliation tool, avoiding blue-and-purple as primary colors, with clear success/warning/error states.

**User-visible outcome:** Users can download the three templates, upload and validate three .xlsx files, preview normalized data, configure how rows match and which fields are compared, run reconciliation, review results in a dedicated Results tab with filters/details, and download an Excel file containing a “Results” sheet with the full output.
