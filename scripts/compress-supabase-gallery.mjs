import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://zbimhhgefmhliqiuwzvb.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaW1oaGdlZm1obGlxaXV3enZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTQyODIsImV4cCI6MjA5MTY5MDI4Mn0.KYoT8yhJk0baVKjVVRwtN6mu1oOtPkkBk_EIl8V9wWk';
const GALLERY_ID    = 'session-de-partage-sur-le-nouveau-code-du-travail-1776707191438';
const BUCKET        = 'mbp-media';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Récupère la galerie
const { data: gallery, error } = await supabase
  .from('galeries')
  .select('photos')
  .eq('id', GALLERY_ID)
  .single();

if (error || !gallery) {
  console.error('Galerie introuvable :', error?.message);
  process.exit(1);
}

const originalPhotos = gallery.photos;
console.log(`${originalPhotos.length} photos à traiter...\n`);

const newPhotos = [];
let converted = 0, skipped = 0, errors = 0;

for (const url of originalPhotos) {
  // Extraire le chemin storage depuis l'URL publique
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) {
    console.warn(`URL non reconnue : ${url}`);
    newPhotos.push(url);
    skipped++;
    continue;
  }

  const [, bucket, storagePath] = match;
  const webpPath = storagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const webpUrl  = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${webpPath}`;

  // Toujours reconvertir (pour appliquer le redimensionnement)

  try {
    // Télécharger l'image originale
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    // Redimensionner à 1200px max + convertir en WebP
    const webpBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // Uploader sur Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(webpPath, webpBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const savings = Math.round((1 - webpBuffer.length / buffer.length) * 100);
    console.log(`✓ ${storagePath.split('/').pop()} → ${(buffer.length/1024).toFixed(0)}Ko → ${(webpBuffer.length/1024).toFixed(0)}Ko (-${savings}%)`);

    newPhotos.push(webpUrl);
    converted++;
  } catch (e) {
    console.error(`✗ ${storagePath} : ${e.message}`);
    newPhotos.push(url); // garder l'original en cas d'erreur
    errors++;
  }
}

// Mettre à jour la base de données
if (converted > 0) {
  const { error: updateError } = await supabase
    .from('galeries')
    .update({ photos: newPhotos })
    .eq('id', GALLERY_ID);

  if (updateError) {
    console.error('\n❌ Erreur mise à jour DB :', updateError.message);
  } else {
    console.log(`\n✅ Base de données mise à jour.`);
  }
}

console.log(`\n─── Résultat ───`);
console.log(`Converties : ${converted}`);
console.log(`Déjà OK    : ${skipped}`);
console.log(`Erreurs    : ${errors}`);
