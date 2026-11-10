# Budget import template (#215) + uploader (#219) + project wizard

Objective: Field spec + runtime ES/EN templates + help guide; CSV/XLSX import with column matching, preview, atomic RPC; project creation wizard embedding ImportFlow. Branch: `feat/budget-import`. Delivery: `feature-branch-chain`. Runner: Vitest in Docker.

## Specs

- S1: Field definitions module (`src/lib/budget-import/fields.ts`) with key, required, type, allowed values, ES/EN labels, aliases; derived from / tested against `buildAddItemFormSchema` / `buildBudgetLineFormSchema`.
- S2: Template generated at runtime from field definitions (CSV + XLSX), ES and EN; enum values listed with localized labels; example row; Allowed values + Instructions sheets on XLSX.
- S3: Download link from project Budget tab; later from uploader.
- S4: Unit tests for field spec and template generation; `docs/budget-import.md`.
- S5: Entry point "Import from Excel/CSV" in Budget tab next to template download AND bulk option in Add dropdown.
- S6: CSV (UTF-8, `;` and `,`) and XLSX; client-side parse or authenticated API with rate limit; 10MB / 500 rows.
- S7: Mapping step auto-suggests exact + alias matches; unmapped required fields block next step.
- S8: Preview shows resolved values and highlights error rows; pricing pair derivation; category resolution for budget lines.
- S9: Validation reuses existing zod schemas (no duplicated rules).
- S10: Import atomic (all valid or none) and idempotent on retry (`import_id`).
- S11: Unknown supplier/space names: create them; empty space = General.
- S12: Demo (read-only) account cannot import.
- S13: ES/EN copy; unit tests for mapping/parse; integration test for import.
- S14: Emits `budget_imported` with counts only, no row content.
- S15: Help guide generated from fields.ts at `/veta-app/help/budget-import` + side sheet; closed lists; tax note without plan names.
- S16: Products: name + quantity mandatory; pricing pair (cost+markup or cost+price) unless Price TBD; Excluded not imported; tax only when multitax.
- S17: Budget lines: category optional until preview resolves; unmatched subcategory → other; empty phase OK.
- S18: Project wizard: step1 name+currency+tax required (status always active); client optional; budget start with ImportFlow; `project_created` source=wizard.

## Tasks

- T1 S1,S16 — fields.ts + normalize-header + pricing + contract tests — inline — done
- T2 S2,S3,S4,S15 — template.ts + BudgetImportHelp + download UI + docs — inline — done
- T3 S6,S7,S8,S9,S16,S17 — parse/map/resolve/validate library — inline — done
- T4 S10,S11,S12,S13,S14 — RPC + server action + event — inline — done
- T5 S5,S7,S8,S15 — ImportFlow UI + Budget tab entry points — inline — done
- T6 S18 — Project creation wizard + GitHub issue draft — inline — done

## Log

- L1: User: Implement the plan as specified for #215 + #219 + wizard. Do NOT edit the plan file. Complete all to-dos.
- L2: Implemented on `feat/budget-import`. Field spec + templates + help + ImportFlow + RPC `import_budget_rows` + `importBudgetRows` action + `budget_imported` event + ProjectCreateWizard. Issue draft at `docs/project-creation-wizard-issue-draft.md` (awaiting user approval before GitHub create). Vitest budget-import suite green. Migration not pushed (local db when available).
