import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
// Sin Font.register externo: las URLs a Google Fonts provocan "Failed to fetch" en toBlob()
// al renderizar. Usamos Helvetica (integrada) para que el PDF se genere sin peticiones externas.
import { defaultLocale, type Locale } from "@/i18n/config";
import { formatCurrencyWithLang, formatDateIntl } from "@/lib/formatting";
import {
  getPdfCategoryLabel,
  getPdfPhaseLabel,
  getPdfSubcategoryLabel,
  getProjectPdfCopy,
  interpolatePdfCopy,
} from "@/lib/project-pdf-copy";
import {
  appendTbdAsterisk,
  budgetLineEstimatedAmount,
  formatItemSalePrice,
  formatItemSaleTotal,
  hasBudgetLinesWithTbd,
  hasPricedItemsWithTbd,
  isItemPriceTbd,
  itemSaleAmount,
  sumBudgetLineEstimatedAmounts,
  sumItemSaleAmounts,
} from "@/lib/project-item-price";
import {
  computeTaxGroups,
  effectiveLineTaxRate,
  formatTaxRatePercent,
  sumTaxAmounts,
} from "@/lib/tax-totals";
import { splitBudgetNotesLines } from "@/lib/budget-notes";
import {
  groupBudgetLinesByPhaseThenCategory,
  groupItemsBySpaceThenCreatedAt,
  orderedBudgetCategoryKeys,
  orderedBudgetPhaseKeys,
} from "@/lib/project-list-order";
import type {
  Project,
  ProjectBudgetLine,
  ProjectItem,
  BudgetCategory,
  ProjectPhase,
} from "@/types";

// Color palette matching the application (from index.css)
const colors = {
  primary: "#8B9A7A",
  background: "#FAF9F6",
  text: "#3F3F3F",
  textLight: "#6B6B6B",
  border: "#E5E5E0",
  card: "#FFFFFF",
  sectionBg: "#F5F5F0",
  white: "#FFFFFF",
};

const VETA_FOOTER_RESERVE = 72;
/** Minimum vertical space (pt) to keep the totals block on one page. */
const SUMMARY_MIN_PRESENCE = 200;
/** Fallback path for logo (relative; react-pdf often needs absolute URL, so caller should pass vetaLogoUrl). */
const VETA_LOGO_PATH = "/img/veta-logo.png";
const PAGE_PADDING = 40;
const BAR_PAD = 5;

const row = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
};
const rowBetween = {
  ...row,
  justifyContent: "space-between" as const,
};
const fullWidth = { width: "100%" as const };
const bold = { fontWeight: "bold" as const };
const boldPrimary = { ...bold, color: colors.primary };
const boldText = { ...bold, color: colors.text };
const text9 = { fontSize: 9 };
const headingSm = { ...boldPrimary, fontSize: 12 };
const headerCaps = {
  ...text9,
  ...boldPrimary,
  textTransform: "uppercase" as const,
};
const cell = { ...text9, color: colors.text };
const bar = {
  ...rowBetween,
  padding: BAR_PAD,
  marginBottom: 0,
  borderRadius: 3,
};
const solidBorder = (side: "Top" | "Bottom", color: string, width = 1) =>
  side === "Top"
    ? {
        borderTopWidth: width,
        borderTopColor: color,
        borderTopStyle: "solid" as const,
      }
    : {
        borderBottomWidth: width,
        borderBottomColor: color,
        borderBottomStyle: "solid" as const,
      };
const colRight = (width: `${number}%`) => ({
  width,
  textAlign: "right" as const,
});
const cardBlock = {
  backgroundColor: colors.card,
  padding: 0,
  ...fullWidth,
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: colors.background,
    padding: PAGE_PADDING,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.text,
  },
  pageWithBrandingFooter: {
    paddingBottom: PAGE_PADDING + VETA_FOOTER_RESERVE,
  },
  header: {
    marginBottom: 10,
    paddingBottom: 5,
    ...solidBorder("Bottom", colors.primary, 1),
  },
  title: {
    ...headingSm,
    fontSize: 14,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  section: {
    marginBottom: 10,
  },
  lineGroupTitleRow: {
    ...bar,
    backgroundColor: colors.sectionBg,
  },
  lineGroupTitleText: headingSm,
  sectionTitleBar: {
    ...bar,
    backgroundColor: colors.primary,
  },
  sectionTitleBarText: {
    ...headingSm,
    color: colors.white,
  },
  clientArchitectRow: {
    ...row,
    alignItems: "flex-start",
    marginTop: 12,
    gap: 24,
  },
  clientArchitectCol: {
    flex: 1,
  },
  clientArchitectTitle: {
    ...boldPrimary,
    fontSize: 11,
    marginBottom: 4,
  },
  clientArchitectText: {
    ...text9,
    color: colors.text,
    marginBottom: 2,
  },
  table: fullWidth,
  tableRow: {
    ...row,
    ...solidBorder("Bottom", colors.border, 0.5),
    paddingVertical: 3,
    paddingHorizontal: 0,
    ...fullWidth,
  },
  tableHeader: {
    ...row,
    paddingVertical: 3,
    paddingHorizontal: 0,
    ...solidBorder("Bottom", colors.primary),
    ...fullWidth,
  },
  tableHeaderText: headerCaps,
  tableHeaderTextRight: {
    ...headerCaps,
    textAlign: "right",
  },
  tableCell: cell,
  tableCellRight: {
    ...cell,
    textAlign: "right",
  },
  tableCellMuted: {
    fontSize: 7,
    marginTop: 2,
    color: colors.textLight,
  },
  tableCellBold: {
    ...text9,
    ...boldText,
  },
  tableCellBoldRight: {
    ...text9,
    ...boldText,
    textAlign: "right",
  },
  colImage: {
    width: "7%",
    justifyContent: "center",
    alignItems: "center",
  },
  colName: {
    width: "36%",
  },
  colPrice: colRight("14%"),
  colQuantity: colRight("10%"),
  colTax: colRight("10%"),
  colTotal: colRight("19%"),
  colEmpty: {
    width: "4%",
  },
  budgetLineGroup: {
    ...cardBlock,
    marginBottom: 10,
  },
  locationGroup: {
    ...cardBlock,
    marginBottom: 5,
  },
  budgetLineGroupIndent: {
    paddingHorizontal: 10,
    ...fullWidth,
  },
  budgetLineHeader: {
    ...rowBetween,
    marginBottom: BAR_PAD,
    paddingVertical: BAR_PAD,
    paddingHorizontal: BAR_PAD,
    ...solidBorder("Bottom", colors.border),
  },
  budgetLineName: { ...headingSm, fontSize: 10 },
  budgetLineSubtotal: {
    ...boldText,
    fontSize: 9,
  },
  budgetLineItem: {
    ...rowBetween,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    borderBottomStyle: "dashed",
  },
  budgetLineItemName: {
    ...text9,
    ...boldText,
    width: "28%",
  },
  budgetLineItemDescription: {
    ...text9,
    color: colors.textLight,
    flex: 1,
    paddingHorizontal: 8,
  },
  budgetLineItemTax: {
    ...text9,
    color: colors.textLight,
    textAlign: "right",
    width: "12%",
  },
  budgetLineItemAmount: {
    ...text9,
    ...boldText,
    textAlign: "right",
    width: "18%",
  },
  summary: {
    flexDirection: "column",
    marginTop: 10,
    backgroundColor: colors.card,
    padding: 5,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "solid",
  },
  summaryRow: {
    ...rowBetween,
    paddingVertical: 3,
    minHeight: 15,
  },
  summaryLabel: {
    flex: 1,
    paddingRight: 12,
    color: colors.textLight,
    fontSize: 10,
  },
  summaryValue: {
    flexShrink: 0,
    ...boldText,
    fontSize: 10,
  },
  summaryTotal: {
    ...rowBetween,
    paddingTop: 5,
    marginTop: 10,
    ...solidBorder("Top", colors.primary),
    minHeight: 20,
  },
  summaryTotalLabel: {
    ...boldPrimary,
    fontSize: 12,
  },
  summaryTotalValue: {
    ...boldPrimary,
    fontSize: 12,
  },
  priceTbdNote: {
    marginTop: 10,
    fontSize: 8,
    color: colors.textLight,
    fontStyle: "italic",
  },
  budgetNotes: {
    marginTop: 12,
    paddingHorizontal: 16,
    fontSize: 8,
    color: colors.textLight,
    lineHeight: 1.35,
  },
  budgetNotesLine: {
    fontSize: 8,
    color: colors.textLight,
  },
  itemImage: {
    width: 30,
    height: 30,
    objectFit: "cover",
    borderRadius: 2,
  },
  vetaHeader: {
    ...row,
    gap: 8,
    marginBottom: 10,
    paddingBottom: 5,
    ...solidBorder("Bottom", colors.border),
  },
  vetaHeaderLogo: {
    width: 32,
    height: 24,
    objectFit: "contain",
  },
  vetaHeaderName: {
    ...boldPrimary,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  vetaFooter: {
    ...row,
    marginTop: 24,
    paddingTop: 5,
    ...solidBorder("Top", colors.border),
    justifyContent: "center",
    gap: 6,
  },
  vetaFooterLogo: {
    width: 16,
    height: 12,
    objectFit: "contain",
  },
  vetaFooterText: {
    fontSize: 8,
    color: colors.textLight,
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
  architectEmail?: string;
  /** When true (pdf_export_mode basic or plus), show Veta logo and name in header and branding footer. */
  showVetaBranding?: boolean;
  /** Absolute URL for the Veta logo (react-pdf does not resolve relative paths). E.g. `${origin}/img/veta-logo.png` */
  vetaLogoUrl?: string;
  lang?: Locale;
}

export function ProjectPDF({
  project,
  items,
  budgetLines,
  taxRate = 0,
  architectName,
  architectEmail,
  showVetaBranding = false,
  vetaLogoUrl,
  lang = defaultLocale,
}: ProjectPDFProps) {
  const copy = getProjectPdfCopy(lang);
  const logoSrc = vetaLogoUrl ?? VETA_LOGO_PATH;
  const logoIsEmbedded =
    typeof logoSrc === "string" && logoSrc.startsWith("data:");

  // Filter out excluded items
  const includedItems = items.filter((item) => !item.is_excluded);
  const hasPriceTbd =
    hasPricedItemsWithTbd(includedItems) || hasBudgetLinesWithTbd(budgetLines);
  const budgetNoteLines = splitBudgetNotesLines(project.budget_notes);

  const itemsBySpace = groupItemsBySpaceThenCreatedAt(
    includedItems,
    copy.spaceGeneral
  );

  const budgetLinesByPhaseAndCategory =
    groupBudgetLinesByPhaseThenCategory(budgetLines);

  // Calculate totals (only included items)
  const totalItemsPrice = sumItemSaleAmounts(includedItems);
  const totalBudgetLines = sumBudgetLineEstimatedAmounts(budgetLines);
  const subtotal = totalItemsPrice + totalBudgetLines;
  const projectTaxRate =
    taxRate ?? (project.tax_rate != null ? Number(project.tax_rate) : 0);
  const taxGroups = computeTaxGroups(
    [
      ...includedItems.map((item) => ({
        amount: itemSaleAmount(item),
        tax_rate: item.tax_rate,
      })),
      ...budgetLines.map((line) => ({
        amount: budgetLineEstimatedAmount(line),
        tax_rate: line.tax_rate,
      })),
    ],
    {
      multitax: project.multitax === true,
      tax_rate: projectTaxRate,
    }
  );
  const tax = sumTaxAmounts(taxGroups);
  const grandTotal = subtotal + tax;
  const taxProjectCtx = {
    multitax: project.multitax === true,
    tax_rate: projectTaxRate,
  };

  const formatCurrency = (amount: number) =>
    formatCurrencyWithLang(amount, project?.currency, lang);

  const visiblePhases = orderedBudgetPhaseKeys(
    budgetLinesByPhaseAndCategory
  ).filter((phase) => {
    const phaseData = budgetLinesByPhaseAndCategory[phase];
    return (
      !!phaseData && Object.values(phaseData).some((lines) => lines.length > 0)
    );
  });
  const [firstPhase, ...restPhases] = visiblePhases;

  const renderPhaseGroup = (phase: string) => {
    const phaseData = budgetLinesByPhaseAndCategory[phase];
    if (!phaseData) return null;

    const phaseLines = Object.values(phaseData).flat();
    const phaseTotal = sumBudgetLineEstimatedAmounts(phaseLines);
    const phaseHasTbd = hasBudgetLinesWithTbd(phaseLines);

    return (
      <View key={phase} style={styles.budgetLineGroup}>
        <View style={styles.lineGroupTitleRow}>
          <Text style={styles.lineGroupTitleText}>
            {getPdfPhaseLabel(phase as ProjectPhase | "no_phase", lang)}
          </Text>
          <Text style={styles.budgetLineSubtotal}>
            {copy.subtotal}{" "}
            {appendTbdAsterisk(formatCurrency(phaseTotal), phaseHasTbd)}
          </Text>
        </View>

        <View style={styles.budgetLineGroupIndent}>
          {orderedBudgetCategoryKeys(phaseData).map((category) => {
            const lines = phaseData[category];
            if (!lines || lines.length === 0) return null;

            const categoryTotal = sumBudgetLineEstimatedAmounts(lines);
            const categoryHasTbd = hasBudgetLinesWithTbd(lines);

            return (
              <View key={category} style={styles.budgetLineGroup}>
                <View style={styles.budgetLineHeader}>
                  <Text style={styles.budgetLineName}>
                    {getPdfCategoryLabel(category as BudgetCategory, lang)}
                  </Text>
                  <Text style={styles.budgetLineSubtotal}>
                    {copy.subtotal}{" "}
                    {appendTbdAsterisk(
                      formatCurrency(categoryTotal),
                      categoryHasTbd
                    )}
                  </Text>
                </View>

                {lines.map((line) => (
                  <View key={line.id} style={styles.budgetLineItem}>
                    <Text style={styles.budgetLineItemName}>
                      {getPdfSubcategoryLabel(
                        category as BudgetCategory,
                        line.subcategory,
                        lang
                      )}
                    </Text>
                    <Text style={styles.budgetLineItemDescription}>
                      {line.description || ""}
                    </Text>
                    <Text style={styles.budgetLineItemTax}>
                      {formatTaxRatePercent(
                        effectiveLineTaxRate(line, taxProjectCtx)
                      )}
                    </Text>
                    <Text style={styles.budgetLineItemAmount}>
                      {isItemPriceTbd(line)
                        ? copy.priceTbd
                        : formatCurrency(Number(line.estimated_amount))}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page
        size="A4"
        style={
          showVetaBranding
            ? [styles.page, styles.pageWithBrandingFooter]
            : styles.page
        }
      >
        {showVetaBranding && (
          <View style={styles.vetaHeader}>
            {logoIsEmbedded && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop
              <Image
                src={logoSrc}
                style={styles.vetaHeaderLogo}
                cache={false}
              />
            )}
            <Text style={styles.vetaHeaderName}>Veta</Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {interpolatePdfCopy(copy.title, { name: project.name })}
          </Text>

          <Text style={styles.subtitle}>
            {copy.dateLabel}{" "}
            {formatDateIntl(new Date(), lang, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          {project.description && (
            <Text style={styles.subtitle}>{project.description}</Text>
          )}

          <View style={styles.clientArchitectRow}>
            <View style={styles.clientArchitectCol}>
              <Text style={styles.clientArchitectTitle}>{copy.client}</Text>
              {project.client ? (
                <>
                  <Text style={styles.clientArchitectText}>
                    {project.client.full_name}
                  </Text>
                  {project.client.address && (
                    <Text style={styles.clientArchitectText}>
                      {project.client.address}
                    </Text>
                  )}
                  {project.client.email && (
                    <Text style={styles.clientArchitectText}>
                      {project.client.email}
                    </Text>
                  )}
                  {project.client.phone && (
                    <Text style={styles.clientArchitectText}>
                      {project.client.phone}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.clientArchitectText}>—</Text>
              )}
            </View>
            <View style={styles.clientArchitectCol}>
              <Text style={styles.clientArchitectTitle}>{copy.architect}</Text>
              {architectName || architectEmail ? (
                <>
                  {architectName && (
                    <Text style={styles.clientArchitectText}>
                      {architectName}
                    </Text>
                  )}
                  {architectEmail && (
                    <Text style={styles.clientArchitectText}>
                      {architectEmail}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.clientArchitectText}>—</Text>
              )}
            </View>
          </View>
        </View>

        {/* Products by space first, then services */}
        {itemsBySpace.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleBar}>
              <Text style={styles.sectionTitleBarText}>
                {copy.furnitureAndProducts}
              </Text>
            </View>

            {itemsBySpace.map(({ spaceKey, spaceName, items: spaceItems }) => {
              const spaceSubtotal = sumItemSaleAmounts(spaceItems);
              const spaceHasTbd = hasPricedItemsWithTbd(spaceItems);

              return (
                <View key={spaceKey} style={styles.locationGroup}>
                  <View style={styles.lineGroupTitleRow}>
                    <Text style={styles.lineGroupTitleText}>{spaceName}</Text>
                    <Text style={styles.budgetLineSubtotal}>
                      {copy.subtotal}{" "}
                      {appendTbdAsterisk(
                        formatCurrency(spaceSubtotal),
                        spaceHasTbd
                      )}
                    </Text>
                  </View>

                  <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <View style={styles.colImage}>
                        <Text style={styles.tableHeaderText}></Text>
                      </View>
                      <View style={styles.colName}>
                        <Text style={styles.tableHeaderText}>
                          {copy.itemColumn}
                        </Text>
                      </View>
                      <View style={styles.colPrice}>
                        <Text style={styles.tableHeaderTextRight}>
                          {copy.unitPriceColumn}
                        </Text>
                      </View>
                      <View style={styles.colQuantity}>
                        <Text style={styles.tableHeaderTextRight}>
                          {copy.qtyColumn}
                        </Text>
                      </View>
                      <View style={styles.colTax}>
                        <Text style={styles.tableHeaderTextRight}>
                          {copy.taxColumn}
                        </Text>
                      </View>
                      <View style={styles.colTotal}>
                        <Text style={styles.tableHeaderTextRight}>
                          {copy.totalColumn}
                        </Text>
                      </View>
                      <View style={styles.colEmpty}>
                        <Text style={styles.tableHeaderText}></Text>
                      </View>
                    </View>

                    {/* Table Rows */}
                    {spaceItems.map((item) => (
                      <View key={item.id} style={styles.tableRow}>
                        <View style={styles.colImage}>
                          {item.image_url?.startsWith("data:") ? (
                            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop
                            <Image
                              src={item.image_url}
                              style={styles.itemImage}
                              cache={true}
                            />
                          ) : (
                            <View style={{ width: 30, height: 30 }} />
                          )}
                        </View>
                        <View style={styles.colName}>
                          <Text style={styles.tableCellBold}>
                            {item.product?.name ?? item.name}
                          </Text>
                          {item.description && (
                            <Text style={styles.tableCellMuted}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                        <View style={styles.colPrice}>
                          <Text style={styles.tableCellRight}>
                            {formatItemSalePrice(
                              item,
                              formatCurrency,
                              copy.priceTbd
                            )}
                          </Text>
                        </View>
                        <View style={styles.colQuantity}>
                          <Text style={styles.tableCellRight}>
                            {item.quantity}
                          </Text>
                        </View>
                        <View style={styles.colTax}>
                          <Text style={styles.tableCellRight}>
                            {formatTaxRatePercent(
                              effectiveLineTaxRate(item, taxProjectCtx)
                            )}
                          </Text>
                        </View>
                        <View style={styles.colTotal}>
                          <Text style={styles.tableCellBoldRight}>
                            {formatItemSaleTotal(
                              item,
                              formatCurrency,
                              copy.priceTbd
                            )}
                          </Text>
                        </View>
                        <View style={styles.colEmpty} />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Budget Lines by Phase and Category — title stays with first phase */}
        {firstPhase && (
          <View style={styles.section}>
            <View wrap={false}>
              <View style={styles.sectionTitleBar}>
                <Text style={styles.sectionTitleBarText}>
                  {copy.servicesAndLines}
                </Text>
              </View>
              {renderPhaseGroup(firstPhase)}
            </View>
            {restPhases.map((phase) => renderPhaseGroup(phase))}
          </View>
        )}

        {/* Summary — keep on one page; fixed footer needs bottom padding */}
        <View
          wrap={false}
          minPresenceAhead={SUMMARY_MIN_PRESENCE}
          style={styles.section}
        >
          <View style={styles.summary}>
            {items.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{copy.subtotalProducts}</Text>
                <Text style={styles.summaryValue}>
                  {appendTbdAsterisk(
                    formatCurrency(totalItemsPrice),
                    hasPricedItemsWithTbd(includedItems)
                  )}
                </Text>
              </View>
            )}
            {budgetLines.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{copy.subtotalServices}</Text>
                <Text style={styles.summaryValue}>
                  {appendTbdAsterisk(
                    formatCurrency(totalBudgetLines),
                    hasBudgetLinesWithTbd(budgetLines)
                  )}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{copy.subtotal}</Text>
              <Text style={styles.summaryValue}>
                {appendTbdAsterisk(formatCurrency(subtotal), hasPriceTbd)}
              </Text>
            </View>
            {taxGroups.map((group) => (
              <View key={group.rate} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {interpolatePdfCopy(copy.tax, { rate: group.rate })}
                </Text>
                <Text style={styles.summaryValue}>
                  {appendTbdAsterisk(
                    formatCurrency(group.taxAmount),
                    hasPriceTbd
                  )}
                </Text>
              </View>
            ))}
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>{copy.grandTotal}</Text>
              <Text style={styles.summaryTotalValue}>
                {appendTbdAsterisk(formatCurrency(grandTotal), hasPriceTbd)}
              </Text>
            </View>
            {hasPriceTbd && (
              <Text style={styles.priceTbdNote}>{copy.priceTbdNote}</Text>
            )}
          </View>
        </View>
        {budgetNoteLines.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.budgetNotes}>
              {budgetNoteLines.map((line, index) => (
                <Text key={index} style={styles.budgetNotesLine}>
                  {line.length > 0 ? line : " "}
                  {index < budgetNoteLines.length - 1 ? "\n" : ""}
                </Text>
              ))}
            </Text>
          </View>
        ) : null}
        {showVetaBranding && (
          <View style={styles.vetaFooter} fixed>
            {logoIsEmbedded && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop
              <Image
                src={logoSrc}
                style={styles.vetaFooterLogo}
                cache={false}
              />
            )}
            <Text style={styles.vetaFooterText}>{copy.generatedWith}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
