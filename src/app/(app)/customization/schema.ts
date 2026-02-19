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
