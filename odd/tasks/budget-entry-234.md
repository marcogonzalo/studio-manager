# Budget entry speedups (#234)

Objective: Faster budget product entry (add-and-create-another, per-space add, duplicate, editable spaces); cost lines get add-another + duplicate only. Branch: `feat/budget-entry-234`. Delivery: ask-on-risk (chained PRs). Runner: Vitest in Docker.

## Specs

- S1: "Add and create another" keeps space, supplier, category; clears name/qty/price; focus Name (description on cost lines); toast; Enter saves next line.
- S2: "+ Add" per space group opens AddItemDialog with that space selected (`origin: space_add`).
- S3: "Duplicate" prefills dialog; saves nothing until confirmed; copy independent of original.
- S4: Assign space on product create/edit (already present); rename and delete spaces. Delete with lines asks move-to-No-space or delete-lines; never silent delete. PO-linked items block delete_lines.
- S5: Mobile dialog full screen; "Add and create another" sticky at bottom.
- S6: Every created line emits exactly one `budget_created` with `source: manual|catalog`, `project_id`, `origin: form|repeat|space_add|duplicate`.
- S7: Cost lines (`BudgetLineDialog`): add-another + duplicate only; no space FK.

## Tasks

- T1 S1,S6,S7 — repeat helper + dialog API + tracking + mobile — inline — done
- T2 S2,S3 — duplicate row actions + per-space add — inline — done
- T3 S4 — space rename/delete + delete_space RPC — inline — done
- T4 S5,S6 — i18n EN/ES + verify tests — inline — done

## Log

- L1: User: Implement the plan as specified for issue #234. Do NOT edit the plan file. Complete all to-dos.
- L2: Implemented on `feat/budget-entry-234`. Focused Vitest 23/23 green. ESLint clean on touched files. Migration `20261017230000_delete_space_rpc.sql` added (local db:push when Supabase up).
