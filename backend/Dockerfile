# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 5555

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "./dist/index.js"]