export function normalizeText(value) {
  return String(value || '').trim().toLocaleLowerCase('tr').replace(/\s+/g, ' ')
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
