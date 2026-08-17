const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const logoPath = path.resolve(__dirname, '../public/dre-logo.png');
  const publicDir = path.resolve(__dirname, '../public');

  if (!fs.existsSync(logoPath)) {
    console.error('Logo file not found:', logoPath);
    return;
  }

  console.log('Generating PWA icons from:', logoPath);

  // 1. Generate 192x192 Icon
  const logo192 = await sharp(logoPath)
    .resize(150, 150, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: logo192, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created: pwa-192x192.png');

  // 2. Generate 512x512 Icon
  const logo512 = await sharp(logoPath)
    .resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: logo512, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created: pwa-512x512.png');

  // 3. Generate 512x512 Maskable Icon (safe zone ~60% size with clean white background)
  const logoMaskable = await sharp(logoPath)
    .resize(320, 320, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: logoMaskable, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created: pwa-maskable-512x512.png');

  // 4. Generate Apple Touch Icon 180x180
  const logoApple = await sharp(logoPath)
    .resize(140, 140, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: logoApple, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created: apple-touch-icon.png');

  // 5. Generate Favicon 64x64
  const logoFavicon = await sharp(logoPath)
    .resize(52, 52, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: logoFavicon, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created: favicon.png');
}

generateIcons().catch(console.error);
