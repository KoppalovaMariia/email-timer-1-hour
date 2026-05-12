export default async function handler(req, res) {
  const { ImageResponse } = await import('@vercel/og');
  
  const duration = parseInt(req.query.duration) || 3600;
  const color = '#' + (req.query.color || 'fd7e14').replace('#', '');

  const rem = Math.max(0, duration);
  const h = Math.floor(rem / 3600);
  const m = Math.floor((rem % 3600) / 60);
  const s = rem % 60;
  const pad = n => String(n).padStart(2, '0');

  const image = new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          width: '400px',
          height: '120px',
          background: 'white',
          fontFamily: 'sans-serif',
        },
        children: [
          { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [
            { type: 'span', props: { style: { fontSize: 64, fontWeight: 500, color }, children: pad(h) } },
            { type: 'span', props: { style: { fontSize: 12, color, letterSpacing: 2 }, children: 'HOURS' } },
          ]}},
          { type: 'span', props: { style: { fontSize: 56, color, paddingBottom: 20 }, children: ':' } },
          { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [
            { type: 'span', props: { style: { fontSize: 64, fontWeight: 500, color }, children: pad(m) } },
            { type: 'span', props: { style: { fontSize: 12, color, letterSpacing: 2 }, children: 'MINUTES' } },
          ]}},
          { type: 'span', props: { style: { fontSize: 56, color, paddingBottom: 20 }, children: ':' } },
          { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [
            { type: 'span', props: { style: { fontSize: 64, fontWeight: 500, color }, children: pad(s) } },
            { type: 'span', props: { style: { fontSize: 12, color, letterSpacing: 2 }, children: 'SECONDS' } },
          ]}},
        ],
      },
    },
    { width: 400, height: 120 }
  );

  const arrayBuffer = await image.arrayBuffer();
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(Buffer.from(arrayBuffer));
}
