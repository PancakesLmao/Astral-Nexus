FROM node:22-alpine@sha256:e986f0eae018fe28fcfb9564b2607212c9cd3fa771a26fecc96dcb8d8366477c AS build

WORKDIR /build

# Set CI environment for pnpm to avoid TTY issues
ENV CI=true

RUN npm install -g pnpm

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies (cached if package files unchanged)
RUN pnpm install --frozen-lockfile

# Copy production environment variables for build
COPY .env.production ./

# Copy necessary files for build
COPY src ./src
COPY public ./public
COPY *.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY env.d.ts ./
COPY tailwind.config.js ./

RUN pnpm run build

# Production stage
FROM nginx:alpine@sha256:b3c656d55d7ad751196f21b7fd2e8d4da9cb430e32f646adcf92441b72f82b14 AS production

# Copy built assets from build stage
COPY --from=build /build/dist /usr/share/nginx/html

# Remove default nginx files
RUN rm -f /usr/share/nginx/html/50x.html /usr/share/nginx/html/index.html

# Copy custom nginx configuration for SPA routing and subdomains
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.prod.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

