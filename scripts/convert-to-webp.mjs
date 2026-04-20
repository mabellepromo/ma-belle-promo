import sharp from 'sharp';
import { readdir, stat, access } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

let converted = 0, skipped = 0, errors = 0;
let savedBytes = 0;

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
      if (entry.name.startsWith('._')) continue;

      const webpPath = full.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      // Sauter si le .webp existe déjà et est plus récent que l'original
      if (await exists(webpPath)) {
        const [origStat, webpStat] = await Promise.all([stat(full), stat(webpPath)]);
        if (webpStat.mtimeMs >= origStat.mtimeMs) {
          skipped++;
          continue;
        }
      }

      try {
        const originalStat = await stat(full);
        const quality = ext === '.png' ? 92 : 88;

        await sharp(full).webp({ quality, effort: 4 }).toFile(webpPath);

        const newStat = await stat(webpPath);
        const saved = originalStat.size - newStat.size;
        savedBytes += saved;
        converted++;

        const pct = Math.round((saved / originalStat.size) * 100);
        console.log(`✓ ${entry.name} → ${(originalStat.size/1024).toFixed(0)}Ko → ${(newStat.size/1024).toFixed(0)}Ko (${pct > 0 ? '-' : '+'}${Math.abs(pct)}%)`);
      } catch (e) {
        console.error(`✗ ${entry.name}: ${e.message}`);
        errors++;
      }
    }
  }
}

await walk(PUBLIC);

if (converted > 0) {
  console.log(`\n✅ ${converted} image(s) converties en WebP — économie : ${(savedBytes / 1048576).toFixed(1)} Mo`);
}
if (skipped > 0) console.log(`⏭  ${skipped} déjà à jour`);
if (errors > 0) console.log(`❌ ${errors} erreur(s)`);
