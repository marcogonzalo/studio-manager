import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Project, AdditionalCost } from '@/types';
import type { ProjectItem } from '@/pages/projects/project-budget';

const COST_TYPE_LABELS: Record<string, string> = {
  shipping: 'Envío',
  packaging: 'Embalaje',
  installation: 'Instalación',
  assembly: 'Montaje',
  transport: 'Transporte',
  insurance: 'Seguro',
  customs: 'Aduanas',
  storage: 'Almacenamiento',
  handling: 'Manejo',
  other: 'Otro',
};

// Color palette matching the application (from index.css)
// Converting oklch to hex approximations for PDF
const colors = {
  primary: '#8B9A7A', // Sage green - oklch(0.65 0.08 140) approximation
  primaryLight: '#B8C5A8', // Lighter sage
  background: '#FAF9F6', // Warm cream - oklch(0.98 0.01 100) approximation
  text: '#3F3F3F', // Dark earthy grey - oklch(0.25 0.02 100) approximation
  textLight: '#6B6B6B', // Medium grey
  border: '#E5E5E0', // Light border - oklch(0.90 0.02 100) approximation
  accent: '#E8E8E0', // Beige - oklch(0.94 0.03 95) approximation
  card: '#FFFFFF', // White
  sectionBg: '#F5F5F0', // Light section background
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderBottomStyle: 'solid',
  },
  locationGroup: {
    marginBottom: 20,
    backgroundColor: colors.card,
    padding: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'solid',
    width: '100%',
  },
  locationHeader: {
    backgroundColor: colors.sectionBg,
    padding: 8,
    marginBottom: 10,
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
  },
  locationSubtotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    borderBottomStyle: 'solid',
    paddingVertical: 6,
    paddingHorizontal: 0,
    width: '100%',
  },
  tableHeader: {
    backgroundColor: colors.sectionBg,
    paddingVertical: 8,
    paddingHorizontal: 0,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    borderBottomStyle: 'solid',
    width: '100%',
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: colors.text,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  colImage: {
    width: '8%',
  },
  colName: {
    width: '44%',
  },
  colPrice: {
    width: '16%',
    textAlign: 'right',
  },
  colQuantity: {
    width: '12%',
    textAlign: 'right',
  },
  colTotal: {
    width: '20%',
    textAlign: 'right',
  },
  colDescription: {
    width: '10%',
    fontSize: 8,
    color: colors.textLight,
  },
  costTypeGroup: {
    marginBottom: 15,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'solid',
  },
  costTypeHeader: {
    backgroundColor: colors.sectionBg,
    padding: 8,
    marginBottom: 8,
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costTypeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  costTypeSubtotal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    borderBottomStyle: 'dashed',
  },
  costItemDescription: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
  },
  costItemAmount: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    width: '20%',
  },
  summary: {
    marginTop: 25,
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'solid',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    fontSize: 10,
  },
  summaryLabel: {
    color: colors.textLight,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    borderTopStyle: 'solid',
    fontSize: 14,
  },
  summaryTotalLabel: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 14,
  },
  summaryTotalValue: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 16,
  },
  itemImage: {
    width: 20,
    height: 20,
    objectFit: 'cover',
    borderRadius: 2,
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 9,
    fontStyle: 'italic',
  },
});

interface ProjectPDFProps {
  project: Project & { client?: { full_name: string; email?: string; phone?: string; address?: string } };
  items: ProjectItem[];
  additionalCosts: AdditionalCost[];
  taxRate?: number; // Tax rate as percentage (e.g., 21 for 21%)
  architectName?: string; // Name of the architect/user
}

export function ProjectPDF({ project, items, additionalCosts, taxRate = 21, architectName }: ProjectPDFProps) {
  // Group items by space (location)
  const itemsBySpace = items.reduce((acc, item) => {
    const spaceName = item.space?.name || 'General';
    if (!acc[spaceName]) {
      acc[spaceName] = [];
    }
    acc[spaceName].push(item);
    return acc;
  }, {} as Record<string, ProjectItem[]>);

  // Group additional costs by type
  const costsByType = additionalCosts.reduce((acc, cost) => {
    if (!acc[cost.cost_type]) {
      acc[cost.cost_type] = [];
    }
    acc[cost.cost_type].push(cost);
    return acc;
  }, {} as Record<string, AdditionalCost[]>);

  // Calculate totals
  const totalItemsPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const subtotal = totalItemsPrice + totalAdditionalCosts;
  const tax = subtotal * (taxRate / 100);
  const grandTotal = subtotal + tax;

  const formatCurrency = (amount: number) => {
    // Format: 1.234,56 € (Spanish format with dot as thousands separator, comma as decimal separator and space before €)
    return `${amount.toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} €`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Presupuesto de {project.name}</Text>
          
          {project.description && (
            <Text style={[styles.subtitle, { marginTop: 8, fontStyle: 'italic' }]}>
              {project.description}
            </Text>
          )}
          
          {project.client && (
            <Text style={[styles.subtitle, { marginTop: 8 }]}>
              Cliente: {project.client.full_name}
            </Text>
          )}
          
          <Text style={[styles.subtitle, { marginTop: 8 }]}>
            Fecha: {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          {architectName && (
            <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, borderTopStyle: 'solid' }}>
              <Text style={[styles.subtitle, { fontWeight: 'bold' }]}>
                Arquitecto/a: {architectName}
              </Text>
            </View>
          )}
        </View>

        {/* Items by Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elementos del Proyecto</Text>
          
          {Object.keys(itemsBySpace).length === 0 ? (
            <View style={styles.emptyState}>
              <Text>No hay elementos registrados en el proyecto.</Text>
            </View>
          ) : (
            Object.entries(itemsBySpace).map(([spaceName, spaceItems]) => {
              const spaceSubtotal = spaceItems.reduce(
                (sum, item) => sum + (item.unit_price * item.quantity),
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

                  <View style={[styles.table, { width: '100%' }]}>
                    {/* Table Header */}
                    <View style={[styles.tableHeader, { width: '100%' }]}>
                      <View style={styles.colImage}>
                        <Text style={styles.tableHeaderText}></Text>
                      </View>
                      <View style={styles.colName}>
                        <Text style={styles.tableHeaderText}>Elemento</Text>
                      </View>
                      <View style={styles.colPrice}>
                        <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Precio Unit.</Text>
                      </View>
                      <View style={styles.colQuantity}>
                        <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Cant.</Text>
                      </View>
                      <View style={styles.colTotal}>
                        <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Total</Text>
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
                          <Text style={styles.tableCellBold}>{item.name}</Text>
                          {item.description && (
                            <Text style={[styles.tableCell, { fontSize: 7, marginTop: 2, color: colors.textLight }]}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                        <View style={styles.colPrice}>
                          <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                            {formatCurrency(item.unit_price)}
                          </Text>
                        </View>
                        <View style={styles.colQuantity}>
                          <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                            {item.quantity}
                          </Text>
                        </View>
                        <View style={styles.colTotal}>
                          <Text style={[styles.tableCellBold, { textAlign: 'right' }]}>
                            {formatCurrency(item.unit_price * item.quantity)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Additional Costs by Type */}
        {additionalCosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Costes Adicionales</Text>
            
            {Object.entries(costsByType).map(([type, typeCosts]) => {
              const typeTotal = typeCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);

              return (
                <View key={type} style={styles.costTypeGroup}>
                  <View style={styles.costTypeHeader}>
                    <Text style={styles.costTypeName}>
                      {COST_TYPE_LABELS[type] || type}
                    </Text>
                    <Text style={styles.costTypeSubtotal}>
                      Subtotal: {formatCurrency(typeTotal)}
                    </Text>
                  </View>

                  {typeCosts.map((cost) => (
                    <View key={cost.id} style={styles.costItem}>
                      <Text style={styles.costItemDescription}>
                        {cost.description || 'Sin descripción'}
                      </Text>
                      <Text style={styles.costItemAmount}>
                        {formatCurrency(Number(cost.amount))}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal Elementos:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalItemsPrice)}</Text>
            </View>
            {additionalCosts.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal Costes Adicionales:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalAdditionalCosts)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IVA ({taxRate}%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>TOTAL:</Text>
              <Text style={styles.summaryTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

