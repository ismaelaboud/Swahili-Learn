FROM node:18.19.0

WORKDIR /app

# Copy package files first
COPY backend/package*.json ./

# Install dependencies with npm config
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install --no-package-lock --legacy-peer-deps

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
