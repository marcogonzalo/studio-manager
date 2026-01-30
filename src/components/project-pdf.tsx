import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type {
  Project,
  ProjectBudgetLine,
  ProjectItem,
  BudgetCategory,
  ProjectPhase,
} from "@/types";
import {
  BUDGET_CATEGORIES,
  BUDGET_SUBCATEGORIES,
  getPhaseLabel,
} from "@/lib/utils";

// Color palette matching the application (from index.css)
const colors = {
  primary: "#8B9A7A",
  primaryLight: "#B8C5A8",
  background: "#FAF9F6",
  text: "#3F3F3F",
  textLight: "#6B6B6B",
  border: "#E5E5E0",
  accent: "#E8E8E0",
  card: "#FFFFFF",
  sectionBg: "#F5F5F0",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.text,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    borderBottomStyle: "solid",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
  },
  locationGroup: {
    marginBottom: 20,
    backgroundColor: colors.card,
    padding: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "solid",
    width: "100%",
  },
  locationHeader: {
    backgroundColor: colors.sectionBg,
    padding: 8,
    marginBottom: 10,
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
  },
  locationSubtotal: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
  },
  table: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    paddingVertical: 6,
    paddingHorizontal: 0,
    width: "100%",
  },
  tableHeader: {
    backgroundColor: colors.sectionBg,
    paddingVertical: 8,
    paddingHorizontal: 0,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    borderBottomStyle: "solid",
    width: "100%",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
    textTransform: "uppercase",
  },
  tableCell: {
    fontSize: 9,
    color: colors.text,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.text,
  },
  colImage: {
    width: "8%",
  },
  colName: {
    width: "44%",
  },
  colPrice: {
    width: "16%",
    textAlign: "right",
  },
  colQuantity: {
    width: "12%",
    textAlign: "right",
  },
  colTotal: {
    width: "20%",
    textAlign: "right",
  },
  budgetLineGroup: {
    marginBottom: 15,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "solid",
  },
  budgetLineHeader: {
    backgroundColor: colors.sectionBg,
    padding: 8,
    marginBottom: 8,
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetLineName: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  budgetLineSubtotal: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.text,
  },
  budgetLineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    borderBottomStyle: "dashed",
  },
  budgetLineItemName: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.text,
    width: "30%",
  },
  budgetLineItemDescription: {
    fontSize: 9,
    color: colors.textLight,
    flex: 1,
    paddingHorizontal: 8,
  },
  budgetLineItemAmount: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "right",
    width: "20%",
  },
  summary: {
    marginTop: 25,
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "solid",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    fontSize: 10,
  },
  summaryLabel: {
    color: colors.textLight,
  },
  summaryValue: {
    fontWeight: "bold",
    color: colors.text,
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    borderTopStyle: "solid",
    fontSize: 14,
  },
  summaryTotalLabel: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 14,
  },
  summaryTotalValue: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 16,
  },
  itemImage: {
    width: 20,
    height: 20,
    objectFit: "cover",
    borderRadius: 2,
  },
  emptyState: {
    padding: 20,
    textAlign: "center",
    color: colors.textLight,
    fontSize: 9,
    fontStyle: "italic",
  },
});

interface ProjectPDFProps {
  project: Project & {
    client?: {
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  items: ProjectItem[];
  budgetLines: ProjectBudgetLine[];
  taxRate?: number;
  architectName?: string;
}

// Helper function to get category label
function getCategoryLabel(category: BudgetCategory): string {
  return BUDGET_CATEGORIES[category] || category;
}

// Helper function to get subcategory label
function getSubcategoryLabel(
  category: BudgetCategory,
  subcategory: string
): string {
  return BUDGET_SUBCATEGORIES[category]?.[subcategory] || subcategory;
}

export function ProjectPDF({
  project,
  items,
  budgetLines,
  taxRate = 0,
  architectName,
}: ProjectPDFProps) {
  // Filter out excluded items
  const includedItems = items.filter((item) => !item.is_excluded);

  // Group items by space (location)
  const itemsBySpace = includedItems.reduce(
    (acc, item) => {
      const spaceName = item.space?.name || "General";
      if (!acc[spaceName]) {
        acc[spaceName] = [];
      }
      acc[spaceName].push(item);
      return acc;
    },
    {} as Record<string, ProjectItem[]>
  );

  // Group budget lines by phase first, then by category
  const budgetLinesByPhaseAndCategory = budgetLines.reduce(
    (acc, line) => {
      const phaseKey = line.phase || "no_phase";
      if (!acc[phaseKey]) {
        acc[phaseKey] = {} as Record<BudgetCategory, ProjectBudgetLine[]>;
      }
      if (!acc[phaseKey][line.category]) {
        acc[phaseKey][line.category] = [];
      }
      acc[phaseKey][line.category].push(line);
      return acc;
    },
    {} as Record<string, Record<BudgetCategory, ProjectBudgetLine[]>>
  );

  // Calculate totals (only included items)
  const totalItemsPrice = includedItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const totalBudgetLines = budgetLines.reduce(
    (sum, line) => sum + Number(line.estimated_amount),
    0
  );
  const subtotal = totalItemsPrice + totalBudgetLines;
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;
  };

  // Order of phases to display in PDF
  const phaseOrder: (ProjectPhase | "no_phase")[] = [
    "diagnosis",
    "design",
    "executive",
    "budget",
    "construction",
    "delivery",
    "no_phase",
  ];

  // Order of categories to display within each phase
  const categoryOrder: BudgetCategory[] = [
    "own_fees",
    "external_services",
    "construction",
    "operations",
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Presupuesto de {project.name}</Text>

          {project.description && (
            <Text
              style={[styles.subtitle, { marginTop: 8, fontStyle: "italic" }]}
            >
              {project.description}
            </Text>
          )}

          {project.client && (
            <Text style={[styles.subtitle, { marginTop: 8 }]}>
              Cliente: {project.client.full_name}
            </Text>
          )}

          <Text style={[styles.subtitle, { marginTop: 8 }]}>
            Fecha:{" "}
            {new Date().toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          {architectName && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                borderTopStyle: "solid",
              }}
            >
              <Text style={[styles.subtitle, { fontWeight: "bold" }]}>
                Arquitecto/a: {architectName}
              </Text>
            </View>
          )}
        </View>

        {/* Budget Lines by Phase and Category */}
        {budgetLines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios y Partidas</Text>

            {phaseOrder.map((phase) => {
              const phaseData = budgetLinesByPhaseAndCategory[phase];
              if (!phaseData) return null;

              // Check if this phase has any lines
              const hasLines = Object.values(phaseData).some(
                (lines) => lines.length > 0
              );
              if (!hasLines) return null;

              const phaseTotal = Object.values(phaseData).reduce(
                (sum, lines) =>
                  sum +
                  lines.reduce(
                    (lineSum, line) => lineSum + Number(line.estimated_amount),
                    0
                  ),
                0
              );

              return (
                <View
                  key={phase}
                  style={[styles.budgetLineGroup, { marginBottom: 20 }]}
                >
                  <View
                    style={[
                      styles.budgetLineHeader,
                      { backgroundColor: colors.primary, marginBottom: 10 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.budgetLineName,
                        { color: "#FFFFFF", fontSize: 13 },
                      ]}
                    >
                      {phase === "no_phase"
                        ? "Sin Fase"
                        : getPhaseLabel(phase as ProjectPhase)}
                    </Text>
                    <Text
                      style={[
                        styles.budgetLineSubtotal,
                        { color: "#FFFFFF", fontSize: 12 },
                      ]}
                    >
                      Subtotal: {formatCurrency(phaseTotal)}
                    </Text>
                  </View>

                  {categoryOrder.map((category) => {
                    const lines = phaseData[category];
                    if (!lines || lines.length === 0) return null;

                    const categoryTotal = lines.reduce(
                      (sum, line) => sum + Number(line.estimated_amount),
                      0
                    );

                    return (
                      <View
                        key={category}
                        style={[
                          styles.budgetLineGroup,
                          { marginLeft: 10, marginBottom: 12 },
                        ]}
                      >
                        <View style={styles.budgetLineHeader}>
                          <Text style={styles.budgetLineName}>
                            {getCategoryLabel(category)}
                          </Text>
                          <Text style={styles.budgetLineSubtotal}>
                            Subtotal: {formatCurrency(categoryTotal)}
                          </Text>
                        </View>

                        {lines.map((line) => (
                          <View key={line.id} style={styles.budgetLineItem}>
                            <Text style={styles.budgetLineItemName}>
                              {getSubcategoryLabel(category, line.subcategory)}
                            </Text>
                            <Text style={styles.budgetLineItemDescription}>
                              {line.description || ""}
                            </Text>
                            <Text style={styles.budgetLineItemAmount}>
                              {formatCurrency(Number(line.estimated_amount))}
                            </Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {/* Items by Location - solo si hay productos */}
        {Object.keys(itemsBySpace).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mobiliario y Productos</Text>

            {Object.entries(itemsBySpace).map(([spaceName, spaceItems]) => {
              const spaceSubtotal = spaceItems.reduce(
                (sum, item) => sum + item.unit_price * item.quantity,
                0
              );

              return (
                <View key={spaceName} style={styles.locationGroup}>
                  <View style={styles.locationHeader}>
                    <Text style={styles.locationName}>{spaceName}</Text>
                    <Text style={styles.locationSubtotal}>
                      Subtotal: {formatCurrency(spaceSubtotal)}
                    </Text>
                  </View>

                  <View style={[styles.table, { width: "100%" }]}>
                    {/* Table Header */}
                    <View style={[styles.tableHeader, { width: "100%" }]}>
                      <View style={styles.colImage}>
                        <Text style={styles.tableHeaderText}></Text>
                      </View>
                      <View style={styles.colName}>
                        <Text style={styles.tableHeaderText}>Elemento</Text>
                      </View>
                      <View style={styles.colPrice}>
                        <Text
                          style={[
                            styles.tableHeaderText,
                            { textAlign: "right" },
                          ]}
                        >
                          Precio Unit.
                        </Text>
                      </View>
                      <View style={styles.colQuantity}>
                        <Text
                          style={[
                            styles.tableHeaderText,
                            { textAlign: "right" },
                          ]}
                        >
                          Cant.
                        </Text>
                      </View>
                      <View style={styles.colTotal}>
                        <Text
                          style={[
                            styles.tableHeaderText,
                            { textAlign: "right" },
                          ]}
                        >
                          Total
                        </Text>
                      </View>
                    </View>

                    {/* Table Rows */}
                    {spaceItems.map((item) => (
                      <View key={item.id} style={styles.tableRow}>
                        <View style={styles.colImage}>
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              style={styles.itemImage}
                              cache={false}
                            />
                          ) : (
                            <View style={{ width: 20, height: 20 }} />
                          )}
                        </View>
                        <View style={styles.colName}>
                          <Text style={styles.tableCellBold}>
                            {item.product?.name ?? item.name}
                          </Text>
                          {item.description && (
                            <Text
                              style={[
                                styles.tableCell,
                                {
                                  fontSize: 7,
                                  marginTop: 2,
                                  color: colors.textLight,
                                },
                              ]}
                            >
                              {item.description}
                            </Text>
                          )}
                        </View>
                        <View style={styles.colPrice}>
                          <Text
                            style={[styles.tableCell, { textAlign: "right" }]}
                          >
                            {formatCurrency(item.unit_price)}
                          </Text>
                        </View>
                        <View style={styles.colQuantity}>
                          <Text
                            style={[styles.tableCell, { textAlign: "right" }]}
                          >
                            {item.quantity}
                          </Text>
                        </View>
                        <View style={styles.colTotal}>
                          <Text
                            style={[
                              styles.tableCellBold,
                              { textAlign: "right" },
                            ]}
                          >
                            {formatCurrency(item.unit_price * item.quantity)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.summary}>
            {budgetLines.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal Servicios y Partidas:
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(totalBudgetLines)}
                </Text>
              </View>
            )}
            {items.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal Mobiliario y Productos:
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(totalItemsPrice)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IVA ({taxRate}%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>TOTAL:</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
