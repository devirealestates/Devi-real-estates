export default async function handler(req, res) {
  const { id } = req.query || {};

  if (!id) {
    return res.redirect(302, '/');
  }

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/devirealestates-a550f/databases/(default)/documents/properties/${id}`;
    const response = await fetch(firestoreUrl);
    
    let title = 'Devi Real Estates - Premium Real Estate Platform';
    let description = 'Discover luxury real estate with Devi Real Estates - your trusted partner for premium properties.';
    let image = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200';
    let price = '';
    let location = '';

    if (response.ok) {
      const data = await response.json();
      const fields = data.fields || {};

      title = fields.title?.stringValue || title;
      location = fields.location?.stringValue || '';
      price = formatPriceWithSlash(fields.price?.stringValue || '');

      const imagesArray = fields.images?.arrayValue?.values || [];
      if (imagesArray.length > 0 && imagesArray[0].stringValue) {
        image = imagesArray[0].stringValue;
      }

      if (location && price) {
        description = `📍 Location: ${location} | 💰 Price: ${price} | Devi Real Estates`;
      } else if (fields.description?.stringValue) {
        description = fields.description.stringValue.substring(0, 160);
      }
    }

    // Return HTML with Open Graph & Twitter meta tags for WhatsApp and other social scrapers
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} | Devi Real Estates</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://devi-real-estates.vercel.app/property/${id}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Devi Real Estates">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <!-- Automatic client redirect for browser users -->
  <meta http-equiv="refresh" content="0;url=/property/${id}">
  <script>
    window.location.replace('/property/${id}');
  </script>
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb;">
  <div style="text-align: center; padding: 20px;">
    <h2>Redirecting to ${escapeHtml(title)}...</h2>
    <p><a href="/property/${id}" style="color: #059669; font-weight: bold;">Click here if you are not redirected automatically</a></p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error generating property share page:', error);
    return res.redirect(302, `/property/${id}`);
  }
}

function formatPriceWithSlash(price) {
  if (!price && price !== 0) return '';
  let str = String(price).trim();
  if (!str) return '';
  if (str.endsWith('/-') || str.endsWith('/ -')) {
    return str.replace(/\/ -$/, '/-');
  }
  const perPeriodRegex = /(\s*\/\s*(?:month|mo|year|yr|day|night|week|sq\.?\s*ft|acre|cent|sq\.?\s*yd|annum\b.*))$/i;
  const match = str.match(perPeriodRegex);
  if (match) {
    const period = match[0];
    const base = str.slice(0, -period.length).trim();
    if (base.endsWith('/-') || base.endsWith('/ -')) {
      return `${base.replace(/\/ -$/, '/-')}${period}`;
    }
    return `${base}/-${period}`;
  }
  if (str.endsWith('/')) {
    return `${str}-`;
  }
  return `${str}/-`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
