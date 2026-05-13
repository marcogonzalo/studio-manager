FROM node:20-alpine

RUN corepack enable

WORKDIR /app

# Install dependencies first for better caching
COPY package.json pnpm-lock.yaml ./
RUN corepack prepare pnpm@9.15.4 --activate && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start development server
CMD ["pnpm", "run", "dev"]
