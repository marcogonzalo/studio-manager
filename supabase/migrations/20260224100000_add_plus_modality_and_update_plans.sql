-- Add 'plus' to plan_feature_modality (progression: none, basic, plus, full)
-- and update plan rows to match docs/plan-copy-mapping.md

create type plan_feature_modality_new as enum ('none', 'basic', 'plus', 'full');

comment on type plan_feature_modality_new is 'none = not available, basic = basic level, plus = mid tier, full = full/unrestricted';

alter table plans
  add column budget_mode_new plan_feature_modality_new,
  add column multi_currency_per_project_new plan_feature_modality_new,
  add column purchase_orders_new plan_feature_modality_new,
  add column costs_management_new plan_feature_modality_new,
  add column payments_management_new plan_feature_modality_new,
  add column documents_new plan_feature_modality_new,
  add column notes_new plan_feature_modality_new,
  add column summary_new plan_feature_modality_new,
  add column support_level_new plan_feature_modality_new;

-- Migrate: existing enum values (none, basic, full) map 1:1 into new type
update plans set
  budget_mode_new = case budget_mode::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'none'::plan_feature_modality_new end,
  multi_currency_per_project_new = case multi_currency_per_project::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'none'::plan_feature_modality_new end,
  purchase_orders_new = case purchase_orders::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'none'::plan_feature_modality_new end,
  costs_management_new = case costs_management::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'basic'::plan_feature_modality_new end,
  payments_management_new = case payments_management::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'none'::plan_feature_modality_new end,
  documents_new = case documents::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'basic'::plan_feature_modality_new end,
  notes_new = case notes::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'basic'::plan_feature_modality_new end,
  summary_new = case summary::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'basic'::plan_feature_modality_new end,
  support_level_new = case support_level::text when 'none' then 'none'::plan_feature_modality_new when 'basic' then 'basic'::plan_feature_modality_new when 'full' then 'full'::plan_feature_modality_new else 'none'::plan_feature_modality_new end;

-- Target values from doc (Base, Pro, Studio)
update plans set
  budget_mode_new = 'basic',
  multi_currency_per_project_new = 'basic',
  purchase_orders_new = 'none',
  payments_management_new = 'none',
  costs_management_new = 'basic',
  documents_new = 'basic',
  notes_new = 'basic',
  summary_new = 'basic',
  support_level_new = 'none'
where code = 'BASE';

update plans set
  budget_mode_new = 'plus',
  multi_currency_per_project_new = 'plus',
  purchase_orders_new = 'basic',
  payments_management_new = 'basic',
  costs_management_new = 'plus',
  documents_new = 'basic',
  notes_new = 'basic',
  summary_new = 'basic',
  support_level_new = 'basic'
where code = 'PRO';

update plans set
  budget_mode_new = 'full',
  multi_currency_per_project_new = 'full',
  purchase_orders_new = 'plus',
  payments_management_new = 'plus',
  costs_management_new = 'plus',
  documents_new = 'basic',
  notes_new = 'basic',
  summary_new = 'basic',
  support_level_new = 'full'
where code = 'STUDIO';

alter table plans
  drop column budget_mode,
  drop column multi_currency_per_project,
  drop column purchase_orders,
  drop column costs_management,
  drop column payments_management,
  drop column documents,
  drop column notes,
  drop column summary,
  drop column support_level;

drop type plan_feature_modality;

alter type plan_feature_modality_new rename to plan_feature_modality;

alter table plans rename column budget_mode_new to budget_mode;
alter table plans rename column multi_currency_per_project_new to multi_currency_per_project;
alter table plans rename column purchase_orders_new to purchase_orders;
alter table plans rename column costs_management_new to costs_management;
alter table plans rename column payments_management_new to payments_management;
alter table plans rename column documents_new to documents;
alter table plans rename column notes_new to notes;
alter table plans rename column summary_new to summary;
alter table plans rename column support_level_new to support_level;

-- Re-apply NOT NULL where needed (from previous migration)
alter table plans
  alter column budget_mode set not null,
  alter column multi_currency_per_project set not null,
  alter column purchase_orders set not null,
  alter column costs_management set not null,
  alter column payments_management set not null,
  alter column documents set not null,
  alter column notes set not null,
  alter column summary set not null,
  alter column support_level set not null;
