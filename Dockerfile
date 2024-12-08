# Build stage
FROM node:18.19.0 AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema and generate client
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18.19.0-slim

WORKDIR /app

# Copy built files and necessary dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
