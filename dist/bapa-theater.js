/* BAPA round table as a paper theater: Taiwan delegation on the left, the counterpart on the right,
   foreign lines in their own language with a Chinese reference line underneath. */
(function () {
const D = BAPAData, G = BAPADebate, L = BAPALogic;
const esc = t => String(t ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const pct = G.pct;
const TW_SIDE = new Set(['阿芬', '小查', '王衡', '阿卷', '沈岸', '陸嚴', '旁白']);
const ROLE = { '阿芬': '臺方領隊', '小查': '證據分析', '王衡': '協商聯絡', '阿卷': '筆錄', '沈岸': '協商覆核官', '陸嚴': '審查召集人', '旁白': '會議廳' };
const COVER = { 日本: ['#2b3550', '#161c2e'], 義大利: ['#2f6b4a', '#173826'], 荷蘭: ['#b4532a', '#6e3014'] };
const LANG = { ja: '日本語', en: 'English' };
const GRADE = { strong: ['有力', '論點站得住，對方必須讓步或轉移戰線。'], fair: ['可行', '方向對，但還不夠有力。'], neutral: ['持平', '沒有加分，也沒有失分。'], weak: ['失分', '這一手讓對方取得優勢。'] };

function flagSVG(country, x, y) {
  let body;
  if (country === '臺灣') { body = '<rect width="48" height="32" fill="#d83a35"/><rect width="24" height="17" fill="#25478c"/><circle cx="12" cy="8.5" r="4.4" fill="#fff"/>'; }
  else if (country === '日本') body = '<rect width="48" height="32" fill="#fffef8"/><circle cx="24" cy="16" r="9" fill="#cb4c4b"/>';
  else if (country === '荷蘭') body = '<rect width="48" height="11" fill="#ae2b30"/><rect y="11" width="48" height="10" fill="#fffef4"/><rect y="21" width="48" height="11" fill="#22468c"/>';
  else body = '<rect width="16" height="32" fill="#2f8a5a"/><rect x="16" width="16" height="32" fill="#fffef4"/><rect x="32" width="16" height="32" fill="#c9433f"/>';
  return `<g transform="translate(${x} ${y})"><path d="M0 0v96" stroke="#8a6a3a" stroke-width="5"/><g transform="translate(3 2)">${body}</g></g>`;
}
function scene(c) {
  const prop = `<g stroke="#fff" stroke-width="7" paint-order="stroke" stroke-linejoin="round">
    ${flagSVG('臺灣', 40, 24)}${flagSVG(c ? c.country : '日本', 300, 24)}
    <ellipse cx="200" cy="188" rx="170" ry="34" fill="#7a5236"/><ellipse cx="200" cy="176" rx="170" ry="34" fill="#c99a62"/>
    <rect x="96" y="150" width="70" height="40" rx="3" fill="#fffdf4" transform="rotate(-6 131 170)"/><path d="M106 162h50M106 172h40" stroke="#b9a37c" stroke-width="4" fill="none" transform="rotate(-6 131 170)"/>
    <rect x="236" y="150" width="70" height="40" rx="3" fill="#fff3d4" transform="rotate(5 271 170)"/><path d="M246 162h50M246 172h34" stroke="#c9b38a" stroke-width="4" fill="none" transform="rotate(5 271 170)"/>
    <rect x="170" y="140" width="60" height="22" rx="4" fill="#3a2a1a"/><text x="200" y="156" text-anchor="middle" font-size="12" fill="#f6e27a" font-family="sans-serif" stroke="none">BAPA</text>
  </g>`;
  return window.TPPaperKit ? TPPaperKit.sceneArt({ floor: '#c9b48a', sky: ['#cfe6ea', '#5b8a96'], prop }) : '';
}
function actor(who) { return window.TPPaperKit ? TPPaperKit.actorSVG(who) : ''; }

let el = null, opts = null, c = null, record = null, st = null;
let lines = [], cursor = 0, typing = 0, full = '', lineDone = true, after = null, shown = { host: '', guest: '' };
const $ = sel => el.querySelector(sel);
function prefersReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
const READ_PAUSE_MS = 4000;
let guideTimer = 0;
let pauseNextGuide = false;
function clearGuideTimer() {
  if (guideTimer) {
    clearTimeout(guideTimer);
    guideTimer = 0;
  }
}
function guideTo(node, { focus = true, delay = 0 } = {}) {
  if (!node || !node.isConnected) return;
  clearGuideTimer();
  const run = () => {
    if (!node.isConnected) return;
    const target = node.closest?.('.paper-tray, .paper-dialogue, .paper-side') || node;
    const scroller = target.closest?.('.paper-book')
      || target.closest?.('.paper-side')
      || document.scrollingElement;
    const behavior = prefersReduceMotion() ? 'auto' : 'smooth';
    try {
      if (scroller && scroller !== document.body && scroller !== document.documentElement && scroller !== document.scrollingElement) {
        const sRect = scroller.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        const topPad = Math.min(80, Math.max(24, sRect.height * 0.08));
        const next = scroller.scrollTop + (tRect.top - sRect.top) - topPad;
        scroller.scrollTo({ top: Math.max(0, next), behavior });
      } else {
        target.scrollIntoView({ behavior, block: 'start', inline: 'nearest' });
      }
    } catch {
      try { target.scrollIntoView(true); } catch { /* ignore */ }
    }
    const trayNode = node.classList?.contains('paper-tray') ? node : node.closest?.('.paper-tray');
    if (!trayNode) return;
    trayNode.classList.remove('is-attention');
    void trayNode.offsetWidth;
    trayNode.classList.add('is-attention');
    trayNode.addEventListener('animationend', () => trayNode.classList.remove('is-attention'), { once: true });
    if (focus) trayNode.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  };
  if (delay > 0) {
    guideTimer = setTimeout(() => {
      guideTimer = 0;
      requestAnimationFrame(() => requestAnimationFrame(run));
    }, delay);
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(run));
}

function mount(container, options) {
  opts = options;
  el = container;
  el.innerHTML = `<div class="paper-stage paper-play has-guest bapa-theater">
    <div class="paper-desk"><div class="paper-book">
      <div class="book-cover"><b class="foil">BAPA 圓桌劇場</b><small class="bapa-cover-sub">部本部島・雙邊預先訂價協商</small></div>
      <div class="diorama"><div class="bapa-scene"></div><div class="paper-stamp"><b>—</b><small>回合</small><em>BAPA</em></div>
        <button type="button" class="stage-clue" hidden><span class="stage-clue-front"><small>本回合文據</small><b></b><em></em></span><span class="stage-clue-back"></span></button>
        <div class="actor-pop actor-host"><div class="paper-actor"></div><i class="paper-stand"></i><span class="actor-tag"></span></div>
        <div class="actor-pop actor-guest" hidden><div class="paper-actor"></div><i class="paper-stand"></i><span class="actor-tag"></span></div>
      </div>
      <div class="case-brief bapa-brief"></div>
      <div class="paper-side">
        <div class="paper-dialogue" role="button" tabindex="0" aria-label="繼續對話">
          <div class="paper-portrait"></div>
          <div><b class="paper-name">旁白</b><span class="paper-role"></span><span class="bapa-lang" hidden></span><p class="paper-text"></p><p class="bapa-sub" hidden></p></div>
          <i class="paper-next">▼</i>
        </div>
        <div class="paper-overlay"><div class="paper-tray is-waiting"></div><div class="paper-slip"></div></div>
      </div>
      <div class="paper-tools">
        <button type="button" data-bapa-tool="files">證據卡</button>
        <button type="button" data-bapa-tool="log">攻防筆錄</button>
        <button type="button" data-bapa-tool="menu">換一個案件</button>
        <button type="button" data-bapa-tool="restart">重來本案</button>
        <button type="button" data-bapa-tool="voyage">回到海港</button>
        <button type="button" data-bapa-tool="leave">離開會議廳</button>
      </div>
    </div></div></div>`;
  const dialogue = $('.paper-dialogue');
  dialogue.addEventListener('click', advance);
  dialogue.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } });
  el.querySelectorAll('[data-bapa-tool]').forEach(b => b.addEventListener('click', () => tool(b.dataset.bapaTool)));
  $('.stage-clue').addEventListener('click', () => $('.stage-clue').classList.toggle('is-open'));
  menu();
}

function setCover(title, sub) {
  $('.book-cover .foil').textContent = title;
  $('.bapa-cover-sub').textContent = sub;
  const [a, b] = c ? COVER[c.country] || COVER.日本 : ['#2f5e5a', '#183533'];
  $('.paper-book').style.setProperty('--cover', a);
  $('.paper-book').style.setProperty('--cover-deep', b);
}
function stamp(top, small) { $('.paper-stamp b').textContent = top; $('.paper-stamp small').textContent = small; }
function clue(fileId) {
  const node = $('.stage-clue'), f = c && fileId ? c.files.find(x => x[0] === fileId) : null;
  node.hidden = !f;
  node.classList.remove('is-open');
  if (!f) return;
  node.querySelector('b').textContent = f[0];
  node.querySelector('em').textContent = f[1];
  node.querySelector('.stage-clue-back').innerHTML = `<p>${esc(f[2])}</p>`;
}
function cast(pop, who) {
  const key = pop.classList.contains('actor-guest') ? 'guest' : 'host';
  pop.hidden = false;
  if (shown[key] === who) return;
  shown[key] = who;
  pop.querySelector('.paper-actor').innerHTML = actor(who);
  const role = TW_SIDE.has(who) ? ROLE[who] : c ? `${c.country}代表` : '對方代表';
  pop.querySelector('.actor-tag').textContent = `${who} · ${role}`;
  pop.classList.remove('is-entering'); void pop.offsetWidth; pop.classList.add('is-entering');
}
function resetCast() {
  shown = { host: '', guest: '' };
  cast($('.actor-host'), '阿芬');
  if (c) cast($('.actor-guest'), c.delegate); else $('.actor-guest').hidden = true;
}

function play(list, then) {
  lines = list.filter(Boolean);
  cursor = 0;
  after = then;
  tray('');
  $('.paper-tray').classList.add('is-waiting');
  $('.paper-stage').classList.remove('is-ready');
  if (!lines.length) { finish(); return; }
  show(0);
}
function show(i) {
  const line = lines[i], foreign = c && line.who === c.delegate;
  const pop = foreign ? $('.actor-guest') : $('.actor-host');
  if (line.who !== '旁白') cast(pop, line.who);
  $('.actor-host').classList.toggle('is-listening', foreign);
  $('.actor-guest').classList.toggle('is-listening', !foreign);
  const bubble = $('.paper-dialogue');
  clearGuideTimer();
  guideTo(bubble, { focus: false });
  bubble.classList.remove('is-pop'); void bubble.offsetWidth; bubble.classList.add('is-pop');
  bubble.classList.toggle('is-foreign', foreign);
  $('.paper-name').textContent = line.who;
  $('.paper-role').textContent = line.role || (TW_SIDE.has(line.who) ? ROLE[line.who] : `${c?.country || ''}代表`);
  const langTag = $('.bapa-lang');
  langTag.hidden = !line.lang;
  langTag.textContent = line.lang ? LANG[line.lang] : '';
  const textEl = $('.paper-text'), sub = $('.bapa-sub');
  textEl.lang = line.lang || 'zh-Hant';
  sub.hidden = true;
  sub.textContent = line.zh ? '中譯｜' + line.zh : '';
  full = line.text;
  lineDone = false;
  clearInterval(typing);
  const done = () => { lineDone = true; if (line.zh) sub.hidden = false; if (i >= lines.length - 1) finish(); };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { textEl.textContent = full; done(); return; }
  let n = 1;
  textEl.textContent = full.slice(0, 1);
  const speed = line.lang === 'en' ? 14 : 24;
  typing = setInterval(() => { n += 1; textEl.textContent = full.slice(0, n); if (n >= full.length) { clearInterval(typing); done(); } }, speed);
}
function advance() {
  if (!lines.length) return;
  clearGuideTimer();
  if (!lineDone) {
    clearInterval(typing);
    $('.paper-text').textContent = full;
    lineDone = true;
    if (lines[cursor].zh) $('.bapa-sub').hidden = false;
    if (cursor >= lines.length - 1) finish();
    return;
  }
  if (cursor < lines.length - 1) { cursor += 1; show(cursor); return; }
  finish();
}
function finish() {
  $('.paper-stage').classList.add('is-ready');
  $('.paper-tray').classList.remove('is-waiting');
  const fn = after; after = null;
  pauseNextGuide = true;
  fn?.();
  pauseNextGuide = false;
}
function tray(html) {
  const t = $('.paper-tray');
  t.innerHTML = html;
  if (html) {
    guideTo(t.querySelector('.story-choices, button') || t, {
      delay: pauseNextGuide ? READ_PAUSE_MS : 0
    });
  }
  return t;
}
function slip(html) { const s = $('.paper-slip'); s.innerHTML = html; s.classList.toggle('is-open', !!html); }

const say = (who, text, role, extra = {}) => ({ who, text, role, ...extra });
const foreignLine = (l, role) => l && ({ who: c.delegate, text: l.o, zh: l.zh, lang: l.lang, role: role || `${c.country}代表` });
function spoken(entry) {
  if (!entry) return say('旁白', '');
  if (Array.isArray(entry)) {
    const [w, t, extra] = entry;
    if (extra?.lang) return { who: w, text: extra.text || extra.o || t, zh: extra.zh, lang: extra.lang, role: extra.role };
    return say(w, t);
  }
  if (entry.lang) return { who: entry.who, text: entry.text, zh: entry.zh, lang: entry.lang, role: entry.role };
  return say(entry.who, entry.text, entry.role);
}
function storyHTML(s) {
  return esc(s).replace(/（中譯：([^）]+)）/g, '<small class="bapa-ending-zh">中譯｜$1</small>');
}
function log(who, text, zh) {
  const speaker = TW_SIDE.has(who) ? `${who}｜臺方` : `${who}｜${c.country}代表`;
  record.history.push({ speaker, text: zh ? `${text}\n（中譯）${zh}` : text });
}

function menu() {
  c = null; record = null; st = null;
  setCover('BAPA 圓桌劇場', '部本部島・雙邊預先訂價協商');
  stamp('7', '個案件');
  $('.bapa-scene').innerHTML = scene(null);
  clue(null);
  resetCast();
  slip('');
  brief(`<p class="case-aim"><b>這裡在做什麼。</b>雙邊預先訂價協議（BAPA）是兩國主管機關在交易「發生之前」，先談好未來幾年的訂價方法、區間和關鍵假設。你是臺方代表團，對面是日本、義大利或荷蘭的主管機關代表。走廊與視訊那頭，審查會議會進來：召集人陸嚴要稅基，覆核官沈岸要依據。兩個人不會說同一句話。</p>
    <p class="case-person"><b>怎麼玩。</b>每一回合對方會提出一個真實的爭點，你從幾種回應裡選一種。中間會插入<b>代表團密商</b>與<b>內部長官審查會議</b>。審查會上有人對、有人錯：阿芬或小查會捍衛查得到的範圍，王衡可能把功能說滿；陸嚴會咄咄相逼，沈岸會幫對的人緩頰。好的回應靠證據、敢跟對的同仁一起辯駁長官；差的回應跟著錯誤指令走，或堅持錯的想法。你的選擇會改變<b>論證可信度</b>、<b>會場緊張度</b>和<b>對方最後願意接受的數字</b>，並走向不同的平行結局。</p>
    <p><b>為什麼難。</b>功能、風險與貢獻往往只能證明到一半：工單證明執行，不一定證明控制；提案被採用，不一定證明獨特。外方本部在看他們的代表會不會讓太多；陸嚴在看稅基，沈岸在看你們會不會把沒查完的部分寫成已確認。外方代表說原文，下方附中譯。</p>`);
  play([say('旁白', '小羊協商號靠岸了。部本部島的會議廳裡，圓桌兩側各擺著一面國旗。審查會議的兩張椅子已經拉開：一張給要稅基的人，一張給要依據的人。', '會議廳'), say('陸嚴', '上級明天問我為什麼加成還要讓。我要聽臺灣控制了什麼，不是你們查不到什麼。'), say('沈岸', '我不是來聽開價的。我要聽：你們查得到哪一步，查不到哪一步。陸座要稅基，我要依據。'), say('阿芬', '七份案卷，三個國家。先選一案。我們不是來贏稅的，是來找到兩國都說得出理由、也能帶回覆核的數字。')], () => {
    tray(`<div class="story-choices bapa-case-list">${D.cases.map((k, i) => {
      const r = opts.peek(k.id), done = r?.debate?.outcome;
      const status = done ? `已結束：${done.title}` : r?.debate ? '協商進行中' : '尚未開始';
      return `<button type="button" data-case="${k.id}"><span>${k.flag}</span><b class="bapa-case-title">${esc(k.title)}<small>${esc(k.theme)}｜${esc(k.delegate)}（${k.country}）<br>${esc(status)}</small></b></button>`;
    }).join('')}</div>`).querySelectorAll('[data-case]').forEach(b => b.onclick = () => openCase(b.dataset.case));
  });
}

function openCase(id) {
  record = opts.use(id);
  c = L.get(record);
  st = record.debate || null;
  setCover(c.title, `臺灣 × ${c.country}・${c.theme}`);
  $('.bapa-scene').innerHTML = scene(c);
  slip('');
  resetCast();
  if (!st) return briefing();
  if (st.phase === 'done') return play([say('阿卷', `這一案已經談完：${st.outcome.title}。筆錄和數字都在下面，可以下載，也可以換一種打法重談。`)], ended);
  if (st.phase === 'final') return finalRound();
  return playRound();
}

function brief(html) { $('.bapa-brief').innerHTML = html; }
function meters() {
  const s = G.scripts[c.id], need = G.need(c.id), offer = G.offer(st);
  const tension = Math.min(6, st.tension), rounds = s.rounds.length;
  const done = Math.min(st.at, rounds);
  const r = st.phase === 'round' || st.phase === 'crisis' ? G.round(st) : null;
  return `<div class="bapa-meters">
      <div><small>論證可信度</small><b>${st.cred}<em>／需要 ${need}</em></b><i style="--v:${Math.max(0, Math.min(1, st.cred / need))}"></i></div>
      <div class="${tension >= 4 ? 'is-hot' : ''}"><small>會場緊張度</small><b>${tension}<em>／6</em></b><i style="--v:${tension / 6}"></i></div>
      <div><small>對方目前可能接受</small><b>${pct(offer)}</b><em>證據區間 ${pct(c.min)}–${pct(c.max)}</em></div>
      <div><small>雙方開場</small><b>臺 ${pct(c.openingTW)}</b><em>${c.country} ${pct(c.openingOther)}</em></div>
    </div>
    ${r ? `<p class="case-aim"><b>第 ${Math.min(done + (st.phase === 'crisis' ? 0 : 1), rounds)}／${rounds} 回合・${esc(r.issue)}。</b>${esc(r.title)}<br>${esc(r.plain)}<br><small class="bapa-tpg">${esc(r.tpg)}</small></p>` : ''}
    <p class="case-person"><b>這場在吵什麼。</b>${esc(s.plain)}</p>
    <p><b>為什麼難。</b>${esc(s.hard)}</p>
    <p><b>單位。</b>${esc(c.unit)}；金額為新臺幣千元，全部為虛構教學數據。</p>`;
}
function refresh() { brief(meters()); }

function briefing() {
  st = G.start(c.id);
  record.debate = st;
  record.history = [];
  opts.save(record);
  stamp('0', '開場');
  clue(null);
  refresh();
  const s = G.scripts[c.id];
  const open = s.lang === 'ja'
    ? { lang: 'ja', o: `本日はよろしくお願いいたします。日本側の当初提案は、${pct(c.openingOther)}でございます。証拠に基づいて、議論させていただきます。`, zh: `今天請多指教。日方的開場提案是 ${pct(c.openingOther)}（${c.unit}）。我們會以證據為本來討論。` }
    : { lang: 'en', o: `Good morning. Our opening position is ${pct(c.openingOther)}. We'll defend it with evidence, and we expect you to do the same.`, zh: `早安。我方開場立場是 ${pct(c.openingOther)}（${c.unit}）。我們會用證據捍衛它，也希望貴方一樣。` };
  const list = [say('旁白', c.background, '案情'), ...s.opening.map(([w, t]) => say(w, t)), foreignLine(open), say('阿芬', `臺方開場提案 ${pct(c.openingTW)}。我們的理由，會在每一個爭點上逐一說明。`)];
  list.forEach(l => l.zh ? log(l.who, l.text, l.zh) : l.who !== '旁白' && log(l.who, l.text));
  opts.save(record);
  play(list, () => {
    tray(`<div class="story-choices"><button type="button" id="bapa-go"><span>▶</span>開始第一回合</button></div>`).querySelector('#bapa-go').onclick = playRound;
  });
}

function playRound() {
  if (st.phase === 'final') return finalRound();
  const { round, line } = G.enter(st);
  opts.save(record);
  const rounds = G.scripts[c.id].rounds.length;
  stamp(st.phase === 'crisis' ? '!' : String(st.at + 1), st.phase === 'crisis' ? '危機' : round.kind === 'review' ? '長官審查' : round.kind === 'caucus' ? '密商' : `／${rounds} 回合`);
  clue(round.file);
  refresh();
  slip('');
  const list = [say('旁白', `${round.issue}｜${round.title}`, st.phase === 'crisis' ? '會場氣氛' : '本回合爭點')];
  (round.lead || []).forEach(([w, t]) => list.push(say(w, t)));
  (round.team || []).forEach(([w, t]) => list.push(say(w, t, round.kind === 'review' ? '內部長官審查' : '代表團密商')));
  if (line) {
    list.push(foreignLine(line));
    if (record.history.at(-1)?.text !== `${line.o}\n（中譯）${line.zh}`) log(c.delegate, line.o, line.zh);
  }
  play(list, () => {
    const t = tray(`<p class="bapa-tray-q">${round.kind === 'review' ? '陸嚴在逼，沈岸在看，你要怎麼答？' : round.kind === 'caucus' ? '代表團要怎麼決定？' : round.lead ? '你要怎麼問？' : '你要怎麼回應？'}</p><div class="story-choices">${order(round).map((i, k) => `<button type="button" data-pick="${i}"><span>${'ABCD'[k]}</span>${esc(round.options[i].label)}</button>`).join('')}</div>`);
    t.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => pick(round, Number(b.dataset.pick)));
  });
}

function order(round) {
  const ids = round.options.map((_, i) => i);
  let h = 0;
  for (const ch of c.id + round.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = ids.length - 1; i > 0; i -= 1) {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0; h = (h ^ (h >>> 13)) >>> 0;
    const j = (h >>> 5) % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function pick(round, index) {
  const before = { c: st.cred, t: st.tension };
  const o = round.options[index];
  G.choose(st, index);
  const list = [];
  if (o.say) { list.push(say(o.by || '阿芬', o.say)); log(o.by || '阿芬', o.say); }
  if (o.back) { list.push(foreignLine(o.back)); log(c.delegate, o.back.o, o.back.zh); }
  (o.reply || []).forEach(([w, t]) => { list.push(say(w, t)); log(w, t); });
  (o.after || []).forEach(([w, t]) => { list.push(say(w, t)); log(w, t); });
  opts.save(record);
  refresh();
  play(list, () => {
    const grade = st.log.at(-1).grade, dc = st.cred - before.c, dt = st.tension - before.t;
    const [label, hint] = GRADE[grade];
    slip(`<div class="bapa-analysis is-${grade}"><b>攻防解析・${label}</b><p>${esc(o.why)}</p><small>可信度 ${dc >= 0 ? '+' : ''}${dc}｜緊張度 ${dt >= 0 ? '+' : ''}${dt}｜${esc(hint)}</small></div>`);
    const next = st.phase === 'crisis' ? '⚠ 會場氣氛緊繃……' : st.phase === 'final' ? '進入最後提案 →' : '下一回合 →';
    tray(`<div class="story-choices"><button type="button" id="bapa-next"><span>▶</span>${next}</button></div>`).querySelector('#bapa-next').onclick = playRound;
  });
}

function finalRound() {
  stamp('終', '最後提案');
  clue(null);
  refresh();
  slip('');
  const s = G.scripts[c.id], x = G.offer(st), off = G.ENDINGS[s.lang].offer(pct(x));
  const list = [say('旁白', '最後一輪。雙方把計算機推到桌子中間。', '最後提案'), foreignLine(off), say('阿芬', `對方的最後數字是 ${pct(x)}。接受、反提案，還是休會？我們的可信度是 ${st.cred}。`)];
  if (!record.history.some(h => h.text.startsWith(off.o))) log(c.delegate, off.o, off.zh);
  opts.save(record);
  play(list, () => {
    const pk = G.packages(st);
    const t = tray(`<p class="bapa-tray-q">臺方最後的決定</p><div class="story-choices">${pk.map((p, i) => {
      const a = p.value == null ? null : L.amounts(record, p.value);
      const money = a ? `臺灣 ${a.tw.toLocaleString('en-US')}｜${c.country} ${a.other.toLocaleString('en-US')}｜相對已報 ${a.delta > 0 ? '+' : ''}${a.delta.toLocaleString('en-US')}` : '';
      return `<button type="button" data-pkg="${p.id}"><span>${'ABCD'[i]}</span><b class="bapa-case-title">${esc(p.label)}<small>${esc(p.note)}${money ? '<br>' + esc(money) : ''}</small></b></button>`;
    }).join('')}</div>`);
    t.querySelectorAll('[data-pkg]').forEach(b => b.onclick = () => conclude(b.dataset.pkg));
  });
}

function conclude(id) {
  const p = G.packages(st).find(x => x.id === id);
  const out = G.settle(st, id);
  record.proposal = p.value == null ? '' : p.value;
  record.outcome = { kind: out.kind, title: out.title, reason: out.reason, agreed: out.agreed };
  const s = G.scripts[c.id], end = G.ENDINGS[s.lang][out.kind];
  const ours = id === 'adjourn' ? '今天不提數字。我們請求休會，把待補的文件和未決爭點列入紀錄。' : `臺方的最後立場：${pct(p.value)}。`;
  log('阿芬', ours); log(c.delegate, end.o, end.zh);
  (out.after || []).forEach(entry => { const line = spoken(entry); log(line.who, line.text, line.zh); });
  opts.save(record);
  const closing = (out.after || []).map(spoken);
  if (!closing.length) closing.push(say('阿卷', '（闔上筆錄）雙方立場、讓步和保留事項，都記下來了。'));
  play([say('阿芬', ours), foreignLine(end), ...closing], ended);
}

function ended() {
  stamp('結', '協商結束');
  clue(null);
  refresh();
  const out = st.outcome, a = st.value == null ? null : L.amounts(record, st.value);
  slip('');
  const strong = st.log.filter(x => x.grade === 'strong').length, weak = st.log.filter(x => x.grade === 'weak').length;
  const worlds = (out.worlds || []).map(w => `<article><h4>${esc(w.title)}</h4><p>${storyHTML(w.text)}</p></article>`).join('');
  tray(`<div class="bapa-ending is-${out.kind}"><b>${esc(out.title)}</b><p>${esc(out.reason)}</p>
      ${out.story ? `<p class="bapa-ending-story">${storyHTML(out.story)}</p>` : ''}
      ${a ? opts.amountHTML(a, c) : ''}
      ${worlds ? `<details class="bapa-worlds"><summary>如果當時做了另一個選擇</summary>${worlds}<p class="bapa-footnote">這些是反事實的平行結局：改變的是壓力下的選擇與尚未查清的範圍，不是同一組證據被偷偷換成較低稅額。</p></details>` : ''}
      <p class="bapa-footnote">本場有力回應 ${strong} 次、失分 ${weak} 次；最終可信度 ${st.cred}，緊張度 ${st.tension}。實際協議須依適用協定、授權及國內程序另行成立。</p>
      <div class="bapa-report-actions"><a role="button" href="#" data-bapa-export="docx">下載協商紀錄 WORD</a><a role="button" href="#" data-bapa-export="odt">下載協商紀錄 ODT</a></div></div>
    <div class="story-choices"><button type="button" data-end="restart"><span>↺</span>重新談這一案（換一種打法）</button><button type="button" data-end="menu"><span>☰</span>回到案件列表</button></div>`);
  el.querySelectorAll('[data-end]').forEach(b => b.onclick = () => tool(b.dataset.end));
  opts.prepareReports();
}

function tool(kind) {
  if (kind === 'leave') return opts.close();
  if (kind === 'voyage') return opts.voyage();
  if (kind === 'menu') { clearInterval(typing); return menu(); }
  if (kind === 'restart') { if (!c) return; clearInterval(typing); record = opts.reset(c.id); st = null; return openCase(c.id); }
  if (!c) return;
  if (kind === 'files') {
    slip(`<div class="bapa-files"><b>本案證據卡</b>${c.files.map(f => `<details><summary>${esc(f[0])} ${esc(f[1])}</summary><p>${esc(f[2])}</p></details>`).join('')}<small>${esc(c.ref)}</small></div>`);
    return;
  }
  if (kind === 'log') {
    slip(`<div class="bapa-files"><b>攻防筆錄</b>${record.history.slice(-24).map(h => `<p><small>${esc(h.speaker)}</small>${esc(h.text)}</p>`).join('') || '<p>還沒有發言。</p>'}</div>`);
  }
}

window.BAPATheater = { mount };
})();
