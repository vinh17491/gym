# 🏋️ GYMER - Hướng dẫn cài đặt

## Quy trình setup (cố định)

### Bước 1: Setup Database

```
Mở SQL Server Management Studio (SSMS)
→ Kết nối SQL Server (Windows Authentication)
→ File → Open → File → chọn database/full_schema.sql
→ Nhấn F5
```

Hoặc chạy script:
```bash
sqlcmd -S localhost -E -i database/full_schema.sql
```

✅ Kết quả: Tạo database `gymer` + 34 tables + 8 stored procedures + seed data

---

### Bước 2: Mở Backend

```bash
cd backend
npm install
npm run dev
```

✅ Kết quả: Backend chạy tại http://localhost:5000

---

### Bước 3: Mở Frontend (Terminal mới)

```bash
cd frontend
npm install
npm run dev
```

✅ Kết quả: Frontend chạy tại http://localhost:5173

---

### Bước 4: Mở web và test

Truy cập **http://localhost:5173**

| Email | Password | Vai trò |
|-------|----------|---------|
| admin@gymer.com | admin123 | Admin |

---

## Tóm tắt 4 bước

```
1. SQL Server → Paste → F5
2. cd backend → npm install → npm run dev
3. cd frontend → npm install → npm run dev
4. Mở localhost:5173 → Test
```

---

## Yêu cầu

- **SQL Server**: SQL Server Developer Edition (miễn phí) hoặc SQL Server Express
- **Node.js**: v18 trở lên
- **SQL Server Management Studio (SSMS)**: để mở file .sql và chạy F5

---

## Có vấn đề?

**"Cannot connect to SQL Server"**
→ Kiểm tra SQL Server đã bật chưa (SQL Server Configuration Manager)

**"Port 5000 đã được dùng"**
→ Sửa PORT trong `backend/.env`

**"Port 5173 đã được dùng"**
→ Sửa port trong `frontend/vite.config.ts`
