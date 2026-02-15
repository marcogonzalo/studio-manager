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

   Create a `.env` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Backblaze B2 - Imágenes de productos (opcional)
   # Crear Application Key en: https://secure.backblaze.com/app_keys.htm
   # El bucket debe ser público para que las imágenes se muestren
   B2_APPLICATION_KEY_ID=your_application_key_id
   B2_APPLICATION_KEY=your_application_key
   B2_BUCKET_ID=your_bucket_id
   B2_BUCKET_NAME=your_bucket_name

   # Formulario de contacto (opcional)
   # Sin RESEND_API_KEY el formulario mostrará un mensaje para contactar por email
   RESEND_API_KEY=re_xxxxxxxx
   CONTACT_EMAIL_TO=hola@veta.app
   # CONTACT_EMAIL_FROM es opcional; por defecto usa onboarding@resend.dev (dev)
   # CONTACT_EMAIL_FROM=Veta Web <hola@veta.app>

   # URL base para sitemap, robots y metadata (opcional)
   # Por defecto usa VERCEL_URL en Vercel o https://veta.app
   # NEXT_PUBLIC_APP_URL=https://tudominio.com
   ```

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

See `.cursor/rules/01-security.mdc` for detailed security guidelines.

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

## 🤝 Contributing

1. Follow the coding standards defined in `.cursor/rules/`
2. Write tests for new features
3. Ensure all security guidelines are met
4. Use conventional commits

## 📄 License

[Specify your license here]

## 🙏 Acknowledgments

Built with modern web technologies and best practices for interior design professionals.

---

**Made with ❤️ for interior designers**
