/* Small-scale daily routines on a walkable grid derived from the actual workplace geometry. */
(function(root){
 const STEP=.3,RADIUS=4.85,CLEARANCE=.36;
 function obstacleMap(biomes,id){const blocks=[],lamps=[];let feature=null;const rect=(x,z,w,d)=>blocks.push({x,z,w:w/2,d:d/2});
 const g={B(x,y,z,w,h,d,c){if(y<1.35&&y+h>.46&&w>.09&&d>.09)rect(x,z,w,d)},C(x,y,z,r,h,c){if(y<1.3&&y+h>.46&&r>=.1)rect(x,z,r*1.55,r*1.55)},S(x,y,z,r,c){if(c==='#ffe5a8')lamps.push({x,z,y});else if(y-r<1.25&&y+r>.55&&r>.3)rect(x,z,r*1.5,r*1.5)},T(x,z){rect(x,z,.52,.52)},P(){},R(){},L(){},F(key,fn){const old=feature;feature=key;fn();feature=old}};
 biomes.build(g,id);return {blocks,lamps};}
 function navigation(blocks,radius=RADIUS){
 const free=(x,z,pad=CLEARANCE)=>Math.hypot(x,z)<radius&&!blocks.some(b=>Math.abs(x-b.x)<b.w+pad&&Math.abs(z-b.z)<b.d+pad);
 const nodes=[],lookup=new Map();for(let a=-18;a<=18;a++)for(let b=-18;b<=18;b++){const x=a*STEP,z=b*STEP;if(free(x,z)){const n={x,z,a,b,key:a+','+b,index:nodes.length,edges:[]};nodes.push(n);lookup.set(n.key,n)}}
 const segmentFree=(a,b)=>{if(!free(a.x,a.z)||!free(b.x,b.z))return false;for(const r of blocks){let lo=0,hi=1;for(const [key,half]of [['x',r.w+CLEARANCE],['z',r.d+CLEARANCE]]){const delta=b[key]-a[key],min=r[key]-half+1e-9,max=r[key]+half-1e-9;if(Math.abs(delta)<1e-12){if(a[key]<min||a[key]>max){lo=2;break}}else{let u=(min-a[key])/delta,v=(max-a[key])/delta;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v)}}if(lo<=hi)return false}return true};
 for(const n of nodes)for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const next=lookup.get((n.a+dx)+','+(n.b+dz));if(next&&segmentFree(n,next))n.edges.push(next.index)}
 // Keep only the largest connected pedestrian area, never snapping through an inaccessible wall.
 const groups=[],seen=new Set();for(const n of nodes){if(seen.has(n.index))continue;const group=[],todo=[n.index];seen.add(n.index);while(todo.length){const index=todo.pop();group.push(nodes[index]);for(const j of nodes[index].edges)if(!seen.has(j)){seen.add(j);todo.push(j)}}groups.push(group)}groups.sort((a,b)=>b.length-a.length);const connected=groups[0]||[];
 function nearest(x,z){let best=null,d=Infinity;for(const n of connected){const q=(n.x-x)**2+(n.z-z)**2;if(q<d){d=q;best=n}}if(!best)throw Error('No walkable area');return best}
 function route(a,b){a=nearest(a.x,a.z);b=nearest(b.x,b.z);const open=new Set([a.index]),came=new Map(),cost=new Map([[a.index,0]]),score=new Map([[a.index,Math.hypot(a.x-b.x,a.z-b.z)]]);
 while(open.size){let at=-1,best=Infinity;for(const n of open){const v=score.get(n)??Infinity;if(v<best){best=v;at=n}}if(at===b.index){const result=[nodes[at]];while(came.has(at)){at=came.get(at);result.unshift(nodes[at])}return result.map(n=>({x:n.x,z:n.z}))}open.delete(at);for(const j of nodes[at].edges){const next=nodes[j],candidate=cost.get(at)+Math.hypot(next.x-nodes[at].x,next.z-nodes[at].z);if(candidate<(cost.get(j)??Infinity)){came.set(j,at);cost.set(j,candidate);score.set(j,candidate+Math.hypot(next.x-b.x,next.z-b.z));open.add(j)}}}throw Error('Disconnected pedestrian route');}
 return {free,nearest,route,segmentFree,nodes:connected,blocks};}
 function line(points){let distance=0;const spans=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(length){spans.push({a,b,start:distance,length});distance+=length}}return {points,spans,length:distance}}
 function atDistance(path,d){if(!path.spans.length){const p=path.points[0];return {x:p.x,z:p.z,angle:0,distance:0}}d=Math.max(0,Math.min(path.length,d));const s=path.spans.find(s=>s.start+s.length>=d)||path.spans.at(-1),q=(d-s.start)/s.length;
 return {x:s.a.x+(s.b.x-s.a.x)*q,z:s.a.z+(s.b.z-s.a.z)*q,angle:Math.atan2(s.b.x-s.a.x,s.b.z-s.a.z),distance:d};}
 function actor(nav,r,k,id,meeting){const work=nav.nearest(r[4],r[5]),pair=Math.floor(k/2),meet=meeting[k%2],path=line(nav.route(work,meet)),back=line([...path.points].reverse()),target={x:r[4],z:r[5]},speed=.43+(k%3)*.045;
 return {id,k,nav,work,meet,path,back,speed,offset:id*9+pair*37,duty:r[2],dutyLoop:null,workAngle:Math.hypot(target.x-work.x,target.z-work.z)>.1?Math.atan2(target.x-work.x,target.z-work.z):-Math.PI/2,uniform:r[3]};}
 function sample(a,time,night=false){const phase=((time+a.offset)%a.cycle+a.cycle)%a.cycle;let state='work',p={x:a.work.x,z:a.work.z,angle:a.workAngle,distance:0};
 if(phase>=24&&phase<a.meetStart){const d=(phase-24)*a.speed;p=atDistance(a.path,d);state=d<a.path.length?'walk':'wait';}
 else if(phase>=a.meetStart&&phase<a.talkEnd){p={x:a.meet.x,z:a.meet.z,angle:a.k%2?-Math.PI/2:Math.PI/2,distance:a.path.length};state=a.hasPartner?'talk':'browse';}
 else if(phase>=a.talkEnd&&phase<a.homeEnd){const d=(phase-a.talkEnd)*a.speed;p=atDistance(a.back,d);state=d<a.back.length?'walk':'work';}
 else if(phase>=a.homeEnd&&night&&a.id!==1)state='rest';
 // A rare short break begins and ends at the work point, without changing paired schedules.
 let fishingTrip=false;
 if(a.fishing&&phase<24&&a.fishing.chance(Math.floor((time+a.offset)/a.cycle))<.24){const f=a.fishing,travel=f.path.length/a.speed;
 if(phase<travel){p=atDistance(f.path,phase*a.speed);state='walk';fishingTrip='out'}
 else if(phase<travel+f.hold){p={x:f.spot.x,z:f.spot.z,angle:Math.atan2(f.spot.x,f.spot.z),distance:f.path.length};state='fish';fishingTrip='fish'}
 else if(phase<travel*2+f.hold){p=atDistance(f.back,(phase-travel-f.hold)*a.speed);state='walk';fishingTrip='back'}
 }
 if(state==='work'&&!a.fishing&&!fishingTrip&&a.dutyLoop){const local=phase<24?phase:phase-a.homeEnd,travel=a.dutyLoop.path.length/a.speed;if(local>=3&&local<3+travel){p=atDistance(a.dutyLoop.path,(local-3)*a.speed);state='walk';fishingTrip='dutyOut'}else if(local>=3+travel&&local<6+travel){p={...atDistance(a.dutyLoop.path,a.dutyLoop.path.length)};state='browse';fishingTrip='dutyCheck'}else if(local>=6+travel&&local<6+2*travel){p=atDistance(a.dutyLoop.back,(local-6-travel)*a.speed);state='walk';fishingTrip='dutyBack'}}
 // A forward look softens head/torso turns without curving a path through a wall.
 if(state==='walk'){const path=String(fishingTrip).startsWith('duty')?(fishingTrip==='dutyOut'?a.dutyLoop.path:a.dutyLoop.back):fishingTrip?(fishingTrip==='out'?a.fishing.path:a.fishing.back):(phase<a.meetStart?a.path:a.back),d=p.distance,past=atDistance(path,Math.max(0,d-.18)),ahead=atDistance(path,d+.18);p.angle=Math.atan2(ahead.x-past.x,ahead.z-past.z)}
 const mixAngle=(from,to,q)=>from+Math.atan2(Math.sin(to-from),Math.cos(to-from))*Math.max(0,Math.min(1,q)),facing=a.k%2?-Math.PI/2:Math.PI/2;
 if(state==='walk'&&!fishingTrip&&p.distance<.28)p.angle=mixAngle(phase<a.meetStart?a.workAngle:facing,p.angle,p.distance/.28);
 if(state==='wait')p.angle=mixAngle(p.angle,facing,(phase-24-a.path.length/a.speed)/1.2);
 if(state==='work'&&phase>=a.talkEnd&&phase<a.homeEnd)p.angle=mixAngle(p.angle,a.workAngle,(phase-a.talkEnd-a.back.length/a.speed)/1.2);
 return {...p,state,fishingTrip,speed:state==='walk'?a.speed:0,gait:p.distance/.64*Math.PI*2,phase};}
 function create(biomes,options={}){const random=options.random||Math.random,seed=Math.floor(random()*1e8),chance=n=>{const x=Math.sin(n*12.9898+seed)*43758.5453;return x-Math.floor(x)};const worlds=biomes.residents.map((residents,id)=>{const map=obstacleMap(biomes,id),nav=navigation(map.blocks,id===1||id===5?5.28:RADIUS),meetings=[];
 for(let pair=0;pair<Math.ceil(residents.length/2);pair++){const choices=[...nav.nodes].sort((a,b)=>Math.hypot(a.x-pair*1.8,a.z-3.2)-Math.hypot(b.x-pair*1.8,b.z-3.2));let meeting=null;
 for(const n of choices){if(nav.free(n.x-.6,n.z)&&nav.free(n.x+.6,n.z)){const left=nav.nearest(n.x-.6,n.z),right=nav.nearest(n.x+.6,n.z);if(Math.hypot(left.x-right.x,left.z-right.z)>.9&&nav.segmentFree(left,right)){meeting=[left,right];break}}}if(!meeting)throw Error('No clear meeting area');meetings.push(meeting)}
 const actors=residents.map((r,k)=>actor(nav,r,k,id,meetings[Math.floor(k/2)]));for(let k=0;k<actors.length;k+=2){const pair=actors.slice(k,k+2),travel=Math.max(...pair.map(a=>a.path.length/a.speed));for(const a of pair){a.meetStart=24+travel+2;a.talkEnd=a.meetStart+14;a.homeEnd=a.talkEnd+travel+2;a.cycle=a.homeEnd+24;a.hasPartner=pair.length===2}}return {nav,lamps:map.lamps,actors};});
 // Precompute short, role-local rounds once; no path search in the animation loop.
 for(const w of worlds)for(const a of w.actors){const choices=w.nav.nodes.filter(n=>{const d=Math.hypot(n.x-a.work.x,n.z-a.work.z);return d>1&&d<1.8}).sort((x,y)=>Math.hypot(x.x-a.work.x,x.z-a.work.z)-Math.hypot(y.x-a.work.x,y.z-a.work.z));if(choices.length){const path=line(w.nav.route(a.work,choices[(a.k*7)%choices.length]));if(path.length/a.speed<5)a.dutyLoop={path,back:line([...path.points].reverse())}}}
 for(const w of worlds){const candidates=[];for(const a of w.actors){const shores=w.nav.nodes.filter(n=>Math.hypot(n.x,n.z)>4.45).sort((u,v)=>Math.hypot(u.x-a.work.x,u.z-a.work.z)-Math.hypot(v.x-a.work.x,v.z-a.work.z));for(const spot of shores.slice(0,30)){const path=line(w.nav.route(a.work,spot)),travel=path.length/a.speed;if(travel>0&&travel<7.2){candidates.push({a,spot,path,hold:Math.min(9,23-travel*2)});break}}}if(candidates.length){const f=candidates[Math.floor(random()*candidates.length)];const {a,...trip}=f;a.fishing={...trip,back:line([...f.path.points].reverse()),chance:cycle=>chance(cycle*31+f.a.id*173+f.a.k*7)}}}
 const petNav=worlds[6].nav;
 const names={sit:'乖乖坐下',sniff:'低頭嗅聞',bark:'汪！汪汪！',pant:'跑累了，吐舌喘氣',belly:'翻肚肚曬太陽',groom:'舔舔毛、洗洗臉',stretch:'伸個大懶腰',play:'停下找玩伴',lampNap:'路燈下打盹',meow:'喵～',roofNap:'屋頂上懶洋洋',loaf:'收手手，變成一顆麵包',nap:'側躺打盹',walk:'慢慢散步',zoom:'突然開啟暴衝模式',jumpUp:'輕輕躍上屋頂',jumpDown:'從屋頂跳下來'};
 function routine(kind,stations){let now=0,segments=[],previous=petNav.nearest(...stations.at(-1).at),lastAngle=0;
 const add=(duration,data)=>{segments.push({...data,start:now,end:now+duration});now+=duration};
 for(const station of stations){const target=petNav.nearest(...station.at),path=line(petNav.route(previous,target)),speed=station.speed||(kind==='dog'?.67:.39);
 if(path.length){add(path.length/speed,{action:speed>1?'zoom':'walk',path,speed});lastAngle=atDistance(path,path.length).angle}
 const ground={x:target.x,z:target.z,y:0,angle:station.angle??lastAngle};
 if(station.action==='roofNap'){const roof={x:.65,z:-.92,y:2.52,angle:Math.PI*.65};add(2.8,{action:'jumpUp',from:ground,to:roof});add(station.hold,{action:'roofNap',point:roof});add(2.8,{action:'jumpDown',from:roof,to:ground})}
 else add(station.hold,{action:station.action,point:ground});previous=target;
 }return {kind,segments,duration:now};}
 const routines=[routine('dog',[
 {at:[-3.4,2.8],action:'sit',hold:7,angle:.7},{at:[-1.5,.1],action:'sniff',hold:6},{at:[1.5,.1],action:'bark',hold:4},
 {at:[2.4,3.6],action:'pant',hold:5,speed:1.7},{at:[.1,4.1],action:'belly',hold:12},{at:[-1.5,3.5],action:'groom',hold:9},
 {at:[-3.4,2.8],action:'stretch',hold:7},{at:[.6,3.4],action:'play',hold:6,speed:1.4}]),
 routine('cat',[
 {at:[3.5,2.9],action:'lampNap',hold:20,angle:-.6},{at:[2.4,.1],action:'groom',hold:10},{at:[1.2,.1],action:'meow',hold:5},
 {at:[.9,.1],action:'roofNap',hold:22},{at:[-1.2,.1],action:'stretch',hold:9},{at:[-2,3.3],action:'loaf',hold:16},
 {at:[.6,3.4],action:'play',hold:5},{at:[2.3,3.7],action:'nap',hold:15}])];
 const smooth=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 function petSample(r,t){const phase=((t%r.duration)+r.duration)%r.duration,s=r.segments.find(s=>phase<s.end)||r.segments.at(-1),age=phase-s.start,q=age/(s.end-s.start);let p;
 if(s.path){p=atDistance(s.path,age*s.speed);const past=atDistance(s.path,p.distance-.12),ahead=atDistance(s.path,p.distance+.12);p.angle=Math.atan2(ahead.x-past.x,ahead.z-past.z);p.y=0}
 else if(s.from){const up=s.action==='jumpUp',move=up?smooth((q-.44)/.56):smooth(q/.56),height=up?smooth(q/.44):smooth((q-.56)/.44);p={x:s.from.x+(s.to.x-s.from.x)*move,z:s.from.z+(s.to.z-s.from.z)*move,y:s.from.y+(s.to.y-s.from.y)*height+Math.sin(q*Math.PI)*.48,angle:Math.atan2(s.to.x-s.from.x,s.to.z-s.from.z),distance:0}}
 else p={...s.point,distance:0};
 return {...p,kind:r.kind,action:s.action,age,progress:q,running:!!s.path,speed:s.speed||0,gait:(p.distance||0)/.45*Math.PI*2,state:names[s.action],calling:(s.action==='bark'||s.action==='meow')&&age%2<.85};}
 // A scheduled visit temporarily suspends each pet's own routine, then walks it back.
 const lamp=petNav.nearest(-3.6,2.8),girlHome=petNav.nearest(-2.4,3.6),girlPath=line(petNav.route(girlHome,lamp)),bowls=[petNav.nearest(-3,3.4),petNav.nearest(-2.8,2.7)];
 let visit=null,lastPetTime=0,lastHour=null,day=0,lastSlot='',petOffset=0;
 function feeding(t,hour){
  if(hour===undefined)return null;
  const h=((hour%24)+24)%24;if(lastHour!==null&&lastHour>21&&h<3)day++;lastHour=h;
  const slot=h>=12&&h<13?'noon':h>=18&&h<19?'dusk':'',key=day+':'+slot;
  if(!visit&&slot&&key!==lastSlot){lastSlot=key;visit={start:t,base:t-petOffset,stage:'gather',pets:routines.map((r,k)=>{const p=petSample(r,t-petOffset);return {origin:p,ready:false,path:null,target:bowls[k],back:null}})}}
  if(!visit)return null;
  const v=visit,age=t-v.start;let all=true;
  v.pets.forEach((p,k)=>{if(!p.path){const natural=petSample(routines[k],t-petOffset);if(natural.y===0){p.origin=natural;p.base=t-petOffset;p.path=line(petNav.route(natural,p.target));p.depart=t}else all=false}if(p.path&&t-p.depart<p.path.length/.95)all=false});
  if(v.stage==='gather'&&all&&age>=girlPath.length/.65+2){v.stage='feed';v.feedStart=t}
  if(v.stage==='feed'&&t-v.feedStart>=12){v.stage='return';v.returnStart=t;v.pets.forEach(p=>p.back=line([...p.path.points].reverse()))}
  if(v.stage==='return'&&t-v.returnStart>Math.max(girlPath.length/.65,...v.pets.map(p=>p.back.length/.95))){petOffset=t-v.base;visit=null;return null}
  const going=v.stage!=='return',d=going?Math.min(girlPath.length,age*.65):Math.max(0,girlPath.length-(t-v.returnStart)*.65),point=atDistance(girlPath,d),walking=going?d<girlPath.length:d>0;
  return {...point,angle:walking?point.angle:Math.atan2((bowls[0].x+bowls[1].x)/2-lamp.x,(bowls[0].z+bowls[1].z)/2-lamp.z),state:walking?'walk':v.stage==='feed'?'feed':'call',gait:point.distance/.5*Math.PI*2,phase:age,stage:v.stage,age,bowls,hearts:v.stage==='feed',label:walking?'提著飼料小袋，走向路燈':v.stage==='feed'?'蹲下倒飼料，輕輕摸摸牠們':'小花、橘丸！吃飯囉～'};
 }
 function pets(t,hour){feeding(t,hour);lastPetTime=t;if(!visit)return routines.map(r=>petSample(r,t-petOffset));const v=visit;return routines.map((r,k)=>{const p=v.pets[k];if(!p.path)return petSample(r,t-petOffset);const returning=v.stage==='return',path=returning?p.back:p.path,d=(t-(returning?v.returnStart:p.depart))*.95,point=atDistance(path,d),running=d<path.length,feed=v.stage==='feed';return {...point,y:0,kind:r.kind,action:running?'walk':feed?'sniff':'sit',age:t-v.start,progress:0,running,speed:running?.95:0,gait:point.distance/.45*Math.PI*2,hearts:feed,calling:false,state:running?(returning?'吃飽散步，回到自己的小天地':'聽見阿穎呼喚，跑來吃飯'):feed?'開心吃飼料 ♡':'乖乖等開飯',angle:running?point.angle:Math.PI}})}
 return {worlds,sample:(id,k,t,night)=>sample(worlds[id].actors[k],t,night),pets,feeding,feedingSpot:{lamp,bowls,girlHome},petRoutines:routines};}
 const ease=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 function transitionHour(from,to,progress){const delta=((to-from+36)%24)-12;return ((from+delta*ease(progress))%24+24)%24}
 function skyEvents(random=Math.random){let last=null,wasNight=false,nightTime=0,next=4+random()*6,showerNext=12+random()*14,fireNext=20+random()*14,event=null,shower=null,fire=null;
 function update(hour,time){const h=((hour%24)+24)%24,night=h>=20||h<6,dt=last===null?0:Math.min(5,Math.max(0,time-last));last=time;if(night&&wasNight)nightTime+=dt;wasNight=night;if(!night){event=shower=fire=null;return false}
 if(nightTime>=next){event={start:nightTime,duration:1.2+random()*.6,x:.18+random()*.46,y:.06+random()*.12,dx:(random()<.5?-1:1)*(.14+random()*.15),dy:.13+random()*.1};next=nightTime+19+random()*28}
 if(nightTime>=showerNext){shower={start:nightTime,paths:Array.from({length:7},(_,k)=>({delay:k*.55+random()*.2,duration:1.1+random()*.5,x:.13+random()*.57,y:.035+random()*.17,dx:.16+random()*.15,dy:.15+random()*.12}))};showerNext=nightTime+90+random()*95}
 if(nightTime>=fireNext){fire={start:nightTime,bursts:Array.from({length:3},(_,k)=>({delay:k*1.8,x:.17+random()*.28,y:.20+random()*.13,color:['#efc78d','#e7a6b1','#a9d6c9','#c9b8e8'][Math.floor(random()*4)],seed:random()*6.28}))};fireNext=nightTime+110+random()*100}return true}
 return {invite(){next=nightTime+.5;showerNext=nightTime+2.5;fireNext=nightTime+7},sample(hour,time){if(!update(hour,time))return null;return event&&nightTime<event.start+event.duration?{...event,progress:(nightTime-event.start)/event.duration}:null},extras(hour,time){if(!update(hour,time))return {showers:[],fireworks:[]};return {showers:shower?shower.paths.map(p=>({...p,progress:(nightTime-shower.start-p.delay)/p.duration})).filter(p=>p.progress>=0&&p.progress<=1):[],fireworks:fire?fire.bursts.map(p=>({...p,age:nightTime-fire.start-p.delay})).filter(p=>p.age>=0&&p.age<=3.3):[]}}};}
 function skyState(hour,time,meteor=null){const h=((hour%24)+24)%24,dusk=h>=17&&h<20?Math.sin((h-17)/3*Math.PI)**2:0,sunAlpha=ease((h-5.8)/1.2)*(1-ease((h-18.6)/1.4)),moonAlpha=h>=12?ease((h-18.5)/1.5):1-ease((h-5)/2),sunQ=Math.max(0,Math.min(1,(h-6)/14)),moonQ=Math.max(0,Math.min(1,((h<12?h+24:h)-19)/12));return {sun:sunAlpha>.001,sunAlpha,sunX:.3+sunQ*.34,sunY:.29-.14*Math.sin(sunQ*Math.PI),moon:moonAlpha>.001,moonAlpha,moonX:.64-moonQ*.4,moonY:.30-.14*Math.sin(moonQ*Math.PI),dusk,stars:moonAlpha>.001,starAlpha:moonAlpha,meteor,egrets:dusk>.001,fog:Math.exp(-(((h-5)/1.8)**2))*.11}}
 const api={create,obstacleMap,navigation,line,atDistance,sample,skyState,skyEvents,transitionHour,STEP,CLEARANCE};if(typeof module!=='undefined')module.exports=api;else root.IslandSimulation=api;
})(typeof window!=='undefined'?window:globalThis);
