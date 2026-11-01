const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

function read(name) { return fs.readFileSync(path.join(dist, name), 'utf8'); }
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|html|css|cjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('許澄 is retired and 阿芬 leads the audit cast', () => {
  for (const file of walk(dist)) assert.equal(fs.readFileSync(file, 'utf8').includes('許澄'), false, file);
  assert.match(read('island-biomes.js'), /\['阿芬','查核領隊'/);
  assert.match(read('rpg.js'), /阿芬 · 查核指導員/);
  assert.match(read('resident-appearance.js'), /\['女','longwave','#7a4050','none'/);
  assert.match(read('bapa-data.js'), /"name":"阿芬","job":"臺方領隊","color":"#c46b86"/);
  assert.match(read('paper-stage.js'), /extra: 'afin'/);
});

test('paper theater is wired ahead of the separate work-page launcher', () => {
  const html = read('index.html');
  assert.ok(html.includes('paper-stage.css'));
  assert.ok(html.indexOf('paper-stage.js') < html.indexOf('island-stage.js'));
  assert.match(read('campaign.js'), /if\(window\.TPPaperTheater\)return/);
  assert.match(read('bapa-voyage.js'), /classList\.remove\('paper-open'\)/);
});

test('theater auto-guides to choices instead of resetting scroll to top', () => {
  const paper = read('paper-stage.js');
  const bapa = read('bapa-theater.js');
  assert.match(paper, /function guideTo\(/);
  assert.match(bapa, /function guideTo\(/);
  assert.match(paper, /scrollTo\(/);
  assert.match(paper, /revealAction/);
  assert.doesNotMatch(paper, /side\.scrollTop\s*=\s*0/);
  assert.match(read('paper-stage.css'), /trayAttention/);
});

test('every current episode and island has a paper set, without dropping newer case content', () => {
  const paper = read('paper-stage.js');
  const ids = [...`${read('campaign-data.js')}\n${read('campaign-extra.js')}`.matchAll(/\bid:'([^']+)'/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, 14);
  for (const id of ids) assert.ok(paper.includes(`${id}: [`) || paper.includes(`'${id}': [`), id);
  for (let island = 0; island < 8; island++) assert.match(paper, new RegExp(`\\n\\s+${island}: \\{ floor:`));
  assert.match(paper, /isle-/);
  assert.match(read('campaign-extra.js'), /三站授權鏈的迷霧/);
  assert.match(read('rpg.js'), /bbformula:/);
  assert.doesNotMatch(read('world.js'), /Double Irish/);
  assert.match(read('world.js'), /原創案卷/);
});
