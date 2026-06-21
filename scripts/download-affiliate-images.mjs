import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** Curated product hero images (Amazon CDN + manufacturer hosts). Keys match link ids in affiliates.ts. */
const IMAGE_URLS = {
  'bean-to-cup-budget':
    'https://m.media-amazon.com/images/I/51EvAQ5unqL._AC_SL1080_.jpg',
  'bean-to-cup-mid': 'https://m.media-amazon.com/images/I/51Q+Kaj2f-L._AC_SL1000_.jpg',
  'bean-to-cup-premium':
    'https://m.media-amazon.com/images/I/61aGMpJ7o-L._AC_SL1500_.jpg',
  'manual-espresso-budget':
    'https://m.media-amazon.com/images/I/714iikjNi-L._AC_SL1500_.jpg',
  'manual-espresso-mid':
    'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1500_.jpg',
  'manual-espresso-premium':
    'https://m.media-amazon.com/images/I/61MEPYMxZIL._AC_SL1500_.jpg',
  'bulk-drip-budget':
    'https://m.media-amazon.com/images/I/61p-3iQVZqL._AC_SL1500_.jpg',
  'bulk-drip-mid':
    'https://www.oxo.com/media/catalog/product/cache/b2f1ce2dfe10d3d31bf2056bf6e0d10f/1/1/11411200.jpg',
  'bulk-drip-premium':
    'https://ratiocoffee.com/cdn/shop/files/ratio4-black-B2_1024x1024.jpg',
  'bulk-french-press-budget':
    'https://m.media-amazon.com/images/I/51Tk7Bl5PML._AC_SL1000_.jpg',
  'bulk-french-press-mid':
    'https://m.media-amazon.com/images/I/61UeQjIpANL._AC_SL1500_.jpg',
  'bulk-french-press-premium':
    'https://m.media-amazon.com/images/I/71G5mqLYaQL._AC_SL1500_.jpg',
  'bulk-pour-over-budget':
    'https://m.media-amazon.com/images/I/71zt0Gcnj6L._AC_SL1500_.jpg',
  'bulk-pour-over-mid':
    'https://m.media-amazon.com/images/I/51Wp-8q4A7L._AC_SL1080_.jpg',
  'bulk-pour-over-premium':
    'https://m.media-amazon.com/images/I/71HlJIN9-6L._AC_SL1500_.jpg',
};

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'affiliates');
await mkdir(outDir, { recursive: true });

for (const [id, url] of Object.entries(IMAGE_URLS)) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`${id}: HTTP ${res.status} for ${url}`);
    continue;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = join(outDir, `${id}.webp`);
  await sharp(buffer)
    .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 80 })
    .toFile(outPath);
  console.log(`${id}: ok`);
}
