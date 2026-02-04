# Specification

## Summary
**Goal:** Ensure all generated GST Excel templates include a required “INVOICE NUMBER” column and enforce it during template header validation.

**Planned changes:**
- Add a new required GST invoice column header named “INVOICE NUMBER” to the shared template header list used to generate Sheet A, Sheet B, and Sheet C templates.
- Update template upload/header validation to require “INVOICE NUMBER” and report it under “Missing required columns” when absent.

**User-visible outcome:** Users downloading any of the three GST templates get an .xlsx whose first row includes “INVOICE NUMBER”, and uploads will fail validation if that header is missing (and pass if it is present, all else equal).
