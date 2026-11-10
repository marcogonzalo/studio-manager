"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  buildBudgetImportHelpModel,
  type HelpLocale,
} from "@/lib/budget-import/help-content";
import { FIELD_LABEL_I18N } from "./field-label-map";
import type { BudgetCategory, ProjectPhase } from "@/types";

type Props = {
  taxAppliesToProject?: boolean;
  focusFieldId?: string;
};

export function BudgetImportHelp({ taxAppliesToProject, focusFieldId }: Props) {
  const locale = useLocale() as HelpLocale;
  const t = useTranslations("ProjectModuleBudget");
  const tCat = useTranslations("ProjectModuleBudget.budgetCategory");
  const tSub = useTranslations("ProjectModuleBudget.budgetSubcategory");
  const tPhase = useTranslations("DialogProject");

  const model = useMemo(
    () =>
      buildBudgetImportHelpModel({
        locale,
        translateLabel: (labelKey) =>
          t((FIELD_LABEL_I18N[labelKey] ?? labelKey) as never),
        translateCategory: (key) => tCat(key as BudgetCategory),
        translateSubcategory: (category, key) =>
          tSub(`${category}.${key}` as never),
        translatePhase: (key) => {
          const map: Record<ProjectPhase, string> = {
            diagnosis: "phaseDiagnosis",
            design: "phaseDesign",
            executive: "phaseExecutive",
            budget: "phaseBudget",
            construction: "phaseConstruction",
            delivery: "phaseDelivery",
          };
          return tPhase(map[key as ProjectPhase] as never);
        },
        taxAppliesToProject,
      }),
    [locale, t, tCat, tSub, tPhase, taxAppliesToProject]
  );

  return (
    <article className="text-foreground space-y-6 text-sm">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{model.title}</h1>
        {model.intro.map((p) => (
          <p key={p} className="text-muted-foreground">
            {p}
          </p>
        ))}
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Limits</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          {model.limits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Pricing</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          {model.pricing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Tax</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          {model.tax.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Spaces & suppliers</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          {model.spacesSuppliers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Products</h2>
        {model.products.map((field) => (
          <FieldBlock
            key={field.id}
            field={field}
            highlighted={focusFieldId === field.id}
          />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Budget lines</h2>
        {model.budgetLines.map((field) => (
          <FieldBlock
            key={`line-${field.id}`}
            field={field}
            highlighted={focusFieldId === field.id}
          />
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Categories</h2>
        {model.categories.map((cat) => (
          <div
            key={cat.category}
            className="border-border rounded-md border p-3"
          >
            <p className="font-medium">{cat.category}</p>
            <p className="text-muted-foreground">
              {cat.subcategories.join(", ")}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Phases</h2>
        <p className="text-muted-foreground">{model.phases.join(", ")}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Not imported</h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          {model.notImported.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function FieldBlock({
  field,
  highlighted,
}: {
  field: {
    id: string;
    title: string;
    required: string;
    format: string;
    example: string;
    emptyBehavior: string;
    acceptedValues?: string[];
    notes: string[];
  };
  highlighted: boolean;
}) {
  return (
    <div
      id={`field-${field.id}`}
      className={
        highlighted
          ? "border-primary bg-primary/5 rounded-md border p-3"
          : "border-border rounded-md border p-3"
      }
    >
      <p className="font-medium">{field.title}</p>
      <p className="text-muted-foreground">
        {field.required} · {field.format} · {field.emptyBehavior}
      </p>
      <p className="text-muted-foreground">Example: {field.example}</p>
      {field.acceptedValues && field.acceptedValues.length > 0 && (
        <p className="text-muted-foreground">
          Accepted: {field.acceptedValues.join(", ")}
        </p>
      )}
      {field.notes.map((note) => (
        <p key={note} className="text-muted-foreground">
          {note}
        </p>
      ))}
    </div>
  );
}
