import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { BudgetCustomizeDialog } from "./budget-customize-dialog";
import esDialogs from "@/i18n/messages/es/app-dialogs.json";

function renderDialog(
  props: Partial<React.ComponentProps<typeof BudgetCustomizeDialog>> = {}
) {
  const onOpenChange = vi.fn();
  const onSave = vi.fn();
  render(
    <NextIntlClientProvider
      locale="es"
      messages={{
        DialogBudgetCustomize: esDialogs.DialogBudgetCustomize,
      }}
    >
      <BudgetCustomizeDialog
        open
        onOpenChange={onOpenChange}
        initialNotes={props.initialNotes ?? "Nota inicial"}
        initialSettings={props.initialSettings ?? null}
        onSave={onSave}
        saving={props.saving}
        {...props}
      />
    </NextIntlClientProvider>
  );
  return { onOpenChange, onSave };
}

describe("BudgetCustomizeDialog", () => {
  it("loads initial notes and saves normalized payload", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({
      initialNotes: "  primera\nsegunda  ",
    });

    const textarea = screen.getByLabelText("Notas");
    expect(textarea).toHaveValue("  primera\nsegunda  ");

    await user.clear(textarea);
    await user.type(textarea, "Validez 30 días\nIVA no incluido");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith({
      notes: "Validez 30 días\nIVA no incluido",
      settings: expect.objectContaining({
        phase_filter: "all",
        sort_field: "created_at",
      }),
    });
  });

  it("saves null notes when cleared", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({ initialNotes: "algo" });

    await user.clear(screen.getByLabelText("Notas"));
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith({
      notes: null,
      settings: expect.any(Object),
    });
  });

  it("hides customization controls when customizationEnabled is false", () => {
    renderDialog({ customizationEnabled: false });

    expect(screen.getByLabelText("Notas")).toBeInTheDocument();
    expect(screen.queryByText("Fase a mostrar")).not.toBeInTheDocument();
    expect(screen.queryByText("Ordenar por")).not.toBeInTheDocument();
  });

  it("preserves initial settings on save when customization is disabled", async () => {
    const user = userEvent.setup();
    const initialSettings = {
      phase_filter: "design" as const,
      sort_field: "supplier" as const,
    };
    const { onSave } = renderDialog({
      customizationEnabled: false,
      initialSettings,
    });

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith({
      notes: "Nota inicial",
      settings: expect.objectContaining({
        phase_filter: "design",
        sort_field: "supplier",
      }),
    });
  });
});
