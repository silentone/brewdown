const urls = {
  'bean-to-cup-premium': 'https://m.media-amazon.com/images/I/61aGMpJ7o-L._AC_SL1500_.jpg',
  'manual-espresso-mid': 'https://m.media-amazon.com/images/I/71KqJ8rQqSL._AC_SL1500_.jpg',
  'manual-espresso-premium': 'https://m.media-amazon.com/images/I/61MEPYMxZIL._AC_SL1500_.jpg',
  'bulk-drip-budget': 'https://m.media-amazon.com/images/I/61p-3iQVZqL._AC_SL1500_.jpg',
  'bulk-drip-mid':
    'https://www.oxo.com/media/catalog/product/cache/b2f1ce2dfe10d3d31bf2056bf6e0d10f/1/1/11411200.jpg',
  'bulk-drip-premium':
    'https://ratiocoffee.com/cdn/shop/files/ratio4-black-B2_1024x1024.jpg',
  'bulk-french-press-premium': 'https://m.media-amazon.com/images/I/71G5mqLYaQL._AC_SL1500_.jpg',
  'bulk-pour-over-budget': 'https://m.media-amazon.com/images/I/71zt0Gcnj6L._AC_SL1500_.jpg',
  'bulk-pour-over-premium': 'https://m.media-amazon.com/images/I/71HlJIN9-6L._AC_SL1500_.jpg',
};

for (const [id, url] of Object.entries(urls)) {
  const r = await fetch(url);
  console.log(id, r.status, r.headers.get('content-type'));
}
