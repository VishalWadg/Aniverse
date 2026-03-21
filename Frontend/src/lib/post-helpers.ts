const CATEGORY_RULES = [
  { label: 'One Piece', keywords: ['one piece', 'luffy', 'imu', 'void century', 'straw hat'] },
  { label: 'Jujutsu Kaisen', keywords: ['jujutsu kaisen', 'jjk', 'gojo', 'sukuna', 'gege'] },
  { label: 'Berserk', keywords: ['berserk', 'guts', 'griffith', 'miura'] },
  { label: 'Naruto', keywords: ['naruto', 'sasuke', 'konoha', 'boruto'] },
  { label: 'Leaks', keywords: ['spoiler', 'spoilers', 'raw scan', 'raw scans', 'leak', 'leaks'] },
  { label: 'Art', keywords: ['cover art', 'cover', 'linework', 'illustration', 'art'] },
  { label: 'Editorial', keywords: ['editorial', 'industry', 'weekly', 'bi-weekly', 'mangaka', 'format'] },
]

export function stripHtml(value = '') {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getExcerpt(value = '', maxLength = 220) {
  const text = stripHtml(value)

  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

export function extractImageSource(value = '') {
  const match = value.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  return match?.[1] ?? null
}

export function getDisplayName(author) {
  return author?.username || author?.name || 'anonymous'
}

export function getInitials(value = 'anonymous') {
  const cleanValue = value.replace(/^u\//i, '').trim()
  const parts = cleanValue.split(/[\s._-]+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
  return initials || 'AN'
}

export function inferCategory(post) {
  const title = typeof post === 'string' ? post : post?.title ?? ''
  const content = typeof post === 'string' ? '' : post?.content ?? ''
  const haystack = `${title} ${stripHtml(content)}`.toLowerCase()

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.label
    }
  }

  return 'Theory'
}

export function getWordCount(value = '') {
  return stripHtml(value).split(/\s+/).filter(Boolean).length
}

export function estimateReadTime(value = '') {
  return Math.max(1, Math.round(getWordCount(value) / 180))
}

export function formatRelativeTime(value) {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) {
    return 'Just now'
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)}m ago`
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}h ago`
  }

  if (diffMs < day * 7) {
    return `${Math.floor(diffMs / day)}d ago`
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function getHotScore(post) {
  const words = getWordCount(post?.content ?? '')
  const createdAt = post?.createdAt ? new Date(post.createdAt).getTime() : Date.now()
  const hoursSincePublished = Math.max(0, (Date.now() - createdAt) / (1000 * 60 * 60))
  const freshness = Math.max(0, 72 - hoursSincePublished)
  return words / 12 + freshness
}

export function matchesSearch(post, query = '') {
  if (!query) {
    return true
  }

  const haystack = `${post?.title ?? ''} ${stripHtml(post?.content ?? '')} ${getDisplayName(post?.author)}`.toLowerCase()
  return haystack.includes(query.toLowerCase())
}
