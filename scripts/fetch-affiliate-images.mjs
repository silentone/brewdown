import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const products = [
  ['bean-to-cup-budget', 'https://amzn.to/40iuZvK'],
  ['bean-to-cup-mid', 'https://a.co/d/01XWVlZc'],
  ['bean-to-cup-premium', 'https://a.co/d/09NcYNE9'],
  ['manual-espresso-entry', 'https://a.co/d/093cyUiV'],
  ['manual-espresso-mid', 'https://a.co/d/0j2aL4yf'],
  ['manual-espresso-premium', 'https://a.co/d/08nHb8XW'],
  ['bulk-drip-budget', 'https://a.co/d/0iIhry37'],
  ['bulk-drip-mid', 'https://a.co/d/0eS3uRUY'],
  ['bulk-drip-premium', 'https://a.co/d/04cr1Hb8'],
  ['bulk-french-press-budget', 'https://a.co/d/09WxSvq7'],
  ['bulk-french-press-mid', 'https://a.co/d/05gw5ZCH'],
  ['bulk-french-press-premium', 'https://a.co/d/0fnJOalx'],
  ['bulk-pour-over-budget', 'https://a.co/d/0brQ3wUm'],
  ['bulk-pour-over-mid', 'https://a.co/d/0cWqkv45'],
  ['bulk-pour-over-premium', 'https://a.co/d/08ppBPLd'],
];

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'affiliates');
await mkdir(outDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const [id, url] of products) {
  try {
    const pageRes = await fetch(url, { redirect: 'follow', headers });
    const asinMatch = pageRes.url.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch?.[1];
    const productUrl = asin ? `https://www.amazon.com/dp/${asin}` : pageRes.url;
    const productRes = await fetch(productUrl, { redirect: 'follow', headers });
    const html = await productRes.text();
    const hiResMatch = html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    const dynamicMatch = html.match(/data-a-dynamic-image="\{&quot;(https:\/\/m\.media-amazon\.com\/images\/I\/[^&]+)/);
    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/);
    const imgUrl = hiResMatch?.[1] ?? dynamicMatch?.[1] ?? ogMatch?.[1];
    if (!imgUrl) {
      console.error(`${id}: no product image on ${productUrl}`);
      continue;
    }
    const imgRes = await fetch(imgUrl, { headers });
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const outPath = join(outDir, `${id}.webp`);
    await sharp(buffer)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 80 })
      .toFile(outPath);
    const customersMatch =
      html.match(/Customers say[\s\S]{0,4000}?<span[^>]*class="[^"]*a-size-base[^"]*"[^>]*>([\s\S]{0,800}?)<\/span>/i) ??
      html.match(/"reviewSummary":"([^"]+)"/);
    console.log(`${id}: ok (${outPath})`);
    if (customersMatch) {
      const text = customersMatch[1].replace(/<[^>]+>/g, ' ').replace(/\\u0026/g, '&').replace(/\s+/g, ' ').trim();
      console.log(`  customers say: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.error(`${id}: ${err.message}`);
  }

  await sleep(2500);
}
