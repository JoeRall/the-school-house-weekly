import glob from "fast-glob"

interface Article {
  title: string
  description: string
  author: string
  date: string
  folder: "madison" | "grace" | "music"
}

export interface ArticleWithSlug extends Article {
  slug: string
}

async function importArticle(
  articleFilename: string,
  subFolder: string,
): Promise<ArticleWithSlug> {
  let { article } = (await import(
    `../app/articles${subFolder ? `/${subFolder}` : ""}/${articleFilename}`
  )) as {
    default: React.ComponentType
    article: Article
  }

  return {
    slug: articleFilename.replace(/(\/page)?\.mdx$/, ""),
    ...article,
  }
}
export function SortBy<T>(
  items: T[],
  selector: (i: T) => number | string,
  reverse = false,
) {
  if (!items) return []

  return items.sort((a, b) => {
    const a1 = selector(a)
    const b1 = selector(b)

    if (a1 == b1) return 0
    if (a1 < b1) {
      return reverse ? 1 : -1
    }

    return reverse ? -1 : 1
  })
}

function sortArticles(articles: ArticleWithSlug[]) {
  return articles.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}

type SubFolder = "madison" | "grace"
export async function getArticlesForSubFolder(
  subFolder: SubFolder | "" = "",
  sort = false,
) {
  const files = await glob("**/*/page.mdx", {
    cwd: `./src/app/articles${subFolder ? `/${subFolder}` : ""}`,
  })
  const articles = await Promise.all(
    files.map((f) => importArticle(f, subFolder)),
  )
  return sort ? sortArticles(articles) : articles
}

export async function getAllArticles() {
  // const subFolders: SubFolder[] = ["madison", "grace"]

  // const all: ArticleWithSlug[] = []

  // for (const folder of subFolders) {
  //   const articles = await getArticlesForSubFolder(folder)
  //   all.push(...articles)
  // }

  const all = await getArticlesForSubFolder("", false)

  return sortArticles(all)
}
