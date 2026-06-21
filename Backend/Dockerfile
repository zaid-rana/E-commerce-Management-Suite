# Backend Dockerfile - Node.js Express server
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (r) => {if (r.statusCode >= 400) throw new Error(r.statusCode)}).on('error', () => process.exit(1))" || exit 1

# Start the application
CMD ["node", "server.js"]
