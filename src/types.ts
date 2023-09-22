export type Providers = 'google' | 'local' | 'bunny'

export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 |700 | 800 | 900

export type FontStyle = 'normal' | 'italic'

export type FontFormat = 'woff' | 'woff2'

export type FontSource = {
  url: string
  format: FontFormat
}

export type Family = {
  name: string
  as?: string
  provider?: Providers
  subsets?: string | string[]
  display?: FontDisplay
  normal?: number | number[] | string | string[]
  italic?: number | number[] | string | string[]
  fallbacks?: string[]
  text?: string
}

export type Font = {
  subset?: string
  family: string
  style: FontStyle
  weight: FontWeight
  display?: FontDisplay
  src: FontSource[]
  unicodeRange?: string
}

export type Provider = (family: Family) => Promise<Font[]> | Font[]

export function defineProvider (provider: Provider) {
  return provider
}
