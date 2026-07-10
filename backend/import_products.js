const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: 'DESKTOP-0PI1Q6Q', port: 1433, database: 'gymer',
  user: 'sa', password: 'MySecretPass123',
  options: { encrypt: false, trustServerCertificate: true }
};

const B = {
  'optimum-nutrition':62,'myprotein':63,'dymatize':64,'bsn':65,
  'muscletech':67,'cellucor':68,'ghost':69,'rule-one':66,
  'naked-nutrition':71,'promix':98,'legion-athletics':94,
  'jym':95,'nutricost':96,'bulksupplements':99,'xtend':93,
  'ritual-multi':97,'evl':70,
  'gymshark':81,'nike':82,'adidas':83,'under-armour':84,'puma':85,
  'rogue-fitness':72,'rep-fitness':73,'titan-fitness':74,'eleiko':75,
  'bowflex':78,'powerblock':79,'assault-fitness':77,'concept2':76,
  'sole-fitness':80,'horizon-fitness':100,'schwinn':101,
  'garmin':87,'polar':88,'withings':92,'hoka':86,'theragun':91,
  'triggerpoint':90,'blenderbottle':89
};

const C = {
  'whey-protein':73,'isolate-protein':74,'mass-gainer':75,'casein':76,
  'creatine':77,'pre-workout':78,'bcaa':79,'eaa':80,'glutamine':81,
  'fish-oil':82,'omega-3':83,'vitamin':84,'zma':85,'electrolytes':86,
  'collagen':89,
  'tank-top':127,'shorts':130,'joggers':131,'leggings':132,
  'hoodie':134,'jacket':135,'sports-bra':133,'oversized-tee':128,
  'compression-shirt':129,
  'training-shoes':136,'running-shoes':137,'weightlifting-shoes':138,'cross-training-shoes':139,
  'kettlebell':104,'resistance-band':106,'hex-dumbbell':91,'adjustable-dumbbell':90,
  'olympic-barbell':92,'ez-bar':93,'weight-plate':94,'medicine-ball':105,
  'battle-rope':107,'jump-rope':116,
  'smart-watch':140,'fitness-tracker':142,'heart-rate-monitor':141,
  'lifting-belt':117,'wrist-wrap':118,'knee-sleeve':119,'elbow-sleeve':120,
  'gym-bag':125,'gym-gloves':121,'lifting-strap':122,'shaker-bottle':123,
  'treadmill':110,'rowing-machine':114,'elliptical':113,'exercise-bike':111,
  'air-bike':112,'stair-climber':115,
  'power-rack':95,'bench':98,'squat-rack':99,'leg-press':100,
  'lat-pulldown':101,'row-machine':102,'trap-bar':103,'smith-machine':96,
  'cable-machine':97,'foam-roller':108,'yoga-block':109,'protein-bar':87,
  'meal-replacement':88
};

async function main() {
  let pool;
  try {
    console.log('Connecting...');
    pool = await sql.connect(config);
    
    const files = ['p_whey.json','p_clothing1.json','p_clothing2.json','p_equip1.json','p_pre.json','p_misc.json','p_final.json'];
    let inserted = 0, errors = 0;
    
    for (const file of files) {
      const fp = path.join(__dirname, file);
      if (!fs.existsSync(fp)) { console.log('Skip (not found):', file); continue; }
      const products = JSON.parse(fs.readFileSync(fp, 'utf8'));
      console.log(`Processing ${file} (${products.length} products)...`);
      
      for (const p of products) {
        // p = [slug, sku, price, sale_price, stock, rating, flavor, color, size, brand, category, specs, tags]
        const slug = p[0], sku = p[1], price = p[2], salePrice = p[3], stock = p[4];
        const rating = p[5], flavor = p[6], color = p[7], size = p[8];
        const brandSlug = p[9], catSlug = p[10], specs = p[11], tags = p[12];
        
        const brandId = B[brandSlug] || 62;
        const catId = C[catSlug] || 73;
        const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const subCat = catSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const img = `/image/${catSlug}/${slug}-main.webp`;
        
        try {
          await pool.request()
            .input('n', sql.NVarChar, name)
            .input('s', sql.NVarChar, slug)
            .input('d', sql.NVarChar, `${name} - Premium quality fitness product`)
            .input('sp', sql.NVarChar, specs)
            .input('sk', sql.NVarChar, sku)
            .input('pr', sql.Decimal(10,2), price)
            .input('spr', sql.Decimal(10,2), salePrice)
            .input('st', sql.Int, stock)
            .input('r', sql.Decimal(3,1), rating)
            .input('fl', sql.NVarChar, flavor)
            .input('co', sql.NVarChar, color)
            .input('sz', sql.NVarChar, size)
            .input('tu', sql.NVarChar, 'Athletes')
            .input('mi', sql.NVarChar, img)
            .input('bi', sql.Int, brandId)
            .input('ci', sql.Int, catId)
            .input('sc', sql.NVarChar, subCat)
            .input('ia', sql.Bit, 1)
            .input('if', sql.Bit, 0)
            .input('ios', sql.Bit, salePrice ? 1 : 0)
            .input('t', sql.NVarChar, tags)
            .query(`INSERT INTO Products (product_name,slug,description,specifications,sku,price,sale_price,stock,rating,flavor,color,size,target_users,main_image,brand_id,category_id,sub_category,is_active,is_featured,is_on_sale,tags)
              VALUES (@n,@s,@d,@sp,@sk,@pr,@spr,@st,@r,@fl,@co,@sz,@tu,@mi,@bi,@ci,@sc,@ia,@if,@ios,@t)`);
          inserted++;
        } catch (e) {
          errors++;
          if (errors <= 5) console.log('  ERR:', slug, '-', e.message.substring(0,80));
        }
      }
    }
    
    const r = await pool.request().query('SELECT COUNT(*) cnt FROM Products');
    console.log(`\nDone! Inserted: ${inserted}, Errors: ${errors}`);
    console.log('Total products in DB:', r.recordset[0].cnt);
  } catch (e) {
    console.error('Fatal:', e.message);
  } finally { if (pool) pool.close(); }
}

main();
