const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

module.exports = async (req, res) => {
  // duration in seconds, default 3600 (1 hour)
  const duration = parseInt(req.query.duration) || 3600;
  
  // color customization
  const bgColor = '#' + (req.query.bg || 'ffffff');
  const textColor = '#' + (req.query.color || 'fd7e14');
  const fontSize = parseInt(req.query.size) || 60;

  const width = 400;
  const height = 140;
  const frames = 60; // 60 seconds of animation then loops

  const encoder = new GIFEncoder(width, height);
  const chunks = [];

  encoder.createReadStream().on('data', chunk => chunks.push(chunk));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(1000);
  encoder.setQuality(10);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < frames; i++) {
    let remaining = Math.max(0, duration - i);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Timer digits
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const timeStr = `${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`;
    ctx.fillText(timeStr, width / 2, height / 2 - 10);

    // Labels
    ctx.font = '13px Arial';
    ctx.fillText('HOURS              MINUTES              SECONDS', width / 2, height / 2 + 40);

    encoder.addFrame(ctx);
  }

  encoder.finish();

  await new Promise(resolve => setTimeout(resolve, 100));

  const gif = Buffer.concat(chunks);
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.send(gif);
};
