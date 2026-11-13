import { readCategories, type CategoryWithArticles } from './articles'

declare const data: CategoryWithArticles[]
export { data }

export default {
  watch: ['../../*/*.md'],
  load(): CategoryWithArticles[] {
    return readCategories()
  }
}
