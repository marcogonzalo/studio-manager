import * as z from "zod";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { getAppUiCopy } from "@/lib/app-ui-copy";

export function createCustomizationFormSchema(lang: Locale = defaultLocale) {
  const copy = getAppUiCopy(lang).validation;
  return z.object({
    default_tax_rate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, copy.taxMin),
    default_currency: z.string().optional(),
    public_name: z.string().optional(),
    email: z
      .string()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: copy.emailInvalid,
      }),
  });
}

export const customizationFormSchema = createCustomizationFormSchema();

export type CustomizationFormValues = z.infer<
  ReturnType<typeof createCustomizationFormSchema>
>;

export function createPublicProfileFormSchema(lang: Locale = defaultLocale) {
  const copy = getAppUiCopy(lang).validation;
  return z.object({
    public_name: z.string().optional(),
    email: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val.trim() === "" ||
          z.string().email().safeParse(val.trim()).success,
        {
          message: copy.emailInvalid,
        }
      ),
  });
}

export const publicProfileFormSchema = createPublicProfileFormSchema();

export function createDefaultsFormSchema(lang: Locale = defaultLocale) {
  const copy = getAppUiCopy(lang).validation;
  return z.object({
    default_currency: z.string().optional(),
    default_tax_rate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, copy.taxMin),
  });
}

export const defaultsFormSchema = createDefaultsFormSchema();

export type PublicProfileFormValues = z.infer<
  ReturnType<typeof createPublicProfileFormSchema>
>;
export type DefaultsFormValues = z.infer<
  ReturnType<typeof createDefaultsFormSchema>
>;

export const languageFormSchema = z.object({
  lang: z.enum(["en", "es"]),
  date_format: z.enum(["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"]),
});

export type LanguageFormValues = z.infer<typeof languageFormSchema>;
