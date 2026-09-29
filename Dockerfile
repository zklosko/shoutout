# Build JS from TS, grab dependencies
FROM node:lts-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Create production container
FROM node:lts-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit-dev

COPY --from=build /app/dist/drizzle ./drizzle
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]