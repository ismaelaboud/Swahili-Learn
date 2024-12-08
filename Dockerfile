FROM node:18.19.0

# Create and set working directory
WORKDIR /usr/src/app

# Copy root package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy prisma files
COPY backend/prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY backend/src ./src/
COPY backend/tsconfig.json ./

# Build the application
RUN npm run build

# Set production environment
ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
