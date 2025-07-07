# Use Bun official image
FROM oven/bun AS base

WORKDIR /usr/src/app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

COPY . .

RUN bun run build

# Production stage
FROM oven/bun AS production

WORKDIR /usr/src/app

# Copy built application and dependencies from base stage
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bunjs -u 1001

# Change ownership of app directory
RUN chown -R bunjs:nodejs /usr/src/app
USER bunjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "run", "start"]
