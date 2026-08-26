/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GISCUS_REPO?: `${string}/${string}`
  readonly VITE_GISCUS_REPO_ID?: string
  readonly VITE_GISCUS_CATEGORY?: string
  readonly VITE_GISCUS_CATEGORY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
