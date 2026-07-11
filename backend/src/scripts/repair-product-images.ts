import { promises as fs } from 'fs';
import path from 'path';
import { closePool, getPool } from '../config/database';
import { config } from '../config/config';

interface ImageRow { id:number; product_id:number; image_url:string }
type Classification = 'kept_external'|'kept_upload'|'kept_legacy'|'empty'|'malformed'|'missing_local';

const apply = process.argv.includes('--apply');
const legacyArg = process.argv.find(arg => arg.startsWith('--legacy-root='))?.slice('--legacy-root='.length);
const legacyRoot = path.resolve(legacyArg || process.env.LEGACY_PRODUCT_IMAGE_DIR || '');
const uploadRoot = path.resolve(config.upload.dir);
const projectRoot = path.resolve(__dirname, '../../..');
const mediaRoot = path.join(projectRoot, 'backend', 'public', 'media');
const backupRoot = path.join(projectRoot, 'backend', 'backups', 'product-images');

async function exists(file:string) { try { await fs.access(file); return true; } catch { return false; } }
function inside(root:string, target:string) { return target === root || target.startsWith(root + path.sep); }
function safeResolve(root:string, relative:string) {
  const target = path.resolve(root, relative.replace(/^[/\\]+/, ''));
  if (!inside(root, target)) throw new Error(`Resolved image path escapes allowed root: ${relative}`);
  return target;
}

async function classify(value:string|null):Promise<{kind:Classification;resolved?:string}> {
  const image=value?.trim(); if(!image)return {kind:'empty'};
  if(/^https?:\/\/[^\s]+$/i.test(image))return {kind:'kept_external'};
  if(image.startsWith('/uploads/')) { const resolved=safeResolve(uploadRoot,image.slice('/uploads/'.length)); return {kind:await exists(resolved)?'kept_upload':'missing_local',resolved}; }
  if(image.startsWith('/media/')) { const resolved=safeResolve(mediaRoot,image.slice('/media/'.length)); return {kind:await exists(resolved)?'kept_legacy':'missing_local',resolved}; }
  let relative:string|undefined;
  if(image.startsWith('/image/')) relative=image.slice('/image/'.length);
  else if(image.startsWith('image/')) relative=image.slice('image/'.length);
  else if(!path.isAbsolute(image) && !image.includes('://')) relative=image;
  else {
    const oldRoot=path.resolve('D:\\gymer\\image');
    const absolute=path.resolve(image);
    if(inside(oldRoot,absolute)) relative=path.relative(oldRoot,absolute);
  }
  if(relative!==undefined){const resolved=safeResolve(legacyRoot,relative);return {kind:await exists(resolved)?'kept_legacy':'missing_local',resolved};}
  return {kind:'malformed'};
}

async function run(){
  if(!process.env.LEGACY_PRODUCT_IMAGE_DIR && !legacyArg) throw new Error('Set LEGACY_PRODUCT_IMAGE_DIR or pass --legacy-root=<directory>');
  if(!(await exists(legacyRoot))) throw new Error(`Legacy image root does not exist: ${legacyRoot}`);
  const pool=await getPool(); const products=await pool.request().query('SELECT id FROM dbo.Products'); const rows=(await pool.request().query<ImageRow>('SELECT id,product_id,image_url FROM dbo.ProductImages ORDER BY product_id,id')).recordset;
  const stats={mode:apply?'apply':'dry-run',legacy_root:legacyRoot,products_checked:products.recordset.length,image_records_checked:rows.length,images_kept:0,images_would_remove:0,images_removed:0,products_using_fallback:0,kept_external:0,kept_upload:0,kept_legacy:0,empty:0,malformed:0,missing_local:0};
  const invalid:(ImageRow&{classification:Classification;resolved_path?:string})[]=[];
  for(const row of rows){const result=await classify(row.image_url);stats[result.kind]++;if(result.kind.startsWith('kept_'))stats.images_kept++;else{stats.images_would_remove++;invalid.push({...row,classification:result.kind,resolved_path:result.resolved});}}
  let backupPath:string|undefined;
  if(apply&&invalid.length){await fs.mkdir(backupRoot,{recursive:true});backupPath=path.join(backupRoot,`repair-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);await fs.writeFile(backupPath,JSON.stringify({created_at:new Date().toISOString(),legacy_root:legacyRoot,records:invalid},null,2),'utf8');const tx=pool.transaction();await tx.begin();try{for(const row of invalid)await tx.request().input('id',row.id).query('DELETE dbo.ProductImages WHERE id=@id');await tx.request().query(`;WITH choice AS (SELECT id,ROW_NUMBER() OVER(PARTITION BY product_id ORDER BY is_primary DESC,sort_order,id) rank FROM dbo.ProductImages) UPDATE pi SET is_primary=CASE WHEN c.rank=1 THEN 1 ELSE 0 END FROM dbo.ProductImages pi JOIN choice c ON c.id=pi.id`);await tx.commit();stats.images_removed=invalid.length;}catch(error){await tx.rollback();throw error;}}
  const fallback=await pool.request().query('SELECT COUNT(*) total FROM dbo.Products p WHERE NOT EXISTS(SELECT 1 FROM dbo.ProductImages pi WHERE pi.product_id=p.id)');stats.products_using_fallback=fallback.recordset[0].total;
  console.log(`PRODUCT_IMAGE_REPAIR ${JSON.stringify({...stats,backup_path:backupPath||null})}`);
}
run().catch(error=>{console.error('PRODUCT_IMAGE_REPAIR_FAILED',error instanceof Error?error.message:error);process.exitCode=1;}).finally(closePool);
