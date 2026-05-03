import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ViewProjectShell } from "../view-project-shell";
import { Card, CardContent } from "@/components/ui/card";
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
import { getViewProjectLocale } from "@/lib/view-project-locale";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("paymentsMetaTitle"),
    description: t("paymentsMetaDescription"),
  };
}

export default async function ViewProjectPaymentsPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const dateFmt = defaultDateFormatForLocale(locale);
  const supabase = await createClient();

  const [shareRes, currencyRes, paymentsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_currency", { share_token: token }),
    supabase.rpc("get_project_public_payments", { share_token: token }),
  ]);

  if (shareRes.error || !shareRes.data?.length) notFound();
  const currency =
    (currencyRes.data?.[0] as { currency: string | null } | undefined)
      ?.currency ?? "EUR";
  const payments = (paymentsRes.data ?? []) as {
    id: string;
    amount: number;
    payment_date: string;
    reference_number: string | null;
    description: string | null;
    payment_type: string;
  }[];

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <ViewProjectShell token={token} showBack title={t("payments")}>
      {payments.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            {t("noPayments")}
          </CardContent>
        </Card>
      ) : (
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
                  <TableHead className="text-muted-foreground">
                    {t("tableReference")}
                  </TableHead>
                  <TableHead>{t("tableDescription")}</TableHead>
                  <TableHead className="text-muted-foreground">
                    {t("tableAmount")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatDateByPattern(payment.payment_date, dateFmt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[12rem] truncate">
                      {payment.reference_number ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[16rem] truncate">
                      {payment.description ?? "—"}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrencyWithLang(
                        Number(payment.amount),
                        currency,
                        locale
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </ViewProjectShell>
  );
}
