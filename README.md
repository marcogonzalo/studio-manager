# Veta - Interior Design Project Manager

A modern, full-stack web application designed to streamline the workflow of interior designers. Manage clients, projects, budgets, catalogs, and purchasing all in one place.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-38bdf8)

## ✨ Features

### 📋 Project Management

- **Client Management:** Complete CRM functionality for tracking client information
- **Project Lifecycle:** Track projects from initial consultation to completion
- **Space Planning:** Organize design elements by specific spaces (living room, bedroom, terrace, office, etc.)
- **Visual Documentation:** Attach renders, plans, and reference images to projects

### 💰 Budgeting & Financials

- **Smart Budgeting:** Add items from catalog or create custom entries
- **Automatic Calculations:** Cost + markup = final price with real-time totals
- **Visual Budgets:** Generate beautiful, image-rich budget presentations for clients
- **PDF Export:** Print-ready budget documents

### 🛒 Catalog & Purchasing

- **Product Catalog:** Global database of furniture, fixtures, and materials
- **Product Images:** Upload images (JPG, PNG, WebP) to Backblaze B2 or use external URLs. Images are resized to 1200px max and converted to WebP. Images are deleted from B2 when a product is removed or when the URL is changed.
- **Supplier Management:** Track vendors and their contact information
- **Purchase Orders:** Automatically generate POs grouped by supplier
- **Logistics Tracking:** Monitor order status (pending → ordered → received → delivered)

### 📝 Collaboration

- **Project Notes:** Keep a project diary with notes and observations
- **Document Management:** Attach contracts, plans, and other project files

## 🛠️ Tech Stack

- **Frontend:**
  - React 19.2.0 with TypeScript
  - Vite for build tooling
  - Tailwind CSS v4 with custom natural/pastel theme
  - Shadcn/UI components (Radix UI primitives)
  - React Router for navigation
  - React Hook Form + Zod for form validation

- **Backend:**
  - Supabase (PostgreSQL database)
  - Supabase Auth for authentication
  - Supabase Storage for file uploads
  - Row Level Security (RLS) for data protection

- **Infrastructure:**
  - Docker & Docker Compose for local development
  - Environment-based configuration

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Supabase account (or local Supabase CLI)
- (Optional) Node.js 20+ and npm for local development without Docker

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd interior-design-project
   ```

2. **Set up Supabase**

   **Option A: Local Development (Recommended)**

   ```bash
   npx supabase start
   ```

   This will start Supabase locally and provide connection details.

   **Option B: Remote Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key

3. **Configure environment variables**

   Copy the example file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your real credentials. The application uses different Supabase keys based on the environment:

   **Local Development:**
   - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for both client and server

   **Production:**
   - Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for client-side (browser-safe with RLS)
   - Uses `SUPABASE_SECRET_KEY` for server-side (privileged backend access)

4. **Run database migrations**

   If using local Supabase:

   ```bash
   npx supabase db reset
   ```

   If using remote Supabase, run the SQL from `supabase/migrations/20251126035338_initial_schema.sql` in your Supabase SQL Editor.

### Running the Application

#### Using Docker (Recommended)

The project is configured to run in a Docker container for consistent development environments.

**Start the development server:**

```bash
docker compose up
```

This will:

- Build the Docker image if it doesn't exist
- Start the container with the application
- Mount your code for hot-reload
- Expose the app on `http://localhost:5173`

**Run in detached mode (background):**

```bash
docker compose up -d
```

**View logs:**

```bash
docker compose logs -f
```

**Stop the container:**

```bash
docker compose down
```

**Rebuild the container (after dependency changes):**

```bash
docker compose up --build
```

#### Using npm directly (Local Development)

If you prefer to run the application locally without Docker:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
interior-design-project/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Shadcn UI primitives
│   │   └── ...            # Domain components
│   ├── layouts/           # Layout wrappers
│   ├── lib/               # Utilities and configs
│   ├── pages/             # Route components
│   │   ├── clients/       # Client management
│   │   ├── projects/      # Project management
│   │   ├── catalog/       # Product catalog
│   │   └── suppliers/     # Supplier management
│   ├── types/             # TypeScript definitions
│   └── ...
├── supabase/
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── memory-bank/           # Project documentation
├── .cursor/rules/         # Development rules and guidelines
└── ...
```

## 📜 Legal & Compliance

- **Terms & Privacy:** The app includes a legal page (`/legal`) with terms of use, privacy policy, and GDPR rights. Registration requires acceptance of terms via a mandatory checkbox.

## 🔒 Security

This project follows security best practices:

- **OWASP Top 10 Compliance:** All guidelines implemented
- **Row Level Security (RLS):** Database-level access control
- **Input Validation:** Zod schemas for all user inputs
- **Authentication:** Supabase Auth with secure session management
- **No Secrets in Code:** Environment variables properly configured
- **Rate Limiting:** API endpoints protected against abuse and brute force
- **Image Hostname Restrictions:** Only trusted domains allowed for image optimization

See `.cursor/rules/01-security.mdc` for detailed security guidelines.

### Security Configuration

#### Rate Limiting

API endpoints are protected by rate limiting to prevent abuse and brute force attacks. Limits are configured per route group in `src/lib/rate-limit.ts`:

```typescript
const LIMITS: Record<RouteGroup, number> = {
  auth: 10, // Requests per minute for /api/auth/*
  upload: 20, // Requests per minute for /api/upload/*
  "account-delete": 5, // Requests per minute for /api/account/delete
};

const WINDOW_MS = 60_000; // Time window in milliseconds (default: 60 seconds)
```

**To customize limits:**

1. Edit `LIMITS` in `src/lib/rate-limit.ts` to adjust requests per minute for each route group
2. Modify `WINDOW_MS` to change the time window (default: 60 seconds)

**Rate limit behavior:**

- Limits are applied per IP address
- Each route group has independent counters
- When limit is exceeded, API returns `429 Too Many Requests` with `Retry-After` header

#### Image Hostname Restrictions

Image optimization via `next/image` is restricted to trusted domains for security. Configuration is in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
    {
      protocol: "https",
      hostname: "**.backblazeb2.com",
      pathname: "/**",
    },
  ],
}
```

**To add or modify allowed image domains:**

1. Edit `images.remotePatterns` in `next.config.ts`
2. Add new pattern objects with:
   - `protocol`: `"https"` or `"http"`
   - `hostname`: Domain pattern (use `**` for subdomain wildcard, e.g., `**.example.com`)
   - `pathname`: Path pattern (use `"/**"` for all paths or specific patterns like `"/images/**"`)
3. Restart the development server or rebuild for changes to take effect

**Current allowed domains:**

- Supabase Storage: `**.supabase.co` (path: `/storage/v1/object/public/**`)
- Backblaze B2: `**.backblazeb2.com` (all paths)

**Note:** If you need to use `next/image` with other external URLs, add them to `remotePatterns`. The wildcard `hostname: "**"` is not allowed for security reasons.

## 🎨 Design System

The application uses a custom natural/pastel color palette:

- **Primary:** Soft Sage Green (`oklch(0.65 0.08 140)`)
- **Secondary:** Warm Beige/Sand tones
- **Background:** Cream whites and deep earthy greens (dark mode)

All colors are defined using the OKLCH color space for perceptual uniformity.

## 🧪 Testing

The project uses Vitest and React Testing Library for testing. Tests can be run both inside Docker containers and locally.

### Running Tests with Docker

**Run all tests:**

```bash
docker compose exec app npm test
```

Or if the container is not running:

```bash
docker compose run --rm app npm test
```

**Run tests in watch mode:**

```bash
docker compose exec app npm run test:watch
```

**Run tests with UI (interactive mode):**

```bash
docker compose exec app npm run test:ui
```

**Generate coverage report:**

```bash
docker compose exec app npm run test:coverage
```

The coverage report will be generated in the `coverage/` directory.

### Running Tests Locally

If you have Node.js installed locally, you can run tests directly:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI (interactive mode)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

Tests are located alongside their source files with the `.test.ts` or `.test.tsx` extension:

- `src/lib/utils.test.ts` - Utility function tests
- `src/components/*.test.tsx` - Component tests
- `src/pages/*.test.tsx` - Page component tests

Test utilities and mocks are located in `src/test/`:

- `src/test/setup.ts` - Test configuration and global setup
- `src/test/utils.tsx` - Testing utilities and custom render functions
- `src/test/mocks/` - Mock implementations for external dependencies

## 📦 Building for Production

### Using Docker

**Build the production image:**

```bash
docker compose build
```

**Build and run production build:**

You can create a production Dockerfile or use docker compose with a production configuration.

### Using npm directly

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The production build will be available in the `dist/` directory.

## 🐳 Docker Commands Reference

**Start services:**

```bash
docker compose up
```

**Start in background:**

```bash
docker compose up -d
```

**Stop services:**

```bash
docker compose down
```

**Rebuild containers:**

```bash
docker compose up --build
```

**View logs:**

```bash
docker compose logs -f app
```

**Execute commands in container:**

```bash
# Run npm commands
docker compose exec app npm <command>

# Access shell
docker compose exec app sh
```

**Clean up (remove containers, volumes, networks):**

```bash
docker compose down -v
```

## 🔄 CI/CD

The project includes a CI/CD pipeline configured in `.github/workflows/ci.yml`:

- **Automated testing**: Runs on every push and PR
- **Dependency verification**: Uses `npm ci` for reproducible builds
- **Security audits**: Automated vulnerability scanning
- **Build verification**: Ensures the application builds successfully

See `docs/ci-cd.md` for detailed documentation on the CI/CD process, including:
- Pipeline configuration and jobs
- Dependency integrity verification
- Local development best practices
- Troubleshooting guide

## 🤝 Contributing

1. Follow the coding standards defined in `.cursor/rules/`
2. Write tests for new features
3. Ensure all security guidelines are met
4. Use conventional commits
5. Run `npm ci` and verify tests pass before pushing

## 📄 License

[Specify your license here]

## 🙏 Acknowledgments

Built with modern web technologies and best practices for interior design professionals.

---

**Made with ❤️ for interior designers**
