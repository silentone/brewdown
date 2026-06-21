const candidates = [
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71Qx8wJzJ0SL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71KqJ8rQqSL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71K8wJzJ0SL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71Qx8wJzJ0SL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL.jpg',
  'https://m.media-amazon.com/images/I/71KqJ8rQqSL.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1080_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SY879_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SX679_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1000_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1200_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL1600_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL2000_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL2500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL3000_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL3500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL4000_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL4500_.jpg',
  'https://m.media-amazon.com/images/I/71QxJ8rQqSL._AC_SL5000_.jpg',
];

for (const url of candidates) {
  const r = await fetch(url);
  if (r.ok) console.log('OK', url);
}
