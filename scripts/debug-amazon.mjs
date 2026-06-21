const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const asins = [
  'B0CZ4GN5YT',
  'B0B69F4W94',
  'B0CGL7878G',
  'B0CCZQCNLJ',
  'B089QVH3SP',
  'B0BJH21MBP',
  'B07S98411N',
  'B00YEYKK8U',
  'B0DKGCL1MR',
  'B01KQKG7KA',
  'B00008XEWG',
  'B011WTM622',
  'B004W5KPSQ',
  'B000P4D5HG',
  'B0000YWF5E',
];

for (const asin of asins) {
  for (const host of ['www.amazon.com', 'www.amazon.co.uk']) {
    const r = await fetch(`https://${host}/dp/${asin}`, { headers });
    const h = await r.text();
    const hi = h.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    console.log(asin, host, h.length, hi?.[1] ?? 'none');
    if (hi) break;
  }
  await new Promise((r) => setTimeout(r, 3000));
}
