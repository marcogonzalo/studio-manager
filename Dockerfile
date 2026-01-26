FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
