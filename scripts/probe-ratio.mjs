const r = await fetch('https://www.ratiocoffee.com/products/ratio-four');
const h = await r.text();
const matches = [...h.matchAll(/https:\/\/[^"'\s]+\.(?:jpg|png|webp)/g)];
console.log([...new Set(matches.map((m) => m[0]))].slice(0, 30).join('\n'));
