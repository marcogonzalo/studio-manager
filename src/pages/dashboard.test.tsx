import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './dashboard';

// Mock the supabase module using hoisted mocks
const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

describe('Dashboard', () => {
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

  it('should render welcome message', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/hola, bienvenido/i)).toBeInTheDocument();
    expect(screen.getByText(/resumen de tu estudio/i)).toBeInTheDocument();
  });

  it('should render new project button', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const newProjectButton = screen.getByRole('link', { name: /nuevo proyecto/i });
    expect(newProjectButton).toBeInTheDocument();
    expect(newProjectButton).toHaveAttribute('href', '/projects');
  });

  it('should render stats cards', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/proyectos activos/i)).toBeInTheDocument();
    expect(screen.getByText(/clientes totales/i)).toBeInTheDocument();
    expect(screen.getByText(/productos en catálogo/i)).toBeInTheDocument();
  });

  it('should render recent projects section', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/proyectos recientes/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/no tienes proyectos recientes/i)).toBeInTheDocument();
  });

  it('should render quick access links', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/accesos rápidos/i)).toBeInTheDocument();
    expect(screen.getByText(/registrar cliente/i)).toBeInTheDocument();
    expect(screen.getByText(/añadir producto/i)).toBeInTheDocument();
  });

  it('should have correct links for quick access', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const clientsLink = screen.getByRole('link', { name: /registrar cliente/i });
    const catalogLink = screen.getByRole('link', { name: /añadir producto/i });

    expect(clientsLink).toHaveAttribute('href', '/clients');
    expect(catalogLink).toHaveAttribute('href', '/catalog');
  });

  it('should render create project button in empty state', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const createProjectButton = screen.getByRole('link', { name: /crear proyecto/i });
    expect(createProjectButton).toBeInTheDocument();
    expect(createProjectButton).toHaveAttribute('href', '/projects');
  });

  it('should display zero counts for stats', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const statValues = screen.getAllByText('0');
    expect(statValues.length).toBeGreaterThanOrEqual(3);
  });
});

