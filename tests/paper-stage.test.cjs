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

test('closing the investigation board returns to the live case', () => {
  const paper = read('paper-stage.js');
  const board = read('investigation.js');
  assert.match(paper, /function isBoardOverlay\(/);
  assert.match(paper, /function resumeCaseFromBoard\(/);
  assert.match(paper, /detective-board, \.paper-board-quest/);
  assert.match(paper, /stopImmediatePropagation/);
  assert.match(board, /\$\('#board-back'\)\.onclick/);
  assert.match(board, /openCampaignStep\(\)/);
});

test('island people and pets stay outside paper theater', () => {
  const paper = read('paper-stage.js');
  const css = read('paper-stage.css');
  assert.match(paper, /function isIslandVisit\(/);
  assert.match(paper, /resident-visit, \.pet-story/);
  assert.match(paper, /function armHubWindow\(/);
  assert.match(paper, /hub-open/);
  assert.match(css, /dialog#modal:not\(\.paper-open\) \.paper-restore/);
  assert.match(read('island-3d.js'), /class="pet-story"/);
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
  assert.match(paper, /guidePendingAction/);
  assert.match(paper, /soft:\s*true/);
  assert.match(paper, /const side = target\.closest/);
  assert.match(paper, /window\.resetStoryCase = resetStoryCase/);
  assert.doesNotMatch(paper, /side\.scrollTop\s*=\s*0/);
  assert.match(read('paper-stage.css'), /trayAttention/);
});

test('paper play keeps a short mission rail and full brief in the case card', () => {
  const paper = read('paper-stage.js');
  const css = read('paper-stage.css');
  assert.match(paper, /function missionHTML\(/);
  assert.match(paper, /case-brief case-mission/);
  assert.match(paper, /missionHTML\(e, rec, s, aim/);
  assert.match(css, /"stage side"/);
  assert.match(css, /"brief side"/);
  assert.match(css, /container-type:\s*inline-size/);
  assert.match(css, /@container paper-play/);
});

test('BAPA theater and campaign case entry share left mission / right dialogue layout', () => {
  const bapa = read('bapa-theater.js');
  const paper = read('paper-stage.js');
  const voyage = read('bapa-voyage.js');
  assert.match(bapa, /paper-stage paper-play has-guest bapa-theater/);
  assert.match(bapa, /case-brief case-mission bapa-brief/);
  assert.match(bapa, /class="paper-side"/);
  assert.match(bapa, /function missionHTML\(/);
  assert.match(bapa, /function openCaseCard\(/);
  assert.match(bapa, /data-bapa-tool="casecard"/);
  assert.match(voyage, /BAPATheater\.mount\(/);
  assert.match(paper, /openCampaignStep = function/);
  assert.match(paper, /mountPaper\(\)/);
  assert.match(read('island-stage.js'), /showSeasonJournal\(\)/);
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
