'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Leaf, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().optional(),
});

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const redirectTo = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = getSupabaseClient();

  // Show error from callback if present
  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      fullName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Redirect to callback route which will handle the session exchange
      // Use the full URL without double encoding
      const finalRedirect = redirectTo || '/dashboard';
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(finalRedirect)}`;

      if (isLogin) {
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: callbackUrl,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: callbackUrl,
            data: {
              full_name: values.fullName,
            },
          },
        });
        if (error) throw error;
      }
      setEmailSent(true);
      toast.success(
        `Revisa tu correo electrónico. Te hemos enviado un enlace para ${
          isLogin ? 'iniciar sesión' : 'completar tu registro'
        }.`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const handleResend = async () => {
    const email = form.getValues('email');
    const fullName = form.getValues('fullName');
    if (!email) return;

    setLoading(true);
    try {
      const finalRedirect = redirectTo || '/dashboard';
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(finalRedirect)}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: callbackUrl,
          ...(fullName && {
            data: {
              full_name: fullName,
            },
          }),
        },
      });
      if (error) throw error;
      toast.success('Enlace reenviado. Revisa tu correo nuevamente.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al reenviar el enlace';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setEmailSent(false);
    form.reset();
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Revisa tu correo</CardTitle>
            <CardDescription>
              Te hemos enviado un enlace mágico a{' '}
              <strong>{form.getValues('email')}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Haz clic en el enlace del correo para{' '}
                {isLogin ? 'iniciar sesión' : 'completar tu registro'}. El enlace
                expirará en unos minutos.
              </p>
              <p className="text-sm text-muted-foreground">
                Si no recibes el correo, revisa tu carpeta de spam o intenta
                nuevamente.
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
              onClick={handleResend}
              disabled={loading}
            >
              {loading ? 'Reenviando...' : 'Reenviar enlace'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Studio<span className="text-primary">Manager</span>
              </span>
            </Link>
          </div>
          <CardTitle>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</CardTitle>
          <CardDescription>
            {redirectTo
              ? 'Tu sesión ha caducado. Por favor, inicia sesión para continuar.'
              : isLogin
                ? 'Ingresa tu correo para enviarte el enlace de inicio de sesión'
                : 'Ingresa tu correo y te enviaremos un enlace para crear tu cuenta'}
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? 'Enviando...'
                  : isLogin
                    ? 'Enviar enlace mágico'
                    : 'Enviar enlace de registro'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
