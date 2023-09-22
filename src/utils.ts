import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { ofetch } from 'ofetch'
import { createRegExp, charIn, charNotIn, exactly, whitespace } from 'magic-regexp'
import { Font, FontFormat, FontSource, FontStyle, FontWeight } from './types'

export function generateCSS (fonts: Font[]) {
  return fonts.map((font) => {
    const declaration = {
      'font-family': `'${font.name}'`,
      'font-style': font.style,
      'font-weight': font.weight,
      'font-display': font.display,
      src: font.src.map(({ url, format }) => `url('${url}') format('${format}')`).join(', '),
      'unicode-range': font.unicodeRange
    }

    return `@font-face {\n${toCSS(declaration)}\n}`
  }).join('\n')
}

export function parseFonts (css: string) {
  const fonts: Font[] = []
  const subsets = []

  for (const match of css.matchAll(SUBSETS_RE)) {
    if (match.index === undefined || !match[0]) { continue }

    subsets.push(match.groups.subset?.trim())
  }

  for (const match of css.matchAll(FONT_FACE_RE)) {
    const matchContent = match[0]
    if (match.index === undefined || !matchContent) { continue }

    fonts.push({
      subset: subsets.at(fonts.length),
      name: withoutQuotes(matchContent.match(FONT_FAMILY_RE)?.groups.fontFamily?.split(',')[0] || ''),
      style: withoutQuotes(matchContent.match(FONT_STYLE_RE)?.groups.fontStyle || 'normal') as FontStyle,
      weight: parseInt(withoutQuotes(matchContent.match(FONT_WEIGHT_RE)?.groups.fontWeight || '400')) as FontWeight,
      src: matchContent.match(FONT_SRC_RE)?.groups.src?.split(',').map(fontSource => ({
        url: withoutQuotes(fontSource.match(URL_RE)?.groups.url || ''),
        format: withoutQuotes(fontSource.match(FONT_FORMAT_RE)?.groups.fontFormat || 'woff2') as FontFormat
      })) || [],
      unicodeRange: matchContent.match(UNICODE_RE)?.groups.unicodeRange
    })
  }

  return fonts
}

export function fetchCSS (url: string) {
  return ofetch(url, { headers: getHeaders() })
}

export async function fetchFont (font: Font, outputDir: string) {
  const src: FontSource[] = []

  for (const { url, format } of font.src) {
    const response = await ofetch.raw(url, {
      headers: getHeaders(),
      responseType: 'arrayBuffer'
    })

    if (!response?._data) {
      src.push({ url, format })

      continue
    }

    const fileName = `${font.name}-${font.style}-${font.weight}${font.subset ? '-' + font.subset : ''}.${format}`
    const buffer = Buffer.from(response?._data)
    const fontPath = resolve(outputDir, fileName)

    mkdirSync(dirname(fontPath), { recursive: true })
    writeFileSync(fontPath, buffer, 'utf-8')

    src.push({ url: fileName, format })
  }

  return src
}

const getHeaders = () => ({
  'user-agent': [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/98.0.4758.102 Safari/537.36'
  ].join(' ')
})

const toCSS = (properties: Record<string, any>, indent = 2) =>
  Object.entries(properties)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ' '.repeat(indent) + `${key}: ${value};`)
    .join('\n')

const withoutQuotes = (str: string) => str.trim().replace(QUOTES_RE, '')

const SUBSETS_RE = createRegExp(
  exactly('/*')
    .and(charNotIn('*/').times.any().as('subset'))
    .and('*/'),
  ['g']
)

const FONT_FACE_RE = createRegExp(
  exactly('@font-face')
    .and(whitespace.times.any())
    .and('{')
    .and(charNotIn('}').times.any())
    .and('}'),
  ['g']
)

const FONT_FAMILY_RE = createRegExp(
  exactly('font-family:')
    .and(whitespace.optionally())
    .and(charNotIn(';}').times.any().as('fontFamily'))
)

const FONT_STYLE_RE = createRegExp(
  exactly('font-style:')
    .and(whitespace.optionally())
    .and(charNotIn(';}').times.any().as('fontStyle'))
)

const FONT_WEIGHT_RE = createRegExp(
  exactly('font-weight:')
    .and(whitespace.optionally())
    .and(charNotIn(';}').times.any().as('fontWeight'))
)

const FONT_FORMAT_RE = createRegExp(
  exactly('format(')
    .and(charNotIn(')').times.any().as('fontFormat')).and(')')
)

const FONT_SRC_RE = createRegExp(
  exactly('src:')
    .and(whitespace.optionally())
    .and(charNotIn(';}').times.any().as('src'))
)

const URL_RE = createRegExp(
  exactly('url(').and(charNotIn(')').times.any().as('url')).and(')')
)

const UNICODE_RE = createRegExp(
  exactly('unicode-range:')
    .and(whitespace.optionally())
    .and(charNotIn(';}').times.any().as('unicodeRange'))
)

const QUOTES_RE = createRegExp(
  charIn('"\'').at.lineStart().or(charIn('"\'').at.lineEnd()),
  ['g']
)
