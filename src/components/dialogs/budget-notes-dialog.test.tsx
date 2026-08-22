import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { BudgetNotesDialog } from "./budget-notes-dialog";
import esDialogs from "@/i18n/messages/es/app-dialogs.json";

function renderDialog(
  props: Partial<React.ComponentProps<typeof BudgetNotesDialog>> = {}
) {
  const onOpenChange = vi.fn();
  const onSave = vi.fn();
  render(
    <NextIntlClientProvider
      locale="es"
      messages={{ DialogBudgetNotes: esDialogs.DialogBudgetNotes }}
    >
      <BudgetNotesDialog
        open
        onOpenChange={onOpenChange}
        initialNotes={props.initialNotes ?? "Nota inicial"}
        onSave={onSave}
        saving={props.saving}
        {...props}
      />
    </NextIntlClientProvider>
  );
  return { onOpenChange, onSave };
}

describe("BudgetNotesDialog", () => {
  it("loads initial notes and saves normalized text", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({
      initialNotes: "  primera\nsegunda  ",
    });

    const textarea = screen.getByLabelText("Notas");
    expect(textarea).toHaveValue("  primera\nsegunda  ");

    await user.clear(textarea);
    await user.type(textarea, "Validez 30 días\nIVA no incluido");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith("Validez 30 días\nIVA no incluido");
  });

  it("saves null when notes cleared", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({ initialNotes: "algo" });

    await user.clear(screen.getByLabelText("Notas"));
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith(null);
  });
});
