FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/interview-coach.db
COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/data/audio /app/data/images && chown -R node:node /app/data
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy && exec npm start -- --hostname 0.0.0.0"]
