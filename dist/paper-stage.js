/* Paper-craft case stage. The campaign script still owns clues, answers and grading;
   this only replaces the case window with a pop-up book, card actors and a dialogue box. */
(function () {
  window.TPPaperTheater = true;
  const caseView = () => new URLSearchParams(location.search).get('view') === 'case';
  if (caseView()) document.body.classList.add('case-theater');
  function leaveCaseTheater() {
    if (!caseView()) return false;
    document.body.classList.add('case-theater');
    const url = new URL(location.href);
    url.search = '';
    location.assign(url.pathname);
    return true;
  }
  function prefersReduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  /** Pause after a line finishes so readers can finish the text before the jump. */
  const READ_PAUSE_MS = 4000;
  let guideTimer = 0;
  function clearGuideTimer() {
    if (guideTimer) {
      clearTimeout(guideTimer);
      guideTimer = 0;
    }
  }
  /** Force the next action into view inside nested theater scrollers (paper-book / side). */
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
      const tray = node.classList?.contains('paper-tray') ? node : node.closest?.('.paper-tray');
      if (!tray) return;
      tray.classList.remove('is-attention');
      void tray.offsetWidth;
      tray.classList.add('is-attention');
      tray.addEventListener('animationend', () => tray.classList.remove('is-attention'), { once: true });
      if (focus) tray.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
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
  const CAST = {
    '簡毅': { role: '軟體中心主管', hair: '#2b2a2e', coat: '#2f7a8c', skin: '#f0c4a4', extra: 'glasses' },
    '蘇芮': { role: '區域營運長', hair: '#3b2a26', coat: '#8a6a1f', skin: '#f6d0b0', extra: '' },
    '葉敏': { role: '人資與資訊主管', hair: '#4a3530', coat: '#b07a3c', skin: '#f6d0b0', extra: 'folder' },
    '郭朗': { role: '感測器團隊主管', hair: '#262224', coat: '#7a3f6e', skin: '#e5b795', extra: 'glasses' },
    '江予': { role: '財務經理', hair: '#3a2a26', coat: '#587b5d', skin: '#f6d0b0', extra: 'folder' },
    '阿芬': { role: '查核領隊', hair: '#6e3b4a', coat: '#e58aa4', skin: '#f8d0bc', extra: 'afin' },
    '陳禾': { role: '廠長', hair: '#2a2118', coat: '#d9783a', skin: '#f0c09a', extra: 'cap' },
    '吳晶': { role: '排程工程師', hair: '#241c18', coat: '#3d8b6e', skin: '#f6d0b0', extra: 'ribbon' },
    '周衡': { role: '受託會計師', hair: '#3a3128', coat: '#314e86', skin: '#f0c4a4', extra: 'glasses' },
    '林安': { role: '總部 TP 代表', hair: '#574237', coat: '#2f6f62', skin: '#f0c4a4', extra: 'glasses' },
    '佐藤葵': { role: '研發主管', hair: '#49383d', coat: '#6d5a92', skin: '#f6d0b0', extra: 'ribbon' },
    'Noor': { role: '經銷主管', hair: '#3f3034', coat: '#0f6e6a', skin: '#e5b795', extra: '' },
    'Alex': { role: '市場主管', hair: '#4d3936', coat: '#1d4e89', skin: '#c99778', extra: '' },
    'Maya': { role: '需求規劃', hair: '#503b34', coat: '#3d8b6e', skin: '#f3c7a6', extra: 'ribbon' },
    'Aoife': { role: '檔案室主管', hair: '#845b39', coat: '#587b5d', skin: '#f0ceb0', extra: 'glasses' },
    '小查': { role: '查核員', hair: '#785343', coat: '#c49c74', skin: '#f4d4b6', extra: 'folder' },
    '王衡': { role: '協商聯絡員', hair: '#444a4b', coat: '#314e86', skin: '#e5b795', extra: 'glasses' },
    '沈岸': { role: '協商覆核官', hair: '#3a3a3e', coat: '#1c2a3a', skin: '#e8c4a4', extra: 'glasses' },
    '陸嚴': { role: '審查召集人', hair: '#2a1e1a', coat: '#5a241c', skin: '#e8b898', extra: 'glasses' },
    '阿卷': { role: '檔案員', hair: '#6e5445', coat: '#ae8baa', skin: '#f0c4a4', extra: 'folder' },
    'Lars': { role: '倉儲主管', hair: '#5e514c', coat: '#b16f4c', skin: '#e5b795', extra: 'cap' },
    'Liam': { role: '融資經辦', hair: '#3d3535', coat: '#1a3a5c', skin: '#f0c4a4', extra: '' },
    '林祐': { role: '研發工程師', hair: '#3c4650', coat: '#3d6a4e', skin: '#f0c4a4', extra: 'glasses' },
    '林穗': { role: '採購經辦', hair: '#3a2a26', coat: '#b0587a', skin: '#f6d0b0', extra: 'folder' },
    '陳凱': { role: '現場主管', hair: '#2e2620', coat: '#4f6f8f', skin: '#e5b795', extra: 'cap' },
    '中村': { role: '技術與服務主管', hair: '#232326', coat: '#5a5f6b', skin: '#f3d2b4', extra: 'glasses' },
    '高橋律': { role: '日方主管機關代表', hair: '#1f1d22', coat: '#2b3550', skin: '#f3d2b4', extra: 'glasses' },
    'Giulia Rossi': { role: '義方主管機關代表', hair: '#5a3424', coat: '#7a2f3a', skin: '#efc6a2', extra: 'ribbon' },
    'Sophie de Vries': { role: '荷方主管機關代表', hair: '#d9b45f', coat: '#d0702c', skin: '#f6d6c0', extra: '' },
    '旁白': { role: '事件簿', hair: '#6a8f4e', coat: '#8fbf6a', skin: '#f6e7c1', extra: 'sprout' },
    '你': { role: '查核員', hair: '#4a3428', coat: '#c4554a', skin: '#f3c7a6', extra: 'badge' }
  };
  const BG = { '阿芬': '#f8d6e4', '陳禾': '#f8d7b0', '吳晶': '#d7f0e4', '周衡': '#d5e2f6', '林安': '#d5ebe4', '佐藤葵': '#e4dcf2', 'Noor': '#d5f0ea', 'Alex': '#d5e4f6', 'Maya': '#d7f0e4', 'Aoife': '#e4efd8', '小查': '#f8e6cf', '王衡': '#d5e2f6', '沈岸': '#d5dce6', '陸嚴': '#e8d0c4', '阿卷': '#f0e0ee', 'Lars': '#f8e0cf', 'Liam': '#d5e4ea', '林祐': '#dceadf', '林穗': '#f6dbe6', '陳凱': '#dae4ef', '中村': '#e2e3e8', '高橋律': '#dfe3ee', 'Giulia Rossi': '#f2dade', 'Sophie de Vries': '#f8e2cc', '旁白': '#f6efcf', '你': '#f8d0c8' };
  const AUDIT_SIDE = new Set(['阿芬', '你', '小查', '旁白']);
  let liveScene = '';
  const COVERS = {
    idle: ['#9c2430', '#6e141c'],
    recipe: ['#2c3f86', '#1a2758'],
    lab: ['#1f6b45', '#0f3e28'],
    synergy: ['#7a2f4a', '#4c1a2c'],
    market: ['#1d4e89', '#102c52'],
    distributor: ['#0f6e6a', '#084240'],
    equipment: ['#b4532a', '#6e3014'],
    reorganization: ['#5c3d7a', '#352248'],
    location: ['#2f7a8c', '#174654'],
    lowvalue: ['#8a6a1f', '#54400f'],
    cca: ['#4b6b2f', '#2b4019'],
    htvi: ['#7a3f6e', '#4a2242'],
    'sandwich-history': ['#1a3a5c', '#0e2238'],
    treaty: ['#6b5420', '#3e3010'],
    shelf: ['#3d6a4e', '#1e3d2c']
  };
  function coverOf(id) { return COVERS[id] || ['#9c2430', '#6e141c']; }

  function castOf(who) { return CAST[who] || { role: '在場的人', hair: '#3b2a22', coat: '#708f78', skin: '#f3c7a6', extra: '' }; }
  function afinSVG() {
    const hair = '#6e3b4a';
    const skin = '#f8d0bc';
    return `<svg viewBox="0 0 140 200" aria-hidden="true">
      <g transform="translate(7 8)" fill="#e7d3b0">
        <path d="M36 86c-2 34 4 70 12 86h52c8-16 14-52 10-86-6-16-20-24-37-24s-31 8-37 24z"/>
        <path d="M48 118h48c8 0 12 8 12 18v46c0 8-6 12-14 12H50c-8 0-14-4-14-12v-46c0-10 4-18 12-18z"/>
      </g>
      <g stroke="#fff" stroke-width="8" paint-order="stroke" stroke-linejoin="round">
        <path d="M34 88c-2 34 4 72 14 90h52c10-18 16-56 12-90-6-6-16-12-26-14-8 8-18 12-28 10-8-1-18 0-24 4z" fill="${hair}"/>
        <path d="M46 114h50c8 0 14 8 14 20v44c0 10-8 16-18 16H50c-10 0-18-6-18-16v-44c0-12 6-20 14-20z" fill="#e58aa4"/>
        <path d="M58 114l12 18 12-18" fill="#fff6ee"/>
        <circle cx="70" cy="74" r="30" fill="${skin}"/>
        <path d="M40 72c2-34 60-40 66 0-14-18-26-22-36-20-12 2-22 8-30 20z" fill="${hair}"/>
        <path d="M38 68c0 22 4 34 10 38-2-14-2-26 0-38z" fill="${hair}"/>
        <path d="M102 68c0 22-4 34-10 38 2-14 2-26 0-38z" fill="${hair}"/>
      </g>
      <g fill="none" stroke-linecap="round">
        <path d="M56 48c6-4 12-4 16 1" stroke="#c48a98" stroke-width="3"/>
        <ellipse cx="58" cy="76" rx="4.4" ry="5.6" fill="#3a2a32" stroke="none"/>
        <ellipse cx="84" cy="76" rx="4.4" ry="5.6" fill="#3a2a32" stroke="none"/>
        <circle cx="56.4" cy="74" r="1.6" fill="#fffaf0" stroke="none"/>
        <circle cx="82.4" cy="74" r="1.6" fill="#fffaf0" stroke="none"/>
        <path d="M51 71l-4-3M55 69v-4M61 70l3-3" stroke="#3a2a32" stroke-width="1.7"/>
        <path d="M77 70l-3-3M83 69v-4M89 71l4-3" stroke="#3a2a32" stroke-width="1.7"/>
        <ellipse cx="49" cy="86" rx="6" ry="3.2" fill="#f3a8b0" stroke="none"/>
        <ellipse cx="91" cy="86" rx="6" ry="3.2" fill="#f3a8b0" stroke="none"/>
        <path d="M62 90q8 8 16 0" stroke="#c47878" stroke-width="2.4"/>
      </g>
    </svg>`;
  }
  function actorSVG(who) {
    const c = castOf(who);
    if (c.extra === 'afin') return afinSVG();
    const extra = c.extra === 'cap' ? `<path d="M38 50h64l-8 14H48z" fill="#3a2a1a"/><rect x="34" y="60" width="72" height="8" rx="3" fill="#3a2a1a"/>`
      : c.extra === 'glasses' ? `<g fill="none" stroke="#3a2a1a" stroke-width="3"><circle cx="56" cy="78" r="10"/><circle cx="84" cy="78" r="10"/><path d="M66 78h8"/></g>`
      : c.extra === 'ribbon' ? `<path d="M96 96l14 8-14 6z" fill="#e85d4c"/>`
      : c.extra === 'folder' ? `<rect x="48" y="112" width="44" height="30" rx="3" fill="#f0d56a" stroke="#3a2a1a" stroke-width="3"/>`
      : c.extra === 'sprout' ? `<path d="M70 28c0-16 14-22 18-8-10 2-14 8-18 8z" fill="#6a8f4e"/>`
      : c.extra === 'badge' ? `<circle cx="96" cy="118" r="8" fill="#f0d56a" stroke="#3a2a1a" stroke-width="3"/>` : '';
    return `<svg viewBox="0 0 140 200" aria-hidden="true">
      <g transform="translate(8 8)"><circle cx="70" cy="72" r="32" fill="#e7d3b0"/><rect x="40" y="100" width="60" height="78" rx="14" fill="#e7d3b0"/></g>
      <g stroke="#fff" stroke-width="8" paint-order="stroke" stroke-linejoin="round">
        <rect x="40" y="102" width="60" height="78" rx="16" fill="${c.coat}"/>
        <circle cx="70" cy="70" r="32" fill="${c.skin}"/>
        <path d="M40 66c2-30 58-36 64-4-10-12-22-16-32-16s-24 6-32 20z" fill="${c.hair}"/>
        <circle cx="58" cy="74" r="3.2" fill="#2b2118" stroke="none"/>
        <circle cx="82" cy="74" r="3.2" fill="#2b2118" stroke="none"/>
        <path d="M62 86q8 8 16 0" fill="none" stroke="#c4786a" stroke-width="3"/>
        <path d="M46 150c-8 10-6 28 2 36h14c2-12 0-24-2-36z" fill="${c.coat}"/>
        <path d="M78 150c2 12 4 24 2 36h14c8-8 10-26 2-36z" fill="${c.coat}"/>
        <ellipse cx="54" cy="188" rx="12" ry="6" fill="#3a2a1a"/>
        <ellipse cx="90" cy="188" rx="12" ry="6" fill="#3a2a1a"/>
        ${extra}
      </g>
    </svg>`;
  }

  const PAPER = (inner) => `<g stroke="#fff" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${inner}</g>`;
  const SCENES = {
    idleOffice: { floor: '#6d4a42', sky: ['#2a2030', '#4a3040'], prop: PAPER(`<rect x="28" y="18" width="160" height="120" rx="8" fill="#9ec8e4"/><path d="M108 18v120M28 78h160" fill="none"/><circle cx="250" cy="36" r="18" fill="#fff1b8"/><rect x="36" y="156" width="320" height="26" rx="6" fill="#8a4a3a"/><rect x="220" y="70" width="78" height="100" rx="6" fill="#e85d4c"/><text x="236" y="126" fill="#f8e7a2" font-size="16" font-family="sans-serif" stroke="none">案卷</text>`) },
    idle: { floor: '#31443c', sky: ['#152033', '#1d4a38'], prop: PAPER(`<rect x="24" y="64" width="230" height="130" rx="8" fill="#d5ddd4"/><rect x="24" y="50" width="230" height="22" fill="#7f9788"/><rect x="268" y="16" width="46" height="178" fill="#c5cfc6"/><circle cx="291" cy="42" r="12" fill="#e24b4b"/><rect x="48" y="88" width="36" height="24" fill="#9fd0ea"/><rect x="96" y="88" width="36" height="24" fill="#9fd0ea"/><rect x="144" y="88" width="36" height="24" fill="#9fd0ea"/><rect x="52" y="150" width="170" height="20" rx="5" fill="#2c3840"/><text x="78" y="165" fill="#f6e27a" font-size="14" font-family="sans-serif" stroke="none">CAP-17</text>`) },
    recipe: { floor: '#2c3b78', sky: ['#141a40', '#243068'], prop: PAPER(`<rect x="70" y="78" width="200" height="120" rx="8" fill="#f7f1dc"/><rect x="86" y="96" width="150" height="8" fill="#2c3f86"/><rect x="86" y="114" width="120" height="8" fill="#8aa0d8"/><rect x="86" y="132" width="140" height="8" fill="#8aa0d8"/><rect x="250" y="40" width="70" height="90" rx="6" fill="#1a2758"/><circle cx="300" cy="28" r="16" fill="#fff6c8"/><rect x="40" y="120" width="48" height="64" rx="4" fill="#e8d48b" transform="rotate(-8 64 152)"/>`) },
    lab: { floor: '#b7d7c4', sky: ['#d9f6ea', '#1f6b45'], prop: PAPER(`<path d="M30 190 Q180 16 350 190" fill="#e7fff6"/><rect x="78" y="126" width="220" height="64" rx="8" fill="#f7f1e4"/><rect x="108" y="78" width="28" height="54" rx="8" fill="#7ec8c3"/><rect x="156" y="64" width="28" height="68" rx="8" fill="#e85d4c"/><rect x="210" y="96" width="70" height="40" rx="4" fill="#fff" /><text x="222" y="122" fill="#1f6b45" font-size="14" font-family="sans-serif" stroke="none">簽名</text>`) },
    synergy: { floor: '#e7b8c4', sky: ['#4c2434', '#7a2f4a'], prop: PAPER(`<rect x="36" y="40" width="120" height="150" rx="6" fill="#fffaf0"/><rect x="168" y="58" width="120" height="132" rx="6" fill="#fff3d4"/><text x="58" y="78" fill="#7a2f4a" font-size="16" font-family="sans-serif" stroke="none">帳單</text><text x="190" y="96" fill="#7a2f4a" font-size="16" font-family="sans-serif" stroke="none">第二張</text><rect x="300" y="150" width="64" height="28" rx="6" fill="#e8c56a"/><circle cx="318" cy="132" r="14" fill="#f0d56a"/><circle cx="346" cy="126" r="12" fill="#fff1b8"/>`) },
    market: { floor: '#f0d48a', sky: ['#8ec8ea', '#1d4e89'], prop: PAPER(`<rect x="40" y="70" width="200" height="120" rx="4" fill="#f7f1e4"/><path d="M28 78 L140 36 L252 78" fill="#e85d4c"/><rect x="70" y="96" width="140" height="70" fill="#d7f3ff"/><rect x="270" y="40" width="90" height="150" rx="6" fill="#1d4e89"/><text x="286" y="120" fill="#f8e7a2" font-size="18" font-family="sans-serif" stroke="none">品牌</text><circle cx="314" cy="24" r="14" fill="#fff6c8"/>`) },
    distributor: { floor: '#d7c4a0', sky: ['#c5e6ea', '#0f6e6a'], prop: PAPER(`<rect x="40" y="90" width="150" height="100" rx="6" fill="#c4554a"/><path d="M30 96 L115 40 L200 96" fill="#f4e7cf"/><rect x="220" y="120" width="46" height="70" fill="#e8c56a"/><rect x="274" y="108" width="46" height="82" fill="#f7f1dc"/><rect x="328" y="96" width="46" height="94" fill="#9fd0c8"/><text x="228" y="158" font-size="12" fill="#3a2a1a" font-family="sans-serif" stroke="none">跌價</text>`) },
    equipment: { floor: '#e7c2a4', sky: ['#f6d7b8', '#b4532a'], prop: PAPER(`<rect x="36" y="80" width="210" height="110" rx="8" fill="#d7ddd4"/><circle cx="250" cy="48" r="16" fill="#e24b4b"/><rect x="70" y="108" width="140" height="18" rx="4" fill="#3e4a52"/><rect x="270" y="100" width="18" height="70" fill="#8a8a8a"/><circle cx="300" cy="96" r="22" fill="#cfcfcf"/><rect x="300" y="130" width="70" height="48" rx="4" fill="#fff8e8"/><text x="312" y="160" font-size="14" fill="#b4532a" font-family="sans-serif" stroke="none">工單</text>`) },
    reorganization: { floor: '#e6d4ef', sky: ['#f3e6f8', '#5c3d7a'], prop: PAPER(`<rect x="80" y="70" width="180" height="120" rx="6" fill="#f7f1e4"/><rect x="110" y="96" width="40" height="40" fill="#d7ecf6"/><rect x="160" y="96" width="40" height="40" fill="#d7ecf6"/><rect x="140" y="148" width="36" height="42" fill="#5c3d7a"/><rect x="250" y="48" width="110" height="36" rx="6" fill="#c4554a"/><path d="M258 52 L352 80" stroke="#3a2a1a" fill="none"/><rect x="250" y="100" width="110" height="36" rx="6" fill="#f0d56a"/><text x="268" y="124" font-size="14" fill="#3a2a1a" font-family="sans-serif" stroke="none">新招牌</text>`) },
    location: { floor: '#d4e6ea', sky: ['#e3f2f5', '#2f7a8c'], prop: PAPER(`<rect x="40" y="96" width="120" height="94" rx="6" fill="#f7f1e4"/><rect x="56" y="112" width="40" height="28" fill="#9fd0ea"/><rect x="104" y="112" width="40" height="28" fill="#9fd0ea"/><rect x="200" y="70" width="150" height="120" rx="6" fill="#fffaf0"/><rect x="216" y="86" width="56" height="36" fill="#2f7a8c"/><rect x="280" y="86" width="56" height="36" fill="#2f7a8c"/><path d="M168 140 H192" stroke="#3a2a1a" stroke-width="4"/><path d="M186 132 L196 140 L186 148" fill="#3a2a1a"/><text x="226" y="160" font-size="14" fill="#3a2a1a" font-family="sans-serif" stroke="none">−1,500</text>`) },
    lowvalue: { floor: '#ecdcb4', sky: ['#f7ecd0', '#8a6a1f'], prop: PAPER(`<rect x="90" y="50" width="170" height="140" rx="6" fill="#fffdf6"/><path d="M110 78 H240 M110 100 H240 M110 122 H240 M110 144 H200" stroke="#c9b48a" stroke-width="4"/><circle cx="226" cy="160" r="22" fill="none" stroke="#c4554a" stroke-width="4"/><text x="212" y="166" font-size="13" fill="#c4554a" font-family="sans-serif" stroke="none">5%</text><rect x="280" y="120" width="80" height="70" rx="6" fill="#8a6a1f"/>`) },
    cca: { floor: '#dce8cc', sky: ['#eaf3dd', '#4b6b2f'], prop: PAPER(`<rect x="60" y="120" width="70" height="70" rx="6" fill="#d7ecf6"/><rect x="150" y="100" width="70" height="90" rx="6" fill="#f3d9e4"/><rect x="240" y="80" width="70" height="110" rx="6" fill="#f7e7b6"/><path d="M95 118 L185 60 L275 78" fill="none" stroke="#4b6b2f" stroke-width="4"/><circle cx="185" cy="56" r="18" fill="#4b6b2f"/><text x="72" y="160" font-size="13" fill="#3a2a1a" font-family="sans-serif" stroke="none">TW</text><text x="164" y="150" font-size="13" fill="#3a2a1a" font-family="sans-serif" stroke="none">JP</text><text x="254" y="140" font-size="13" fill="#3a2a1a" font-family="sans-serif" stroke="none">SG</text>`) },
    htvi: { floor: '#ecd6e6', sky: ['#f6e7f1', '#7a3f6e'], prop: PAPER(`<rect x="50" y="70" width="260" height="120" rx="8" fill="#fffdf6"/><path d="M70 170 L130 160 L190 150 L250 100 L290 80" fill="none" stroke="#7a3f6e" stroke-width="5"/><path d="M70 170 L130 165 L190 160 L250 156 L290 152" fill="none" stroke="#9a9a9a" stroke-width="3" stroke-dasharray="6 5"/><circle cx="330" cy="70" r="20" fill="#7a3f6e"/><rect x="322" y="62" width="16" height="16" rx="3" fill="#f7e7b6"/>`) },
    'sandwich-history': { floor: '#d5e4ea', sky: ['#16324e', '#1a3a5c'], prop: PAPER(`<rect x="250" y="36" width="28" height="140" fill="#f4e7cf"/><path d="M236 40 h56 l-8 22 h-40z" fill="#e85d4c"/><circle cx="264" cy="28" r="10" fill="#fff6c8"/><path d="M20 180 Q80 150 140 176 T260 168" fill="none"/><rect x="36" y="96" width="150" height="90" rx="6" fill="#f7f1dc"/><text x="58" y="132" font-size="16" fill="#1a3a5c" font-family="sans-serif" stroke="none">授權鏈</text><circle cx="70" cy="160" r="8" fill="#0f6e6a"/><circle cx="110" cy="168" r="8" fill="#9c2430"/><circle cx="146" cy="158" r="8" fill="#1d4e89"/>`) },
    treaty: { floor: '#e6d3a4', sky: ['#f6ecd0', '#6b5420'], prop: PAPER(`<rect x="40" y="120" width="300" height="28" rx="6" fill="#8a6230"/><rect x="70" y="48" width="90" height="80" rx="4" fill="#fffaf0"/><rect x="210" y="48" width="90" height="80" rx="4" fill="#fff3d4"/><text x="86" y="94" font-size="16" fill="#6b5420" font-family="sans-serif" stroke="none">稅單</text><text x="226" y="94" font-size="16" fill="#6b5420" font-family="sans-serif" stroke="none">稅單</text><path d="M160 36 h50 M185 20 v70" stroke="#3a2a1a" fill="none"/><circle cx="154" cy="40" r="14" fill="#f0d56a"/><circle cx="214" cy="40" r="14" fill="#f0d56a"/>`) },
    shelf: { floor: '#c9a27a', sky: ['#f3e6d4', '#3d6a4e'], prop: PAPER(`<rect x="24" y="36" width="352" height="160" rx="8" fill="#6b3e2a"/><rect x="40" y="52" width="28" height="120" fill="#9c2430"/><rect x="74" y="52" width="24" height="120" fill="#2c3f86"/><rect x="104" y="52" width="30" height="120" fill="#1f6b45"/><rect x="140" y="52" width="26" height="120" fill="#7a2f4a"/><rect x="172" y="52" width="30" height="120" fill="#1d4e89"/><rect x="208" y="52" width="24" height="120" fill="#0f6e6a"/><rect x="238" y="52" width="28" height="120" fill="#b4532a"/><rect x="272" y="52" width="26" height="120" fill="#5c3d7a"/><rect x="304" y="52" width="24" height="120" fill="#1a3a5c"/><rect x="334" y="52" width="26" height="120" fill="#6b5420"/>`) }
  };
  const ISLANDS = {
    0: { floor: '#bdd6b3', sky: ['#d7efe4', '#447c74'], prop: PAPER(`<rect x="70" y="70" width="200" height="110" rx="8" fill="#e7fff6"/><rect x="90" y="90" width="70" height="50" fill="#9fd0ea"/><rect x="170" y="90" width="70" height="50" fill="#9fd0ea"/><path d="M40 70 h80 v-28 h30 v28" fill="#7f9788"/><circle cx="300" cy="40" r="16" fill="#fff6c8"/><text x="108" y="150" font-size="16" fill="#447c74" font-family="sans-serif" stroke="none">總部</text>`) },
    1: { floor: '#c8d8cf', sky: ['#d5e8f2', '#467f9c'], prop: PAPER(`<rect x="40" y="60" width="250" height="120" rx="6" fill="#eef6f8"/><rect x="60" y="80" width="70" height="40" fill="#9ec8e4"/><rect x="150" y="80" width="70" height="40" fill="#9ec8e4"/><rect x="240" y="100" width="90" height="70" rx="6" fill="#4a6b80"/><text x="255" y="140" font-size="14" fill="#f6e27a" font-family="sans-serif" stroke="none">晶圓</text>`) },
    2: { floor: '#d8d3e3', sky: ['#efe8f8', '#76629d'], prop: PAPER(`<path d="M40 180 Q180 30 340 180" fill="#f4e9ff"/><rect x="90" y="110" width="200" height="60" rx="8" fill="#f7f1e4"/><rect x="120" y="70" width="24" height="48" rx="8" fill="#7ec8c3"/><rect x="170" y="58" width="24" height="60" rx="8" fill="#e85d4c"/><text x="210" y="146" font-size="14" fill="#76629d" font-family="sans-serif" stroke="none">實驗</text>`) },
    3: { floor: '#ead7ba', sky: ['#e7f4ea', '#b16f4c'], prop: PAPER(`<rect x="36" y="80" width="140" height="100" fill="#c4554a"/><path d="M24 88 L106 36 L188 88" fill="#f4e7cf"/><rect x="210" y="100" width="40" height="80" fill="#e8c56a"/><rect x="260" y="88" width="40" height="92" fill="#f7f1dc"/><rect x="310" y="76" width="40" height="104" fill="#9fd0c8"/><text x="214" y="150" font-size="12" fill="#3a2a1a" font-family="sans-serif" stroke="none">倉庫</text>`) },
    4: { floor: '#f0d48a', sky: ['#d7f3ff', '#b67b42'], prop: PAPER(`<rect x="40" y="70" width="180" height="110" fill="#f7f1e4"/><path d="M28 78 L130 34 L232 78" fill="#e85d4c"/><rect x="250" y="40" width="100" height="140" rx="6" fill="#1d4e89"/><text x="268" y="120" font-size="16" fill="#f8e7a2" font-family="sans-serif" stroke="none">市集</text><circle cx="300" cy="24" r="14" fill="#fff6c8"/>`) },
    5: { floor: '#c5d5b8', sky: ['#e7f0df', '#587b5d'], prop: PAPER(`<rect x="80" y="50" width="200" height="130" rx="4" fill="#f7f1e4"/><rect x="100" y="70" width="36" height="70" fill="#d7ecf6"/><rect x="150" y="70" width="36" height="70" fill="#d7ecf6"/><rect x="200" y="70" width="36" height="70" fill="#d7ecf6"/><rect x="150" y="150" width="40" height="30" fill="#587b5d"/><circle cx="300" cy="48" r="22" fill="#e8c56a"/><text x="118" y="160" font-size="14" fill="#587b5d" font-family="sans-serif" stroke="none">金庫</text>`) },
    6: { floor: '#d0d4bd', sky: ['#e7eee4', '#6d806c'], prop: PAPER(`<rect x="40" y="60" width="200" height="120" rx="6" fill="#f7f1e4"/><circle cx="250" cy="80" r="28" fill="#e24b4b"/><rect x="236" y="108" width="28" height="50" fill="#6d806c"/><rect x="290" y="70" width="70" height="100" rx="4" fill="#fff6dc"/><text x="304" y="126" font-size="14" fill="#6d806c" font-family="sans-serif" stroke="none">查核</text>`) },
    7: { floor: '#d8d1cb', sky: ['#f3eee8', '#7a6b85'], prop: PAPER(`<rect x="30" y="40" width="28" height="140" fill="#9c2430"/><rect x="64" y="40" width="24" height="140" fill="#2c3f86"/><rect x="94" y="40" width="28" height="140" fill="#1f6b45"/><rect x="128" y="40" width="24" height="140" fill="#7a2f4a"/><rect x="180" y="90" width="160" height="80" rx="6" fill="#f7f1dc"/><text x="210" y="136" font-size="16" fill="#7a6b85" font-family="sans-serif" stroke="none">圖書館</text>`) }
  };
  const KIND_PROPS = {
    desk: PAPER(`<rect x="20" y="150" width="360" height="30" rx="6" fill="#8a5a3a"/><rect x="40" y="178" width="16" height="40" fill="#6b4329"/><rect x="344" y="178" width="16" height="40" fill="#6b4329"/><rect x="80" y="92" width="124" height="62" rx="3" fill="#fffdf4" transform="rotate(-4 142 123)"/><path d="M96 108h86M96 121h96M96 134h62" stroke="#b9a37c" stroke-width="5" fill="none"/><rect x="200" y="90" width="112" height="64" rx="3" fill="#fff3d4" transform="rotate(5 256 122)"/><path d="M216 108h76M216 121h60" stroke="#c9b38a" stroke-width="5" fill="none"/><circle cx="290" cy="140" r="12" fill="#e24b4b"/><path d="M344 150V70l-30-20" fill="none" stroke="#4a4a4a" stroke-width="6"/><path d="M292 40h44l-10 24h-24z" fill="#f0d56a"/><text x="112" y="150" fill="#8a5a3a" font-size="13" font-family="sans-serif" stroke="none">合約</text>`),
    archive: PAPER(`<rect x="24" y="26" width="210" height="178" rx="6" fill="#7a5236"/><rect x="36" y="40" width="186" height="44" fill="#5c3c26"/><rect x="36" y="94" width="186" height="44" fill="#5c3c26"/><rect x="36" y="148" width="186" height="44" fill="#5c3c26"/><rect x="44" y="48" width="52" height="36" fill="#e8d4a8"/><rect x="104" y="48" width="52" height="36" fill="#d9c08a"/><rect x="164" y="48" width="50" height="36" fill="#e8d4a8"/><rect x="44" y="102" width="52" height="36" fill="#d9c08a"/><rect x="104" y="102" width="52" height="36" fill="#e8d4a8"/><rect x="164" y="102" width="50" height="36" fill="#d9c08a"/><rect x="44" y="156" width="52" height="36" fill="#e8d4a8"/><rect x="104" y="156" width="52" height="36" fill="#d9c08a"/><rect x="258" y="120" width="116" height="74" rx="4" fill="#fffaf0"/><path d="M258 120l58 40 58-40" fill="none" stroke="#c4554a" stroke-width="4"/><text x="296" y="186" fill="#c4554a" font-size="15" font-family="sans-serif" stroke="none">調閱</text>`),
    board: PAPER(`<rect x="36" y="22" width="328" height="176" rx="8" fill="#c99a62"/><rect x="62" y="44" width="72" height="52" fill="#fffdf4" transform="rotate(-3 98 70)"/><rect x="166" y="38" width="72" height="52" fill="#fff3d4"/><rect x="268" y="54" width="72" height="52" fill="#fffdf4" transform="rotate(4 304 80)"/><rect x="106" y="122" width="72" height="52" fill="#fff3d4" transform="rotate(3 142 148)"/><rect x="226" y="126" width="72" height="52" fill="#fffdf4"/><path d="M98 52L202 46 304 62M202 46L142 130 262 134" stroke="#d6453a" stroke-width="3" fill="none"/><circle cx="98" cy="52" r="6" fill="#e24b4b"/><circle cx="202" cy="46" r="6" fill="#e24b4b"/><circle cx="304" cy="62" r="6" fill="#e24b4b"/><circle cx="142" cy="130" r="6" fill="#e24b4b"/><circle cx="262" cy="134" r="6" fill="#e24b4b"/>`),
    verdict: PAPER(`<rect x="30" y="34" width="130" height="96" rx="6" fill="#9ec8e4"/><path d="M95 34v96M30 82h130" fill="none"/><rect x="20" y="150" width="360" height="32" rx="6" fill="#6d4a42"/><path d="M262 58v84M206 70h112" stroke="#8a6a2a" stroke-width="6" fill="none"/><path d="M206 70l-20 38h40z" fill="#f0d56a"/><path d="M318 70l-20 38h40z" fill="#f0d56a"/><rect x="236" y="138" width="52" height="12" rx="3" fill="#8a6a2a"/><rect x="62" y="118" width="88" height="36" rx="3" fill="#fffdf4"/><text x="88" y="142" fill="#6d4a42" font-size="14" font-family="sans-serif" stroke="none">報告</text>`),
    meeting: PAPER(`<rect x="40" y="30" width="150" height="90" rx="6" fill="#fffdf4"/><path d="M60 56h110M60 74h90M60 92h100" stroke="#b9a37c" stroke-width="5" fill="none"/><rect x="60" y="130" width="280" height="40" rx="20" fill="#8a5a3a"/><rect x="80" y="170" width="14" height="40" fill="#6b4329"/><rect x="306" y="170" width="14" height="40" fill="#6b4329"/><rect x="250" y="40" width="100" height="70" rx="8" fill="#3d4a5c"/><text x="268" y="82" fill="#f6e27a" font-size="14" font-family="sans-serif" stroke="none">對質</text>`)
  };
  const KIND_SCENE = { document: 'desk', request: 'archive', puzzle: 'board', sequence: 'board', costBase: 'board', profitSplit: 'board', assetScope: 'board', verdict: 'verdict', crossExamination: 'meeting' };
  function sceneFor(id, island, kind) {
    if (id === 'shelf') return { id: 'shelf', ...SCENES.shelf };
    const prop = KIND_PROPS[KIND_SCENE[kind]];
    if (prop) {
      const pal = ISLANDS[island] || SCENES[id] || SCENES.idle;
      return { id: KIND_SCENE[kind] + '-' + (island ?? 'x'), floor: pal.floor, sky: pal.sky, prop };
    }
    if (kind === 'talk' && ISLANDS[island]) return { id: 'isle-' + island, ...ISLANDS[island] };
    if (id === 'idle' && island === 6) return { id: 'idleOffice', ...SCENES.idleOffice };
    const home = typeof episodes !== 'undefined' ? episodes.find(ep => ep.id === id)?.island : undefined;
    if (home != null && island != null && island !== home && ISLANDS[island]) return { id: 'isle-' + island, ...ISLANDS[island] };
    const scene = SCENES[id] || ISLANDS[island] || SCENES.idle;
    return { id: SCENES[id] ? id : 'isle-' + (island ?? 'x'), ...scene };
  }
  function paperCloud(x, y) {
    return `<g stroke="#fff" stroke-width="8" paint-order="stroke" stroke-linejoin="round" transform="translate(${x} ${y})"><ellipse cx="0" cy="8" rx="36" ry="22" fill="#fffdf8"/><ellipse cx="28" cy="12" rx="24" ry="18" fill="#fffdf8"/><ellipse cx="-26" cy="14" rx="20" ry="15" fill="#fffdf8"/><circle cx="-8" cy="6" r="2.2" fill="#3a2a1a" stroke="none"/><circle cx="10" cy="6" r="2.2" fill="#3a2a1a" stroke="none"/><path d="M-4 14 q6 6 14 0" fill="none" stroke="#3a2a1a" stroke-width="2"/></g>`;
  }
  function sceneArt(scene) {
    const [sky] = scene.sky;
    const hill = scene.floor;
    return `<div class="layer sky"><svg viewBox="0 0 720 280" preserveAspectRatio="xMidYMid slice">
      <rect width="720" height="280" fill="${sky}"/>
      <circle cx="630" cy="52" r="26" fill="#fff3b0" stroke="#fff" stroke-width="8"/>
      ${paperCloud(120, 54)}${paperCloud(300, 36)}
    </svg></div>
    <div class="layer hill"><svg viewBox="0 0 720 220" preserveAspectRatio="xMidYMax meet">
      <path d="M-20 210 Q180 70 380 150 T760 90 V240 H-20 Z" fill="${hill}" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
    </svg></div>
    <div class="cut cut-tree"><svg viewBox="0 0 150 180" preserveAspectRatio="xMidYMax meet"><g stroke="#fff" stroke-width="9" paint-order="stroke" stroke-linejoin="round"><rect x="64" y="112" width="20" height="52" rx="4" fill="#8a5a32"/><circle cx="74" cy="78" r="50" fill="#5eaf62"/><circle cx="46" cy="98" r="28" fill="#8ed36a"/><circle cx="104" cy="96" r="26" fill="#3e9a55"/></g></svg></div>
    <div class="cut cut-prop"><svg viewBox="0 0 400 230" preserveAspectRatio="xMidYMax meet">${scene.prop}</svg></div>
    <div class="ground-card" style="--floor:${scene.floor}"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="paper-bits" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b><b></b></div>`;
  }

  window.TPPaperKit = { actorSVG, castOf, sceneArt, BG };
  function roleFor(who, step) {
    if (who === '你') return '查核員';
    if (who === '旁白') return '事件簿';
    if (step && who === step.speaker && step.role) return step.role;
    return castOf(who).role;
  }
  function challengeOf(e) {
    return typeof TPLessons !== 'undefined' ? TPLessons[e.id]?.challenge : null;
  }
  function guideOf(e) {
    return window.TPStoryGuide?.cases[e.id] || null;
  }
  function linesFor(e, r, s) {
    const out = [];
    const seen = new Set();
    const add = (who, text, role) => {
      const name = String(who || '旁白').replace(/／文據核對$/, '');
      const t = String(text || '').trim().replace(/^「|」$/g, '');
      const key = name + '\n' + t;
      if (!t || seen.has(key)) return;
      seen.add(key);
      out.push({ who: name, role: role || roleFor(name, s), text: t });
    };
    const afin = (text) => add('阿芬', text, '查核領隊');
    if (r.step === 0) {
      (e.opening || []).forEach(p => add('旁白', p, '事件簿'));
      if (e.question) afin(e.question);
      if (s.narration) add(s.speaker || '阿芬', s.narration, s.speaker ? (s.role || roleFor(s.speaker, s)) : '查核領隊');
      if (s.prompt) afin(s.prompt);
    } else if (s.kind === 'crossExamination' && challengeOf(e)) {
      add('旁白', challengeOf(e).scene, '新的反證');
    } else if (s.kind !== 'talk') {
      if (s.speaker && s.speaker !== '阿芬' && s.narration) add(s.speaker, s.narration);
      else add('旁白', s.title || s.narration, '這一步');
      if (s.prompt) add('旁白', s.prompt, '這一步');
    }
    if (s.kind === 'talk') {
      const d = dialogueState(r, r.step, s);
      const history = d.history?.length ? d.history : [{ speaker: s.speaker || '旁白', text: s.nodes?.[d.node]?.text }];
      const lastYou = history.reduce((at, item, index) => item.speaker === '你' ? index : at, -1);
      const slice = lastYou >= 0 ? history.slice(lastYou) : history.slice(-1);
      out.intro = out.length;
      slice.forEach(item => add(item.speaker || s.speaker || '旁白', item.text));
      return out;
    }
    if (s.kind === 'verdict' && r.step === 0) afin('算式在舞台下方。填這次有證據的金額，再勾選要寫進報告的理由。');
    else if (s.kind === 'verdict') add('旁白', '算式在舞台下方。填這次有證據的金額，再勾選要寫進報告的理由。', '這一步');
    else if (s.file && r.step === 0) afin('背景先看到這裡。左邊那張紙是這一步的線索，下面可以選擇要怎麼問。');
    out.intro = out.length;
    return out;
  }

  const flowColor = ['#c4553f', '#2f6f8f', '#5a7a2f', '#8a5a9a'];
  function flowSVG(card) {
    const ps = card.parties, w = 120, gap = 46, W = ps.length * w + (ps.length - 1) * gap;
    const x = id => { const i = ps.findIndex(p => p.id === id); return i * (w + gap) + w / 2; };
    const box = ps.map((p, i) => `<g transform="translate(${i * (w + gap)} 0)"><rect width="${w}" height="58" rx="10" fill="#fffdf6" stroke="#3a2a1a" stroke-width="2"/><text x="${w / 2}" y="22" text-anchor="middle" font-size="13" font-weight="800" fill="#3a2a1a">${safe(p.id)}</text><text x="${w / 2}" y="42" text-anchor="middle" font-size="10.5" fill="#6a5640">${safe(p.place.length > 9 ? p.place.slice(0, 9) + '…' : p.place)}</text></g>`).join('');
    const arrows = card.flows.filter(f => f[0] !== f[1]).map((f, i) => {
      const a = x(f[0]), b = x(f[1]), y = 84 + i * 30, dir = b > a ? 1 : -1, c = flowColor[i % flowColor.length];
      return `<g><path d="M${a} 58V${y}H${b - dir * 6}" fill="none" stroke="${c}" stroke-width="2"/><path d="M${b - dir * 8} ${y - 5}L${b} ${y}L${b - dir * 8} ${y + 5}Z" fill="${c}"/><path d="M${b} ${y}V60" stroke="${c}" stroke-width="2" stroke-dasharray="3 3"/><text x="${(a + b) / 2}" y="${y - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="${c}">${safe(f[2])}</text></g>`;
    }).join('');
    const H = 84 + card.flows.length * 30;
    return `<svg class="case-flow" viewBox="-4 -4 ${W + 8} ${H}" role="img" aria-label="公司關係與金流圖">${box}${arrows}</svg>`;
  }
  /** Short left-rail strip: only what you need while talking. Full dossier stays in 案情卡. */
  function missionHTML(e, r, s, aim, guestWho, profile, guide) {
    const phase = window.TPCaseBriefs ? TPCaseBriefs.phaseOf(s) : '';
    const next = e.steps[r.step + 1];
    const nextAim = next ? (guide?.aims[r.step + 1] || next.title || '') : '';
    let html = `<p class="case-aim"><b>目前任務・第 ${r.step + 1} 步${phase ? '（' + safe(phase) + '）' : ''}。</b>${safe(aim)}</p>`;
    html += `<p class="case-next"><b>完成後的下一步。</b>${next ? `${safe(next.label)}：${safe(nextAim)}` : '寫出結案判斷：交易是什麼、爭點是什麼、證據支持什麼，以及還有哪些不確定。'}</p>`;
    if (profile) html += `<p class="case-person"><b>${safe(guestWho)}是誰。</b>${safe(profile)}</p>`;
    return html;
  }
  function briefHTML(e, r, s, aim, guestWho, profile, guide) {
    const card = window.TPCaseBriefs?.cases[e.id];
    const have = new Set(r.files || []);
    const solved = new Set(r.solved || []);
    let html = missionHTML(e, r, s, aim, guestWho, profile, guide);
    if (card) {
      const tx = card.tx;
      html += `<details class="case-card"${r.step === 0 ? ' open' : ''}><summary>案情卡：公司、交易與金流</summary>
        <p class="case-you"><b>你的角色。</b>${safe(card.you)}</p>
        ${flowSVG(card)}
        <ul class="case-parties">${card.parties.map(p => `<li><b>${safe(p.id)}</b> ${safe(p.name)}（${safe(p.place)}）：${safe(p.role)}</li>`).join('')}</ul>
        <dl class="case-tx"><dt>被檢視的交易</dt><dd>${safe(tx.what)}</dd><dt>方向</dt><dd>${safe(tx.dir)}</dd><dt>金額</dt><dd>${safe(tx.amount)}</dd><dt>計價方式</dt><dd>${safe(tx.pricing)}</dd><dt>年度</dt><dd>${safe(tx.year)}</dd><dt>單位</dt><dd>${safe(card.unit)}</dd></dl>
        <p><b>為什麼開始查。</b>${safe(card.trigger)}</p>
        <p><b>故事背景。</b>${safe((e.opening || []).join(''))}</p></details>`;
      const confirmed = card.facts.filter(f => have.has(f[0])), pending = card.facts.filter(f => !have.has(f[0]));
      html += `<details class="case-facts"${r.step === 0 ? ' open' : ''}><summary>事實、主張與待查（已確認 ${confirmed.length}／${card.facts.length}）</summary>
        <b class="fact-head is-fact">已確認事實（有證據原文）</b>${confirmed.length ? `<ul>${confirmed.map(f => `<li><em>${safe(f[0])}</em>${safe(f[1])}</li>`).join('')}</ul>` : '<p class="fact-empty">還沒有。調閱或翻開證據後，這裡會出現。</p>'}
        <b class="fact-head is-claim">當事人主張（還不是事實）</b><ul>${card.claims.map(c => `<li><em>${safe(c[0])}</em>${safe(c[1])}<small>查證方向：${safe(c[2])}</small></li>`).join('')}</ul>
        <b class="fact-head is-open">待查證</b>${pending.length ? `<ul>${pending.map(f => `<li><em>需 ${safe(f[0])}</em>${safe(f[2])}</li>`).join('')}</ul>` : '<p class="fact-empty">關鍵事實都已有證據。</p>'}
        ${solved.size ? `<b class="fact-head is-mine">你的推論（已通過的步驟）</b><ul>${[...solved].sort((a, b) => a - b).map(i => e.steps[i]).filter(Boolean).map(st => `<li><em>${safe(st.label)}</em>${safe(st.insight || st.title || '')}</li>`).join('')}</ul>` : ''}</details>`;
      const files = (e.files || []).filter(f => have.has(f.id));
      html += `<details class="case-evidence"><summary>已取得證據（${files.length}／${(e.files || []).length}）與用途</summary>${files.length ? `<ul>${files.map(f => `<li><details><summary><em>${safe(f.id)}</em>${safe(f.title)}<small>用途：${safe(card.use[f.id] || (/-X$/.test(f.id) ? '補核：確認後來出現的文件會不會推翻原本的證據鏈' : ''))}</small></summary>${f.lines.map(l => `<p>${safe(l)}</p>`).join('')}</details></li>`).join('')}</ul>` : '<p class="fact-empty">還沒有取得證據。</p>'}</details>`;
    }
    html += `<details class="case-track"><summary>調查進度 ${r.step + 1}／${e.steps.length}</summary><ol>${e.steps.map((st, i) => `<li class="${i < r.step || solved.has(i) ? 'is-done' : i === r.step ? 'is-now' : ''}"><b>${safe(st.label)}</b><small>${safe(window.TPCaseBriefs ? TPCaseBriefs.phaseOf(st) : '')}</small></li>`).join('')}</ol></details>`;
    if (guide?.goals || card) {
      html += `<details class="case-goals"><summary>本案學習目標、爭點與依據</summary>${guide?.goals ? `<ol>${guide.goals.map(g => `<li>${safe(g)}</li>`).join('')}</ol>` : ''}<p><b>為什麼要查、核心是什麼。</b>${safe([e.concept, e.question].filter(Boolean).join(' '))}</p>${card ? `<p class="case-issues">${card.issues.map(t => `<span>${safe(t)}</span>`).join('')}</p>
        <b class="ref-head">規範依據</b><ul>${[...card.refs.tpg, ...card.refs.tw].map(t => `<li>${safe(t)}</li>`).join('')}</ul>
        <b class="ref-head">教學簡化</b><ul>${card.refs.simplify.map(t => `<li>${safe(t)}</li>`).join('')}</ul>
        <b class="ref-head">案件假設</b><ul>${card.refs.assume.map(t => `<li>${safe(t)}</li>`).join('')}</ul>` : ''}</details>`;
    }
    return html;
  }

  function mountPaper() {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content || content.querySelector('.paper-stage')) return;
    if (!content.querySelector('.story-header')) return;
    const e = seasonEpisode();
    const r = seasonRecord();
    const s = currentStep();
    if (r.complete) return;

    const logic = document.createElement('div');
    logic.id = 'paper-logic';
    while (content.firstChild) logic.appendChild(content.firstChild);
    content.appendChild(logic);

    const place = (typeof islands !== 'undefined' && islands[s.island]?.name) || '現場';
    const theme = sceneFor(e.id, s.island, s.kind);
    const sceneId = `${e.id}:${r.step}`;
    const resumed = liveScene === sceneId;
    const moved = !!liveScene && !resumed && liveScene.split(':')[0] === e.id;
    liveScene = sceneId;
    const visitor = s.kind === 'talk' ? s.speaker : s.kind === 'crossExamination' ? challengeOf(e)?.speaker : '';
    const guestWho = visitor && !AUDIT_SIDE.has(visitor) ? visitor : '';
    const guide = guideOf(e);
    const profile = guestWho && window.TPStoryGuide?.people[guestWho];
    const aim = guide?.aims[r.step] || s.narration || s.prompt || s.title || '';
    const stage = document.createElement('div');
    stage.className = 'paper-stage' + (resumed || moved ? ' is-resume' : '') + (moved ? ' is-moved' : '') + (guestWho ? ' has-guest' : '');
    const cover = coverOf(e.id);
    stage.innerHTML = `<div class="paper-desk">
      <div class="paper-book" style="--cover:${cover[0]};--cover-deep:${cover[1]}">
        <div class="book-cover" role="group" aria-label="拖曳書封以移動視窗"><b class="foil">${e.title}</b><small>${place} · ${s.label}</small></div>
        <div class="paper-stamp"><b>${r.step + 1}</b><small>/ ${e.steps.length}</small><em>${s.label}</em></div>
        <div class="diorama" data-theme="${theme.id}">${sceneArt(theme)}<div class="stage-curtain" aria-hidden="true"><i></i><i></i><b class="curtain-card"><small>前往下一個現場</small>${safe(place)} · ${safe(s.label)}</b></div><button type="button" class="stage-clue" hidden><span class="stage-clue-front"><small>翻開線索</small><b></b><em></em></span><span class="stage-clue-back"></span></button><div class="doc-slot" hidden><button type="button" class="examine" aria-label="檢視這張紙">✦</button></div><div class="actor-pop actor-host"><div class="paper-actor"></div><i class="paper-stand"></i></div><div class="actor-pop actor-guest" hidden><div class="paper-actor"></div><i class="paper-stand"></i><span class="actor-tag"></span></div></div>
        <div class="case-brief case-mission">${missionHTML(e, r, s, aim, guestWho, profile, guide)}</div>
      </div>
      <div class="paper-tools">
        <button type="button" id="paper-casecard">案情卡</button>
        <button type="button" id="paper-issues">爭點索引</button>
        <button type="button" data-paper-click="story-evidence">證據袋</button>
        <button type="button" id="paper-minutes">會議紀錄</button>
        <button type="button" data-paper-click="story-hint">請阿芬提示</button>
        <button type="button" data-paper-click="story-board">推理板</button>
        <button type="button" data-paper-click="open-case-learning">這一步在查什麼</button>
        <button type="button" data-paper-click="return-story-world">暫離現場</button>
        <button type="button" id="paper-rewind" title="回到上一步回看或補查；已完成的作答會保留">回到上一步</button>
        <button type="button" id="paper-reset">重來本案</button>
      </div>
      <div class="paper-overlay"><div class="paper-tray is-waiting"></div><div class="paper-slip"></div></div>
      <div class="paper-dialogue" role="button" tabindex="0" aria-label="繼續對話">
        <div class="paper-portrait"></div>
        <div><b class="paper-name">旁白</b><span class="paper-role"></span><p class="paper-text"></p><p class="paper-terms" hidden></p></div>
        <i class="paper-next">▼</i>
      </div>
    </div>`;
    content.appendChild(stage);
    stage.classList.add('paper-play');
    const book = stage.querySelector('.paper-book');
    const side = document.createElement('div');
    side.className = 'paper-side';
    side.append(stage.querySelector('.paper-dialogue'), stage.querySelector('.paper-overlay'));
    book.append(stage.querySelector('.case-brief'), side, stage.querySelector('.paper-tools'));
    const dioramaEl = stage.querySelector('.diorama');
    [stage.querySelector('.paper-stamp'), stage.querySelector('.travel-banner')].forEach(node => { if (node) dioramaEl.appendChild(node); });
    const live = logic.querySelector('.live-scene');
    if (live && r.step === 0) dioramaEl.appendChild(live);
    modal.classList.add('paper-open');
    const worksheet = ['puzzle', 'sequence', 'costBase', 'profitSplit', 'assetScope', 'verdict', 'crossExamination'].includes(s.kind);
    if (worksheet) stage.classList.add('paper-worksheet');

    stage.querySelector('#paper-minutes')?.addEventListener('click', () => window.ResidentMinutes?.openForCase());
    const briefEl = stage.querySelector('.case-brief');
    let briefKey = '';
    function refreshBrief() {
      const rec = seasonRecord();
      const key = JSON.stringify([rec.step, rec.files, rec.solved]);
      if (key === briefKey) return;
      briefKey = key;
      briefEl.innerHTML = missionHTML(e, rec, s, aim, guestWho, profile, guide);
    }
    briefKey = JSON.stringify([r.step, r.files, r.solved]);
    function issueIndexHTML() {
      const B = window.TPCaseBriefs;
      if (!B?.issueIndex) return '<p>爭點索引尚未載入。</p>';
      const titleOf = id => episodes.find(x => x.id === id)?.title || id;
      const rows = B.issueIndex().map(([issue, ids]) => `<li><b>${safe(issue)}</b><span>${ids.map(id => `<em class="${id === e.id ? 'is-here' : ''}">${safe(titleOf(id))}</em>`).join('')}</span></li>`).join('');
      const card = B.cases[e.id];
      const refs = card ? `<h4>本案依據（${safe(e.title)}）</h4><ul class="issue-refs">${card.refs.tpg.concat(card.refs.tw).map(x => `<li>${safe(x)}</li>`).join('')}</ul>` : '';
      return `<p class="issue-lead">同一個 TP 爭點會在不同案件出現。底色標記的是你現在這一案；其他案件可從案件選擇進入。</p><ul class="issue-index">${rows}</ul>${refs}<p class="issue-lead">來源版本：OECD 移轉訂價指導原則 2022 年版；營利事業所得稅不合常規移轉訂價查核準則（民國 109 年 12 月 28 日修正）。外國側案件只用 OECD 原則說明，不套用我國條文。</p>`;
    }
    function openCaseFile(first, mode) {
      let box = book.querySelector('.paper-casefile');
      if (!box) {
        box = document.createElement('div');
        box.className = 'paper-casefile';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', '案情簡報');
        book.appendChild(box);
      }
      const rec = seasonRecord();
      box.setAttribute('aria-label', mode === 'index' ? '爭點索引' : '案情簡報');
      const head = mode === 'index' ? `<header><small>爭點索引・${episodes.length} 個案件的 TP 爭點</small><h3>這一案在整季的位置</h3><button type="button" class="casefile-close" aria-label="關閉爭點索引">✕</button></header><div class="casefile-body case-brief">${issueIndexHTML()}</div>` : `<header><small>案情簡報・${first ? '先看懂案子，再開始調查' : '隨時可以回來看'}</small><h3>${safe(e.title)}</h3><p>${safe(e.question)}</p><button type="button" class="casefile-close" aria-label="關閉案情簡報">✕</button></header><div class="casefile-body case-brief">${briefHTML(e, rec, s, aim, guestWho, profile, guide)}</div>`;
      box.innerHTML = `<div class="casefile-sheet">${head}<footer><button type="button" class="casefile-go">${first ? '我看懂了，開始調查 →' : '回到現場'}</button></footer></div>`;
      box.querySelectorAll('.casefile-body details').forEach(d => { if (!d.classList.contains('case-evidence')) d.open = true; });
      box.hidden = false;
      box.querySelector('.casefile-sheet').scrollIntoView({ block: 'nearest' });
      const close = () => {
        box.hidden = true;
        if (first && !rec.briefSeen) { rec.briefSeen = true; window.saveSeason?.(); }
        stage.querySelector('#paper-casecard')?.focus();
      };
      box.querySelector('.casefile-close').onclick = close;
      box.querySelector('.casefile-go').onclick = close;
      box.onkeydown = ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); } };
      box.querySelector('.casefile-go').focus({ preventScroll: true });
    }
    stage.querySelector('#paper-casecard').addEventListener('click', () => openCaseFile(false));
    stage.querySelector('#paper-issues').addEventListener('click', () => openCaseFile(false, 'index'));
    if (r.step === 0 && !r.briefSeen && !resumed) setTimeout(() => { if (stage.isConnected) openCaseFile(true); }, 700);
    const tray = stage.querySelector('.paper-tray');
    const slip = stage.querySelector('.paper-slip');
    const review = logic.querySelector('#review-story-talk');
    if (review) {
      const tools = stage.querySelector('.paper-tools');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '訪談筆錄';
      button.onclick = () => review.click();
      tools.appendChild(button);
    }
    ['.request-scene', '.story-question', '.story-choices', '.contract-lines', '.authored-questions', '.professional-followup', '.shown-exhibit', '.sequence-puzzle', '#check-story-sequence', '.classification-puzzle', '#check-story-puzzle', '.cost-basket', '#check-cost-basket', '.split-board', '#check-split-board', '.asset-scope', '#check-asset-scope', '.position-story', '.hypothesis-pair', '.cross-question', '#cross-check', '.cross-scene', '.conversation-finished'].forEach(sel => {
      logic.querySelectorAll(sel).forEach(node => { if (!tray.contains(node)) tray.appendChild(node); });
    });
    const feedback = logic.querySelector('#case-feedback');
    if (feedback) slip.appendChild(feedback);
    const doc = logic.querySelector('.story-play > .story-document');
    const slot = stage.querySelector('.doc-slot');
    const clue = stage.querySelector('.stage-clue');
    const fileMeta = s.file && typeof getFile === 'function' ? getFile(e, s.file) : null;
    if (fileMeta && clue) {
      clue.hidden = false;
      clue.querySelector('b').textContent = fileMeta.id;
      clue.querySelector('em').textContent = fileMeta.title;
      clue.querySelector('.stage-clue-back').innerHTML = fileMeta.lines.slice(0, 3).map(line => `<p>${safe(line)}</p>`).join('');
      clue.onclick = () => {
        clue.classList.toggle('is-open');
        say({ who: '阿芬', role: '查核領隊', text: clue.classList.contains('is-open') ? `${fileMeta.id} 翻開了。看完再選對話。` : '線索先闔上。人還站在台上。' });
      };
    }
    if ((worksheet || (fileMeta && clue)) && doc) {
      doc.classList.add('worksheet-source');
      doc.hidden = true;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'worksheet-source-toggle';
      toggle.textContent = '展開這份原文';
      toggle.onclick = () => {
        doc.hidden = !doc.hidden;
        toggle.textContent = doc.hidden ? '展開這份原文' : '收合原文';
      };
      tray.prepend(toggle, doc);
    } else if (doc) {
      slot.hidden = false;
      slot.appendChild(doc);
      slot.addEventListener('click', event => {
        if (event.target.closest('button') && !event.target.classList.contains('examine')) return;
        slot.classList.toggle('is-reading');
      });
    }

    const portrait = stage.querySelector('.paper-portrait');
    const hostPop = stage.querySelector('.actor-host');
    const guestPop = stage.querySelector('.actor-guest');
    const nameEl = stage.querySelector('.paper-name');
    const roleEl = stage.querySelector('.paper-role');
    const textEl = stage.querySelector('.paper-text');
    const termsEl = stage.querySelector('.paper-terms');
    const showTerms = () => {
      const hits = window.TPGlossary ? TPGlossary.find(full) : [];
      termsEl.hidden = !hits.length;
      termsEl.innerHTML = hits.map(h => `<span><b>${h.term}</b>${h.note}</span>`).join('');
    };
    let timer = 0;
    let full = '';
    let shownWho = '';
    let animateActors = !resumed;
    const onStage = new Map();
    function cast(pop, who) {
      if (onStage.get(pop) === who) return;
      onStage.set(pop, who);
      pop.hidden = false;
      const card = pop.querySelector('.paper-actor');
      card.innerHTML = actorSVG(who);
      const tag = pop.querySelector('.actor-tag');
      if (tag) tag.textContent = `${who} · ${castOf(who).role}`;
      if (!animateActors) return;
      pop.classList.remove('is-entering');
      void pop.offsetWidth;
      pop.classList.add('is-entering');
      card.classList.add('is-flipping');
      setTimeout(() => card.classList.remove('is-flipping'), 420);
    }
    if (guestWho) {
      cast(guestPop, guestWho);
      cast(hostPop, '阿芬');
    }
    function say(line, done) {
      const onGuest = !!guestWho && !AUDIT_SIDE.has(line.who);
      const pop = onGuest ? guestPop : hostPop;
      const bubble = stage.querySelector('.paper-dialogue');
      if (!(guestWho && line.who === '旁白')) cast(pop, line.who);
      if (guestWho) {
        hostPop.classList.toggle('is-listening', onGuest);
        guestPop.classList.toggle('is-listening', !onGuest);
      }
      if (shownWho !== line.who) {
        shownWho = line.who;
        portrait.innerHTML = actorSVG(line.who);
        portrait.style.background = BG[line.who] || '#f6efcf';
        portrait.classList.add('is-flipping');
        setTimeout(() => portrait.classList.remove('is-flipping'), 420);
      }
      animateActors = true;
      pop.classList.remove('is-talking', 'is-pointing', 'is-nod');
      bubble.classList.remove('is-pop');
      void bubble.offsetWidth;
      bubble.classList.add('is-pop');
      nameEl.textContent = line.who;
      roleEl.textContent = line.role || '';
      full = line.text;
      termsEl.hidden = true;
      clearInterval(timer);
      const settle = () => { pop.classList.remove('is-talking'); showTerms(); done?.(); };
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || full.length <= 1) { textEl.textContent = full; settle(); return; }
      let i = 1;
      textEl.textContent = full.slice(0, 1);
      timer = setInterval(() => {
        i += 1;
        textEl.textContent = full.slice(0, i);
        if (i >= full.length) { clearInterval(timer); settle(); }
      }, 26);
    }
    function finishTyping() {
      clearInterval(timer);
      textEl.textContent = full;
      showTerms();
      stage.querySelectorAll('.actor-pop').forEach(pop => pop.classList.remove('is-talking'));
    }

    const allLines = linesFor(e, r, s);
    const fresh = resumed ? allLines.slice(allLines.intro) : allLines;
    const lines = resumed && !fresh.length ? allLines.slice(-1) : fresh;
    let cursor = 0;
    let lineDone = false;
    let queueDone = false;
    let lastFeedback = '';
    function revealAction({ pause = false } = {}) {
      if (!queueDone) {
        guideTo(stage.querySelector('.paper-dialogue'), { focus: false });
        return;
      }
      const action = tray.querySelector('.story-choices, .authored-questions, .contract-lines, button')
        || slip.querySelector('button')
        || tray;
      guideTo(action, { focus: !!tray.querySelector('button'), delay: pause ? READ_PAUSE_MS : 0 });
    }
    function finishQueue() {
      queueDone = true;
      stage.classList.add('is-ready');
      tray.classList.remove('is-waiting');
      syncFeedback();
      // Let the last line be read before jumping to choices.
      revealAction({ pause: true });
    }
    function showLine(index) {
      lineDone = false;
      stage.classList.remove('is-ready');
      clearGuideTimer();
      guideTo(stage.querySelector('.paper-dialogue'), { focus: false });
      say(lines[index], () => {
        lineDone = true;
        if (index >= lines.length - 1) finishQueue();
      });
    }
    function advance() {
      clearGuideTimer();
      if (!lineDone) {
        finishTyping();
        lineDone = true;
        if (cursor >= lines.length - 1) finishQueue();
        return;
      }
      if (cursor < lines.length - 1) { cursor += 1; showLine(cursor); return; }
      if (!queueDone) finishQueue();
      else revealAction({ pause: false });
    }
    function syncFeedback() {
      if (!stage.isConnected) return;
      refreshBrief();
      const box = slip.querySelector('.story-feedback');
      slip.classList.toggle('is-open', !!(box && queueDone));
      dressAll();
      if (!box || !queueDone) return;
      const paragraph = box.querySelector('p')?.textContent?.trim() || '';
      if (!paragraph || paragraph === lastFeedback) return;
      lastFeedback = paragraph;
      const ok = box.classList.contains('supported');
      tray.classList.toggle('is-waiting', ok);
      say({ who: '阿芬', role: ok ? '查核領隊' : '這個推論還接不上', text: paragraph });
      const target = ok
        ? (stage.querySelector('.paper-dialogue') || slip)
        : (tray.querySelector('button') || stage.querySelector('.paper-dialogue'));
      guideTo(target, { focus: !ok, delay: READ_PAUSE_MS });
    }
    function dress(button) {
      if (!button || button.dataset.paperDressed) return;
      button.dataset.paperDressed = '1';
      const hits = window.TPGlossary && button.closest('.story-choices, .authored-questions') ? TPGlossary.find(button.textContent, 2) : [];
      if (hits.length) {
        button.title = hits.map(h => `${h.term}：${h.note}`).join('\n');
        button.insertAdjacentHTML('beforeend', `<small class="paper-choice-terms">${hits.map(h => `${h.term}＝${h.note}`).join('；')}</small>`);
      }
      const fn = button.onclick;
      button.onclick = (event) => {
        if (button.id === 'next-story-step' && !button.dataset.turning) {
          button.dataset.turning = '1';
          stage.classList.add('is-leaving');
          setTimeout(() => fn?.call(button, event), 420);
          return;
        }
        fn?.call(button, event);
        if (stage.isConnected) syncFeedback();
      };
    }
    function dressAll() { stage.querySelectorAll('.paper-tray button, .paper-slip button').forEach(dress); }
    dressAll();
    if (feedback) {
      const watch = new MutationObserver(() => { if (stage.isConnected) syncFeedback(); else watch.disconnect(); });
      watch.observe(feedback, { childList: true, subtree: true });
    }
    stage.querySelector('#paper-rewind').onclick = () => window.rewindStoryStep?.();
    stage.querySelector('#paper-reset').onclick = () => {
      if (!window.confirm('重來會清掉這件案子目前的進度，從開場再查一次。')) return;
      liveScene = '';
      window.resetStoryCase?.();
    };
    stage.querySelectorAll('[data-paper-click]').forEach(button => {
      button.onclick = () => {
        const target = document.getElementById(button.dataset.paperClick);
        if (button.dataset.paperClick === 'return-story-world' && leaveCaseTheater()) return;
        if (button.dataset.paperClick === 'story-hint' && target) {
          target.click();
          const hint = logic.querySelector('#story-hint-text')?.textContent?.trim();
          if (hint) say({ who: '阿芬', role: '提示', text: hint });
          return;
        }
        target?.click();
      };
    });
    const dialogue = stage.querySelector('.paper-dialogue');
    dialogue.addEventListener('click', () => { if (!queueDone) advance(); else finishTyping(); });
    dialogue.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); dialogue.click(); } });
    stage.querySelector('.diorama').addEventListener('click', event => {
      if (event.target.closest('button, a, input, select, textarea, label, .paper-overlay, .paper-dialogue, .doc-slot, .stage-clue')) return;
      if (!queueDone) advance();
    });

    if (!lines.length) {
      queueDone = true;
      stage.classList.add('is-ready');
      tray.classList.remove('is-waiting');
      say({ who: '旁白', role: '這一步', text: s.title || '' });
      syncFeedback();
      guideTo(tray.querySelector('.story-choices, .authored-questions, .contract-lines, button') || tray);
    } else if (resumed && !fresh.length) {
      say(lines[0]);
      finishTyping();
      lineDone = true;
      finishQueue();
    } else showLine(0);
    if (moved) {
      setTimeout(() => guideTo(stage.querySelector('.paper-dialogue'), { focus: false }), prefersReduceMotion() ? 0 : 720);
    }
    armCaseWindow();
  }

  function episodeFromModal() {
    const label = document.getElementById('modal-label')?.textContent || '';
    if (typeof episodes === 'undefined') return null;
    return episodes.find(ep => label.includes(ep.title)) || null;
  }
  function dressPages() {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content || content.querySelector('.paper-stage, .story-header')) return;
    const label = document.getElementById('modal-label')?.textContent || '';
    const journal = content.querySelector('.season-journal');
    const casePage = journal || content.querySelector('.evidence-bag, .detective-board, .full-authored-record, .learning-definition, .exam-hero, .story-result, .source-list, .letter-text, .report-answer, .transcript-list') || /證據|推理|提示|依據|筆錄|結案|查核|交卷|案件|規範/.test(label);
    if (!casePage) return;
    const found = episodeFromModal();
    const e = journal ? { id: 'shelf', title: '案件紀錄' } : (found || (typeof seasonEpisode === 'function' ? seasonEpisode() : null));
    if (!e) return;
    const pages = document.createElement('div');
    pages.className = 'paper-pages';
    while (content.firstChild) pages.appendChild(content.firstChild);
    if (journal) {
      pages.querySelectorAll('[data-season-record]').forEach(button => {
        const ep = episodes[+button.dataset.seasonRecord];
        if (!ep) return;
        const cloth = coverOf(ep.id)[0];
        button.style.borderLeft = `14px solid ${cloth}`;
        button.style.boxShadow = '4px 4px 0 #e8c56a';
      });
    }
    const cover = coverOf(e.id);
    const theme = sceneFor(e.id);
    const pageName = label.split('·')[0].trim() || '案卷';
    const stage = document.createElement('div');
    const fullPage = /結案|報告|評量|交卷/.test(label) || !!pages.querySelector('.story-result, .case-learning-report, .exam-hero');
    stage.className = 'paper-stage paper-pages-mode' + (fullPage ? ' paper-full' : '');
    stage.innerHTML = `<div class="paper-desk"><div class="paper-book" style="--cover:${cover[0]};--cover-deep:${cover[1]}"><div class="book-cover" role="group" aria-label="拖曳書封以移動視窗"><b class="foil">${e.title}</b><small>${pageName}</small></div><div class="diorama" data-theme="${theme.id}">${sceneArt(theme)}<div class="actor-pop"><div class="paper-actor">${actorSVG('阿芬')}</div></div></div><div class="paper-pages-slot"></div></div></div>`;
    stage.querySelector('.paper-pages-slot').appendChild(pages);
    content.appendChild(stage);
    modal.classList.add('paper-open');
    armCaseWindow();
  }
  function mountBoardQuest(index) {
    const content = document.getElementById('modal-content');
    if (!content || content.querySelector('.paper-board-quest')) return;
    const e = episodes[index];
    const cfg = e && investigationStories[e.id];
    if (!cfg) return;
    if (!content.querySelector('.paper-stage')) dressPages();
    const stage = content.querySelector('.paper-stage');
    if (!stage) return;
    stage.classList.add('paper-board-quest', 'paper-play');
    const coverLabel = stage.querySelector('.book-cover small');
    if (coverLabel) coverLabel.textContent = '證據連結';
    const book = stage.querySelector('.paper-book');
    const clue = document.createElement('div');
    clue.className = 'paper-clue';
    clue.hidden = true;
    book.appendChild(clue);
    const tray = document.createElement('div');
    tray.className = 'paper-tray is-waiting';
    const overlay = document.createElement('div');
    overlay.className = 'paper-overlay';
    overlay.appendChild(tray);
    const dialogue = document.createElement('div');
    dialogue.className = 'paper-dialogue';
    dialogue.innerHTML = `<div class="paper-portrait" style="background:#f8d6e4">${actorSVG('阿芬')}</div><div><b class="paper-name">阿芬</b><span class="paper-role">查核領隊</span><p class="paper-text"></p></div><i class="paper-next">▼</i>`;
    const side = document.createElement('div');
    side.className = 'paper-side';
    side.append(dialogue, clue, overlay);
    book.append(side);
    const r = seasonRecord(index);
    const b = boardState(r);
    const links = cfg.links;
    const textEl = dialogue.querySelector('.paper-text');
    const roleEl = dialogue.querySelector('.paper-role');
    let timer = 0;
    let full = '';
    let lineDone = false;
    let queue = [];
    let cursor = 0;
    let queueDone = false;
    function say(line, done) {
      dialogue.classList.remove('is-pop');
      void dialogue.offsetWidth;
      dialogue.classList.add('is-pop');
      roleEl.textContent = line.role || '查核領隊';
      full = line.text;
      clearInterval(timer);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || full.length <= 1) { textEl.textContent = full; done?.(); return; }
      let i = 1;
      textEl.textContent = full.slice(0, 1);
      timer = setInterval(() => {
        i += 1;
        textEl.textContent = full.slice(0, i);
        if (i >= full.length) { clearInterval(timer); done?.(); }
      }, 26);
    }
    function showLine() {
      lineDone = false;
      stage.classList.remove('is-ready');
      say(queue[cursor], () => { lineDone = true; });
    }
    function play(lines, onDone) {
      queue = lines;
      queue.onDone = onDone || null;
      cursor = 0;
      queueDone = false;
      tray.classList.add('is-waiting');
      showLine();
    }
    dialogue.addEventListener('click', () => {
      if (!lineDone) {
        clearInterval(timer);
        textEl.textContent = full;
        lineDone = true;
        return;
      }
      if (cursor < queue.length - 1) { cursor += 1; showLine(); return; }
      if (!queueDone) {
        queueDone = true;
        stage.classList.add('is-ready');
        const done = queue.onDone;
        queue.onDone = null;
        done?.();
      }
    });
    function choices(items) {
      tray.classList.remove('is-waiting');
      tray.innerHTML = `<div class="story-choices">${items.map(item => `<button type="button" data-quest="${item.id}"><span>${item.mark}</span>${item.label}</button>`).join('')}</div>`;
      tray.querySelectorAll('button').forEach(button => { button.onclick = () => items.find(item => item.id === button.dataset.quest).run(); });
    }
    const crossStep = e.steps.findIndex(step => step.kind === 'crossExamination');
    function foundAt(id) {
      let at = e.steps.findIndex(step => step.file === id || (step.reveal || []).includes(id));
      if (at < 0 && typeof TPLessons !== 'undefined' && TPLessons[e.id]?.challenge?.file === id) at = crossStep;
      return at < 0 ? '' : `第 ${at + 1} 步「${e.steps[at].label}」取得`;
    }
    function fileChoices(k) {
      const [question, answer, hint, keyLine, why] = links[k];
      clue.hidden = false;
      clue.innerHTML = `<small>第 ${k + 1} / ${links.length} 題 · 選一份對得上的文據</small>${question}<small class="paper-clue-hint">找什麼：${hint}</small>`;
      const files = r.files.filter(id => getFile(e, id));
      choices(files.map(id => {
        const file = getFile(e, id);
        const meta = [file.issuer, foundAt(id)].filter(Boolean).join(' · ');
        return { id, mark: id, label: `<div class="quest-file"><b>${safe(file.title)}</b><small class="quest-file-meta">${safe(meta)}</small></div>`, run() {
          if (id === answer) {
            b.links[k] = id;
            b.verified = false;
            saveSeason();
            const quote = file.lines[keyLine ?? 0] || file.lines[0];
            play([
              { text: `接上了。《${file.title}》寫著：「${quote}」` },
              { text: why || '這一句直接回答了這一題。' }
            ], () => ask());
          } else {
            play([
              { text: `《${file.title}》寫的是：「${file.lines[0]}」這份回答的是別的事，接不上這一題。` },
              { text: `再看一次：${hint}` }
            ], () => fileChoices(k));
          }
        } };
      }));
    }
    function ask() {
      const open = links.map((v, i) => i).filter(i => b.links[i] !== links[i][1]);
      if (!open.length) return finish();
      const k = open.find(i => r.files.includes(links[i][1]));
      if (k == null) {
        const [question, , hint] = links[open[0]];
        clue.hidden = false;
        clue.innerHTML = `<small>還有 ${open.length} 題缺原文</small>${question}`;
        play([{ text: `還沒接上的題目，證據袋裡還沒有能對上的原文。${hint} 先回現場把資料調齊。` }], () => {
          choices([{ id: 'back', mark: '←', label: '回到現場', run() { document.getElementById('board-back')?.click(); } }]);
        });
        return;
      }
      const [question, , hint] = links[k];
      clue.hidden = true;
      play([
        { text: `第 ${k + 1} 題，共 ${links.length} 題。${question}` },
        { text: '題目卡上寫了要找什麼。下面每份文據都標了是誰提供、在哪一步拿到的，對照著選。' }
      ], () => fileChoices(k));
    }
    function finish() {
      clue.hidden = false;
      clue.innerHTML = '<small>支線完成</small>三條都接回各自的原文了。每一條只證明一部分。';
      document.getElementById('verify-board')?.click();
      play([{ text: '三條都接上了。每一份文據只支持它對應的那一個事實，合在一起才是本案的理由。' }], () => {
        choices([{ id: 'back', mark: '←', label: '帶著連結回到現場', run() { document.getElementById('board-back')?.click(); } }]);
      });
    }
    const doneCount = links.filter((v, i) => b.links[i] === v[1]).length;
    play([
      { text: doneCount ? `證據連結做到 ${doneCount} / ${links.length} 題。我們從還沒接上的那題繼續。` : '這是支線：證據連結。一題只接一份原文，接錯我會告訴你差在哪。' },
      { text: '我先唸問題，再給提示。你從證據袋裡選最對得上的那一份。點對話框可以看下一句。' }
    ], () => ask());
  }
  const rawOpen = openModal;
  openModal = function (title, html) {
    rawOpen(title, html);
    document.getElementById('modal')?.classList.remove('paper-open');
    dressPages();
  };
  const rawStep = openCampaignStep;
  openCampaignStep = function () {
    rawStep();
    mountPaper();
  };
  const rawBoard = showInvestigationBoard;
  showInvestigationBoard = function (i) {
    rawBoard(i);
    mountBoardQuest(typeof i === 'number' ? i : season.current);
  };
  const rawAdvance = advanceStoryStep;
  advanceStoryStep = function () {
    const before = seasonRecord().step;
    rawAdvance();
    const record = seasonRecord();
    if (record.complete || record.step === before) return;
    openCampaignStep();
  };
  let caseFramed = false;
  let caseChrome = false;
  function caseLimits() {
    const margin = 16;
    const maxW = Math.max(280, window.innerWidth - margin * 2);
    const maxH = Math.max(240, window.innerHeight - margin * 2);
    return { margin, maxW, maxH, minW: Math.min(720, maxW), minH: Math.min(560, maxH) };
  }
  function defaultCaseFrame() {
    const box = caseLimits();
    const width = Math.max(box.minW, Math.min(1280, box.maxW));
    const height = Math.max(box.minH, Math.min(940, box.maxH));
    return {
      width,
      height,
      left: Math.max(box.margin, (window.innerWidth - width) / 2),
      top: Math.max(box.margin, (window.innerHeight - height) / 2)
    };
  }
  function applyCaseFrame(modal, frame) {
    modal.style.position = 'fixed';
    modal.style.margin = '0';
    modal.style.inset = 'auto';
    modal.style.right = 'auto';
    modal.style.bottom = 'auto';
    modal.style.width = frame.width + 'px';
    modal.style.height = frame.height + 'px';
    modal.style.left = frame.left + 'px';
    modal.style.top = frame.top + 'px';
  }
  function clampCaseWindow(modal) {
    const box = caseLimits();
    let width = Math.max(box.minW, Math.min(modal.offsetWidth, box.maxW));
    let height = Math.max(box.minH, Math.min(modal.offsetHeight, box.maxH));
    let left = parseFloat(modal.style.left);
    let top = parseFloat(modal.style.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) {
      const rect = modal.getBoundingClientRect();
      left = rect.left;
      top = rect.top;
    }
    left = Math.min(Math.max(box.margin, left), Math.max(box.margin, window.innerWidth - width - box.margin));
    top = Math.min(Math.max(box.margin, top), Math.max(box.margin, window.innerHeight - height - box.margin));
    applyCaseFrame(modal, { width, height, left, top });
  }
  function clearCaseFrame(modal) {
    caseFramed = false;
    modal.classList.remove('is-dragging', 'is-resizing');
    ['position', 'margin', 'inset', 'left', 'top', 'right', 'bottom', 'width', 'height'].forEach(prop => { modal.style[prop] = ''; });
  }
  function armCaseWindow() {
    const modal = document.getElementById('modal');
    if (!modal || !modal.classList.contains('paper-open')) return;
    if (!modal.querySelector('.paper-restore')) {
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'paper-restore';
      restore.textContent = '回復大小';
      const fold = document.createElement('button');
      fold.type = 'button';
      fold.className = 'paper-fold';
      fold.textContent = '收合';
      fold.setAttribute('aria-label', '收合視窗');
      fold.onclick = () => {
        const closed = modal.classList.toggle('is-collapsed');
        fold.textContent = closed ? '展開' : '收合';
        fold.setAttribute('aria-label', closed ? '展開視窗' : '收合視窗');
      };
      modal.append(fold);
      restore.setAttribute('aria-label', '回復大小');
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'paper-resize';
      handle.setAttribute('aria-label', '拖曳調整視窗大小');
      modal.append(restore, handle);
    }
    if (!caseFramed) {
      applyCaseFrame(modal, defaultCaseFrame());
      caseFramed = true;
    }
    if (caseChrome) return;
    caseChrome = true;
    let drag = null;
    modal.addEventListener('pointerdown', event => {
      if (!modal.classList.contains('paper-open') || event.button !== 0) return;
      if (event.target.closest('.paper-restore')) {
        event.preventDefault();
        applyCaseFrame(modal, defaultCaseFrame());
        return;
      }
      const handle = event.target.closest('.paper-resize');
      const cover = event.target.closest('.book-cover');
      if (!handle && !cover) return;
      if (cover && event.target.closest('button, a, input, textarea, select')) return;
      event.preventDefault();
      const rect = modal.getBoundingClientRect();
      drag = {
        kind: handle ? 'resize' : 'move',
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
      modal.classList.toggle('is-resizing', !!handle);
      modal.classList.toggle('is-dragging', !handle);
      modal.setPointerCapture(event.pointerId);
    });
    modal.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.pointer) return;
      const box = caseLimits();
      if (drag.kind === 'move') {
        let left = drag.left + (event.clientX - drag.x);
        let top = drag.top + (event.clientY - drag.y);
        left = Math.min(Math.max(box.margin, left), Math.max(box.margin, window.innerWidth - drag.width - box.margin));
        top = Math.min(Math.max(box.margin, top), Math.max(box.margin, window.innerHeight - drag.height - box.margin));
        modal.style.left = left + 'px';
        modal.style.top = top + 'px';
        return;
      }
      let width = Math.max(box.minW, Math.min(drag.width + (event.clientX - drag.x), box.maxW));
      let height = Math.max(box.minH, Math.min(drag.height + (event.clientY - drag.y), box.maxH));
      if (drag.left + width > window.innerWidth - box.margin) width = Math.max(box.minW, window.innerWidth - box.margin - drag.left);
      if (drag.top + height > window.innerHeight - box.margin) height = Math.max(box.minH, window.innerHeight - box.margin - drag.top);
      modal.style.width = width + 'px';
      modal.style.height = height + 'px';
    });
    const endDrag = event => {
      if (!drag || (event && event.pointerId !== drag.pointer)) return;
      drag = null;
      modal.classList.remove('is-dragging', 'is-resizing');
    };
    modal.addEventListener('pointerup', endDrag);
    modal.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', () => {
      if (modal.classList.contains('paper-open')) clampCaseWindow(modal);
    });
  }
  document.getElementById('modal')?.addEventListener('close', () => {
    const modal = document.getElementById('modal');
    liveScene = '';
    modal?.classList.remove('paper-open');
    if (modal) clearCaseFrame(modal);
    leaveCaseTheater();
  });
})();
