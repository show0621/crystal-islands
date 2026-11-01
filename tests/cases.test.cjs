const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const logic=require('../dist/case-logic.js');
const context=vm.createContext({OECD:'https://www.oecd.org/',AMOUNT:'https://www.oecd.org/amount-b'});
vm.runInContext(fs.readFileSync(require.resolve('../dist/casebook.js'),'utf8'),context);
const cases=vm.runInContext('mysteries',context);
test('all required curriculum topics are discoverable on islands, with distinct factual endings',()=>{
assert.equal(cases.length,21);assert.equal(new Set(cases.map(c=>c.id)).size,21);assert.equal(new Set(cases.map(c=>c.island)).size,7);
const covered=new Set(cases.flatMap(c=>Array.from(c.chapters)));for(const ch of ['I','II','III','IV','V','VI','VII','VIII','IX','X'])assert.ok(covered.has(ch),ch);
for(const c of cases){assert.equal(c.worlds.length,3,c.id);assert.equal(new Set(c.worlds.map(w=>w.label)).size,3,c.id);assert.ok(new Set(c.worlds.map(w=>w.amount)).size>=2,c.id);for(const w of c.worlds){assert.equal(w.clues.length,4);assert.ok(w.clues.every(x=>typeof x==='string'&&x.length>10));assert.ok(Number.isFinite(w.amount)&&w.amount>=0);assert.ok(w.formula&&w.finding&&w.lesson)}}
});
test('incomplete evidence and unsupported theories never become verified findings',()=>{
const s={universe:1,clues:[0,1,2,3],theory:1,endings:[]};assert.equal(logic.resolve(s),'verified');assert.equal(logic.resolve({...s,theory:0}),'contradiction');assert.equal(logic.resolve({...s,clues:[0,0,1,2]}),'incomplete');assert.equal(logic.resolve({...s,theory:'more'}),'incomplete');assert.equal(logic.resolve({...s,theory:null}),'choose');
});
test('tax changes with facts and rate, not the chosen hypothesis',()=>{
const c=cases.find(x=>x.id==='research');assert.deepEqual(Array.from(c.worlds,w=>logic.tax(w.amount,20)),[0,10,4]);assert.equal(logic.tax(50,25),12.5);assert.equal(logic.tax(50,0),0);for(const bad of ['',-1,101,Infinity,'oops'])assert.equal(logic.tax(50,bad),null);assert.equal(logic.tax(-1,20),null);
});
test('entering a parallel world clears evidence and preserves previous endings and notes',()=>{
const s={universe:0,clues:[0,1,2,3],theory:0,resolved:true,endings:[0],note:'decision record'};const n=logic.changeTimeline(s,1);assert.equal(n.universe,1);assert.deepEqual(n.clues,[]);assert.equal(n.theory,null);assert.equal(n.resolved,false);assert.deepEqual(n.endings,[0]);assert.equal(n.note,s.note);assert.deepEqual(s.clues,[0,1,2,3]);assert.throws(()=>logic.changeTimeline(s,4),RangeError);
});
