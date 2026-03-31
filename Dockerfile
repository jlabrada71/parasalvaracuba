ARG NODE_VERSION=22.22.1

# Create build stage
FROM node:${NODE_VERSION}-slim AS base

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml files to the working directory
COPY ./package.json /app/
COPY ./pnpm-lock.yaml /app/

# Install dependencies
RUN pnpm install --shamefully-hoist

# Copy the rest of the application files to the working directory
COPY . ./

FROM base as development
CMD ["pnpm", "run", "dev"]


# Create build stage
FROM base AS build


# Build the application
RUN pnpm run build

# Create a new stage for the production image
FROM node:${NODE_VERSION}-slim AS production

# Install runtime dependencies for native modules and healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the output from the build stage to the working directory
COPY --from=build /app/.output ./

# Create data directory for SQLite
RUN mkdir -p /app/data

# Define environment variables
ENV HOST=0.0.0.0
ENV NODE_ENV=development

# Expose the port the application will run on
EXPOSE 3000

# Start the application
CMD ["node","/app/server/index.mjs"]
