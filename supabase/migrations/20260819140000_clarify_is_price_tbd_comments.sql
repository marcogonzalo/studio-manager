-- Clarify TBD comments for databases that already applied earlier migrations.
comment on column project_items.is_price_tbd is
  'If true, unit cost and sale price are unknown. The item stays in the budget without showing zero or an estimate.';

comment on column project_budget_lines.is_price_tbd is
  'If true, estimated and actual amounts are unknown. The line stays in the budget without showing zero or an estimate.';
