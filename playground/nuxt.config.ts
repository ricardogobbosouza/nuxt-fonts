import NuxtFontsModule from '../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtFontsModule
  ],
  fonts: {
    families: [
      {
        name: 'Roboto',
        provider: 'bunny'
      },
      {
        name: 'Croissant One'
      },
      {
        name: 'Ubuntu',
        subsets: 'greek'
      }
    ]
  }
})
