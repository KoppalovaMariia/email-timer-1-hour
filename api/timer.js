module.exports = (req, res) => {
  const duration = parseInt(req.query.duration) || 3600;
  const color = (req.query.color || 'fd7e14').replace('#', '');

  const frames = [];
  for (let i = 0; i < 60; i++) {
    const rem = Math.max(0, duration - i);
    const h = Math.floor(rem / 3600);
    const m = Math.floor((rem % 3600) / 60);
    const s = rem % 60;
    const pad = n => String(n).padStart(2, '0');
    frames.push(`${pad(h)}:${pad(m)}:${pad(s)}`);
  }

  const animValues = frames.map(f => f).join(';');
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <rect width="400" height="120" fill="white" rx="12"/>
  
  <!-- Hours -->
  <text x="85" y="72" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="500" fill="#${color}" text-anchor="middle">
    <animate attributeName="textContent" dur="60s" repeatCount="indefinite"
      values="${frames.map(f => f.split(':')[0]).join(';')}" calcMode="discrete"/>
  </text>
  <text x="85" y="105" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="400" fill="#${color}" text-anchor="middle" letter-spacing="2">HOURS</text>

  <!-- Separator 1 -->
  <text x="155" y="68" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="400" fill="#${color}" text-anchor="middle">:</text>

  <!-- Minutes -->
  <text x="215" y="72" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="500" fill="#${color}" text-anchor="middle">
    <animate attributeName="textContent" dur="60s" repeatCount="indefinite"
      values="${frames.map(f => f.split(':')[1]).join(';')}" calcMode="discrete"/>
  </text>
  <text x="215" y="105" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="400" fill="#${color}" text-anchor="middle" letter-spacing="2">MINUTES</text>

  <!-- Separator 2 -->
  <text x="283" y="68" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="400" fill="#${color}" text-anchor="middle">:</text>

  <!-- Seconds -->
  <text x="338" y="72" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="500" fill="#${color}" text-anchor="middle">
    <animate attributeName="textContent" dur="60s" repeatCount="indefinite"
      values="${frames.map(f => f.split(':')[2]).join(';')}" calcMode="discrete"/>
  </text>
  <text x="338" y="105" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="400" fill="#${color}" text-anchor="middle" letter-spacing="2">SECONDS</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(svg);
};
