const pages = [
  ['bean-to-cup-premium', 'https://www.amazon.com/dp/B0CGL7878G'],
  ['manual-espresso-mid', 'https://www.amazon.com/dp/B089QVH3SP'],
  ['manual-espresso-premium', 'https://www.amazon.com/dp/B0BJH21MBP'],
  ['bulk-drip-budget', 'https://www.amazon.com/dp/B07S98411N'],
  ['bulk-drip-mid', 'https://www.amazon.com/dp/B00YEYKK8U'],
  ['bulk-french-press-premium', 'https://www.amazon.com/dp/B011WTM622'],
  ['bulk-pour-over-budget', 'https://www.amazon.com/dp/B004W5KPSQ'],
  ['bulk-pour-over-premium', 'https://www.amazon.com/dp/B0000YWF5E'],
];

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

for (const [id, url] of pages) {
  const r = await fetch(url, { headers });
  const h = await r.text();
  const hi = h.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  const dyn = h.match(/data-a-dynamic-image="\{&quot;(https:\/\/m\.media-amazon\.com\/images\/I\/[^&]+)/);
  const og = h.match(/property="og:image"\s+content="([^"]+)"/);
  const img = h.match(/!\[[^\]]*\]\((https:\/\/m\.media-amazon\.com\/images\/I\/[^)]+)\)/);
  console.log(id, h.length, hi?.[1] ?? dyn?.[1] ?? og?.[1] ?? img?.[1] ?? 'none');
  await new Promise((resolve) => setTimeout(resolve, 4000));
}
