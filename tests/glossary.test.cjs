const test = require('node:test'), assert = require('node:assert/strict'), G = require('../dist/tp-glossary.js');
test('glossary explains jargon in reading order without overlapping shorter terms', () => {
  const hits = G.find('先用一致口徑做橋接，再看 DEMPE。');
  assert.deepEqual(hits.map(h => h.term), ['一致口徑', '橋接', 'DEMPE']);
  assert(hits.every(h => h.note.length > 8));
  assert.equal(G.find('今天天氣很好').length, 0);
  assert.equal(G.find('口徑 橋接 FAR DEMPE TNMM', 2).length, 2);
});
