# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) process for the Veta project.

## CI Pipeline

The CI pipeline is configured in `.github/workflows/ci.yml` and runs on every push and pull request to `main` and `develop` branches.

### Jobs

#### 1. Test Job

Runs the following steps:

- **Checkout code**: Clones the repository
- **Setup Node.js**: Uses Node.js 20.x with npm cache enabled
- **Verify package-lock.json integrity**: Ensures the lockfile exists and is valid
- **Install dependencies**: Uses `npm ci` for reproducible, clean installs
- **Run linter**: Executes `npm run lint` to check code quality
- **Check formatting**: Runs `npm run format:check` to ensure consistent formatting
- **Run tests**: Executes the test suite with `npm test -- --run`
- **Build application**: Verifies the application builds successfully

#### 2. Security Audit Job

Runs security checks:

- **Install dependencies**: Uses `npm ci` for clean install
- **Run security audit**: Executes `npm audit --audit-level=moderate`
- **Upload audit results**: If vulnerabilities are found, uploads the audit report as an artifact

### Dependency Integrity Verification

The pipeline uses `npm ci` instead of `npm install` to ensure:

1. **Reproducible builds**: `npm ci` installs exactly what's in `package-lock.json`
2. **Lockfile verification**: Fails if `package-lock.json` is out of sync with `package.json`
3. **Clean installs**: Removes `node_modules` before installing, ensuring no stale dependencies
4. **Faster installs**: Optimized for CI environments

### Environment Variables

The build step uses placeholder environment variables. For production deployments, configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Other required environment variables (see `.env.example`)

## Local Development

### Running CI Checks Locally

You can run the same checks locally before pushing:

```bash
# Verify lockfile integrity
npm ls --package-lock-only

# Clean install (like CI)
npm ci

# Run linter
npm run lint

# Check formatting
npm run format:check

# Run tests
npm test -- --run

# Build application
npm run build
```

### Best Practices

1. **Always commit `package-lock.json`**: Never add it to `.gitignore`
2. **Use `npm ci` in CI/CD**: Never use `npm install` in automated pipelines
3. **Keep dependencies updated**: Regularly run `npm audit` and update vulnerable packages
4. **Test before pushing**: Run the full test suite locally before creating a PR

## Deployment

### Production Deployment

Production deployments should:

1. Use `npm ci` for dependency installation
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

- **Dependency verification**: `npm ci` ensures no malicious packages are installed
- **Lockfile integrity**: Prevents supply chain attacks by verifying package versions
- **Security audits**: Automated vulnerability scanning in CI pipeline
- **No secrets in code**: All secrets are managed via environment variables

## Troubleshooting

### Build Fails in CI but Works Locally

1. Check Node.js version matches (CI uses 20.x)
2. Verify `package-lock.json` is committed and up to date
3. Run `npm ci` locally to reproduce CI environment
4. Check for environment-specific code that might fail in CI

### Lockfile Out of Sync

If `npm ci` fails with lockfile errors:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall and regenerate lockfile
npm install

# Commit the updated package-lock.json
git add package-lock.json
git commit -m "chore: update package-lock.json"
```
