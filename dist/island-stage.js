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
function applyBox(box,{keepHeight=true}={}){
  if(!panel||!box)return;
  panel.classList.add('is-user-sized');
  // Pin the left edge so width always grows left → right.
  setImp(panel,'position','fixed');
  setImp(panel,'right','auto');
  setImp(panel,'bottom','auto');
  setImp(panel,'left',Math.round(box.l)+'px');
  setImp(panel,'top',Math.round(box.t)+'px');
  setImp(panel,'margin','0');
  if(box.w){
    setImp(panel,'width',Math.round(box.w)+'px');
    setImp(panel,'max-width','none');
  }
  if(keepHeight&&box.h&&!panel.classList.contains('is-collapsed')){
    setImp(panel,'height',Math.round(box.h)+'px');
    setImp(panel,'max-height','none');
  }
}
function snapshotBox(){
  const r=panel.getBoundingClientRect();
  const prev=readBox()||{};
  const box={w:Math.round(r.width),l:Math.round(r.left),t:Math.round(r.top),collapsed:panel.classList.contains('is-collapsed')};
  // Keep the expanded height while collapsed so restore still works.
  box.h=panel.classList.contains('is-collapsed')&&prev.h?prev.h:Math.round(r.height);
  return box;
}
function collapsePanel(closed){
  const fold=panel.querySelector('.dossier-fold');
  panel.classList.toggle('is-collapsed',closed);
  if(fold){
    fold.textContent=closed?'＋':'–';
    fold.setAttribute('aria-label',closed?'展開案卷':'收合案卷');
  }
  if(closed){
    // Drop the locked pixel height so the card really shrinks to the title bar.
    panel.style.removeProperty('height');
    setImp(panel,'height','fit-content');
    setImp(panel,'min-height','0');
    setImp(panel,'max-height','52px');
  }else{
    const saved=readBox();
    panel.style.removeProperty('max-height');
    setImp(panel,'min-height',null);
    if(saved?.h){
      setImp(panel,'height',saved.h+'px');
      setImp(panel,'max-height','none');
    }else{
      setImp(panel,'height',null);
      setImp(panel,'max-height',null);
    }
  }
  const box=snapshotBox();
  box.collapsed=closed;
  writeBox(box);
}
function dressPanel(){
  if(!panel)return;
  if(!panel.querySelector('.dossier-bar')){
    const bar=document.createElement('div');
    bar.className='dossier-bar';
    // Use a span, not <button>, so global button min-height rules cannot squash it into an oval.
    bar.innerHTML='<b>案卷</b><small class="dossier-hint">可拖移 · 右邊拉寬</small><span class="dossier-fold" role="button" tabindex="0" aria-label="收合案卷">–</span>';
    panel.prepend(bar);
    const grip=document.createElement('i');
    grip.className='dossier-resize';
    grip.title='拖曳調整寬高（向右加寬）';
    grip.setAttribute('aria-hidden','true');
    panel.append(grip);
    const edge=document.createElement('i');
    edge.className='dossier-resize-x';
    edge.title='向右拖曳加寬';
    edge.setAttribute('aria-hidden','true');
    panel.append(edge);
    const fold=bar.querySelector('.dossier-fold');
    const toggle=event=>{
      event.preventDefault();
      event.stopPropagation();
      collapsePanel(!panel.classList.contains('is-collapsed'));
    };
    fold.addEventListener('click',toggle);
    fold.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' ')toggle(event);
    });
    bar.addEventListener('pointerdown',event=>{
      if(event.target.closest('.dossier-fold'))return;
      event.preventDefault();
      const startX=event.clientX,startY=event.clientY;
      const rect=panel.getBoundingClientRect();
      const origin={w:rect.width,h:rect.height,l:rect.left,t:rect.top};
      applyBox(origin,{keepHeight:!panel.classList.contains('is-collapsed')});
      const move=ev=>{
        const w=panel.getBoundingClientRect().width;
        const maxL=window.innerWidth-w-8;
        const maxT=window.innerHeight-48;
        setImp(panel,'left',Math.max(8,Math.min(maxL,origin.l+ev.clientX-startX))+'px');
        setImp(panel,'top',Math.max(8,Math.min(maxT,origin.t+ev.clientY-startY))+'px');
        setImp(panel,'right','auto');
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
      if(panel.classList.contains('is-collapsed'))return;
      const rect=panel.getBoundingClientRect();
      // Lock left edge first; dragging the right handle only changes width.
      const pinnedLeft=rect.left;
      const pinnedTop=rect.top;
      const startX=event.clientX,startY=event.clientY;
      const startW=rect.width,startH=rect.height;
      const minW=160,minH=110;
      applyBox({w:startW,h:startH,l:pinnedLeft,t:pinnedTop});
      const move=ev=>{
        setImp(panel,'left',Math.round(pinnedLeft)+'px');
        setImp(panel,'top',Math.round(pinnedTop)+'px');
        setImp(panel,'right','auto');
        if(mode!=='y'){
          const nextW=Math.max(minW,Math.min(window.innerWidth-pinnedLeft-8,startW+(ev.clientX-startX)));
          setImp(panel,'width',Math.round(nextW)+'px');
          setImp(panel,'max-width','none');
        }
        if(mode!=='x'){
          const nextH=Math.max(minH,Math.min(window.innerHeight-pinnedTop-8,startH+(ev.clientY-startY)));
          setImp(panel,'height',Math.round(nextH)+'px');
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
  if(saved){
    if(!panel.classList.contains('is-user-sized'))applyBox(saved,{keepHeight:!saved.collapsed});
    if(saved.collapsed)collapsePanel(true);
    else{
      const fold=panel.querySelector('.dossier-fold');
      if(fold&&!panel.classList.contains('is-collapsed')){
        fold.textContent='–';
        fold.setAttribute('aria-label','收合案卷');
      }
    }
  }
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
