import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { ViewProjectCostsClient } from "./costs-client";
import esView from "@/i18n/messages/es/app-view-project.json";
import esCommon from "@/i18n/messages/es/app-common.json";
import type { BudgetCategory } from "@/types";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src="" />
  ),
}));

const description =
  "Lámpara de suspensión en latón cepillado con pantalla de lino. Cable textil de 2 m y regulador incluido.";

const categoryLabels: Record<BudgetCategory, string> = {
  construction: "Obra",
  own_fees: "Honorarios Propios",
  external_services: "Servicios Externos",
  operations: "Gastos Operativos",
};

const subcategoryLabels: Record<BudgetCategory, Record<string, string>> = {
  construction: { electricity: "Electricidad" },
  own_fees: {},
  external_services: {},
  operations: {},
};

function renderCosts() {
  return render(
    <NextIntlClientProvider
      locale="es"
      messages={{
        ViewProject: esView.ViewProject,
        Phases: esCommon.Phases,
      }}
    >
      <ViewProjectCostsClient
        budgetLines={[
          {
            id: "line-1",
            category: "construction",
            subcategory: "electricity",
            description: "Instalación eléctrica completa planta baja",
            estimated_amount: 1200,
            phase: "construction",
          },
        ]}
        products={[
          {
            id: "prod-1",
            name: "Lámpara",
            description,
            quantity: 1,
            unit_price: 320,
            total_price: 320,
            status: "pending",
            image_url: null,
            space_name: "Salón",
          },
        ]}
        currency="EUR"
        taxRate={21}
        locale="es"
        categoryLabels={categoryLabels}
        subcategoryLabels={subcategoryLabels}
      />
    </NextIntlClientProvider>
  );
}

describe("ViewProjectCostsClient descriptions", () => {
  it("expands a truncated product description on click", async () => {
    const user = userEvent.setup();
    renderCosts();

    const productDescription = screen.getByRole("button", {
      name: description,
    });
    expect(productDescription).toHaveAttribute("aria-expanded", "false");

    await user.click(productDescription);
    expect(productDescription).toHaveAttribute("aria-expanded", "true");
  });

  it("expands a truncated budget line description on click", async () => {
    const user = userEvent.setup();
    renderCosts();

    const lineDescription = screen.getByRole("button", {
      name: "Instalación eléctrica completa planta baja",
    });
    expect(lineDescription).toHaveAttribute("aria-expanded", "false");

    await user.click(lineDescription);
    expect(lineDescription).toHaveAttribute("aria-expanded", "true");
  });
});
