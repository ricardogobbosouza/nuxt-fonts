import { $URL } from 'ufo'
import { fetchCSS, parseFonts } from '../utils'
import { Family, defineProvider } from '../types'

export default defineProvider(async (family) => {
  const url = constructURL(family).toString()
  const css = await fetchCSS(url)
  return parseFonts(css)
})

function constructURL (family: Family) {
  const url = new $URL('https://fonts.bunny.net/css')
  const normal = family.normal ? (Array.isArray(family.normal) ? family.normal : [family.normal]) : []
  const italic = family.italic ? (Array.isArray(family.italic) ? family.italic : [family.italic]) : []
  const styles = normal.concat(italic.map(i => `${i}i`)).join(',')

  url.query.family = family.name.concat(styles.length ? `:${styles}` : '')
  url.query.display = family.display
  // url.query.text = family.text

  return url
}
