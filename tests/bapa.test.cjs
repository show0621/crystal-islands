const test=require('node:test'),assert=require('node:assert/strict'),D=require('../dist/bapa-data.js'),L=require('../dist/bapa-logic.js');
function complete(id){const s=L.fresh(id),c=L.get(s);s.read=c.files.map(f=>f[0]);s.checks=Object.fromEntries(c.check.map((q,i)=>[i,q[2]]));s.method=c.method;s.critical=true;for(const k of ['function','method','rate'])L.talk(s,'本輪具體追問',k);s.proposal=c.target;return s}
test('seven BAPA themes provide scoped evidence, distinct positions and three outcome branches',()=>{assert.equal(D.cases.length,7);for(const c of D.cases){assert.equal(c.files.length,5);assert(c.check.length>=3);assert(c.openingTW!==c.openingOther);assert(c.ref.includes('TPG'));for(const k of ['function','asset','method','rate']){assert.equal(c.attack[k].length,2);assert(c.attack[k].every(s=>s.length>25))}const s=complete(c.id);assert.deepEqual(L.ready(s),[]);assert.equal(L.evaluate(s,'agreement').kind,'agreement');assert.equal(L.evaluate(s,'partial').kind,'partial');assert.equal(L.evaluate(s,'adjourn').kind,'adjourn');s.proposal=c.max+.2;assert.equal(L.evaluate(s,'agreement').kind,'dispute')}});
test('numerical proposals alone cannot create agreements; blanks, negative and inconsistent profits are rejected',()=>{for(const c of D.cases){const s=L.fresh(c.id);assert.equal(s.read.length,0);assert.equal(s.proposal,'');s.proposal=c.target;assert.equal(L.evaluate(s,'agreement').kind,'incomplete');assert(!L.evaluate(s,'adjourn').agreed);assert.equal(L.amounts(s,''),null);assert.equal(L.amounts(s,-1),null)}const s=complete('equipment');s.proposal=99;assert.equal(L.amounts(s,s.proposal).valid,false)});
test('income bridges conserve same-scope profits, exclude pure pass-through, preserve routine returns and allow downward Taiwan outcomes',()=>{const expected={equipment:[2400,4600,200],dempe:[3200,6800,1200],manufacturing:[12000,48000,-38000],'chemical-shared':[22250,37750,-27750],marketing:[9500,5500,-2500],finance:[38400,11600,30400],hub:[15000,5000,3000]};for(const [id,n]of Object.entries(expected)){const s=complete(id),a=L.amounts(s,s.proposal);assert.deepEqual([a.tw,a.other,a.delta],n);assert.equal(a.tw+a.other,a.pool)}});
test('manual questions route to topic-specific two-sided exchanges; pressure or averages never count as supporting a rate',()=>{const s=L.fresh('equipment');assert.equal(L.talk(s,'零件成本是否都要加成？').topic,'method');assert.equal(L.talk(s,'無形資產明明在我方公司').topic,'asset');assert.equal(L.talk(s,'你方要保留多少利潤率？').topic,'rate');assert.equal(L.talk(s,'雙方開價取平均就好').topic,'midpoint');assert.equal(L.talk(s,'今天月球天氣？').topic,'clarify');assert(s.history.every(h=>h.speaker&&h.text));assert.equal(L.ready(s).includes('完成實質功能、方法與利潤率三種雙邊攻防'),true);assert.equal(s.outcome,null)});

test('both negotiation report packages include full positions, unread items and the same scoped income bridge',async()=>{const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync(require.resolve('../dist/bapa-voyage.js'),'utf8'),fn=source.slice(source.indexOf('async function download('),source.indexOf("modal.addEventListener('close'")),exporter=require('../dist/report-formats.js');let blob;const s=complete('equipment');s.outcome=L.evaluate(s,'agreement');const c={record:s,L,TPReportExport:exporter,window:{TPReportExport:exporter},Blob,URL:{createObjectURL(b){blob=b;return 'blob:test'}},reportUrls:[],money:n=>Math.round(n).toLocaleString('en-US'),pct:n=>Number(n).toFixed(2)+'%',greeting:()=>[{speaker:'臺方',text:'本輪開場10%，日本4%'}]};vm.createContext(c);vm.runInContext(fn,c);for(const format of ['docx','odt']){const anchor={};await c.download(format,anchor);assert.equal(anchor.download,'BAPA協商教學紀錄_equipment.'+format);assert.equal(anchor.href,'blob:test');const bytes=Buffer.from(await blob.arrayBuffer());assert(bytes.length>10000);assert.equal(bytes.readUInt32LE(0),0x04034b50);assert(bytes.includes(Buffer.from('2,400')));assert(bytes.includes(Buffer.from('4,600')));assert(bytes.includes(Buffer.from('本輪開場10%')));assert(bytes.includes(Buffer.from('不代表任何主管機關立場')))}});

const G=require('../dist/bapa-debate.js');
test('every BAPA case has a bilingual round-table script with three reasoned options per round',()=>{for(const c of D.cases){const sc=G.scripts[c.id];assert(sc,c.id);assert.equal(sc.lang,c.country==='日本'?'ja':'en');assert(sc.rounds.length>=5);assert(sc.rounds.some(r=>r.kind==='caucus'));for(const r of sc.rounds){assert(r.issue&&r.title&&r.plain&&r.tpg,c.id+r.id);assert(/TPG|Chapter|查核準則/.test(r.tpg),c.id+r.id+' missing TPG cite');assert(r.options.length>=3,c.id+r.id);for(const o of r.options){assert(o.label.length>4&&o.why.length>=12,c.id+r.id+o.label);if(o.back){assert(o.back.o&&o.back.zh);if(sc.lang==='ja')assert(/[\u3040-\u30ff]/.test(o.back.o),o.back.o)}}const lines=[].concat(r.them||[]);for(const l of lines){assert(l.o&&l.zh,c.id+r.id);if(sc.lang==='ja')assert(/[\u3040-\u30ff]/.test(l.o))}}}});
test('BAPA debates stay inside TPG values on both sides',()=>{assert(G.CANON&&G.CANON.includes('TPG'));assert(/FAR/.test(G.CANON));assert(/受測個體/.test(G.CANON));assert(/離指引/.test(G.CANON));assert(/拉回/.test(G.CANON));for(const c of D.cases){const sc=G.scripts[c.id];const open=JSON.stringify(sc.opening);assert(/TPG|FAR|第十章|6\.71|DEMPE/.test(open),c.id+' opening leaves TPG frame');assert(/離指引|拉回/.test(open),c.id+' opening misses pull-back frame');const scores=sc.rounds.flatMap(r=>r.options.map(o=>(o.fx&&o.fx.c)||0));assert(scores.some(n=>n>=2),c.id+' missing strong TPG option');assert(scores.some(n=>n<0),c.id+' missing counterpart pressure')}});
test('off-guideline claims get pulled back by TPG on both sides',()=>{const bait={equipment:/契約がFAR|10%と4%の中間/,dempe:/70対30|アルファベットは日本/,manufacturing:/一人一半|折半すれば/, 'chemical-shared':/費用が四倍なら価値も四倍/,marketing:/average three and eight|Whoever spends owns/i,finance:/money is money|average your five/i,hub:/Profit follows the books/};const snap={equipment:/合約不是 FAR|§1\.42/,dempe:/不是數字母|§6\.32/,manufacturing:/一人一半不是|折半，離指引/, 'chemical-shared':/§2\.166|費用比例不是公平/,marketing:/not arm's length|6\.71/,finance:/§10\.89|兩種貨幣取平均/,hub:/Profit follows the books|入帳歸誰/};for(const c of D.cases){const sc=G.scripts[c.id],blob=JSON.stringify(sc);assert(bait[c.id].test(blob),c.id+' missing off-TPG bait');assert(snap[c.id].test(blob),c.id+' missing TPG snapback');assert(sc.rounds.some(r=>r.options.some(o=>(o.fx&&o.fx.c||0)<0&&o.back&&/TPG|指引|Guideline|Chapter|查核準則|常規/.test(JSON.stringify(o.back)))),c.id+' missing counterpart TPG rebuke of a weak leave')}});
test('caucus rest rooms rehearse audit, proof and how to break a real TPG claim',()=>{assert(/休息/.test(G.CANON));assert(/舉證/.test(G.CANON));assert(/真假|半真/.test(G.CANON));assert(/點子/.test(G.CANON));assert(/妥協/.test(G.CANON));for(const c of D.cases){const sc=G.scripts[c.id],caucus=sc.rounds.find(r=>r.kind==='caucus'),team=JSON.stringify(caucus.team);assert(caucus,c.id);assert(/休息/.test(caucus.issue+caucus.title+caucus.plain),c.id+' caucus not a rest');assert(/舉證/.test(caucus.plain),c.id+' missing burden of proof');assert(/真假難辨|半真半假/.test(caucus.plain+team),c.id+' missing half-truth');assert(/點子一/.test(team)&&/點子二/.test(team)&&/點子三/.test(team),c.id+' missing competing ideas');assert(/矛盾/.test(team),c.id+' missing internal contradiction');assert(/不妥協/.test(team),c.id+' missing non-compromise');assert(/興奮/.test(team)&&/可惜/.test(team),c.id+' missing win/regret beat');assert(caucus.team.length>=8,c.id+' caucus too thin');assert(sc.rounds.some(r=>(r.options||[]).some(o=>o.after&&/可惜|興奮/.test(JSON.stringify(o.after)))),c.id+' missing table-side regret/win')}});
test('debate outcomes depend on argument quality and the final package, not on the number alone',()=>{for(const c of D.cases){const best=G.start(c.id),worst=G.start(c.id);for(const st of [best,worst]){while(st.phase==='round'||st.phase==='crisis'){const r=G.round(st);G.enter(st);const scores=r.options.map(o=>(o.fx&&o.fx.c)||0);const i=st===best?scores.indexOf(Math.max(...scores)):scores.indexOf(Math.min(...scores));G.choose(st,i)}}assert.equal(best.phase,'final');assert(best.cred>worst.cred,c.id);const a=JSON.parse(JSON.stringify(best));G.settle(a,'median');const w=JSON.parse(JSON.stringify(worst));G.settle(w,'median');assert.equal(w.phase,'done');assert(['agreement','partial'].includes(a.outcome.kind),c.id+a.outcome.kind);assert(!['agreement'].includes(w.outcome.kind)||w.cred>=G.need(c.id),c.id);const j=JSON.parse(JSON.stringify(best));G.settle(j,'adjourn');assert.equal(j.outcome.kind,'adjourn');assert.equal(j.outcome.agreed,false)}});
test('foreign delegates speak their language with a Chinese gloss in endings and at the table',()=>{const E=require('../dist/bapa-endings.js');const kana=/[\u3040-\u30ff]/;const latin=/[A-Za-z]{3,}/;for(const [id,pack] of Object.entries(E.CORE)){for(const [kind,row] of Object.entries(pack)){const s=row.story||'';for(const q of s.matchAll(/「([^」]*[\u3040-\u30ff][^」]*)」/g)){const i=s.indexOf(q[0]);assert(s.slice(i,i+q[0].length+18).includes('中譯'),id+kind+' '+q[1]);}for(const q of s.matchAll(/[“"]([^”"]{6,})[”"]/g)){if(!latin.test(q[1]))continue;const i=s.indexOf(q[0]);assert(s.slice(i,i+q[0].length+18).includes('中譯'),id+kind+' '+q[1]);}for(const line of row.after||[]){if(Array.isArray(line))continue;if(line.who==='高橋律'){assert.equal(line.lang,'ja');assert(kana.test(line.text),id+kind);assert(line.zh);}if(line.who==='Giulia Rossi'||line.who==='Sophie de Vries'){assert.equal(line.lang,'en');assert(latin.test(line.text),id+kind);assert(line.zh);}}}}for(const c of D.cases){const sc=G.scripts[c.id];assert.equal(sc.lang,c.country==='日本'?'ja':'en');const end=G.ENDINGS[sc.lang];for(const k of ['agreement','partial','impasse','adjourn','unsupported']){assert(end[k].o&&end[k].zh,c.id+k);if(sc.lang==='ja')assert(kana.test(end[k].o),end[k].o);else assert(latin.test(end[k].o),end[k].o);}}});
test('BB formula Japan debate spells out why CUP and cost plus fail the FAR test',()=>{
  const far=G.scripts.manufacturing.rounds.find(r=>r.id==='far');
  assert(far,'manufacturing missing FAR/method round');
  const blob=JSON.stringify(far);
  assert(/CUP|可比較未受控/.test(blob));
  assert(/コストプラス|成本加價/.test(blob));
  assert(/研究開発|研發/.test(blob));
  assert(/失敗|リスク|風險/.test(blob));
  assert(/FAR/.test(blob));
  assert(/有限リスク|有限風險/.test(blob));
  assert(/権利金|權利金/.test(blob));
  assert(/被検証|受測/.test(blob));
  assert(/CUT|查核準則/.test(blob));
  assert(/差異性|比較可能性/.test(blob));
  const open=JSON.stringify(G.scripts.manufacturing.opening);
  assert(/內心獨白/.test(open));
  assert(!/假裝方法已經簡單/.test(open));
  const strong=far.options.find(o=>(o.fx.c||0)>=2);
  assert(strong && strong.say.length>180);
  assert(strong.after && strong.after.some(x=>x.who==='高橋律'&&x.lang==='ja'));
  const shared=G.scripts['chemical-shared'].rounds.find(r=>r.id==='unilateral');
  assert(shared,'chemical-shared missing unilateral-method round');
  assert(/CUP|成本加價|コストプラス/.test(JSON.stringify(shared)));
  const m3=D.cases.find(c=>c.id==='manufacturing').files.find(f=>f[0]==='M3')[2];
  assert(m3.includes('可以嵌入原液價格'));
  assert(/CUP|成本加價/.test(m3));
});

test('each BAPA case has an internal review round and branching ending stories under dual pressure',()=>{for(const c of D.cases){const sc=G.scripts[c.id];const review=sc.rounds.find(r=>r.kind==='review');assert(review,c.id);assert.equal(review.issue,'內部長官審查');assert(review.team.some(line=>line[0]==='沈岸'),c.id);assert(review.team.some(line=>line[0]==='陸嚴'),c.id);assert(review.options.length>=4,c.id);assert(review.plain.includes('查')||review.plain.includes('覆核')||review.plain.includes('控制'),c.id)}const play=id=>{const st=G.start(id);while(st.phase==='round'||st.phase==='crisis'){const r=G.round(st);G.enter(st);const scores=r.options.map(o=>(o.fx&&o.fx.c)||0);G.choose(st,scores.indexOf(Math.max(...scores)))}return st};const best=play('equipment'),worst=G.start('equipment');while(worst.phase==='round'||worst.phase==='crisis'){const r=G.round(worst);G.enter(worst);const scores=r.options.map(o=>(o.fx&&o.fx.c)||0);G.choose(worst,scores.indexOf(Math.min(...scores)))}G.settle(best,'median');G.settle(worst,'median');assert(best.outcome.story.length>40);assert(best.outcome.worlds.length>=1);assert.notEqual(best.outcome.title,worst.outcome.title);assert.notEqual(best.outcome.story,worst.outcome.story);assert(best.flags.includes('honest_gap'));assert(worst.flags.includes('staff_wrong'));assert.equal(best.outcome.kind,'agreement');assert.notEqual(worst.outcome.kind,'agreement')});

test('every BAPA case keeps bilateral after-volleys, fuller endings and three side-worlds',()=>{
  const E=require('../dist/bapa-endings.js');
  const Ed=require('../dist/bapa-editorial.js');
  for(const c of D.cases){
    const sc=G.scripts[c.id];
    const volleys=sc.rounds.flatMap(r=>(r.options||[]).filter(o=>o.after&&o.after.some(x=>x&&x.lang)));
    assert(volleys.length>=1,c.id+' missing counterpart after-volley');
    const follow=Ed.follow[c.id];
    assert(follow,c.id+' missing editorial follow');
    for(const k of Object.keys(c.attack)){
      assert(Array.isArray(follow[k])&&follow[k].length===2,c.id+k+' follow');
      assert(follow[k].every(s=>s.length>40),c.id+k+' follow short');
    }
  }
  for(const [id,pack] of Object.entries(E.CORE)){
    for(const kind of ['agreement','partial','impasse','adjourn','unsupported']){
      assert(pack[kind],id+kind);
      assert(pack[kind].story.length>80,id+kind+' story short');
      assert(pack[kind].after.length>=2,id+kind+' after short');
    }
    assert(pack.agreement.after.some(x=>x&&x.lang),id+' agreement missing counterpart');
  }
  for(const [id,worlds] of Object.entries(E.WORLDS)){
    assert(worlds.length>=3,id+' worlds');
    assert(worlds.every(w=>w.text.length>40),id+' world short');
  }
});
