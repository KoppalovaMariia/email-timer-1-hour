const omggif = require('omggif');

function encodeGIF(frames, width, height, delay) {
  const buf = Buffer.alloc(width * height * frames.length * 4 + 1024);
  const gw = new omggif.GifWriter(buf, width, height, { loop: 0 });
  
  for (const frame of frames) {
    gw.addFrame(0, 0, width, height, frame.pixels, {
      palette: frame.palette,
      delay: delay
    });
  }
  
  return buf.slice(0, gw.end());
}

function renderDigits(pixels, palette, width, digitStr, x, y, scale, colorIdx) {
  const SEGMENTS = {
    '0': [1,1,1,0,1,1,1],
    '1': [0,0,1,0,0,1,0],
    '2': [1,0,1,1,1,0,1],
    '3': [1,0,1,1,0,1,1],
    '4': [0,1,1,1,0,1,0],
    '5': [1,1,0,1,0,1,1],
    '6': [1,1,0,1,1,1,1],
    '7': [1,0,1,0,0,1,0],
    '8': [1,1,1,1,1,1,1],
    '9': [1,1,1,1,0,1,1],
    ':': [0,0,0,0,0,0,0]
  };

  const sw = scale * 3;
  const sh = scale;
  const gap = scale;
  const charW = sw + gap * 2 + 2;

  let cx = x;
  for (const ch of digitStr) {
    if (ch === ':') {
      const dotY1 = y + sh + gap;
      const dotY2 = y + sh * 3 + gap * 3;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const p1 = (dotY1 + dy) * width + (cx + dx);
          const p2 = (dotY2 + dy) * width + (cx + dx);
          if (p1 >= 0 && p1 < pixels.length) pixels[p1] = colorIdx;
          if (p2 >= 0 && p2 < pixels.length) pixels[p2] = colorIdx;
        }
      }
      cx += scale + gap * 2;
      continue;
    }

    const seg = SEGMENTS[ch] || SEGMENTS['8'];
    const segs = [
      { r: y,                    c: cx + gap,     w: sw, h: sh, on: seg[0] },
      { r: y + sh,               c: cx,           w: sh, h: sw, on: seg[1] },
      { r: y + sh,               c: cx + gap + sw, w: sh, h: sw, on: seg[2] },
      { r: y + sh + sw + gap,    c: cx + gap,     w: sw, h: sh, on: seg[3] },
      { r: y + sh + sw + gap + sh, c: cx,         w: sh, h: sw, on: seg[4] },
      { r: y + sh + sw + gap + sh, c: cx + gap + sw, w: sh, h: sw, on: seg[5] },
      { r: y + sh*2 + sw*2 + gap*2, c: cx + gap, w: sw, h: sh, on: seg[6] },
    ];

    for (const s of segs) {
      if (!s.on) continue;
      for (let dy = 0; dy < s.h; dy++) {
        for (let dx = 0; dx < s.w; dx++) {
          const p = (s.r + dy) * width + (s.c + dx);
          if (p >= 0 && p < pixels.length) pixels[p] = colorIdx;
        }
      }
    }
    cx += charW;
  }
}

module.exports = (req, res) => {
  const duration = parseInt(req.query.duration) || 3600;
  const colorHex = (req.query.color || 'fd7e14').replace('#', '');
  const r = parseInt(colorHex.substring(0,2), 16);
  const g = parseInt(colorHex.substring(2,4), 16);
  const b = parseInt(colorHex.substring(4,6), 16);

  const width = 200;
  const height = 80;
  const scale = 5;
  const numFrames = 60;
  const palette = [0xFFFFFF, (r << 16) | (g << 8) | b];

  const frames = [];
  for (let i = 0; i < numFrames; i++) {
    const rem = Math.max(0, duration - i);
    const hh = Math.floor(rem / 3600);
    const mm = Math.floor((rem % 3600) / 60);
    const ss = rem % 60;
    const pad = n => String(n).padStart(2, '0');
    const str = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;

    const pixels = new Uint8Array(width * height).fill(0);
    renderDigits(pixels, palette, width, str, 10, 15, scale, 1);
    frames.push({ pixels, palette });
  }

  const gif = encodeGIF(frames, width, height, 100);

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(gif);
};
