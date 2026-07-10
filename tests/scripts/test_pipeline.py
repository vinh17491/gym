import subprocess, sys, os, re, time
from pathlib import Path
from PIL import Image

DB_SERVER = "DESKTOP-0PI1Q6Q"
DB_USER = "SA"
DB_PASS = "MySecretPass123"
DB_NAME = "gymer"
MEDIA_ROOT = Path("D:/gymer/backend/public/media/products")
TEMP_DIR = Path("D:/gymer/temp_media")
TEMP_DIR.mkdir(parents=True, exist_ok=True)
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

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
        return result
    except Exception as e:
        print(f"  [SQL ERROR] {e}")
        return []

def sql_update(query):
    cmd = f'sqlcmd -S {DB_SERVER} -U {DB_USER} -P "{DB_PASS}" -d {DB_NAME} -Q "{query}"'
    try:
        subprocess.run(cmd, shell=True, capture_output=True, timeout=15)
        return True
    except:
        return False

# Test: Process just 3 products
print("Fetching products...")
rows = sql_query("SELECT p.id, p.product_name, p.slug, COALESCE(b.name, 'Unknown') as brand_name FROM Products p LEFT JOIN Brands b ON p.brand_id = b.id ORDER BY b.name, p.id")
products = []
for parts in rows:
    if len(parts) >= 4:
        products.append({'id':int(parts[0]),'name':parts[1],'slug':parts[2],'brand':parts[3]})

print(f"Total: {len(products)} products")

# Process first 3 only
for i, p in enumerate(products[:3], 1):
    print(f"\n[{i}/3] ID={p['id']} - {p['brand']} - {p['name']}")
    
    # Create directory
    brand_slug = re.sub(r'[^a-z0-9-]', '', p['brand'].lower().replace(' ','-')).strip('-')
    product_slug = p['slug'] or re.sub(r'[^a-z0-9-]', '', p['name'].lower().replace(' ','-')).strip('-')
    product_dir = MEDIA_ROOT / brand_slug / product_slug
    product_dir.mkdir(parents=True, exist_ok=True)
    print(f"  Dir: {product_dir}")
    
    # For now just test the directory creation and SQL update
    media_path = f"/media/products/{brand_slug}/{product_slug}/main.webp"
    sql_update(f"UPDATE Products SET main_image='{media_path}' WHERE id={p['id']}")
    print(f"  Updated SQL: {media_path}")
    
    time.sleep(0.5)

print("\n\nDone! Processed 3 products.")

# Verify
rows = sql_query("SELECT COUNT(*) FROM Products WHERE main_image LIKE '/media/%'")
print(f"Products with /media/ path: {rows[0][0] if rows else 'N/A'}")
