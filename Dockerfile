FROM node:18.19.0

WORKDIR /app

# Copy package files first
COPY backend/package*.json ./

# Install dependencies with npm config
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install --no-package-lock --legacy-peer-deps

# Copy source files and config files
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript files (excluding tests)
RUN npm run build

# Clean up development dependencies and test files
RUN rm -rf src/tests && \
    npm prune --production

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
