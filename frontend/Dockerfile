FROM node:18-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build application (environment variables are injected at build time)
ARG VITE_API_URL
ARG VITE_API_BASE_PATH
ARG VITE_SOCKET_URL
ARG VITE_FRONTEND_URL
ARG VITE_NODE_ENV

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_PATH=$VITE_API_BASE_PATH
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]



