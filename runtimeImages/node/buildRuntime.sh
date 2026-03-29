#!/bin/bash

NODE_VERSION=$1
PNPM_VERSION=$2

IMAGE_NAME="cloud-ide-node-$NODE_VERSION"

docker build \
  --build-arg NODE_VERSION=$NODE_VERSION \
  --build-arg PNPM_VERSION=$PNPM_VERSION \
  -t $IMAGE_NAME \
  ./runtimeImages/node

echo "Built runtime image: $IMAGE_NAME"