import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().optional(),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const redirectTo = searchParams.get('redirect');

  // Redirigir si el usuario ya está autenticado o después de iniciar sesión
  useEffect(() => {
    if (user) {
      const destination = redirectTo ? decodeURIComponent(redirectTo) : '/';
      navigate(destination, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (isLogin) {
        // Enviar magic link para login
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        setEmailSent(true);
        toast.success("Revisa tu correo electrónico. Te hemos enviado un enlace para iniciar sesión.");
      } else {
        // Enviar magic link para registro
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: values.fullName,
            },
          },
        });
        if (error) throw error;
        setEmailSent(true);
        toast.success("Revisa tu correo electrónico. Te hemos enviado un enlace para completar tu registro.");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    setEmailSent(false);
    form.reset();
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Revisa tu correo</CardTitle>
            <CardDescription>
              Te hemos enviado un enlace mágico a <strong>{form.getValues('email')}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Haz clic en el enlace del correo para {isLogin ? 'iniciar sesión' : 'completar tu registro'}.
                El enlace expirará en unos minutos.
              </p>
              <p className="text-sm text-muted-foreground">
                Si no recibes el correo, revisa tu carpeta de spam o intenta nuevamente.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={handleBack}>
              Volver
            </Button>
            <Button
              variant="link"
              className="w-full"
              onClick={async () => {
                const email = form.getValues('email');
                const fullName = form.getValues('fullName');
                if (email) {
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.signInWithOtp({
                      email: email,
                      options: {
                        emailRedirectTo: `${window.location.origin}/`,
                        ...(fullName && {
                          data: {
                            full_name: fullName,
                          },
                        }),
                      },
                    });
                    if (error) throw error;
                    toast.success("Enlace reenviado. Revisa tu correo nuevamente.");
                  } catch (error: any) {
                    toast.error(error.message || "Error al reenviar el enlace");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
            >
              {loading ? "Reenviando..." : "Reenviar enlace"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Iniciar Sesión" : "Registrarse"}</CardTitle>
          <CardDescription>
            {redirectTo 
              ? "Tu sesión ha caducado. Por favor, inicia sesión para continuar."
              : isLogin 
                ? "Ingresa tu correo para enviarte el enlace de inicio de sesión"
                : "Ingresa tu correo y te enviaremos un enlace para crear tu cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : (isLogin ? "Enviar enlace mágico" : "Enviar enlace de registro")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
