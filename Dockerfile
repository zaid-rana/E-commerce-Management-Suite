# Frontend Dockerfile - React + Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build argument for VITE_BASE_URL
ARG VITE_BASE_URL=/api/

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with VITE_BASE_URL available
RUN NODE_OPTIONS="--max-old-space-size=2048" \
    VITE_BASE_URL=${VITE_BASE_URL} npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
