# Dependencies
FROM node:lts-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build stage
FROM node:lts-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock ./
COPY . ./

RUN yarn build

# Production
FROM node:lts-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production \
    && yarn cache clean

COPY --from=builder /app/build ./build

EXPOSE 5173
CMD ["node", "build"]