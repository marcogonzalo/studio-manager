# Budget import

In-app guide: `/veta-app/help/budget-import` (ES/EN). Field definitions live in `src/lib/budget-import/fields.ts` and generate templates, mapping aliases, and help copy.

## Templates

Download from the project Budget tab (Import menu) or the import wizard:

- Products / Budget lines × CSV / XLSX
- Generated at runtime (no static files)
- XLSX includes Allowed values + Instructions sheets

## Import rules (summary)

- Products: Name + Quantity required; pricing pair (unit cost + markup **or** unit cost + unit price) unless Price TBD.
- Empty space → General; unknown spaces/suppliers are created.
- Tax column only applies when the project has multitax (availability depends on plan; plan names are never shown in help).
- Budget line category empty/unmatched → user must choose in preview (subcategory falls back to Other).
- Excluded / images / status are not imported.
- Demo accounts cannot import.
- Atomic + idempotent via `import_budget_rows` RPC and client `import_id`.

## Related issues

- #215 field spec + templates
- #219 uploader with column matching
