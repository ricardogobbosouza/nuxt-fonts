import { Provider } from '../types'
import google from './google'
import bunny from './bunny'

export const providers: Record<string, Provider> = {
  google,
  bunny
}
