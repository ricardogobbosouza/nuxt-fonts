import { defineNuxtModule, useLogger, addTemplate, addPluginTemplate, resolvePath } from '@nuxt/kit'
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
    const fonts: Font[] = []

    for (const family of options.families) {
      const providerName = family.provider ?? options.provider

      if (!Object.keys(providers).includes(providerName)) {
        logger.error(`Provider ${providerName} does not exists.`)

        continue
      }

      const providerFonts = await (providers[providerName])(family)

      for (const font of providerFonts) {
        if (family.subsets && font.subset && !family.subsets.includes(font.subset)) {
          continue
        }

        fonts.push({
          ...font,
          name: family.as || font.name,
          src: await fetchFont(font, outputDir)
        })
      }
    }

    const css = generateCSS(fonts)

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
