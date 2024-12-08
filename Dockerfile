FROM node:18.19.0

WORKDIR /app

# Copy package files first
COPY backend/package*.json ./
COPY backend/.npmrc ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy prisma schema
COPY backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY backend/ .

# Build the application
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
