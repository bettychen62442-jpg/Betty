ARG DATABASE_PROVIDER=sqlite
FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates gosu \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
ARG DATABASE_PROVIDER
ENV DATABASE_PROVIDER=$DATABASE_PROVIDER
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
COPY src/lib/database-config.mjs ./src/lib/database-config.mjs
RUN --mount=type=secret,id=build_ca set -eu; \
    if [ -f /run/secrets/build_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/build_ca; fi; \
    npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM base AS runtime
ARG DATABASE_PROVIDER
ENV DATABASE_PROVIDER=$DATABASE_PROVIDER
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/interview-coach.db
COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/data/audio /app/data/images && chown -R node:node /app/data
ENTRYPOINT ["sh", "/app/scripts/docker-entrypoint.sh"]
EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy && npm run storage:prepare && exec npm start -- --hostname 0.0.0.0"]
