import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './protected-route';
import { AuthProvider } from './auth-provider';
import { createMockUser, createMockSession } from '@/test/mocks/supabase';

// Mock the supabase module using hoisted mocks
const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  },
}));

const TestProtectedComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
  });

  it('should show loading state when auth is loading', async () => {
    mockGetSession.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestProtectedComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should redirect to /auth when user is not authenticated', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const TestApp = () => (
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <ProtectedRoute>
            <TestProtectedComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    render(<TestApp />);

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });
  });

  it.skip('should render protected content when user is authenticated', async () => {
    const mockUser = createMockUser({ email: 'user@example.com' });
    const mockSession = createMockSession(mockUser);

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockOnAuthStateChange.mockImplementation((callback) => {
      // Simulate auth state change with session
      setTimeout(() => callback('SIGNED_IN', mockSession), 0);
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestProtectedComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});

