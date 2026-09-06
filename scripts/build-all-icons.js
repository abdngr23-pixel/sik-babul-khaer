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

  const logoSharp = sharp(srcLogoPath);
  const { data, info } = await logoSharp.raw().toBuffer({ resolveWithObject: true });

  // Convert all non-transparent pixels to pure crisp white (#FFFFFF)
  // Preserving original anti-aliased alpha channel for perfect smoothness
  const whiteData = Buffer.from(data);
  for (let i = 0; i < whiteData.length; i += 4) {
    if (whiteData[i + 3] > 15) {
      whiteData[i] = 255;     // R
      whiteData[i + 1] = 255; // G
      whiteData[i + 2] = 255; // B
    }
  }

  const whiteLogoBuffer = await sharp(whiteData, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  const emeraldBg = { r: 4, g: 120, b: 87, alpha: 1 }; // #047857 brand color

  // Helper function to create an icon with given canvas size and logo size
  async function createEmeraldIcon(canvasSize, logoMaxDimension, outputPath) {
    const resizedLogo = await sharp(whiteLogoBuffer)
      .resize(logoMaxDimension, logoMaxDimension, { fit: 'inside' })
      .toBuffer();

    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: emeraldBg
      }
    })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toFile(outputPath);

    console.log(`Generated (${canvasSize}x${canvasSize}): ${outputPath}`);
  }

  // 1. icon-512.png (512x512, logo ~320px)
  await createEmeraldIcon(512, 320, path.join(iconsDir, 'icon-512.png'));

  // 2. icon-maskable-512.png (512x512, logo 310px — perfectly within 80% safe-zone 409px circle)
  await createEmeraldIcon(512, 310, path.join(iconsDir, 'icon-maskable-512.png'));

  // 3. icon-192.png (192x192, logo ~120px)
  await createEmeraldIcon(192, 120, path.join(iconsDir, 'icon-192.png'));

  // 4. apple-touch-icon.png (180x180, logo ~115px)
  await createEmeraldIcon(180, 115, path.join(rootDir, 'public', 'apple-touch-icon.png'));

  // 5. Next.js App Router icon.png (512x512)
  await createEmeraldIcon(512, 320, path.join(appDir, 'icon.png'));

  // 6. Next.js App Router apple-icon.png (180x180)
  await createEmeraldIcon(180, 115, path.join(appDir, 'apple-icon.png'));

  // Clean up temporary test files
  const testFiles = ['test-white-on-emerald.png', 'test-green-on-white.png', 'test-badge.png', 'test-preview-192.png'];
  for (const f of testFiles) {
    const p = path.join(iconsDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log('All high-contrast PWA and favicon icons generated successfully!');
}

buildAllIcons().catch(console.error);
