import type { OutputData } from '@editorjs/editorjs'

type EditorJsBlock = OutputData['blocks'][number]

function escapeAttribute(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getTextAlignment(element: Element) {
  const textAlign = (element as HTMLElement).style?.textAlign?.trim().toLowerCase()

  if (!textAlign || textAlign === 'left') {
    return undefined
  }

  return textAlign
}

function getListStyle(element: HTMLOListElement | HTMLUListElement) {
  if (element.classList.contains('monolith-checklist')) {
    return 'checklist' as const
  }

  return element.tagName.toLowerCase() === 'ol' ? 'ordered' as const : 'unordered' as const
}

function parseUrlFromCssValue(value = '') {
  const match = value.match(/url\((['"]?)(.*?)\1\)/i)
  return match?.[2] ?? ''
}

function inferEmbedService(value = '') {
  const href = value.toLowerCase()

  if (href.includes('youtube.com') || href.includes('youtu.be')) {
    return 'youtube'
  }

  if (href.includes('vimeo.com')) {
    return 'vimeo'
  }

  if (href.includes('instagram.com')) {
    return 'instagram'
  }

  return null
}

function parseNumericAttribute(value: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function trimHtml(value = '') {
  return value.replace(/^\s+|\s+$/g, '')
}

function createRawBlock(html = ''): EditorJsBlock {
  return {
    type: 'raw',
    data: {
      html,
    },
  }
}

function parseListItem(listItem: HTMLLIElement, fallbackStyle: 'ordered' | 'unordered' | 'checklist') {
  const nestedLists = Array.from(listItem.children).filter(
    (child): child is HTMLUListElement | HTMLOListElement =>
      child instanceof HTMLUListElement || child instanceof HTMLOListElement
  )

  const nestedItems = nestedLists.flatMap((list) => parseListItems(list, fallbackStyle))

  if (fallbackStyle === 'checklist') {
    const label = Array.from(listItem.children).find((child): child is HTMLLabelElement => child instanceof HTMLLabelElement)
    const labelClone = (label ?? listItem).cloneNode(true) as HTMLElement

    labelClone.querySelectorAll('input, ul, ol').forEach((node) => node.remove())

    return {
      content: trimHtml(labelClone.innerHTML),
      meta: {
        checked:
          listItem.getAttribute('data-checked') === 'true' ||
          Boolean(label?.querySelector('input')?.hasAttribute('checked')),
      },
      items: nestedItems,
    }
  }

  const clone = listItem.cloneNode(true) as HTMLElement
  clone.querySelectorAll('ul, ol').forEach((node) => node.remove())

  return {
    content: trimHtml(clone.innerHTML),
    meta: {},
    items: nestedItems,
  }
}

function parseListItems(
  listElement: HTMLUListElement | HTMLOListElement,
  fallbackStyle: 'ordered' | 'unordered' | 'checklist'
) {
  return Array.from(listElement.children)
    .filter((child): child is HTMLLIElement => child instanceof HTMLLIElement)
    .map((item) => parseListItem(item, fallbackStyle))
}

function parseParagraphAsLinkTool(element: HTMLParagraphElement) {
  const childElements = Array.from(element.children)

  if (childElements.length !== 1 || !(childElements[0] instanceof HTMLAnchorElement)) {
    return null
  }

  const anchor = childElements[0]
  const surroundingText = Array.from(element.childNodes)
    .filter((node) => node !== anchor)
    .map((node) => node.textContent ?? '')
    .join('')
    .trim()

  if (surroundingText) {
    return null
  }

  const rel = anchor.getAttribute('rel') ?? ''
  const target = anchor.getAttribute('target') ?? ''

  if (target !== '_blank' || !/noopener|noreferrer/i.test(rel)) {
    return null
  }

  const link = anchor.getAttribute('href') ?? ''
  const title = trimHtml(anchor.innerHTML)

  return {
    type: 'linkTool',
    data: {
      link,
      meta: title && title !== link ? { title } : {},
    },
  } satisfies EditorJsBlock
}

function parseBookmark(element: HTMLAnchorElement) {
  const link = element.getAttribute('href') ?? ''

  if (!link) {
    return createRawBlock(element.outerHTML)
  }

  const title = trimHtml(
    element.querySelector('.monolith-bookmark__title')?.innerHTML ?? element.textContent ?? link
  )
  const description = trimHtml(
    element.querySelector('.monolith-bookmark__description')?.innerHTML ?? ''
  )
  const siteName = trimHtml(
    element.querySelector('.monolith-bookmark__anchor')?.textContent ?? ''
  )
  const imageStyle = element.querySelector('.monolith-bookmark__image')?.getAttribute('style') ?? ''
  const imageUrl = parseUrlFromCssValue(imageStyle)

  const meta: Record<string, any> = {}

  if (title) {
    meta.title = title
  }

  if (description) {
    meta.description = description
  }

  if (siteName) {
    meta.site_name = siteName
  }

  if (imageUrl) {
    meta.image = { url: imageUrl }
  }

  return {
    type: 'linkTool',
    data: {
      link,
      meta,
    },
  } satisfies EditorJsBlock
}

function parseFigure(element: HTMLElement) {
  if (element.classList.contains('monolith-image')) {
    const image = element.querySelector('img')

    if (!image?.getAttribute('src')) {
      return createRawBlock(element.outerHTML)
    }

    return {
      type: 'simple-image',
      data: {
        url: image.getAttribute('src'),
        caption: trimHtml(
          element.querySelector('figcaption')?.innerHTML ?? image.getAttribute('alt') ?? ''
        ),
        withBorder: false,
        withBackground: false,
        stretched: false,
      },
    } satisfies EditorJsBlock
  }

  if (element.classList.contains('monolith-embed')) {
    const iframe = element.querySelector('iframe')
    const embed = iframe?.getAttribute('src') ?? ''
    const service = inferEmbedService(embed)

    if (!embed || !service) {
      return createRawBlock(element.outerHTML)
    }

    return {
      type: 'embed',
      data: {
        service,
        source: embed,
        embed,
        width: parseNumericAttribute(iframe?.getAttribute('width') ?? null),
        height: parseNumericAttribute(iframe?.getAttribute('height') ?? null),
        caption: trimHtml(element.querySelector('figcaption')?.innerHTML ?? ''),
      },
    } satisfies EditorJsBlock
  }

  const image = element.querySelector('img')

  if (image?.getAttribute('src')) {
    return {
      type: 'simple-image',
      data: {
        url: image.getAttribute('src'),
        caption: trimHtml(
          element.querySelector('figcaption')?.innerHTML ?? image.getAttribute('alt') ?? ''
        ),
        withBorder: false,
        withBackground: false,
        stretched: false,
      },
    } satisfies EditorJsBlock
  }

  return createRawBlock(element.outerHTML)
}

function parseHtmlNode(node: ChildNode): EditorJsBlock | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim()

    if (!text) {
      return null
    }

    return {
      type: 'paragraph',
      data: {
        text: text.replace(/\n/g, '<br>'),
      },
    }
  }

  if (!(node instanceof HTMLElement)) {
    return null
  }

  const tagName = node.tagName.toLowerCase()

  if (tagName === 'p') {
    const linkToolBlock = parseParagraphAsLinkTool(node as HTMLParagraphElement)

    if (linkToolBlock) {
      return linkToolBlock
    }

    const alignment = getTextAlignment(node)

    return {
      type: alignment ? 'paragraph-with-alignment' : 'paragraph',
      data: {
        text: trimHtml(node.innerHTML),
        ...(alignment ? { alignment } : {}),
      },
    } satisfies EditorJsBlock
  }

  if (/^h[1-6]$/.test(tagName)) {
    return {
      type: 'header',
      data: {
        text: trimHtml(node.innerHTML),
        level: Number(tagName[1]),
      },
    } satisfies EditorJsBlock
  }

  if (tagName === 'blockquote') {
    const clone = node.cloneNode(true) as HTMLElement
    const caption = trimHtml(clone.querySelector('cite')?.innerHTML ?? '')
    clone.querySelectorAll('cite').forEach((element) => element.remove())
    const paragraph = clone.querySelector('p')
    const text = trimHtml(paragraph?.innerHTML ?? clone.innerHTML)
    const alignment = getTextAlignment(node)

    return {
      type: 'quote',
      data: {
        text,
        caption,
        alignment: alignment ?? 'left',
      },
    } satisfies EditorJsBlock
  }

  if (node instanceof HTMLUListElement || node instanceof HTMLOListElement) {
    const style = getListStyle(node)
    const blockMeta =
      style === 'ordered'
        ? {
            start: parseNumericAttribute(node.getAttribute('start')),
            counterType: (node as HTMLElement).style.listStyleType || undefined,
          }
        : undefined

    return {
      type: 'list',
      data: {
        style,
        ...(blockMeta && (blockMeta.start || blockMeta.counterType) ? { meta: blockMeta } : {}),
        items: parseListItems(node, style),
      },
    } satisfies EditorJsBlock
  }

  if (tagName === 'figure') {
    return parseFigure(node)
  }

  if (tagName === 'img') {
    const src = node.getAttribute('src')

    if (!src) {
      return createRawBlock(node.outerHTML)
    }

    return {
      type: 'simple-image',
      data: {
        url: src,
        caption: node.getAttribute('alt') ?? '',
        withBorder: false,
        withBackground: false,
        stretched: false,
      },
    } satisfies EditorJsBlock
  }

  if (tagName === 'a' && node.classList.contains('monolith-bookmark')) {
    return parseBookmark(node as HTMLAnchorElement)
  }

  if (tagName === 'hr') {
    return {
      type: 'delimiter',
      data: {},
    } satisfies EditorJsBlock
  }

  return createRawBlock(node.outerHTML)
}

function parseHtmlToEditorJsContent(value = ''): OutputData | null {
  if (typeof DOMParser === 'undefined' || !value.trim()) {
    return null
  }

  const document = new DOMParser().parseFromString(value, 'text/html')
  const blocks = Array.from(document.body.childNodes)
    .map(parseHtmlNode)
    .filter((block): block is EditorJsBlock => Boolean(block))

  if (blocks.length === 0) {
    return null
  }

  return {
    blocks,
    time: Date.now(),
  }
}

function withAlignment(style = '', alignment?: string) {
  if (!alignment || alignment === 'left') {
    return style
  }

  const nextStyle = `${style}${style ? ';' : ''}text-align:${alignment}`
  return nextStyle
}

function renderListItems(items: any[] = [], style = 'unordered') {
  return items
    .map((item) => {
      const content = item?.content ?? item?.text ?? ''
      const children = Array.isArray(item?.items) && item.items.length > 0
        ? renderList(item.items, style, item?.meta)
        : ''

      if (style === 'checklist') {
        const checked = item?.meta?.checked ? 'true' : 'false'
        return `<li data-checked="${checked}"><label><input type="checkbox" ${item?.meta?.checked ? 'checked' : ''} disabled />${content}</label>${children}</li>`
      }

      return `<li>${content}${children}</li>`
    })
    .join('')
}

function renderList(items: any[] = [], style = 'unordered', meta?: Record<string, any>) {
  if (style === 'ordered') {
    const attributes = [
      typeof meta?.start === 'number' && meta.start > 1 ? ` start="${meta.start}"` : '',
      meta?.counterType ? ` style="list-style-type:${escapeAttribute(meta.counterType)}"` : '',
    ].join('')

    return `<ol${attributes}>${renderListItems(items, style)}</ol>`
  }

  const className = style === 'checklist' ? ' class="monolith-checklist"' : ''
  return `<ul${className}>${renderListItems(items, style)}</ul>`
}

function renderBlock(block: EditorJsBlock) {
  const data = block?.data ?? {}

  switch (block?.type) {
    case 'paragraph':
    case 'paragraph-with-alignment': {
      const style = withAlignment('', data.alignment)
      const styleAttribute = style ? ` style="${escapeAttribute(style)}"` : ''
      return `<p${styleAttribute}>${data.text ?? ''}</p>`
    }

    case 'header': {
      const level = Math.min(Math.max(Number(data.level) || 2, 1), 6)
      return `<h${level}>${data.text ?? ''}</h${level}>`
    }

    case 'quote':
    case 'cyQuote': {
      const style = withAlignment('', data.alignment)
      const styleAttribute = style ? ` style="${escapeAttribute(style)}"` : ''
      const caption = data.caption ? `<cite>${data.caption}</cite>` : ''
      return `<blockquote${styleAttribute}><p>${data.text ?? ''}</p>${caption}</blockquote>`
    }

    case 'list': {
      return renderList(data.items, data.style, data.meta)
    }

    case 'checklist': {
      const items = (data.items ?? []).map((item: any) => ({
        content: item?.text ?? '',
        meta: { checked: Boolean(item?.checked) },
        items: [],
      }))

      return renderList(items, 'checklist')
    }

    case 'embed': {
      const iframe = data.embed
        ? `<div class="monolith-embed__frame"><iframe src="${escapeAttribute(data.embed)}" loading="lazy" allowfullscreen></iframe></div>`
        : ''
      const caption = data.caption ? `<figcaption>${data.caption}</figcaption>` : ''
      return `<figure class="monolith-embed">${iframe}${caption}</figure>`
    }

    case 'simple-image':
    case 'image': {
      const url = data.url ?? data.file?.url

      if (!url) {
        return ''
      }

      const caption = data.caption ? `<figcaption>${data.caption}</figcaption>` : ''
      return `<figure class="monolith-image"><img src="${escapeAttribute(url)}" alt="${escapeAttribute(data.caption ?? '')}" />${caption}</figure>`
    }

    case 'linkTool': {
      const href = data.link ?? ''
      const title = data.meta?.title ?? data.meta?.site_name ?? href
      const description = data.meta?.description ?? ''
      const imageUrl = data.meta?.image?.url ?? ''
      const siteName = (() => {
        if (data.meta?.site_name) {
          return data.meta.site_name
        }

        try {
          return new URL(href).hostname.replace(/^www\./i, '')
        } catch {
          return href
        }
      })()

      if (!href) {
        return ''
      }

      if (!data.meta || Object.keys(data.meta).length === 0) {
        return `<p><a href="${escapeAttribute(href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(title)}</a></p>`
      }

      const descriptionMarkup = description
        ? `<span class="monolith-bookmark__description">${escapeHtml(description)}</span>`
        : ''
      const imageMarkup = imageUrl
        ? `<span class="monolith-bookmark__image" style="background-image:url(&quot;${escapeAttribute(imageUrl)}&quot;)" aria-hidden="true"></span>`
        : ''

      return `
        <a class="monolith-bookmark" href="${escapeAttribute(href)}" target="_blank" rel="noreferrer noopener">
          <span class="monolith-bookmark__content">
            <span class="monolith-bookmark__title">${escapeHtml(title)}</span>
            ${descriptionMarkup}
            <span class="monolith-bookmark__anchor">${escapeHtml(siteName)}</span>
          </span>
          ${imageMarkup}
        </a>
      `
    }

    case 'delimiter':
    case 'cool-delimiter':
      return '<hr />'

    case 'raw':
      return data.html ?? ''

    default:
      return ''
  }
}

export function parseEditorJsContent(value = ''): OutputData | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value)

    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    return null
  }

  return null
}

export function createEditorJsData(value = ''): OutputData {
  const parsed = parseEditorJsContent(value)

  if (parsed) {
    return parsed
  }

  if (!value.trim()) {
    return {
      blocks: [],
      time: Date.now(),
    }
  }

  if (/<[a-z][\s\S]*>/i.test(value)) {
    return parseHtmlToEditorJsContent(value) ?? {
      blocks: [
        {
          type: 'raw',
          data: {
            html: value,
          },
        },
      ],
      time: Date.now(),
    }
  }

  return {
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: value.replace(/\n/g, '<br>'),
        },
      },
    ],
    time: Date.now(),
  }
}

export function editorJsToHtml(data: OutputData) {
  return (data?.blocks ?? [])
    .map(renderBlock)
    .filter(Boolean)
    .join('')
}
