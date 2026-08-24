# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:lts-alpine

# Create and change to the app directory.
WORKDIR /app

# Copy the files to the container image
COPY package.json ./
COPY yarn.lock ./

# Install packages
RUN yarn install --frozen-lockfile

# Copy local code to the container image.
COPY . ./

# Build the app.
RUN npm run build

# Serve the app
CMD ["npm", "run", "start"]