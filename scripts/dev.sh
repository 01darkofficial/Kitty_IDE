#!/bin/bash

ROOT_DIR=$(pwd)

echo "Starting Web IDE..."
cd "$ROOT_DIR/Web_IDE" && pnpm dev &
WEB_PID=$!

echo "Starting Proxy Server..."
cd "$ROOT_DIR/Web_IDE_Runtime_Server" && pnpm dev &
PROXY_PID=$!

echo "Both services started"

trap "kill $WEB_PID $PROXY_PID" EXIT

wait