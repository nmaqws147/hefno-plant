const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    table[n] = v;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crcV = Buffer.alloc(4);
  crcV.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeB, data, crcV]);
}

function png(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

function hex(c) {
  return {
    r: parseInt(c.slice(1, 3), 16),
    g: parseInt(c.slice(3, 5), 16),
    b: parseInt(c.slice(5, 7), 16),
  };
}

function lerp(a, b, t) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

const W = 1200;
const H = 630;

const colors = [hex('#1a3c34'), hex('#2d6a4f'), hex('#40916c')];
const gold1 = hex('#d4a373');
const gold2 = hex('#b5835a');

const pixels = Buffer.alloc(W * H * 4);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const t = (x / W + y / H) / 2;
    const c = t < 0.5
      ? lerp(colors[0], colors[1], t * 2)
      : lerp(colors[1], colors[2], (t - 0.5) * 2);

    const dx = x - 950;
    const dy = y - 500;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let r = c.r, g = c.g, b = c.b;

    if (dist < 220) {
      const f = 1 - dist / 220;
      const blend = f * 0.35;
      r = r + (gold1.r - r) * blend;
      g = g + (gold1.g - g) * blend;
      b = b + (gold1.b - b) * blend;
    }

    pixels[i] = Math.min(255, Math.max(0, Math.round(r)));
    pixels[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    pixels[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
    pixels[i + 3] = 255;
  }
}

const img = png(W, H, pixels);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'og-image.png'), img);
console.log(`OG image generated: ${img.length} bytes`);
