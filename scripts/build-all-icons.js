const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildAllIcons() {
  const rootDir = path.join(__dirname, '..');
  const srcLogoPath = path.join(rootDir, 'public', 'logo-babul-khaer.png');
  const iconsDir = path.join(rootDir, 'public', 'icons');
  const appDir = path.join(rootDir, 'app');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const whiteBg = { r: 255, g: 255, b: 255, alpha: 1 }; // Pure white #FFFFFF

  // Helper function to create an icon with given canvas size and logo size on white background
  async function createWhiteIcon(canvasSize, logoMaxDimension, outputPath) {
    const resizedLogo = await sharp(srcLogoPath)
      .resize(logoMaxDimension, logoMaxDimension, { fit: 'inside' })
      .toBuffer();

    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: whiteBg
      }
    })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toFile(outputPath);

    console.log(`Generated (${canvasSize}x${canvasSize}): ${outputPath}`);
  }

  // 1. icon-512.png (512x512, logo ~320px)
  await createWhiteIcon(512, 320, path.join(iconsDir, 'icon-512.png'));

  // 2. icon-maskable-512.png (512x512, logo 310px — within safe-zone circle)
  await createWhiteIcon(512, 310, path.join(iconsDir, 'icon-maskable-512.png'));

  // 3. icon-192.png (192x192, logo ~120px)
  await createWhiteIcon(192, 120, path.join(iconsDir, 'icon-192.png'));

  // 4. apple-touch-icon.png (180x180, logo ~115px)
  await createWhiteIcon(180, 115, path.join(rootDir, 'public', 'apple-touch-icon.png'));

  // 5. Next.js App Router icon.png (512x512)
  await createWhiteIcon(512, 320, path.join(appDir, 'icon.png'));

  // 6. Next.js App Router apple-icon.png (180x180)
  await createWhiteIcon(180, 115, path.join(appDir, 'apple-icon.png'));

  // Clean up temporary test files
  const testFiles = ['test-white-on-emerald.png', 'test-green-on-white.png', 'test-badge.png', 'test-preview-192.png', 'test-white-icon.png'];
  for (const f of testFiles) {
    const p = path.join(iconsDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log('All icons generated successfully with pure white background!');
}

buildAllIcons().catch(console.error);
