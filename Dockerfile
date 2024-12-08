FROM node:18

WORKDIR /app/backend

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY backend/prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the backend code
COPY backend/ .

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
