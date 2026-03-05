"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email("Introduce un correo válido"),
});

type FormValues = z.infer<typeof formSchema>;

export function DemoRequestForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/auth/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Error al solicitar el enlace");
        return;
      }
      setSent(true);
      toast.success(
        "Revisa tu correo. Te hemos enviado un enlace para acceder a la demo."
      );
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Revisa tu correo electrónico. Te hemos enviado un enlace para
            acceder a la demo de Veta. El enlace es válido durante un máximo de
            1 hora.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Probar la demo</CardTitle>
        <p className="text-muted-foreground text-sm">
          Introduce tu correo y te enviaremos el enlace para acceder a la demo.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Enviando…"
                : "Recibir enlace de demo"}
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-4 text-sm">
          Al enviar tu correo aceptas recibir un mensaje de nuestro equipo para
          conocer tu experiencia en la aplicación.
        </p>
      </CardContent>
    </Card>
  );
}
