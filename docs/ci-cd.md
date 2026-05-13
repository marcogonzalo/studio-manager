# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) process for the Veta project.

## CI Pipeline

The CI pipeline is configured in `.github/workflows/ci.yml` and runs on every push and pull request to `main` and `develop` branches.

### Jobs

#### 1. Test Job

Runs the following steps:

- **Checkout code**: Clones the repository
- **Install pnpm**: Pins pnpm via `pnpm/action-setup` (same major as `package.json` `packageManager`)
- **Setup Node.js**: Uses Node.js 20.x with pnpm store cache enabled
- **Verify pnpm lockfile**: Ensures `pnpm-lock.yaml` is present
- **Install dependencies**: Uses `pnpm install --frozen-lockfile` for reproducible, clean installs
- **Run linter**: Executes `pnpm run lint` to check code quality
- **Check formatting**: Runs `pnpm run format:check` to ensure consistent formatting
- **Run tests**: Executes the test suite with `pnpm test -- --run`
- **Build application**: Verifies the application builds successfully

#### 2. Security Audit Job

Runs security checks:

- **Install dependencies**: Uses `pnpm install --frozen-lockfile` for clean install
- **Run security audit**: Executes `pnpm audit --audit-level moderate`
- **Upload audit results**: If vulnerabilities are found, uploads the audit report as an artifact

### Dependency Integrity Verification

The pipeline uses `pnpm install --frozen-lockfile` instead of a mutable install to ensure:

1. **Reproducible builds**: Installs exactly what is recorded in `pnpm-lock.yaml`
2. **Lockfile verification**: Fails if `pnpm-lock.yaml` is out of sync with `package.json`
3. **Clean installs**: CI runners start from a clean workspace
4. **Faster installs**: pnpm’s content-addressable store reduces duplicate work across jobs when cached

### Environment Variables

The build step uses placeholder environment variables. For production deployments, configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Other required environment variables (see `.env.example`)

## Local Development

### Running CI Checks Locally

You can run the same checks locally before pushing:

```bash
# Clean install (like CI)
pnpm install --frozen-lockfile

# Run linter
pnpm run lint

# Check formatting
pnpm run format:check

# Run tests
pnpm test -- --run

# Build application
pnpm run build
```

### Best Practices

1. **Always commit `pnpm-lock.yaml`**: Never add it to `.gitignore`
2. **Use `pnpm install --frozen-lockfile` in CI/CD**: Avoid mutable installs in automated pipelines
3. **Keep dependencies updated**: Regularly run `pnpm audit` and update vulnerable packages
4. **Test before pushing**: Run the full test suite locally before creating a PR

## Deployment

### Production Deployment

Production deployments should:

1. Use `pnpm install --frozen-lockfile` (or the platform’s pnpm integration) for dependency installation
2. Run the full test suite
3. Build the application
4. Verify environment variables are set correctly
5. Run security audits before deployment

### Environment-Specific Configuration

- **Development**: Uses local Supabase instance
- **Staging**: Uses staging Supabase project
- **Production**: Uses production Supabase project with proper secrets

See `.env.example` for required environment variables.

## Security Considerations

- **Dependency verification**: Frozen lockfile installs ensure resolved versions match the committed graph
- **Lockfile integrity**: Reduces supply-chain drift by failing when the lockfile is stale
- **Security audits**: Automated vulnerability scanning in CI pipeline
- **No secrets in code**: All secrets are managed via environment variables

## Troubleshooting

### Build Fails in CI but Works Locally

1. Check Node.js version matches (CI uses 20.x)
2. Verify `pnpm-lock.yaml` is committed and up to date
3. Run `pnpm install --frozen-lockfile` locally to reproduce CI environment
4. Check for environment-specific code that might fail in CI

### Lockfile Out of Sync

If `pnpm install --frozen-lockfile` fails with lockfile errors:

```bash
# Remove install artifacts
rm -rf node_modules

# Regenerate lockfile from package.json
pnpm install

# Commit the updated pnpm-lock.yaml
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml"
```
