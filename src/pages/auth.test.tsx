import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from './auth';

// Mock the supabase module using hoisted mocks
const mockSignInWithOtp = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: mockSignInWithOtp,
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithOtp.mockResolvedValue({ error: null });
  });

  it('should render login form by default', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace mágico/i })).toBeInTheDocument();
  });

  it('should switch to signup form when clicking register link', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const registerLink = screen.getByText('¿No tienes cuenta? Regístrate');
    await user.click(registerLink);

    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it.skip('should validate email format', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // React Hook Form validates on submit, wait for error message
    await waitFor(() => {
      const errorMessage = screen.queryByText(/email inválido/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify that signInWithOtp was not called due to validation error
    await waitFor(() => {
      expect(mockSignInWithOtp).not.toHaveBeenCalled();
    });
  });

  it('should submit login form with valid email', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/'),
        },
      });
    });
  });

  it('should submit signup form with email and full name', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    // Switch to signup
    const registerLink = screen.getByText('¿No tienes cuenta? Regístrate');
    await user.click(registerLink);

    const emailInput = screen.getByLabelText(/email/i);
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace de registro/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'john@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/'),
          data: {
            full_name: 'John Doe',
          },
        },
      });
    });
  });

  it('should show email sent message after successful submission', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  it('should handle signup form submission error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid email address';
    mockSignInWithOtp.mockResolvedValue({
      error: { message: errorMessage },
    });

    const { toast } = await import('sonner');
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should allow going back from email sent screen', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /volver/i });
    await user.click(backButton);

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });

  it('should allow resending the magic link', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
    });

    const resendButton = screen.getByRole('button', { name: /reenviar enlace/i });
    await user.click(resendButton);

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockSignInWithOtp.mockReturnValue(promise);

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace mágico/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(screen.getByText(/enviando/i)).toBeInTheDocument();

    resolvePromise!({ error: null });
    await waitFor(() => {
      expect(screen.queryByText(/enviando/i)).not.toBeInTheDocument();
    });
  });
});

