const omggif = require('omggif');

module.exports = (req, res) => {
  const duration = parseInt(req.query.duration) || 3600;
  const colorHex = (req.query.color || 'fd7e14').replace('#', '');
  const r = parseInt(colorHex.substring(0,2), 16);
  const g = parseInt(colorHex.substring(2,4), 16);
  const b = parseInt(colorHex.substring(4,6), 16);

  const W = 300, H = 80;
  // palette: 0=white, 1=orange
  const palette = [0xFFFFFF, (r<<16)|(g<<8)|b];

  // Simple 5x7 pixel font
  const FONT = {
    '0':['11100','10010','10010','10010','10010','10010','11100'],
    '1':['00100','01100','00100','00100','00100','00100','01110'],
    '2':['11100','00010','00010','01100','10000','10000','11110'],
    '3':['11110','00010','00010','01110','00010','00010','11110'],
    '4':['10010','10010','10010','11110','00010','00010','00010'],
    '5':['11110','10000','10000','11100','00010','00010','11100'],
    '6':['01110','10000','10000','11100','10010','10010','11100'],
    '7':['11110','00010','00100','00100','01000','01000','01000'],
    '8':['11100','10010','10010','11100','10010','10010','11100'],
    '9':['11100','10010','10010','11110','00010','00010','11100'],
    ':':['00','00','01','00','01','00','00'],
  };

  function drawChar(pixels, ch, startX, startY, scale) {
    const rows = FONT[ch] || FONT['0'];
    for (let row = 0; row < rows.length; row++) {
      for (let col = 0; col < rows[row].length; col++) {
        if (rows[row][col] === '1') {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = startX + col * scale + sx;
              const py = startY + row * scale + sy;
              if (px >= 0 && px < W && py >= 0 && py < H) {
                pixels[py * W + px] = 1;
              }
            }
          }
        }
      }
    }
  }

  function drawString(pixels, str, startX, startY, scale) {
    let x = startX;
    for (const ch of str) {
      const w = ch === ':' ? 2 : 5;
      drawChar(pixels, ch, x, startY, scale);
      x += (w + 1) * scale;
    }
    return x;
  }

  function drawLabel(pixels, label, centerX, y) {
    // Draw label as tiny dots pattern — skip for simplicity, use blank
  }

  const scale = 7;
  const numFrames = 60;
  const frames = [];

  for (let i = 0; i < numFrames; i++) {
    const rem = Math.max(0, duration - i);
    const hh = Math.floor(rem / 3600);
    const mm = Math.floor((rem % 3600) / 60);
    const ss = rem % 60;
    const pad = n => String(n).padStart(2, '0');
    const str = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;

    const pixels = new Uint8Array(W * H).fill(0);
    // Center the string
    const totalW = (2*5 + 2 + 2*5 + 2 + 2*5 + 4*1) * scale + (2*2+1)*scale;
    const startX = Math.floor((W - 238) / 2);
    drawString(pixels, str, startX, 10, scale);
    frames.push(pixels);
  }

  // Encode GIF
  const bufSize = W * H * numFrames * 2 + 2048;
  const buf = Buffer.alloc(bufSize);
  const gw = new omggif.GifWriter(buf, W, H, { loop: 0, palette });

  for (const pixels of frames) {
    gw.addFrame(0, 0, W, H, pixels, { delay: 100 });
  }

  const gif = buf.slice(0, gw.end());
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(gif);
};
