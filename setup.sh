#!/bin/bash
# ============================================
# GYMER - Setup & Run Script
# ============================================
# Flow cố định:
#   1. SQL Server → Paste → Run
#   2. Start Backend
#   3. Start Frontend
#   4. Mở web → Test
# ============================================

echo ""
echo "============================================"
echo "  🏋️  GYMER SETUP - Bắt đầu"
echo "============================================"
echo ""

# ── STEP 1: Kiểm tra SQL Server ──
echo "[1/5] Kiểm tra SQL Server..."
if sqlcmd -S localhost -E -Q "SELECT 1" >/dev/null 2>&1; then
    echo "  ✅ SQL Server đang chạy"
else
    echo "  ❌ SQL Server chưa chạy!"
    echo "  → Mở SQL Server Configuration Manager → Start dịch vụ"
    echo "  → Hoặc restart SQL Server rồi chạy lại script này"
    exit 1
fi

# ── STEP 2: Tạo database + tables ──
echo ""
echo "[2/5] Setup database..."

DB_EXISTS=$(sqlcmd -S localhost -E -Q "SELECT 1 FROM sys.databases WHERE name='gymer'" -h-1 2>/dev/null | tr -d ' ')
if [ "$DB_EXISTS" = "1" ]; then
    echo "  ℹ️  Database 'gymer' đã tồn tại"
    echo -n "  Reload schema? (y/N): "
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        sqlcmd -S localhost -E -Q "DROP DATABASE gymer" 2>/dev/null
        cd database && sqlcmd -S localhost -E -i full_schema.sql && cd ..
        echo "  ✅ Schema reloaded"
    else
        echo "  ⏭️  Bỏ qua"
    fi
else
    cd database && sqlcmd -S localhost -E -i full_schema.sql && cd ..
    echo "  ✅ Database created (34 tables, 8 procs, seed data)"
fi

# ── STEP 3: Cài dependencies + Start Backend ──
echo ""
echo "[3/5] Cài dependencies backend..."
cd backend
cp .env.example .env 2>/dev/null
npm install --silent 2>/dev/null
echo "  ✅ Backend dependencies ready"
cd ..

# ── STEP 4: Cài dependencies + Start Frontend ──
echo ""
echo "[4/5] Cài dependencies frontend..."
cd frontend
npm install --silent 2>/dev/null
echo "  ✅ Frontend dependencies ready"
cd ..

echo ""
echo "============================================"
echo "  Setup hoàn tất!"
echo "============================================"
echo ""
echo "Mở 2 Terminal riêng biệt:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Truy cập: http://localhost:5173"
echo "  Admin:    admin@gymer.com / admin123"
echo ""
