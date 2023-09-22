import { $URL } from 'ufo'
import { fetchCSS, parseFonts } from '../utils'
import { Family, defineProvider } from '../types'

export default defineProvider(async (family) => {
  const url = constructURL(family).toString()
  const css = await fetchCSS(url)
  return parseFonts(css)
})

function constructURL (family: Family) {
  const url = new $URL('https://fonts.googleapis.com/css2')
  const normal = family.normal ? (Array.isArray(family.normal) ? family.normal : [family.normal]) : []
  const italic = family.italic ? (Array.isArray(family.italic) ? family.italic : [family.italic]) : []
  let styles = ''

  if (italic.length) {
    styles = styles.concat(':ital,wght')
  }

  if (normal.length || italic.length) {
    styles = styles.concat('@')
      .concat(
        normal.map(weight => italic.length ? `0,${weight}` : weight).concat(
          italic.map(weight => `1,${weight}`)
        ).join(';')
      )
  }

  url.query.family = family.name.concat(styles)
  url.query.display = family.display
  url.query.text = family.text

  return url
}
