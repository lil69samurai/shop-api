#!/bin/bash
# 本機啟動腳本：載入 .env 並啟動 Spring Boot
# 使用方式: ./start-local.sh

if [ ! -f .env ]; then
    echo "❌ .env not found. Please copy .env.example to .env first:"
    echo "   cp .env.example .env"
    exit 1
fi

# 載入 .env (用 export 一行一行解析，避免 & 等特殊字元出問題)
set -o allexport
source .env
set +o allexport

echo "🚀 Starting Spring Boot..."
echo "   DATABASE_URL=$DATABASE_URL"
echo "   PORT=${PORT:-8080}"
echo ""

./mvnw spring-boot:run
