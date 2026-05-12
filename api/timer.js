module.exports = (req, res) => {
  const duration = parseInt(req.query.duration) || 3600;
  const color = (req.query.color || 'fd7e14').replace('#', '');
  
  const r = parseInt(color.substring(0,2), 16);
  const g = parseInt(color.substring(2,4), 16);
  const b = parseInt(color.substring(4,6), 16);

  const h = Math.floor(duration / 3600);
  const m = Math.floor((duration % 3600) / 60);
  const s = duration % 60;

  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${pad(h)}:${pad(m)}:${pad(s)}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="140">
    <rect width="400" height="140" fill="white" rx="8"/>
    <text x="200" y="75" font-family="Arial" font-size="64" font-weight="bold" 
      fill="rgb(${r},${g},${b})" text-anchor="middle" dominant-baseline="middle"
      letter-spacing="4">${timeStr}</text>
    <text x="88" y="115" font-family="Arial" font-size="13" 
      fill="rgb(${r},${g},${b})" text-anchor="middle">HOURS</text>
    <text x="200" y="115" font-family="Arial" font-size="13" 
      fill="rgb(${r},${g},${b})" text-anchor="middle">MINUTES</text>
    <text x="312" y="115" font-family="Arial" font-size="13" 
      fill="rgb(${r},${g},${b})" text-anchor="middle">SECONDS</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(svg);
};
