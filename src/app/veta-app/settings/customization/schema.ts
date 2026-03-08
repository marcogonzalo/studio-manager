import * as z from "zod";

export const customizationFormSchema = z.object({
  default_tax_rate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Debe ser mayor o igual a 0"),
  default_currency: z.string().optional(),
  public_name: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Correo no válido",
    }),
});

export type CustomizationFormValues = z.infer<typeof customizationFormSchema>;

/** Schema for Presupuesto card (public name and public email). */
export const publicProfileFormSchema = z.object({
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
        message: "Correo no válido",
      }
    ),
});

/** Schema for Valores por defecto card. */
export const defaultsFormSchema = z.object({
  default_currency: z.string().optional(),
  default_tax_rate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Debe ser mayor o igual a 0"),
});

export type PublicProfileFormValues = z.infer<typeof publicProfileFormSchema>;
export type DefaultsFormValues = z.infer<typeof defaultsFormSchema>;
