# Multi-stage Dockerfile for Node.js + Express + Vite Full-Stack Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies required for build)
RUN npm ci || npm install

# Copy application source files
COPY . .

# Build the client static bundle and server.cjs
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# Copy compiled dist folder from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
