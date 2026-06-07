"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  MobileDetailField,
  TableCellMd,
  TableHeadExpandPlaceholder,
  TableHeadMd,
  TableRowExpandTrigger,
  TableRowMobileDetail,
  useExpandableTableRow,
} from "@/components/ui/expandable-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  defaultDateFormatForLocale,
  formatCurrencyWithLang,
  formatDateByPattern,
} from "@/lib/formatting";
import type { Locale } from "@/i18n/config";

export interface ViewProjectPaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  reference_number: string | null;
  description: string | null;
  payment_type: string;
}

export function ViewProjectPaymentsClient({
  payments,
  currency,
  locale,
}: {
  payments: ViewProjectPaymentRow[];
  currency: string;
  locale: Locale;
}) {
  const t = useTranslations("ViewProject");
  const { toggleRow, isExpanded } = useExpandableTableRow();
  const dateFmt = defaultDateFormatForLocale(locale);
  const mobileVisibleColumnCount = 4;

  const paymentTypeLabel = (type: string) => {
    const known = [
      "fees",
      "purchase_provision",
      "additional_cost",
      "other",
    ] as const;
    if ((known as readonly string[]).includes(type)) {
      return t(`paymentType.${type as (typeof known)[number]}`);
    }
    return type;
  };

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-12 text-center">
          {t("noPayments")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-border flex justify-end border-b px-4 py-3">
          <span className="text-muted-foreground text-sm">
            {t("total")}{" "}
            <span className="text-foreground font-semibold">
              {formatCurrencyWithLang(totalAmount, currency, locale)}
            </span>
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("tableDate")}</TableHead>
              <TableHead>{t("tableType")}</TableHead>
              <TableHead className="text-right">{t("tableAmount")}</TableHead>
              <TableHeadMd className="text-muted-foreground">
                {t("tableReference")}
              </TableHeadMd>
              <TableHeadMd>{t("tableDescription")}</TableHeadMd>
              <TableHeadExpandPlaceholder srLabel={t("expandRow")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const expanded = isExpanded(payment.id);
              const formattedDate = formatDateByPattern(
                payment.payment_date,
                dateFmt
              );
              const formattedAmount = formatCurrencyWithLang(
                Number(payment.amount),
                currency,
                locale
              );
              const typeLabel = paymentTypeLabel(payment.payment_type);

              return (
                <Fragment key={payment.id}>
                  <TableRow>
                    <TableCell className="whitespace-nowrap">
                      {formattedDate}
                    </TableCell>
                    <TableCell>
                      <span className="bg-primary/10 text-primary inline-flex max-w-[7rem] truncate rounded-full px-2 py-1 text-xs sm:max-w-none">
                        {typeLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formattedAmount}
                    </TableCell>
                    <TableCellMd className="text-muted-foreground max-w-[12rem] truncate">
                      {payment.reference_number ?? "—"}
                    </TableCellMd>
                    <TableCellMd className="text-muted-foreground max-w-[16rem] truncate">
                      {payment.description ?? "—"}
                    </TableCellMd>
                    <TableRowExpandTrigger
                      expanded={expanded}
                      onToggle={() => toggleRow(payment.id)}
                      expandLabel={t("expandPaymentDetails")}
                      collapseLabel={t("collapsePaymentDetails")}
                    />
                  </TableRow>
                  <TableRowMobileDetail
                    open={expanded}
                    colSpan={mobileVisibleColumnCount}
                  >
                    <div className="space-y-2">
                      <MobileDetailField
                        label={t("tableReference")}
                        value={payment.reference_number ?? "—"}
                      />
                      <MobileDetailField
                        label={t("tableDescription")}
                        value={payment.description ?? "—"}
                      />
                    </div>
                  </TableRowMobileDetail>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
