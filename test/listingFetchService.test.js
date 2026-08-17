import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { closeSourceLoader, loadSourceModule } from './helpers/viteModuleLoader.js'

after(closeSourceLoader)

test('known blocked listing hosts are recognized regardless of path/query/subdomain', async () => {
  const { isKnownBlockedListingUrl } = await loadSourceModule('/src/services/listingFetchService.js')
  assert.equal(isKnownBlockedListingUrl('https://www.sahibinden.com/ilan/1234567890/detay'), true)
  assert.equal(isKnownBlockedListingUrl('https://sahibinden.com/ilan/1234567890'), true)
  assert.equal(isKnownBlockedListingUrl('https://www.arabam.com/ilan/1234567'), true)
  assert.equal(isKnownBlockedListingUrl('https://www.letgo.com/item/9876543'), true)
})

test('unrelated or malformed input is not treated as a known blocked host', async () => {
  const { isKnownBlockedListingUrl } = await loadSourceModule('/src/services/listingFetchService.js')
  assert.equal(isKnownBlockedListingUrl('https://example.com/sahibinden.com'), false)
  assert.equal(isKnownBlockedListingUrl('https://notsahibinden.com/ilan/1'), false)
  assert.equal(isKnownBlockedListingUrl('1234567890'), false)
  assert.equal(isKnownBlockedListingUrl(''), false)
  assert.equal(isKnownBlockedListingUrl(null), false)
  assert.equal(isKnownBlockedListingUrl('not a url at all'), false)
})

test('looksLikeListingInput still accepts a bare listing number and any http(s) link', async () => {
  const { looksLikeListingInput } = await loadSourceModule('/src/services/listingFetchService.js')
  assert.equal(looksLikeListingInput('1234567890'), true)
  assert.equal(looksLikeListingInput('https://www.sahibinden.com/ilan/1234567890/detay'), true)
  assert.equal(looksLikeListingInput('merhaba'), false)
  assert.equal(looksLikeListingInput(''), false)
})
