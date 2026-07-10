import subprocess
import os

DB_SERVER = "DESKTOP-0PI1Q6Q"
DB_USER = "SA"
DB_PASS = "MySecretPass123"
DB_NAME = "gymer"

query = "SELECT p.id, p.product_name, p.slug, COALESCE(b.name, 'Unknown') as brand_name FROM Products p LEFT JOIN Brands b ON p.brand_id = b.id ORDER BY b.name, p.id"
cmd = f'sqlcmd -S {DB_SERVER} -U {DB_USER} -P "{DB_PASS}" -d {DB_NAME} -Q "{query}" -h-1 -W -s"|"'

print(f"CMD: {cmd}")
print(f"CMD length: {len(cmd)}")

r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
print(f"Return code: {r.returncode}")
print(f"STDERR: {r.stderr[:200] if r.stderr else '(empty)'}")
print(f"STDOUT len: {len(r.stdout)}")

lines = [l.strip() for l in r.stdout.split('\n') if l.strip() and 'rows affected' not in l and '---' not in l]
print(f"Parsed lines: {len(lines)}")
if lines:
    parts = lines[0].split('|')
    while parts and parts[-1] == '':
        parts.pop()
    print(f"First row parts: {parts}")
else:
    print(f"Raw stdout start: {repr(r.stdout[:300])}")