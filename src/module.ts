import { pathToFileURL } from 'node:url'
import { defineNuxtModule, useLogger, addTemplate, addPluginTemplate, resolvePath } from '@nuxt/kit'
import { getMetricsForFamily, generateFontFace, readMetrics, generateFallbackName } from 'fontaine'
import { join } from 'pathe'
import { hasProtocol } from 'ufo'
import { name, version } from '../package.json'
import { providers } from './providers'
import type { Providers, Family, Font } from './types'
import { fetchFont, generateCSS } from './utils'

export interface ModuleOptions {
  inline: boolean
  provider: Providers
  families: Family[]
  fallbacks?: string[]
}

const logger = useLogger('nuxt:fonts')

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'fonts'
  },
  defaults: nuxt => ({
    inline: nuxt.options.ssr,
    provider: 'google',
    families: [],
    fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans']
  }),
  async setup (options, nuxt) {
    if (!options.families.length) {
      logger.warn('No fonts provided')
      return
    }

    const outputDir = await resolvePath('node_modules/.cache/nuxt-fonts')
    let css = ''

    for (const family of options.families) {
      const providerName = family.provider ?? options.provider

      if (!Object.keys(providers).includes(providerName)) {
        logger.error(`Provider ${providerName} does not exists.`)

        continue
      }

      const providerFonts = await (providers[providerName])(family)
      const fonts: Font[] = []

      for (const font of providerFonts) {
        if (family.subsets && font.subset && !family.subsets.includes(font.subset)) {
          continue
        }

        fonts.push({
          ...font,
          family: family.as || font.family,
          src: await fetchFont(font, outputDir)
        })
      }

      css += generateCSS(fonts)

      const fallbacks = family.fallbacks || options.fallbacks || []

      if (fallbacks.length) {
        let metrics = await getMetricsForFamily(family.name)

        if (!metrics && fonts.length && !hasProtocol(fonts[0].src[0].url)) {
          metrics = await readMetrics(pathToFileURL(join(outputDir, fonts[0].src[0].url)))
        }

        if (!metrics) {
          logger.warn('Could not find metrics for font', family.name)
          continue
        }

        css += '\n'

        for (const fallback of fallbacks) {
          css += generateFontFace(metrics, {
            name: generateFallbackName(family.name),
            font: fallback,
            metrics: (await getMetricsForFamily(fallback))!
          })
        }
      }
    }

    if (options.inline) {
      addPluginTemplate({
        filename: 'nuxt-fonts-fallback-inlining-plugin.server.ts',
        getContents: () =>
          [
            'import { defineNuxtPlugin, useHead } from \'#imports\'',
            `const css = \`${css.replace(/\s+/g, ' ')}\``,
            'export default defineNuxtPlugin(() => { useHead({ style: [{ children: css }] }) })'
          ].join('\n'),
        mode: 'server'
      })
    } else {
      addTemplate({
        filename: 'nuxt-fonts.css',
        write: true,
        getContents: () => css
      })
      nuxt.options.css.push('#build/nuxt-fonts.css')
    }

    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({ dir: outputDir })
  }
})
