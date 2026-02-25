-- Homologate plan_feature_modality to use none, basic, full
-- Convention: none = not available, basic = basic level, full = full/unrestricted
-- Column name: pdf_export_mode (production uses this; legacy budget_mode supported as source)

-- Strategy: Create new type with different name, migrate columns, drop old type, rename new type

-- Create new enum type with 'none' value
create type plan_feature_modality_new as enum ('none', 'basic', 'full');

comment on type plan_feature_modality_new is 'none = not available, basic = basic level, full = full/unrestricted functionality';

-- Add temporary columns with new type (canonical name: pdf_export_mode)
alter table plans
  add column pdf_export_mode_new plan_feature_modality_new,
  add column multi_currency_per_project_new plan_feature_modality_new,
  add column purchase_orders_new plan_feature_modality_new,
  add column costs_management_new plan_feature_modality_new,
  add column payments_management_new plan_feature_modality_new,
  add column documents_new plan_feature_modality_new,
  add column notes_new plan_feature_modality_new,
  add column summary_new plan_feature_modality_new;

-- Migrate pdf_export_mode_new from whichever source column exists (pdf_export_mode or budget_mode)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'plans' and column_name = 'pdf_export_mode') then
    update plans set pdf_export_mode_new = case
      when pdf_export_mode is null then 'none'::plan_feature_modality_new
      when pdf_export_mode::text = 'basic' then 'basic'::plan_feature_modality_new
      when pdf_export_mode::text = 'full' then 'full'::plan_feature_modality_new
      else 'none'::plan_feature_modality_new
    end;
  elsif exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'plans' and column_name = 'budget_mode') then
    update plans set pdf_export_mode_new = case
      when budget_mode is null then 'none'::plan_feature_modality_new
      when budget_mode::text = 'basic' then 'basic'::plan_feature_modality_new
      when budget_mode::text = 'full' then 'full'::plan_feature_modality_new
      else 'none'::plan_feature_modality_new
    end;
  end if;
end $$;

-- Migrate rest of modality columns
update plans set
  multi_currency_per_project_new = case
    when multi_currency_per_project is null then 'none'
    when multi_currency_per_project::text = 'basic' then 'basic'
    when multi_currency_per_project::text = 'full' then 'full'
    else 'none'
  end::plan_feature_modality_new,
  purchase_orders_new = case
    when purchase_orders is null then 'none'
    when purchase_orders::text = 'basic' then 'basic'
    when purchase_orders::text = 'full' then 'full'
    else 'none'
  end::plan_feature_modality_new,
  costs_management_new = case
    when costs_management is null then 'basic'
    when costs_management::text = 'basic' then 'basic'
    when costs_management::text = 'full' then 'full'
    else 'basic'
  end::plan_feature_modality_new,
  payments_management_new = case
    when payments_management is null then 'none'
    when payments_management::text = 'basic' then 'basic'
    when payments_management::text = 'full' then 'full'
    else 'none'
  end::plan_feature_modality_new,
  documents_new = case
    when documents is null then 'none'
    when documents::text = 'basic' then 'basic'
    when documents::text = 'full' then 'full'
    else 'none'
  end::plan_feature_modality_new,
  notes_new = case
    when notes is null then 'full'
    when notes::text = 'basic' then 'basic'
    when notes::text = 'full' then 'full'
    else 'full'
  end::plan_feature_modality_new,
  summary_new = case
    when summary is null then 'full'
    when summary::text = 'basic' then 'basic'
    when summary::text = 'full' then 'full'
    else 'full'
  end::plan_feature_modality_new;

-- Drop old columns (either pdf_export_mode or budget_mode exists, plus the rest)
alter table plans drop column if exists budget_mode;
alter table plans drop column if exists pdf_export_mode;
alter table plans
  drop column multi_currency_per_project,
  drop column purchase_orders,
  drop column costs_management,
  drop column payments_management,
  drop column documents,
  drop column notes,
  drop column summary;

-- Drop old type
drop type if exists plan_feature_modality;

-- Rename new type to original name
alter type plan_feature_modality_new rename to plan_feature_modality;

-- Rename new columns to final names (canonical: pdf_export_mode)
alter table plans rename column pdf_export_mode_new to pdf_export_mode;
alter table plans rename column multi_currency_per_project_new to multi_currency_per_project;
alter table plans rename column purchase_orders_new to purchase_orders;
alter table plans rename column costs_management_new to costs_management;
alter table plans rename column payments_management_new to payments_management;
alter table plans rename column documents_new to documents;
alter table plans rename column notes_new to notes;
alter table plans rename column summary_new to summary;

-- Set NOT NULL for columns that should always have a value
alter table plans
  alter column pdf_export_mode set not null,
  alter column costs_management set not null,
  alter column documents set not null,
  alter column notes set not null,
  alter column summary set not null;
