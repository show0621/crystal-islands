const test = require('node:test'), assert = require('node:assert/strict');
const { TPRules } = require('../dist/learning-content.js');
const briefs = require('../dist/case-briefs.js');

test('the four added topics and MAP cite verified 2022 English PDF pages, not estimates', () => {
  assert.deepEqual(
    ['location', 'lvas', 'cca', 'htvi', 'map'].map(k => [k, TPRules[k].page, TPRules[k].print]),
    [
      ['location', 83, '81–83'],
      ['lvas', 328, '326–327、334'],
      ['cca', 340, '338、341、346'],
      ['htvi', 306, '304–306'],
      ['map', 184, '182–183']
    ]
  );
});

test('the treaty case card cites the verified Taiwan MAP application rules', () => {
  const tw = briefs.cases.treaty.refs.tw.join('\n');
  assert.match(tw, /適用所得稅協定查核準則第 40、41 條/);
  assert.match(tw, /相互協議程序作業要點/);
  assert.doesNotMatch(tw, /待核實/);
});
