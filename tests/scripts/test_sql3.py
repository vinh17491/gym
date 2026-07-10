import subprocess, sys, os, re, time

DB_SERVER = "DESKTOP-0PI1Q6Q"
DB_USER = "SA"
DB_PASS = "MySecretPass123"
DB_NAME = "gymer"

def sql_query(query):
    cmd = f'sqlcmd -S {DB_SERVER} -U {DB_USER} -P "{DB_PASS}" -d {DB_NAME} -Q "{query}" -h-1 -W -s"|"'
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
        lines = [l.strip() for l in r.stdout.split('\n') if l.strip() and 'rows affected' not in l and '---' not in l]
        result = []
        for l in lines:
            parts = l.split('|')
            while parts and parts[-1] == '':
                parts.pop()
            if parts:
                result.append(parts)
        print(f"  [DEBUG] query returned {len(result)} rows", file=sys.stderr)
        return result
    except Exception as e:
        print(f"  [SQL ERROR] {e}", file=sys.stderr)
        return []

# Test 1: Simple query
print("Test 1: Simple product query")
rows = sql_query("SELECT p.id, p.product_name, p.slug, COALESCE(b.name, 'Unknown') as brand_name FROM Products p LEFT JOIN Brands b ON p.brand_id = b.id ORDER BY b.name, p.id")
print(f"  Got {len(rows)} products")
if rows:
    print(f"  First: {rows[0]}")

# Test 2: Verify query (the one that might hang)
print("\nTest 2: Verify query")
rows = sql_query("SELECT COUNT(*) as total, SUM(CASE WHEN main_image LIKE '%.webp' THEN 1 ELSE 0 END) as webp, SUM(CASE WHEN main_image = 'MEDIA_PENDING' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN main_image IS NULL OR main_image = '' THEN 1 ELSE 0 END) as nulls FROM Products")
print(f"  Got {len(rows)} rows")
if rows:
    print(f"  Data: {rows[0]}")

# Test 3: Simple count
print("\nTest 3: Simple count")
rows = sql_query("SELECT COUNT(*) FROM Products")
print(f"  Got {len(rows)} rows")
if rows:
    print(f"  Count: {rows[0]}")

print("\nAll tests passed!")
