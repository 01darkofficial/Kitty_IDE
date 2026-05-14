ARG NODE_VERSION=25
ARG PNPM_VERSION=9

FROM node:${NODE_VERSION}-bookworm-slim

ARG UID=1000
ARG GID=1000

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ENV PNPM_STORE_DIR="/pnpm-store"

# Disable corepack prompts
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

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

# Install corepack
RUN npm install -g corepack@latest --force

RUN corepack enable

# Create directories FIRST
RUN mkdir -p /workspace \
    && mkdir -p /pnpm \
    && mkdir -p /pnpm-store

# Create user if needed
RUN if ! id -u ${UID} >/dev/null 2>&1; then \
        useradd -m -u ${UID} -g ${GID} coder; \
    fi

# Give ownership BEFORE installing pnpm
RUN chown -R ${UID}:${GID} /workspace \
    && chown -R ${UID}:${GID} /pnpm \
    && chown -R ${UID}:${GID} /pnpm-store

# Switch user BEFORE pnpm install
USER ${UID}:${GID}

WORKDIR /workspace

# Install pinned pnpm as runtime user
RUN corepack prepare pnpm@${PNPM_VERSION} --activate

# Force install during build
RUN pnpm --version

# Configure store
RUN pnpm config set store-dir /pnpm-store

CMD ["sleep", "infinity"]