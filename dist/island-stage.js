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
document.querySelector('#enter-island')?.remove();
window.addEventListener('tp-island-focus',event=>{
  if(event.detail<0){
    window.TPIslandPage=false;
    district?.classList.remove('island-open');
  }
});
function dressPanel(){
  if(!panel||panel.querySelector('.dossier-bar'))return;
  const bar=document.createElement('div');
  bar.className='dossier-bar';
  bar.innerHTML='<b>案卷</b><button type="button" class="dossier-fold" aria-label="收合案卷">–</button>';
  panel.prepend(bar);
  const grip=document.createElement('i');
  grip.className='dossier-resize';
  grip.title='拖曳調整大小';
  panel.append(grip);
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
    panel.style.position='fixed';
    panel.style.right='auto';
    panel.style.bottom='auto';
    panel.style.left=rect.left+'px';
    panel.style.top=rect.top+'px';
    panel.style.width=rect.width+'px';
    panel.style.margin='0';
    const move=ev=>{
      const maxL=window.innerWidth-rect.width-8;
      const maxT=window.innerHeight-48;
      panel.style.left=Math.max(8,Math.min(maxL,rect.left+ev.clientX-startX))+'px';
      panel.style.top=Math.max(8,Math.min(maxT,rect.top+ev.clientY-startY))+'px';
    };
    const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
  });
  grip.addEventListener('pointerdown',event=>{
    event.preventDefault();
    event.stopPropagation();
    const rect=panel.getBoundingClientRect();
    panel.style.position='fixed';
    panel.style.right='auto';
    panel.style.bottom='auto';
    panel.style.left=rect.left+'px';
    panel.style.top=rect.top+'px';
    const startX=event.clientX,startY=event.clientY,width=rect.width,height=rect.height;
    const move=ev=>{
      panel.style.width=Math.max(168,Math.min(window.innerWidth-24,width+ev.clientX-startX))+'px';
      panel.style.height=Math.max(120,Math.min(window.innerHeight-24,height+ev.clientY-startY))+'px';
      panel.style.maxHeight='none';
    };
    const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
  });
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
