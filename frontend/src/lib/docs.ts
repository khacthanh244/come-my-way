export interface Doc {
  slug: string
  title: string
  content: string
  category: string
}

function categoryOf(slug: string): string {
  if (slug.startsWith('zalopay-api-')) return 'API Reference'
  if (slug.startsWith('merchant-support')) return 'Hỗ trợ Merchant'
  return 'Hướng dẫn tích hợp'
}

const modules = import.meta.glob('../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) meta[kv[1]] = kv[2].trim()
  }
  return { meta, body: raw.slice(m[0].length) }
}

function titleOf(meta: Record<string, string>, body: string, slug: string): string {
  if (meta.api_name) return meta.api_name
  const h1 = body.match(/^#\s+(.+)$/m)
  return h1 ? h1[1].trim() : slug
}

export const docs: Doc[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { meta, body } = splitFrontmatter(raw)
    return { slug, title: titleOf(meta, body, slug), content: body, category: categoryOf(slug) }
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title))

export function headingsOf(doc: Doc): { text: string; id: string; level: number }[] {
  const out: { text: string; id: string; level: number }[] = []
  for (const m of doc.content.matchAll(/^(##|###)\s+(.+)$/gm)) {
    const text = m[2].replace(/[*`]/g, '').trim()
    out.push({ text, id: slugify(text), level: m[1].length })
  }
  return out
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
