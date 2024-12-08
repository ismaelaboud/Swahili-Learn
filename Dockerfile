FROM node:18-slim

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Copy prisma directory from backend
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the backend application code
COPY backend/ .

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
