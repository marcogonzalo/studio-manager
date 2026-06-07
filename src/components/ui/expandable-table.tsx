"use client";

import * as React from "react";
import { ChevronDown, MoreVertical, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Responsive expandable rows for wide data tables on mobile (`< md`).
 *
 * ## Pattern
 *
 * 1. **Collapsed row (mobile):** plain `TableHead` / `TableCell` — always visible below `md`.
 * 2. **Desktop-only columns:** `TableHeadMd` / `TableCellMd` — `hidden md:table-cell`.
 * 3. **Expand control:** `TableHeadExpandPlaceholder` + `TableRowExpandTrigger` — `md:hidden`.
 * 4. **Expanded panel:** `TableRowMobileDetail` + `MobileDetailField` for hidden fields.
 * 5. **Row actions:** define once with `ExpandableTableRowAction[]`, render with
 *    `ExpandableRowActionsMenu` (desktop) and `ExpandableRowActionsPanel` (mobile panel).
 *
 * ## `mobileVisibleColumnCount`
 *
 * Count of columns visible when collapsed on mobile (including the chevron column).
 * Must match: visible `TableHead`/`TableCell` + `TableHeadExpandPlaceholder`/`TableRowExpandTrigger`.
 * Hidden `TableHeadMd`/`TableCellMd` columns are skipped by the browser on mobile.
 *
 * ## Example
 *
 * ```tsx
 * const { toggleRow, isExpanded } = useExpandableTableRow();
 * const mobileVisibleColumnCount = 4; // visible cols on mobile, including chevron
 *
 * <TableHeader>
 *   <TableRow>
 *     <TableHead>Fecha</TableHead>
 *     <TableHead>Tipo</TableHead>
 *     <TableHead>Monto</TableHead>
 *     <TableHeadMd>Referencia</TableHeadMd>
 *     <TableHeadMd className="text-right">Acciones</TableHeadMd>
 *     <TableHeadExpandPlaceholder srLabel="Expandir fila" />
 *   </TableRow>
 * </TableHeader>
 * <TableBody>
 *   {rows.map((row) => {
 *     const expanded = isExpanded(row.id);
 *     const rowActions: ExpandableTableRowAction[] = [
 *       { id: "edit", label: "Editar", icon: Pencil, onClick: () => onEdit(row) },
 *       { id: "delete", label: "Eliminar", icon: Trash2, onClick: () => onDelete(row.id), destructive: true },
 *     ];
 *     return (
 *       <Fragment key={row.id}>
 *         <TableRow>
 *           <TableCell>{row.date}</TableCell>
 *           <TableCell>{row.type}</TableCell>
 *           <TableCell>{row.amount}</TableCell>
 *           <TableCellMd>{row.reference}</TableCellMd>
 *           <TableCellMd className="text-right">
 *             <ExpandableRowActionsMenu actions={rowActions} menuAriaLabel="Acciones" />
 *           </TableCellMd>
 *           <TableRowExpandTrigger
 *             expanded={expanded}
 *             onToggle={() => toggleRow(row.id)}
 *             expandLabel="Ver detalles"
 *             collapseLabel="Ocultar detalles"
 *           />
 *         </TableRow>
 *         <TableRowMobileDetail open={expanded} colSpan={mobileVisibleColumnCount}>
 *           <MobileDetailField label="Referencia" value={row.reference} />
 *           <ExpandableRowActionsPanel actions={rowActions} />
 *         </TableRowMobileDetail>
 *       </Fragment>
 *     );
 *   })}
 * </TableBody>
 * ```
 *
 * Reference: `src/modules/app/projects/project-payments.tsx`
 */

/** Tailwind class — hide table header below `md`. Prefer `TableHeadMd`. */
export const tableHeadMdClass = "hidden md:table-cell";

/** Tailwind class — hide table cell below `md`. Prefer `TableCellMd`. */
export const tableCellMdClass = "hidden md:table-cell";

/** Single row action — shared by desktop menu and mobile action buttons. */
export type ExpandableTableRowAction = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  /** Applies destructive styling in menu and mobile buttons. */
  destructive?: boolean;
};

/**
 * Desktop (`md+`) kebab menu. Place inside `TableCellMd`.
 * Returns `null` when `actions` is empty (e.g. read-only rows).
 */
export function ExpandableRowActionsMenu({
  actions,
  menuAriaLabel,
  className,
}: {
  actions: ExpandableTableRowAction[];
  menuAriaLabel: string;
  className?: string;
}) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-11 w-11", className)}
          aria-label={menuAriaLabel}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={action.onClick}
              className={action.destructive ? "text-destructive" : undefined}
            >
              {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Mobile expand panel action buttons (`md:hidden` context).
 * Renders a labeled section with equal-width, right-aligned outline buttons.
 * Returns `null` when `actions` is empty.
 */
export function ExpandableRowActionsPanel({
  actions,
  sectionLabel = "Acciones",
  className,
}: {
  actions: ExpandableTableRowAction[];
  sectionLabel?: string;
  className?: string;
}) {
  if (actions.length === 0) return null;

  return (
    <div className={cn("mt-1 border-t pt-3", className)}>
      <p className="text-muted-foreground mb-2 text-xs font-medium">
        {sectionLabel}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-11 min-h-11 w-[7.25rem] shrink-0 justify-center px-2",
                action.destructive &&
                  "text-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
              onClick={action.onClick}
            >
              {Icon ? <Icon className="mr-2 h-4 w-4 shrink-0" /> : null}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/** Table header hidden below `md` — use for columns shown only in desktop row or expand panel. */
export function TableHeadMd({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <TableHead className={cn(tableHeadMdClass, className)} {...props} />;
}

/** Table cell hidden below `md`. */
export function TableCellMd({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <TableCell className={cn(tableCellMdClass, className)} {...props} />;
}

/** Chevron toggle cell — visible only on mobile. Place last in the row. */
export function TableRowExpandTrigger({
  expanded,
  onToggle,
  expandLabel,
  collapseLabel,
  className,
}: {
  expanded: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel: string;
  className?: string;
}) {
  return (
    <TableCell className={cn("w-11 p-1 md:hidden", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={expanded ? collapseLabel : expandLabel}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </Button>
    </TableCell>
  );
}

/** Empty header for the expand column — pair with `TableRowExpandTrigger`. */
export function TableHeadExpandPlaceholder({
  className,
  srLabel,
}: {
  className?: string;
  srLabel: string;
}) {
  return (
    <TableHead className={cn("w-11 px-1 md:hidden", className)}>
      <span className="sr-only">{srLabel}</span>
    </TableHead>
  );
}

/**
 * Second `<tr>` with hidden fields — only rendered when `open`.
 * Set `colSpan` to `mobileVisibleColumnCount`.
 */
export function TableRowMobileDetail({
  open,
  colSpan,
  children,
  className,
}: {
  open: boolean;
  colSpan: number;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <TableRow className="hover:bg-transparent md:hidden">
      <TableCell
        colSpan={colSpan}
        className={cn("bg-muted/20 border-b p-3", className)}
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

/** Label/value row inside `TableRowMobileDetail`. */
export function MobileDetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 text-sm",
        className
      )}
    >
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right">{value}</span>
    </div>
  );
}

/** Tracks which row id is expanded; only one row open at a time. */
export function useExpandableTableRow(initialId: string | null = null) {
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(
    initialId
  );

  const toggleRow = React.useCallback((rowId: string) => {
    setExpandedRowId((current) => (current === rowId ? null : rowId));
  }, []);

  const isExpanded = React.useCallback(
    (rowId: string) => expandedRowId === rowId,
    [expandedRowId]
  );

  return { expandedRowId, toggleRow, isExpanded, setExpandedRowId };
}
