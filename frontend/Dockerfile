# ── Stage 1: Build Stage ─────────────────────────────────────────────
# Use Node.js to build the React/Vite app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (leverages Docker layer cache)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the production bundle (outputs to /app/dist)
RUN npm run build

# ── Stage 2: Production Stage ─────────────────────────────────────────
# Use lightweight Nginx to serve the built static files
FROM nginx:alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from stage 1 into nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle React Router (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
