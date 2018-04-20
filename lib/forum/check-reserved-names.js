import config from '../config/config'
import reservedNames from '../models/forum/reserved-names'

export default function checkReservedNames (name) {
  if (!config.multiForum) return true
  if (!~reservedNames.indexOf(name)) return true
  window.location.reload(false)
  return false
}
