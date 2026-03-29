ARG NODE_VERSION=25
ARG PNPM_VERSION=9

FROM node:${NODE_VERSION}-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ENV PNPM_STORE_DIR="/pnpm-store"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    ca-certificates \
    build-essential \
    python3 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install corepack properly
RUN npm install -g corepack@latest --force

# Enable corepack
RUN corepack enable

# Activate pnpm version
RUN corepack prepare pnpm@${PNPM_VERSION} --activate

# Configure shared pnpm store
RUN pnpm config set store-dir /pnpm-store

WORKDIR /workspace

RUN mkdir -p /workspace \
    && mkdir -p /pnpm-store

CMD ["sleep", "infinity"]