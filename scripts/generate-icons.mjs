import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')
const publicDirectory = resolve(projectRoot, 'docs/public')
const masterPath = resolve(publicDirectory, 'jlg-logo-master.png')

async function coloredMark(color, size) {
  const alpha = await sharp(masterPath)
    .resize(size, size, { fit: 'contain' })
    .extractChannel('alpha')
    .raw()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: color
    }
  })
    .joinChannel(alpha, {
      raw: {
        width: size,
        height: size,
        channels: 1
      }
    })
    .png()
    .toBuffer()
}

async function renderTransparentMark(filename, color, size) {
  const mark = await coloredMark(color, size)
  await sharp(mark).png().toFile(resolve(publicDirectory, filename))
}

await Promise.all([
  renderTransparentMark('logo-mark-light.png', '#5B5BD6', 512),
  renderTransparentMark('logo-mark-dark.png', '#A5B4FC', 512),
  renderTransparentMark('favicon-32x32.png', '#5B5BD6', 32)
])

async function renderAppIcon(filename, size, safeArea = 0.72) {
  const markSize = Math.round(size * safeArea)
  const offset = Math.round((size - markSize) / 2)
  const mark = await coloredMark('#A5B4FC', markSize)

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#101218'
    }
  })
    .composite([{ input: mark, left: offset, top: offset }])
    .png()
    .toFile(resolve(publicDirectory, filename))
}

await Promise.all([
  renderAppIcon('apple-touch-icon.png', 180, 0.76),
  renderAppIcon('pwa-192x192.png', 192, 0.76),
  renderAppIcon('pwa-512x512.png', 512, 0.76),
  renderAppIcon('pwa-maskable-512x512.png', 512, 0.62)
])

const ogMark = await coloredMark('#A5B4FC', 310)
const ogMarkData = ogMark.toString('base64')
const ogSvg = Buffer.from(`
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="78%" cy="20%" r="80%">
        <stop offset="0" stop-color="#1B4C4A"/>
        <stop offset="0.48" stop-color="#171A2B"/>
        <stop offset="1" stop-color="#101218"/>
      </radialGradient>
      <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
        <path d="M42 0H0V42" fill="none" stroke="#8B8CF8" stroke-opacity="0.1"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <image href="data:image/png;base64,${ogMarkData}" x="74" y="158" width="310" height="310"/>
    <text x="430" y="267" fill="#EEF1F7" font-family="Inter, Segoe UI, sans-serif" font-size="76" font-weight="750">JinLingBlog</text>
    <text x="434" y="342" fill="#A5B4FC" font-family="Consolas, monospace" font-size="32" letter-spacing="3">CODE. LOG. SHARE.</text>
    <path d="M434 383H1060" stroke="#2DD4BF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <text x="434" y="442" fill="#AAB3C2" font-family="Inter, Segoe UI, sans-serif" font-size="25">Build a durable knowledge system.</text>
  </svg>
`)

await sharp(ogSvg).png().toFile(resolve(publicDirectory, 'og.png'))

console.log('Generated JinLingBlog dual-theme logo, favicon, PWA icons and social card.')
