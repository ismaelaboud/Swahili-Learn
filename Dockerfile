FROM node:18-alpine

# Add necessary build tools
RUN apk add --no-cache python3 make g++ git

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Copy prisma directory from backend
COPY backend/prisma ./prisma/

# Install dependencies with explicit flags
RUN npm ci --include=dev \
    && npm install typescript -g

# Generate Prisma Client
RUN npx prisma generate

# Copy the backend application code
COPY backend/ .

# Build the application
RUN npm run build

# Clean up dev dependencies
RUN npm ci --only=production \
    && npm cache clean --force

EXPOSE 3001

CMD ["npm", "start"]
