FROM node:18.19.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
