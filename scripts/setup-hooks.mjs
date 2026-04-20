import { writeFile, chmod, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HOOKS_DIR = join(ROOT, '.git', 'hooks');
const HOOK_PATH = join(HOOKS_DIR, 'pre-commit');

const hookScript = `#!/bin/sh
# Auto-conversion WebP avant chaque commit
echo "🖼  Compression images en WebP..."
node scripts/convert-to-webp.mjs
# Ajouter les .webp générés au commit
git add public/**/*.webp public/*.webp 2>/dev/null || true
`;

try {
  await mkdir(HOOKS_DIR, { recursive: true });
  await writeFile(HOOK_PATH, hookScript, { encoding: 'utf8' });
  await chmod(HOOK_PATH, 0o755);
  console.log('✅ Hook pre-commit installé — les images seront auto-converties en WebP à chaque commit.');
} catch (e) {
  console.error('❌ Impossible d\'installer le hook :', e.message);
}
