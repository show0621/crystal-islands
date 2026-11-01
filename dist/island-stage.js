/* Scene-first hub. Island clicks stay on this map and zoom in place. */
(function(){
const q=new URLSearchParams(location.search),page=q.get('view');
const bar=document.createElement('nav');
bar.className='stage-launchers';
bar.setAttribute('aria-label','案件選擇');
bar.innerHTML='<button type="button" data-work-page="cases">案件選擇</button>';
document.querySelector('header').append(bar);
bar.querySelector('[data-work-page="cases"]').onclick=()=>showSeasonJournal();
const fold=document.createElement('button');
fold.className='stage-sidebar-fold';
fold.textContent='案卷 ▤';
fold.onclick=()=>document.querySelector('.explorer').classList.toggle('sidebar-open');
document.querySelector('.explorer').append(fold);
if(page){
  document.body.classList.add('stage-page');
  const back=document.createElement('a');
  back.className='stage-return';
  back.href='./';
  back.textContent='← 回到晶島全景';
  document.querySelector('main').prepend(back);
  if(page==='cases')showSeasonJournal();
  if(page==='archive')openArchiveMenu();
  if(page==='bapa')BAPAVoyage.open();
  if(page==='residents'){window.scrollTo(0,0);document.querySelector('#district').style.display='block'}
}
})();
(function(){
const q=new URLSearchParams(location.search),view=q.get('view');
if(!view){
  window.CampaignRoute=function(hit){
    if(hit&&Number.isInteger(hit.id)&&islands[hit.id])goIsland(hit.id);
  };
}else if(view==='case')openCampaignStep();
else if(view==='residents'&&q.has('island')){
  IslandWorld.select(Number(q.get('island')));
  if(q.has('person'))IslandWorld.resident(Number(q.get('island')),Number(q.get('person')));
}
})();
(function(){
const panel=document.querySelector('#island-panel');
const district=document.querySelector('#district');
const STORE='tp-dossier-box';
document.querySelector('#enter-island')?.remove();
window.addEventListener('tp-island-focus',event=>{
  if(event.detail<0){
    window.TPIslandPage=false;
    district?.classList.remove('island-open');
  }
});
function readBox(){
  try{return JSON.parse(localStorage.getItem(STORE)||'null');}catch{return null;}
}
function writeBox(box){
  try{localStorage.setItem(STORE,JSON.stringify(box));}catch{}
}
function setImp(el,name,value){
  if(value==null||value==='')el.style.removeProperty(name);
  else el.style.setProperty(name,value,'important');
}
function applyBox(box){
  if(!panel||!box)return;
  panel.classList.add('is-user-sized');
  setImp(panel,'position','fixed');
  setImp(panel,'right','auto');
  setImp(panel,'bottom','auto');
  setImp(panel,'margin','0');
  if(box.w){setImp(panel,'width',box.w+'px');setImp(panel,'max-width','none');}
  if(box.h){setImp(panel,'height',box.h+'px');setImp(panel,'max-height','none');}
  if(Number.isFinite(box.l))setImp(panel,'left',box.l+'px');
  if(Number.isFinite(box.t))setImp(panel,'top',box.t+'px');
}
function snapshotBox(){
  const r=panel.getBoundingClientRect();
  return {w:Math.round(r.width),h:Math.round(r.height),l:Math.round(r.left),t:Math.round(r.top)};
}
function dressPanel(){
  if(!panel)return;
  if(!panel.querySelector('.dossier-bar')){
    const bar=document.createElement('div');
    bar.className='dossier-bar';
    bar.innerHTML='<b>案卷</b><small class="dossier-hint">可拖移 · 右下角調寬</small><button type="button" class="dossier-fold" aria-label="收合案卷">–</button>';
    panel.prepend(bar);
    const grip=document.createElement('i');
    grip.className='dossier-resize';
    grip.title='拖曳調整寬高';
    grip.setAttribute('aria-hidden','true');
    panel.append(grip);
    const edge=document.createElement('i');
    edge.className='dossier-resize-x';
    edge.title='拖曳調整寬度';
    edge.setAttribute('aria-hidden','true');
    panel.append(edge);
    bar.querySelector('.dossier-fold').onclick=event=>{
      event.stopPropagation();
      const closed=panel.classList.toggle('is-collapsed');
      event.currentTarget.textContent=closed?'＋':'–';
      event.currentTarget.setAttribute('aria-label',closed?'展開案卷':'收合案卷');
    };
    bar.addEventListener('pointerdown',event=>{
      if(event.target.closest('button'))return;
      event.preventDefault();
      const startX=event.clientX,startY=event.clientY;
      const rect=panel.getBoundingClientRect();
      applyBox({w:rect.width,h:rect.height,l:rect.left,t:rect.top});
      const move=ev=>{
        const w=panel.getBoundingClientRect().width;
        const maxL=window.innerWidth-w-8;
        const maxT=window.innerHeight-48;
        setImp(panel,'left',Math.max(8,Math.min(maxL,rect.left+ev.clientX-startX))+'px');
        setImp(panel,'top',Math.max(8,Math.min(maxT,rect.top+ev.clientY-startY))+'px');
      };
      const up=()=>{
        window.removeEventListener('pointermove',move);
        window.removeEventListener('pointerup',up);
        writeBox(snapshotBox());
      };
      window.addEventListener('pointermove',move);
      window.addEventListener('pointerup',up);
    });
    const startResize=(event,mode)=>{
      event.preventDefault();
      event.stopPropagation();
      const rect=panel.getBoundingClientRect();
      applyBox({w:rect.width,h:rect.height,l:rect.left,t:rect.top});
      const startX=event.clientX,startY=event.clientY,width=rect.width,height=rect.height;
      const minW=160,minH=110;
      const move=ev=>{
        if(mode!=='y'){
          const nextW=Math.max(minW,Math.min(window.innerWidth-24,width+ev.clientX-startX));
          setImp(panel,'width',nextW+'px');
          setImp(panel,'max-width','none');
        }
        if(mode!=='x'){
          const nextH=Math.max(minH,Math.min(window.innerHeight-24,height+ev.clientY-startY));
          setImp(panel,'height',nextH+'px');
          setImp(panel,'max-height','none');
        }
      };
      const up=()=>{
        window.removeEventListener('pointermove',move);
        window.removeEventListener('pointerup',up);
        writeBox(snapshotBox());
      };
      window.addEventListener('pointermove',move);
      window.addEventListener('pointerup',up);
    };
    grip.addEventListener('pointerdown',event=>startResize(event,'xy'));
    edge.addEventListener('pointerdown',event=>startResize(event,'x'));
  }
  const saved=readBox();
  if(saved&&!panel.classList.contains('is-user-sized'))applyBox(saved);
}
if(panel){
  new MutationObserver(()=>dressPanel()).observe(panel,{childList:true});
  dressPanel();
}
if(typeof renderSeason==='function'){
  const paint=renderSeason;
  renderSeason=function(){
    paint();
    if(window.TPIslandPage&&window.IslandWorld&&IslandWorld.viewed>=0)IslandWorld.render();
    dressPanel();
  };
}
})();
