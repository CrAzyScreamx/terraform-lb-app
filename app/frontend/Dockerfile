FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
# Accept build arguments for Vite environment variables
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

FROM node:20-alpine
# Install production dependencies (including the new proxy dependencies)
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# Copy built files and server
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/server.js /app/server.js

# Set runtime environment variable for the backend URL
ENV BACKEND_URL=${BACKEND_URL}

CMD ["npm", "run", "start"]