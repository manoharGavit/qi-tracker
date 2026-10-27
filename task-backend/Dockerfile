# better-sqlite3 ships platform prebuilds. `npm ci --ignore-scripts` is required:
# a from-source compile fails without C++ build tools, and npm older than 11.18
# ignores the package.json `allowScripts` override.
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    DB_PATH=/app/data/app.db

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && mkdir -p /app/data \
    && chown -R node:node /app

COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/server.js"]
