const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const srcPath = path.join(__dirname, '..', 'public', 'logo-babul-khaer.png');
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const logo = sharp(srcPath);
  const { data, info } = await logo.raw().toBuffer({ resolveWithObject: true });

  // 1. Create pure white silhouette of the logo
  const whiteData = Buffer.from(data);
  for (let i = 0; i < whiteData.length; i += 4) {
    if (whiteData[i + 3] > 20) {
      whiteData[i] = 255;     // R
      whiteData[i + 1] = 255; // G
      whiteData[i + 2] = 255; // B
      // keep alpha as is for smooth anti-aliasing
    }
  }

  const whiteLogoBuffer = await sharp(whiteData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  // Version 1: White logo on vibrant Emerald (#047857) background
  // For maskable icon: Android maskable safe zone is inner 66%-80%, so size ~340 on 512
  const whiteLogo340 = await sharp(whiteLogoBuffer)
    .resize(340, 340, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 4, g: 120, b: 87, alpha: 1 } // #047857 emerald
    }
  })
  .composite([{ input: whiteLogo340, gravity: 'center' }])
  .png()
  .toFile(path.join(iconsDir, 'test-white-on-emerald.png'));

  // Version 2: Green logo on White (#FFFFFF) background
  const greenLogo340 = await sharp(srcPath)
    .resize(340, 340, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // #FFFFFF
    }
  })
  .composite([{ input: greenLogo340, gravity: 'center' }])
  .png()
  .toFile(path.join(iconsDir, 'test-green-on-white.png'));

  // Version 3: Emerald background with a crisp white circular card in center
  const badgeSvg = Buffer.from(
    `<svg width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <radialGradient id="grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="100%" stop-color="#047857"/>
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="512" height="512" fill="url(#grad)"/>
      <circle cx="256" cy="256" r="176" fill="#ffffff" filter="url(#shadow)"/>
    </svg>`
  );

  const greenLogoForBadge = await sharp(srcPath)
    .resize(255, 255, { fit: 'inside' })
    .toBuffer();

  await sharp(badgeSvg)
    .composite([{ input: greenLogoForBadge, gravity: 'center' }])
    .png()
    .toFile(path.join(iconsDir, 'test-badge.png'));

  console.log('Test icons generated successfully!');
}

generateIcons().catch(console.error);
