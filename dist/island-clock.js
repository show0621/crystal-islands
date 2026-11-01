/* One virtual day = two real minutes. Epoch survives refresh; buttons offer explicit previews. */
(function(root){
 const cycleMs=120000,wrap=n=>((n%24)+24)%24;
 const periods=[
 {hour:0,label:'深夜',mood:'萬籟俱寂 · 明月映海',sky:'#10172e'},
 {hour:3,label:'凌晨',mood:'星光微寒 · 海霧輕浮',sky:'#202841'},
 {hour:6,label:'晨曦',mood:'晨光初露 · 薄霧漸散',sky:'#dfbca5'},
 {hour:9,label:'早上',mood:'晴空柔光 · 群島甦醒',sky:'#a3dbe1'},
 {hour:12,label:'中午',mood:'日正當中 · 碧海閃耀',sky:'#78cadc'},
 {hour:15,label:'下午',mood:'暖陽斜照 · 悠悠海風',sky:'#a2cec9'},
 {hour:18,label:'黃昏',mood:'晚霞飛鷺 · 華燈初上',sky:'#d69a91'},
 {hour:21,label:'晚上',mood:'燈火通明 · 星月相伴',sky:'#162b45'}];
 const ease=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 function describe(hour){hour=wrap(hour);const index=Math.floor(hour/3),period=periods[index],next=periods[(index+1)%8],q=ease((hour-period.hour)/3),rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),A=rgb(period.sky),B=rgb(next.sky),sky='#'+A.map((v,i)=>Math.round(v+(B[i]-v)*q).toString(16).padStart(2,'0')).join(''),darkness=hour<5?1:hour<7?1-ease((hour-5)/2):hour<17?0:hour<20?ease((hour-17)/3):1;return {hour,darkness,night:darkness>.55,phase:period.label,period:period.hour,mood:period.mood,sky,text:String(Math.floor(hour)).padStart(2,'0')+':'+String(Math.floor((hour%1)*60)).padStart(2,'0')}}
 if(typeof module!=='undefined')module.exports={describe,wrap,cycleMs,periods};
 if(!root.document)return;
 let epoch=Date.now(),startHour=15,auto=true;
 try{const old=JSON.parse(localStorage.getItem('tp-island-clock-v1'));if(old&&Number.isFinite(old.epoch)&&Number.isFinite(old.hour)){auto=old.auto!==false;startHour=wrap(old.hour+(auto&&old.rate!==2?(Date.now()-old.epoch)/480000*24:0));epoch=old.rate===2?old.epoch:Date.now()}}catch{}
 const save=()=>{try{localStorage.setItem('tp-island-clock-v1',JSON.stringify({epoch,hour:startHour,auto,rate:2}))}catch{}};
 root.IslandClock={periods,cycleMs,describe,read(now=Date.now()){return {...describe(startHour+(auto?(now-epoch)/cycleMs*24:0)),auto}},set(hour){startHour=wrap(hour);epoch=Date.now();auto=false;save()},resume(){startHour=this.read().hour;epoch=Date.now();auto=true;save()},toggleAuto(){startHour=this.read().hour;epoch=Date.now();auto=!auto;save()}};save();
})(typeof window!=='undefined'?window:globalThis);
