/**
 * VitePress reads each page's "last updated" time (shown on the page and used as
 * the sitemap <lastmod>) from git history. Cloudflare Pages builds from a shallow
 * clone, so every page would get the time of the latest commit. Fetch the full
 * history first when the clone is shallow. Never fails the build.
 */
import { execFileSync } from 'node:child_process'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

try {
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    console.log('[ensure-git-history] shallow clone detected, fetching full history…')
    git('fetch', '--unshallow', '--quiet')
    console.log('[ensure-git-history] done')
  }
} catch (error) {
  const reason = error instanceof Error ? error.message.split('\n')[0] : String(error)
  console.warn(`[ensure-git-history] skipped: ${reason}`)
  console.warn('[ensure-git-history] page update times may all equal the latest commit')
}
