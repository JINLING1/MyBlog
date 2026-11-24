/**
 * Tell search engines about the site's pages right after a deploy.
 *
 *   pnpm submit:urls             submit every URL in the live sitemap
 *   pnpm submit:urls --dry-run   only list the URLs
 *
 * Reads from the environment or `.env.local` (never committed):
 *   SITE_URL          defaults to https://jinling-blog.pages.dev
 *   BAIDU_PUSH_TOKEN  token from 百度搜索资源平台 → 普通收录 → API 提交
 *   INDEXNOW_KEY      any 8–128 character key (letters, digits, -). The same value
 *                     must be set in Cloudflare Pages so the build publishes
 *                     /<key>.txt. Used by Bing, Yandex and other IndexNow engines.
 */
import fs from 'node:fs'

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const origin = (process.env.SITE_URL || 'https://jinling-blog.pages.dev').replace(/\/$/, '')
const { BAIDU_PUSH_TOKEN, INDEXNOW_KEY } = process.env
const dryRun = process.argv.includes('--dry-run')

async function readSitemap() {
  const response = await fetch(`${origin}/sitemap.xml`)
  if (!response.ok) throw new Error(`读取 sitemap 失败：HTTP ${response.status}`)
  const xml = await response.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
  const foreign = urls.filter((url) => !url.startsWith(`${origin}/`))
  if (foreign.length) {
    throw new Error(
      `sitemap 中有 ${foreign.length} 个地址不属于 ${origin}（例如 ${foreign[0]}）。` +
        '请先部署修正后的版本，或检查 SITE_URL。'
    )
  }
  return urls
}

async function submitToBaidu(urls) {
  // HTTPS 站点在百度平台登记时带协议，site 参数要与之一致
  const endpoint =
    `http://data.zz.baidu.com/urls?site=${encodeURIComponent(origin)}` +
    `&token=${encodeURIComponent(BAIDU_PUSH_TOKEN)}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n')
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.error) {
    throw new Error(`百度推送失败：${result.message || `HTTP ${response.status}`}`)
  }
  console.log(`百度：成功推送 ${result.success} 条，今日剩余配额 ${result.remain}`)
  if (result.not_same_site?.length) console.log('  不属于该站点的地址：', result.not_same_site)
  if (result.not_valid?.length) console.log('  无效地址：', result.not_valid)
}

async function submitToIndexNow(urls) {
  const keyUrl = `${origin}/${INDEXNOW_KEY}.txt`
  const keyResponse = await fetch(keyUrl)
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== INDEXNOW_KEY) {
    throw new Error(
      `IndexNow 密钥文件 ${keyUrl} 不可访问或内容不符。` +
        '请在 Cloudflare Pages 设置相同的 INDEXNOW_KEY 并重新部署。'
    )
  }
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(origin).host, key: INDEXNOW_KEY, keyLocation: keyUrl, urlList: urls })
  })
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow 提交失败：HTTP ${response.status} ${await response.text()}`)
  }
  console.log(`IndexNow：已提交 ${urls.length} 条（HTTP ${response.status}）`)
}

const urls = await readSitemap().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
console.log(`从 ${origin}/sitemap.xml 读取到 ${urls.length} 个地址`)

if (dryRun) {
  for (const url of urls) console.log(`  ${url}`)
  process.exit(0)
}

if (!BAIDU_PUSH_TOKEN && !INDEXNOW_KEY) {
  console.log('未设置 BAIDU_PUSH_TOKEN 或 INDEXNOW_KEY，没有可提交的目标。')
  process.exit(1)
}

let failed = false
for (const [name, enabled, submit] of [
  ['百度', BAIDU_PUSH_TOKEN, submitToBaidu],
  ['IndexNow', INDEXNOW_KEY, submitToIndexNow]
]) {
  if (!enabled) {
    console.log(`${name}：未配置，跳过`)
    continue
  }
  try {
    await submit(urls)
  } catch (error) {
    failed = true
    console.error(error instanceof Error ? error.message : error)
  }
}
process.exit(failed ? 1 : 0)
