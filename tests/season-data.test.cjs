const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const dist = f => fs.readFileSync(path.join(__dirname, '../dist', f), 'utf8');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['campaign-data.js', 'campaign-extra.js', 'investigation-data.js', 'learning-content.js']) vm.runInContext(dist(f), ctx, { filename: f });
const get = name => vm.runInContext(name, ctx);
const episodes = get('episodes'), lessons = get('TPLessons'), rules = get('TPRules'), stories = get('investigationStories');
const guide = require('../dist/story-guide.js');

test('every case has lessons, board links and guide aims that point at evidence the learner can actually obtain', () => {
  for (const e of episodes) {
    const ids = new Set(e.files.map(f => f.id));
    const l = lessons[e.id];
    assert(l && l.quiz.length >= 6, e.id);
    for (const q of l.quiz) {
      assert(ids.has(q.file), `${e.id} quiz file ${q.file}`);
      for (const r of q.refs || []) assert(rules[r], `${e.id} rule ${r}`);
    }
    for (const r of l.refs) assert(rules[r], `${e.id} lesson rule ${r}`);
    const verdict = e.steps.findIndex(s => s.kind === 'verdict');
    const obtainable = new Set(e.steps.slice(0, verdict).flatMap(s => [s.file, ...(s.reveal || [])]).filter(Boolean));
    const links = stories[e.id].links;
    assert.equal(links.length, 3, e.id);
    for (const [q, id, hint, line] of links) {
      assert(obtainable.has(id), `${e.id} board ${id} is not obtainable before the verdict`);
      assert(line == null || line < e.files.find(f => f.id === id).lines.length, `${e.id} board line ${id}`);
      assert(q.length > 4 && hint.length > 4);
    }
    const g = guide.cases[e.id];
    assert(g, e.id);
    assert.equal(g.aims.length, e.steps.length, `${e.id} aims`);
    assert.equal(g.goals.length, 3, e.id);
  }
});

test('every talk can reach its goal, and document, sequence and puzzle steps are answerable', () => {
  for (const e of episodes) {
    const ids = new Set(e.files.map(f => f.id));
    for (const s of e.steps) {
      if (s.file) assert(ids.has(s.file), `${e.id} ${s.label} file ${s.file}`);
      for (const id of s.reveal || []) assert(ids.has(id), `${e.id} reveal ${id}`);
      if (s.kind === 'talk') {
        const seen = new Set(), queue = [s.start];
        while (queue.length) {
          const id = queue.shift();
          if (seen.has(id)) continue;
          seen.add(id);
          assert(s.nodes[id], `${e.id} ${s.label} node ${id}`);
          for (const c of s.nodes[id].choices) queue.push(c.next);
        }
        assert(seen.has(s.goal), `${e.id} ${s.label} goal unreachable`);
      }
      if (s.kind === 'document') assert(s.correct < e.files.find(f => f.id === s.file).lines.length, e.id);
      if (s.kind === 'sequence') assert.equal(JSON.stringify([...s.correct].sort()), JSON.stringify(s.items.map((_, i) => i)), e.id);
      if (s.kind === 'puzzle') for (const row of s.rows) assert(row.correct < row.options.length, e.id);
      if (['inspect', 'request'].includes(s.kind)) assert(s.correct < s.options.length, e.id);
    }
  }
});

test('the four added topics are separate cases whose exam adjustment matches the verdict', () => {
  for (const id of ['location', 'lowvalue', 'cca', 'htvi']) {
    const e = episodes.find(x => x.id === id);
    assert(e, id);
    const v = e.steps.find(s => s.kind === 'verdict');
    const q = lessons[id].quiz.find(x => x.type === 'number' && x.prompt.includes('所得調增'));
    assert.equal(q.correct, v.amount, id);
    assert.equal(lessons[id].quiz.find(x => x.prompt.includes('稅額')).correct, v.amount * 0.2, id);
    assert(e.parallels.length >= 2 && e.cliffhanger, id);
  }
  const order = episodes.map(e => e.id);
  assert.equal(JSON.stringify(order.slice(order.indexOf('reorganization'), order.indexOf('sandwich-history') + 1)), JSON.stringify(['reorganization', 'location', 'lowvalue', 'cca', 'htvi', 'sandwich-history']));
});
