"use client";

import React from "react";
import PhoneInputLib from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es.json";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
/* Estilos del PhoneInput en globals.css (evita fallo de resolución en Docker/Next) */

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
      flags={flags}
      labels={es as Record<string, string>}
      inputComponent={Input}
      international={false}
      placeholder="600 000 000"
      countryCallingCodeEditable={false}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
