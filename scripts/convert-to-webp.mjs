import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

let converted = 0, skipped = 0, errors = 0;
let savedBytes = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
      if (entry.name.startsWith('._')) continue; // fichiers cachés macOS

      const webpPath = full.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      try {
        const originalStat = await stat(full);

        // qualité 88 pour photos, 92 pour PNG (logos/graphiques)
        const quality = ext === '.png' ? 92 : 88;

        await sharp(full)
          .webp({ quality, effort: 4 })
          .toFile(webpPath);

        const newStat = await stat(webpPath);
        const saved = originalStat.size - newStat.size;
        savedBytes += saved;
        converted++;

        const pct = Math.round((saved / originalStat.size) * 100);
        console.log(`✓ ${entry.name} → ${(originalStat.size/1024).toFixed(0)}Ko → ${(newStat.size/1024).toFixed(0)}Ko (-${pct}%)`);
      } catch (e) {
        console.error(`✗ ${entry.name}: ${e.message}`);
        errors++;
      }
    }
  }
}

console.log('Conversion en cours...\n');
await walk(PUBLIC);
console.log(`\n─── Résultat ───`);
console.log(`Converties : ${converted}`);
console.log(`Erreurs    : ${errors}`);
console.log(`Économie   : ${(savedBytes / 1048576).toFixed(1)} Mo`);
