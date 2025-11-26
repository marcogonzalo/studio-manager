# Studio Manager - Interior Design Project Manager

A modern, full-stack web application designed to streamline the workflow of interior designers. Manage clients, projects, budgets, catalogs, and purchasing all in one place.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-38bdf8)

## ✨ Features

### 📋 Project Management

- **Client Management:** Complete CRM functionality for tracking client information
- **Project Lifecycle:** Track projects from initial consultation to completion
- **Room Planning:** Organize design elements by specific spaces (living room, bedroom, etc.)
- **Visual Documentation:** Attach renders, plans, and reference images to projects

### 💰 Budgeting & Financials

- **Smart Budgeting:** Add items from catalog or create custom entries
- **Automatic Calculations:** Cost + markup = final price with real-time totals
- **Visual Budgets:** Generate beautiful, image-rich budget presentations for clients
- **PDF Export:** Print-ready budget documents

### 🛒 Catalog & Purchasing

- **Product Catalog:** Global database of furniture, fixtures, and materials
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

- Node.js 20+ and npm
- Docker and Docker Compose
- Supabase account (or local Supabase CLI)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd interior-design-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   **Option A: Local Development (Recommended)**

   ```bash
   npx supabase start
   ```

   This will start Supabase locally and provide connection details.

   **Option B: Remote Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key

4. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run database migrations**

   If using local Supabase:

   ```bash
   npx supabase db reset
   ```

   If using remote Supabase, run the SQL from `supabase/migrations/20251126035338_initial_schema.sql` in your Supabase SQL Editor.

6. **Start the development server**

   **Using Docker (Recommended):**

   ```bash
   docker compose up
   ```

   **Or using npm directly:**

   ```bash
   npm run dev
   ```

7. **Open your browser**
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

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test:watch
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
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
