const DROP_TAGS = new Set(['script', 'style', 'noscript', 'object', 'embed', 'meta', 'link'])
const VOID_TAGS = new Set(['br', 'hr', 'img', 'input'])
const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'cite',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'iframe',
  'img',
  'input',
  'label',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
  'ul',
])
const ALLOWED_CLASSES = new Set([
  'cdx-marker',
  'cdx-text-style',
  'monolith-bookmark',
  'monolith-bookmark__anchor',
  'monolith-bookmark__content',
  'monolith-bookmark__description',
  'monolith-bookmark__image',
  'monolith-bookmark__title',
  'monolith-checklist',
  'monolith-embed',
  'monolith-embed__frame',
  'monolith-image',
])
const ALLOWED_TEXT_ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify'])
const ALLOWED_LIST_STYLE_VALUES = new Set([
  'decimal',
  'lower-alpha',
  'lower-roman',
  'numeric',
  'upper-alpha',
  'upper-roman',
])
const SAFE_COLOR_PATTERN = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|[a-z]+)$/i
const SAFE_FONT_SIZE_PATTERN = /^\d+(\.\d+)?(px|em|rem|%)$/i
const SAFE_FONT_FAMILY_PATTERN = /^[\w\s,'"-]+$/i

function parseUrlFromCssValue(value = '') {
  const match = value.match(/url\((['"]?)(.*?)\1\)/i)
  return match?.[2] ?? ''
}

function sanitizeUrl(
  value = '',
  options: {
    allowHash?: boolean
    allowRelative?: boolean
    protocols?: string[]
  } = {}
) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  if (options.allowHash && trimmedValue.startsWith('#')) {
    return trimmedValue
  }

  if (options.allowRelative && /^(\/|\.\/|\.\.\/|\?)/.test(trimmedValue)) {
    return trimmedValue
  }

  try {
    const parsedUrl = new URL(trimmedValue)
    const allowedProtocols = options.protocols ?? ['http:', 'https:']

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return null
    }

    if (parsedUrl.username || parsedUrl.password) {
      return null
    }

    return parsedUrl.toString()
  } catch {
    return null
  }
}

function sanitizeStyle(tagName: string, classList: DOMTokenList, styleValue = '') {
  const sanitizedDeclarations: string[] = []

  for (const declaration of styleValue.split(';')) {
    const separatorIndex = declaration.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
    const value = declaration.slice(separatorIndex + 1).trim()

    if (!value) {
      continue
    }

    if ((tagName === 'p' || tagName === 'blockquote') && property === 'text-align' && ALLOWED_TEXT_ALIGN_VALUES.has(value.toLowerCase())) {
      sanitizedDeclarations.push(`text-align:${value.toLowerCase()}`)
      continue
    }

    if (tagName === 'ol' && property === 'list-style-type' && ALLOWED_LIST_STYLE_VALUES.has(value.toLowerCase())) {
      sanitizedDeclarations.push(`list-style-type:${value.toLowerCase()}`)
      continue
    }

    if (tagName === 'span' && property === 'color' && SAFE_COLOR_PATTERN.test(value)) {
      sanitizedDeclarations.push(`color:${value}`)
      continue
    }

    if (tagName === 'span' && property === 'background-color' && SAFE_COLOR_PATTERN.test(value)) {
      sanitizedDeclarations.push(`background-color:${value}`)
      continue
    }

    if (tagName === 'span' && property === 'font-size' && SAFE_FONT_SIZE_PATTERN.test(value)) {
      sanitizedDeclarations.push(`font-size:${value}`)
      continue
    }

    if (tagName === 'span' && property === 'font-family' && SAFE_FONT_FAMILY_PATTERN.test(value)) {
      sanitizedDeclarations.push(`font-family:${value}`)
      continue
    }

    if (tagName === 'span' && classList.contains('monolith-bookmark__image') && property === 'background-image') {
      const safeImageUrl = sanitizeUrl(parseUrlFromCssValue(value), { protocols: ['http:', 'https:'] })

      if (safeImageUrl) {
        sanitizedDeclarations.push(`background-image:url("${safeImageUrl}")`)
      }
    }
  }

  return sanitizedDeclarations.join(';')
}

function sanitizeAttributes(source: Element, target: HTMLElement) {
  const tagName = target.tagName.toLowerCase()

  for (const attribute of Array.from(source.attributes)) {
    const attributeName = attribute.name.toLowerCase()
    const attributeValue = attribute.value

    if (attributeName === 'class') {
      const safeClasses = attributeValue
        .split(/\s+/)
        .filter(Boolean)
        .filter((className) => ALLOWED_CLASSES.has(className))

      if (safeClasses.length > 0) {
        target.setAttribute('class', safeClasses.join(' '))
      }

      continue
    }

    if (attributeName === 'style') {
      const safeStyle = sanitizeStyle(tagName, source.classList, attributeValue)

      if (safeStyle) {
        target.setAttribute('style', safeStyle)
      }

      continue
    }

    if (tagName === 'a' && attributeName === 'href') {
      const safeHref = sanitizeUrl(attributeValue, {
        allowHash: true,
        allowRelative: true,
        protocols: ['http:', 'https:', 'mailto:', 'tel:'],
      })

      if (safeHref) {
        target.setAttribute('href', safeHref)
      }

      continue
    }

    if (tagName === 'a' && attributeName === 'target' && attributeValue === '_blank') {
      target.setAttribute('target', '_blank')
      target.setAttribute('rel', 'noreferrer noopener')
      continue
    }

    if (tagName === 'a' && attributeName === 'rel' && target.getAttribute('target') === '_blank') {
      target.setAttribute('rel', 'noreferrer noopener')
      continue
    }

    if ((tagName === 'img' || tagName === 'iframe') && attributeName === 'src') {
      const safeSrc = sanitizeUrl(attributeValue, { protocols: ['http:', 'https:'] })

      if (safeSrc) {
        target.setAttribute('src', safeSrc)
      }

      continue
    }

    if (tagName === 'img' && attributeName === 'alt') {
      target.setAttribute('alt', attributeValue)
      continue
    }

    if (tagName === 'iframe' && attributeName === 'loading' && (attributeValue === 'lazy' || attributeValue === 'eager')) {
      target.setAttribute('loading', attributeValue)
      continue
    }

    if (tagName === 'iframe' && attributeName === 'allowfullscreen') {
      target.setAttribute('allowfullscreen', '')
      continue
    }

    if (tagName === 'input' && attributeName === 'type' && attributeValue === 'checkbox') {
      target.setAttribute('type', 'checkbox')
      continue
    }

    if (tagName === 'input' && (attributeName === 'checked' || attributeName === 'disabled')) {
      target.setAttribute(attributeName, '')
      continue
    }

    if (tagName === 'li' && attributeName === 'data-checked' && (attributeValue === 'true' || attributeValue === 'false')) {
      target.setAttribute('data-checked', attributeValue)
      continue
    }

    if (tagName === 'ol' && attributeName === 'start') {
      const numericValue = Number(attributeValue)

      if (Number.isInteger(numericValue) && numericValue > 0) {
        target.setAttribute('start', String(numericValue))
      }
    }
  }
}

function sanitizeNode(node: ChildNode, cleanDocument: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return cleanDocument.createTextNode(node.textContent ?? '')
  }

  if (!(node instanceof Element)) {
    return null
  }

  const tagName = node.tagName.toLowerCase()

  if (DROP_TAGS.has(tagName)) {
    return null
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = cleanDocument.createDocumentFragment()

    for (const child of Array.from(node.childNodes)) {
      const sanitizedChild = sanitizeNode(child, cleanDocument)

      if (sanitizedChild) {
        fragment.appendChild(sanitizedChild)
      }
    }

    return fragment
  }

  const sanitizedElement = cleanDocument.createElement(tagName)
  sanitizeAttributes(node, sanitizedElement)

  if (tagName === 'a' && sanitizedElement.getAttribute('target') === '_blank') {
    sanitizedElement.setAttribute('rel', 'noreferrer noopener')
  }

  if (tagName === 'a' && !sanitizedElement.getAttribute('href')) {
    const fragment = cleanDocument.createDocumentFragment()

    for (const child of Array.from(node.childNodes)) {
      const sanitizedChild = sanitizeNode(child, cleanDocument)

      if (sanitizedChild) {
        fragment.appendChild(sanitizedChild)
      }
    }

    return fragment
  }

  if ((tagName === 'img' || tagName === 'iframe') && !sanitizedElement.getAttribute('src')) {
    return null
  }

  if (tagName === 'input' && sanitizedElement.getAttribute('type') !== 'checkbox') {
    return null
  }

  if (!VOID_TAGS.has(tagName)) {
    for (const child of Array.from(node.childNodes)) {
      const sanitizedChild = sanitizeNode(child, cleanDocument)

      if (sanitizedChild) {
        sanitizedElement.appendChild(sanitizedChild)
      }
    }
  }

  return sanitizedElement
}

export function sanitizeMonolithHtml(value = '') {
  if (!value.trim() || typeof DOMParser === 'undefined') {
    return value.trim()
  }

  const parser = new DOMParser()
  const dirtyDocument = parser.parseFromString(value, 'text/html')
  const cleanDocument = dirtyDocument.implementation.createHTMLDocument('sanitized')
  const cleanContainer = cleanDocument.createElement('div')

  for (const child of Array.from(dirtyDocument.body.childNodes)) {
    const sanitizedChild = sanitizeNode(child, cleanDocument)

    if (sanitizedChild) {
      cleanContainer.appendChild(sanitizedChild)
    }
  }

  return cleanContainer.innerHTML.trim()
}
