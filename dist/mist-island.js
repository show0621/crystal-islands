/* Separate document and save namespace: the island never advances the main campaign. */
(function(){
 const portal=document.createElement('dialog');portal.id='mist-portal';portal.setAttribute('aria-label','迷霧孤島：三重交易謎團');
 portal.innerHTML='<div class="mist-toolbar"><div><b>🌫 迷霧孤島</b><small>甲・A・B・C｜獨立偵查副本</small></div><a href="mist-island/" target="_blank" rel="noopener">另開頁面 ↗</a><button id="mist-return" aria-label="返回原群島">← 返回群島</button></div><iframe title="三重交易謎團：獨立偵查遊戲" src="about:blank"></iframe>';
 document.body.append(portal);const frame=portal.querySelector('iframe');let previous=null;
 window.openMistIsland=function(){previous=document.activeElement;if(!frame.src.includes('mist-island/?v=left'))frame.src='mist-island/?v=left';portal.showModal()};
 portal.querySelector('#mist-return').onclick=()=>portal.close();portal.addEventListener('close',()=>previous?.focus());
 const entry=document.createElement('button');entry.id='mist-island-entry';entry.className='mist-entry';entry.innerHTML='<span>⌕</span><div><b>迷霧孤島</b><small>甲・A・B・C 的三重交易謎團</small></div><em>獨立探索 ↗</em>';entry.onclick=window.openMistIsland;
 document.querySelector('.explorer').insertAdjacentElement('afterend',entry);
})();
