"use client";

import React from "react";
import PhoneInputLib from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import es from "react-phone-number-input/locale/es.json";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import "react-phone-number-input/style.css";

/** Convierte código de país (ISO 3166-1 alpha-2) en bandera Unicode (emoji). */
function countryToUnicodeFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = [...countryCode.toUpperCase()].map(
    (c) => 0x1f1e6 - 65 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

/** Props que pasa la librería al flagComponent (compatible con FlagProps). */
interface UnicodeFlagProps {
  country: Country;
  countryName: string;
}

/** Componente de bandera Unicode para el selector de país. */
function UnicodeFlagComponent({ country, countryName }: UnicodeFlagProps) {
  return (
    <span
      className="inline-flex h-4 w-6 items-center justify-center text-base leading-none"
      title={countryName}
    >
      {countryToUnicodeFlag(country)}
    </span>
  );
}

export { isValidPhoneNumber };

type PhoneInputProps = Omit<
  React.ComponentProps<typeof PhoneInputLib>,
  "onChange" | "value"
> & {
  value?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
};

const PhoneInput = React.forwardRef<
  React.ComponentRef<typeof PhoneInputLib>,
  PhoneInputProps
>(({ className, value, onChange, ...props }, ref) => {
  const handleChange = (v: string | undefined) => {
    onChange?.(v === undefined ? "" : v);
  };

  return (
    <PhoneInputLib
      ref={ref}
      className={cn("PhoneInput", className)}
      value={value && value.trim() ? value : undefined}
      onChange={handleChange}
      defaultCountry="ES"
      labels={es as Record<string, string>}
      inputComponent={Input}
      flagComponent={UnicodeFlagComponent}
      international={false}
      placeholder="600 000 000"
      countryCallingCodeEditable={false}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
