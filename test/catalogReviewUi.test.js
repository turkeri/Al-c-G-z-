import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildReviewQuery,
  canAcceptReview,
  mergeReviewItems,
  parseSourceSummary,
  reasonCodeLabel,
  reviewActionsFor,
  statusLabel
} from '../src/services/catalogReviewUi.js'

test('review actions only appear for pending items with write permission', () => {
  assert.deepEqual(reviewActionsFor('pending', ['catalog:read', 'catalog:write']), ['accept', 'reject', 'defer'])
  assert.deepEqual(reviewActionsFor('pending', ['catalog:read']), [])
  assert.deepEqual(reviewActionsFor('accepted', ['catalog:read', 'catalog:write']), [])
  assert.deepEqual(reviewActionsFor('pending', []), [])
  assert.deepEqual(reviewActionsFor('pending', undefined), [])
})

test('reason code and status labels are human readable in Turkish, unknown codes degrade safely', () => {
  assert.equal(reasonCodeLabel('LOW_CONFIDENCE'), 'Düşük güven')
  assert.equal(reasonCodeLabel('UNMATCHED'), 'Eşleşme bulunamadı')
  assert.equal(reasonCodeLabel('SOME_NEW_CODE'), 'Some new code')
  assert.equal(reasonCodeLabel(''), '')
  assert.equal(reasonCodeLabel(null), '')
  assert.equal(statusLabel('pending'), 'Bekliyor')
  assert.equal(statusLabel('unknown-status'), 'unknown-status')
})

test('review query strips empty filters and keeps only known params', () => {
  assert.deepEqual(buildReviewQuery({ status: 'pending', confidence: '', q: undefined, cursor: 'abc', bogus: 'x' }), {
    status: 'pending',
    cursor: 'abc'
  })
  assert.deepEqual(buildReviewQuery(), {})
})

test('cursor pagination never adds the same review item twice', () => {
  const page1 = [{ id: 'a' }, { id: 'b' }]
  const page2 = [{ id: 'b' }, { id: 'c' }]
  const merged = mergeReviewItems(page1, page2)
  assert.deepEqual(merged.map((i) => i.id), ['a', 'b', 'c'])
})

test('accept requires an existing or freshly picked canonical target', () => {
  assert.equal(canAcceptReview({ proposed_target_id: null }, ''), false)
  assert.equal(canAcceptReview({ proposed_target_id: null }, 'brand:1'), true)
  assert.equal(canAcceptReview({ proposed_target_id: 'brand:2' }, ''), true)
})

test('source summary parses safely and never leaks malformed JSON to the caller', () => {
  assert.deepEqual(parseSourceSummary('{"label":"safe","empty":""}'), [['label', 'safe']])
  assert.deepEqual(parseSourceSummary('not json'), [])
  assert.deepEqual(parseSourceSummary('[1,2,3]'), [])
  assert.deepEqual(parseSourceSummary(''), [])
  assert.deepEqual(parseSourceSummary(null), [])
})
