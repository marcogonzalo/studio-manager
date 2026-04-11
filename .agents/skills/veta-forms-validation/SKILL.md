---
name: veta-forms-validation
description: Build and validate forms with react-hook-form and Zod in the Veta project; follow Shadcn Select rules (no empty string value). Use when creating or editing forms, Select fields, Zod schemas, or useForm.
---

# Veta – Forms & validation

## Stack

- **Forms:** `react-hook-form` with `useForm`.
- **Validation:** Zod schemas with `@hookform/resolvers` `zodResolver(schema)`.

## Schema and defaultValues

- Define a Zod schema for the form. Use `undefined` for optional fields in `defaultValues`, not `""`.
- Optional Select fields: use `value || undefined` and `field.onChange(value || undefined)`.

## Shadcn Select – critical rule

- **Never** use `value=""` on `<SelectItem>`. Radix Select reserves empty string for “no selection”.
- **Correct:** Omit the empty option; use `placeholder` on `<SelectTrigger>` and `value={field.value || undefined}`.
- **Wrong:** `<SelectItem value="">No option</SelectItem>`.

```tsx
<Select
  value={field.value ?? undefined}
  onValueChange={(v) => field.onChange(v ?? undefined)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {options.map((opt) => (
      <SelectItem key={opt.id} value={opt.id}>
        {opt.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Form component

- Use the shared `<Form>`, `<FormField>`, `<FormItem>`, `<FormControl>`, `<FormMessage>` from `@/components/ui/form` for consistent layout and error display.
