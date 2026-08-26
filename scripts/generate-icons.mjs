import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')
const publicDirectory = resolve(projectRoot, 'docs/public')
const mark = await readFile(resolve(publicDirectory, 'logo-mark.svg'))

async function renderIcon(filename, size) {
  await sharp(mark).resize(size, size).png().toFile(resolve(publicDirectory, filename))
}

await Promise.all([
  renderIcon('favicon-32x32.png', 32),
  renderIcon('apple-touch-icon.png', 180),
  renderIcon('pwa-192x192.png', 192),
  renderIcon('pwa-512x512.png', 512)
])

const safeMark = await sharp(mark).resize(372, 372).png().toBuffer()
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: '#0B1530'
  }
})
  .composite([{ input: safeMark, left: 70, top: 70 }])
  .png()
  .toFile(resolve(publicDirectory, 'pwa-maskable-512x512.png'))

console.log('Generated JinLingBlog favicon and PWA icons.')
