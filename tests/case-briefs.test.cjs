const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const B = require('../dist/case-briefs.js');
const dist = f => fs.readFileSync(path.join(__dirname, '../dist', f), 'utf8');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(dist('campaign-data.js').replace('const episodes=', 'globalThis.episodes=') + '\n' + dist('campaign-extra.js'), ctx);

test('every season case has a case card whose facts point at evidence that exists in that case', () => {
  for (const e of ctx.episodes) {
    const card = B.cases[e.id];
    assert(card, e.id);
    const ids = new Set(e.files.map(f => f.id));
    assert(card.parties.length >= 2 && card.flows.length >= 1, e.id);
    for (const f of card.flows) for (const end of f.slice(0, 2)) assert(card.parties.some(p => p.id === end), `${e.id} flow ${end}`);
    for (const [id, fact, question] of card.facts) { assert(ids.has(id), `${e.id} ${id}`); assert(fact.length > 10 && question.length > 4); }
    for (const id of Object.keys(card.use)) assert(ids.has(id), `${e.id} use ${id}`);
    for (const k of ['what', 'dir', 'amount', 'pricing', 'year']) assert(card.tx[k], `${e.id} tx.${k}`);
    assert(card.unit.includes('萬元'));
    assert(card.claims.every(c => c.length === 3));
    assert(card.refs.tpg.every(t => t.includes('2022') || /第.章|稅約範本/.test(t)), e.id);
  }
});

test('domestic cases cite verified Taiwan provisions; foreign-side cases do not borrow them', () => {
  for (const e of ctx.episodes) {
    const tw = B.cases[e.id].refs.tw.join('');
    if (e.authority.includes('外國側')) assert(!tw.includes('第 43 條之 1'), e.id);
    else assert(tw.includes('第 43 條之 1'), e.id);
  }
});

test('step phases follow the investigation storyline and hints name the evidence to look for', () => {
  const e = ctx.episodes.find(x => x.id === 'idle');
  assert.equal(B.phaseOf(e.steps[0]), '理解案件・提出疑點');
  assert.equal(B.phaseOf(e.steps.at(-1)), '形成判斷・結案');
  assert.match(B.findHint(e, { files: [] }, { kind: 'talk' }), /I-01/);
  assert.match(B.findHint(e, { files: [] }, { kind: 'talk', file: 'I-03' }), /I-03/);
  assert.match(B.findHint(e, { files: e.files.map(f => f.id) }, { kind: 'talk' }), /證據都到齊/);
});

test('issue index covers every case issue and lists shared issues first', () => {
  const idx = B.issueIndex();
  const all = Object.values(B.cases).flatMap(c => c.issues);
  assert.equal(idx.reduce((n, [, ids]) => n + ids.length, 0), all.length);
  for (let i = 1; i < idx.length; i++) assert(idx[i - 1][1].length >= idx[i][1].length);
  for (const [, ids] of idx) for (const id of ids) assert(ctx.episodes.some(e => e.id === id), id);
});
