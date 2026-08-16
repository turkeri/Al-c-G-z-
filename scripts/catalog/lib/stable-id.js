import { createHash } from 'node:crypto'
import { slugify } from './normalize.js'

export function stableId(namespace, parts, sourceId = '') {
  const canonical = [namespace, ...parts.map((part) => slugify(part)).filter(Boolean)].join('|')
  if (sourceId) return `${namespace}:${slugify(sourceId)}`
  return `${namespace}:${createHash('sha256').update(canonical).digest('hex').slice(0, 16)}`
}

export function payloadFingerprint(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}
