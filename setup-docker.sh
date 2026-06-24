#!/bin/bash
# Gymer Docker Setup - Linux/Mac
set -e
echo "=== GYMER SETUP ==="

# Copy env
[ -f backend/.env ] || cp backend/.env.example backend/.env
echo "[1/3] .env ready"

# Build & start
echo "[2/3] Starting services..."
docker-compose up -d --build

# Wait for SQL Server
echo "[3/3] Waiting for SQL Server..."
sleep 15

# Copy schema into container
docker cp database/full_schema.sql gymer-db-1:/tmp/full_schema.sql
docker exec gymer-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "GymerSecure123!" -d gymer -i /tmp/full_schema.sql

echo ""
echo "=== DONE ==="
echo "Frontend: http://localhost"
echo "Backend:  http://localhost:5000/api/health"
echo "Admin:    admin@gymer.com / admin123"
