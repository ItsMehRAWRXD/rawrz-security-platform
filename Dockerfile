# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for security tools
RUN apk add --no-cache \
    curl \
    wget \
    nmap \
    bind-tools \
    iputils \
    traceroute \
    whois \
    openssl \
    ca-certificates \
    bash

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads data logs

# Set proper permissions
RUN chmod +x rawrz-standalone.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S rawrz -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R rawrz:nodejs /app

# Switch to non-root user
USER rawrz

# Expose port for web application
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Default command - start web server
CMD ["npm", "start"]