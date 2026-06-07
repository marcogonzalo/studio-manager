import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil, Trash2 } from "lucide-react";
import {
  ExpandableRowActionsMenu,
  ExpandableRowActionsPanel,
  MobileDetailField,
  TableRowExpandTrigger,
  useExpandableTableRow,
} from "./expandable-table";
import { Table, TableBody, TableRow, TableCell } from "./table";

const sampleActions = [
  {
    id: "edit",
    label: "Editar",
    icon: Pencil,
    onClick: vi.fn(),
  },
  {
    id: "delete",
    label: "Eliminar",
    icon: Trash2,
    onClick: vi.fn(),
    destructive: true,
  },
];

describe("expandable-table", () => {
  it("MobileDetailField renders label and value", () => {
    render(<MobileDetailField label="Tipo" value="Honorarios" />);
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Honorarios")).toBeInTheDocument();
  });

  it("ExpandableRowActionsPanel renders labeled action buttons", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <ExpandableRowActionsPanel
        actions={[
          { id: "edit", label: "Editar", icon: Pencil, onClick: onEdit },
        ]}
      />
    );
    expect(screen.getByText("Acciones")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("ExpandableRowActionsMenu renders menu trigger", () => {
    render(
      <ExpandableRowActionsMenu
        actions={sampleActions}
        menuAriaLabel="Acciones del pago"
      />
    );
    expect(
      screen.getByRole("button", { name: "Acciones del pago" })
    ).toBeInTheDocument();
  });

  it("ExpandableRowActionsPanel returns null when actions empty", () => {
    const { container } = render(<ExpandableRowActionsPanel actions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("TableRowExpandTrigger updates aria-expanded when expanded prop changes", async () => {
    const user = userEvent.setup();

    function ExpandRow() {
      const [expanded, setExpanded] = useState(false);
      return (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableRowExpandTrigger
                expanded={expanded}
                onToggle={() => setExpanded((open) => !open)}
                expandLabel="Ver detalles"
                collapseLabel="Ocultar detalles"
              />
            </TableRow>
          </TableBody>
        </Table>
      );
    }

    render(<ExpandRow />);

    const button = screen.getByRole("button", { name: "Ver detalles" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(
      screen.getByRole("button", { name: "Ocultar detalles" })
    ).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Ocultar detalles" }));
    expect(
      screen.getByRole("button", { name: "Ver detalles" })
    ).toHaveAttribute("aria-expanded", "false");
  });
});

describe("useExpandableTableRow", () => {
  function ExpandProbe({ rowId }: { rowId: string }) {
    const { expandedRowId, toggleRow, isExpanded } = useExpandableTableRow();
    return (
      <div>
        <span data-testid="expanded-id">{expandedRowId ?? "none"}</span>
        <span data-testid="is-open">{String(isExpanded(rowId))}</span>
        <button type="button" onClick={() => toggleRow(rowId)}>
          toggle
        </button>
      </div>
    );
  }

  it("toggles a single expanded row id", async () => {
    const user = userEvent.setup();
    render(<ExpandProbe rowId="a" />);
    expect(screen.getByTestId("expanded-id")).toHaveTextContent("none");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("expanded-id")).toHaveTextContent("a");
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("expanded-id")).toHaveTextContent("none");
  });
});
