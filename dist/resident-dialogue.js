/* Authored branching conversations. Testable, deterministic, no model or network. */
(function(root){
 const scenes=[
 {day:'會議室裡，需求預測被排成三列；他先把咖啡挪到文件以外。',dusk:'散會後的玻璃走廊染上晚霞，最後一頁決議還沒收好。',night:'總部只剩一排燈。鍵盤停了，他回頭看你手裡的資料夾。',task:'把提案、核准與執行分開',prop:'決議版本',question:'誰能改變原先的安排？'},
 {day:'輸送線的提示燈一明一暗。對方先確認交接，再走到隔音窗前。',dusk:'換班鈴響了，工單和安全帽留在桌上；他請你別擋住載具通道。',night:'廠窗仍然通明，對方看了一眼交接簿，示意你把問題說得具體一點。',task:'把例行操作、工程判斷與管理決策分開',prop:'工單與版本紀錄',question:'這是安全操作權，還是商業決定權？'},
 {day:'實驗台上有幾組不同顏色的樣本。對方先蓋好瓶蓋，才轉身聽你說。',dusk:'穹頂映著晚霞，模擬還在跑；他把失敗記錄也一併留在桌上。',night:'實驗室的燈照著未完成的筆記。對方揉揉眼睛，先確認你問的是哪一項工作。',task:'區分技術執行、研發決策與失敗風險',prop:'原始實驗與授權紀錄',question:'誰能換方向，誰又能終止整個計畫？'},
 {day:'倉庫外的推車剛停好，訂單畫面還開著；對方先核對了一次出貨欄位。',dusk:'運河邊的風慢下來了，最後一批貨仍等著確認。',night:'倉庫路燈照著棧板的影子，他把沒關的訂單頁面轉向自己。',task:'把接單、存貨、信用與市場風險拆開',prop:'訂單與損失處理紀錄',question:'誰決定接受風險，誰實際處理後果？'},
 {day:'品牌舞台正在換看板；對方收起提案樣張，問你想看活動還是報酬。',dusk:'活動散場後，晚霞照在撤下的海報上；他把當初的企劃也找了出來。',night:'招牌映著安靜街道，對方仍在比對活動成效與原先約定。',task:'把支出、實際貢獻與已有利益分開',prop:'企劃、權利與既有報酬',question:'這項貢獻是否已透過其他方式取得報酬？'},
 {day:'銀行大廳裡，資金表與核准文件分放兩側；他指了指兩張不同的表。',dusk:'銀行開始收櫃，桌燈仍照著未核完的條件清單。',night:'金庫旁只亮一盞燈。對方先確認你問的是額度、動支，還是風險。',task:'區分資金提供、決策權與可衡量利益',prop:'動支與融資條件',question:'交易條件到底讓誰得到什麼利益？'},
 {day:'證據廣場有人推著資料車；對方把空白的結論欄暫時蓋住。',dusk:'路燈亮起來了，查核桌上分成支持與反對兩疊資料。',night:'公署的窗透出暖光，對方先把納稅人的反論放在你面前。',task:'把疑點、口述、查證與調整理由分開',prop:'待證事項與證據對照',question:'如果企業提出相反資料，你的主張還成立嗎？'},
 {day:'閱讀桌上攤著兩份立場不同的資料；對方沒有急著把其中一份收走。',dusk:'圖書館窗邊的光漸暗，對方在自己的意見旁留了一行空白。',night:'書架間只剩桌燈亮著。他把筆放下，請你先說清楚想反駁哪一點。',task:'同時檢查企業主張與稅局推論',prop:'原文與反證',question:'哪一個具體事實能推翻現在的結論？'}
 ];
 const labels={greet:'先聊聊你今天的工作',duty:'問他能不能決定',clue:'問他今天做了什麼',records:'問該調哪份原件',contract:'問合約漏了什麼',counter:'問哪裡會寫錯',accuse:'你的說法有矛盾，是不是在說謊？',repair:'我收回指控，改問可查證的細節',verify:'回答反問：拿原始資料交叉查證',assume:'回答反問：先相信你的職稱與說法',cross:'另一位同事是否能交叉核對？',finish:'整理成會議紀錄',continue:'換個角度，再聊一段',life:'工作之外，最近過得怎樣？'};
 function marked(text){const m=String(text||'').match(/\[\[([^\]]+)\]\]/);return m?m[1]:''}
 function prompts(c,action){
  const scene=scenes[c.id]||scenes[0];
  const name=c.r[0],job=c.r[1],task=c.r[2];
  const fact=marked(c.d[1])||task;
  const knot=marked(c.d[4])||marked(c.d[6])||scene.question;
  const other=c.other?.[0]||'另一位同事';
  const pack=[
   [c.d[3], `${name}，${fact}是今天哪一件事？不要先下結論。`, `要核對「${fact}」，你要我調的第一份原件是什麼？`, `若把合約攤開，「${knot}」還有哪一句對不上？`],
   [`我只先問你能回答的：${c.d[3]}`, `${task}做到這一步時，${fact}是誰經手的？`, `口說不算。支持「${knot}」的原始檔在哪裡？`, `${other}若不同意你，分歧會不會落在「${knot}」？`],
   [c.d[3], `別用職稱帶過。${fact}，你自己做了哪一步？`, `這件案子要補件的話，請講文件名稱，不要講感覺。`, `「${knot}」如果只有一半有合約支持，另一半你怎麼解釋？`],
   [`以${job}的工作，${c.d[3]}`, `${scene.prop}裡，${fact}會記在哪一欄？`, `我現在去檔案室，應該指名要哪一份？`, `有沒有一份資料，會讓「${knot}」站不住？`],
   [c.d[3], `我要現場，不是摘要。${fact}當時還有誰在？`, `下一份應該調閱的，跟「${fact}」直接有關的是哪一種紀錄？`, `${name}，你的${task}和「${knot}」衝突時，你會改口嗎？`],
   [`這座島上先查這一件：${c.d[3]}`, `${task}進行到一半，${fact}改變了什麼？`, `請列給我能交叉的檔，不要說「去問別人」。`, `如果${other}的紀錄和你不同，我們先對「${knot}」的哪一個事實？`]
  ][(c.id*3+c.k)%6];
  const bank={
   greet:`${name}，先從你今天的${task}講起。`,
   duty:c.d[3],
   clue:`${name}，今天「${task}」你實際做了哪一步？只講你經手的，先不要下結論。`,
   records:'要把剛才說的寫進會議紀錄，第一份該調的原件叫什麼？請講文件名稱。',
   contract:'合約若只寫職稱或封面，會漏掉你剛才說的哪一個限制？',
   counter:`如果紀錄寫成「${name}決定一切，或擁有這項資產」，哪裡會寫錯？`,
   accuse:`「${fact}」和書面時間對不上。請指到那一頁。`,
   repair:`我改問能查的：${c.d[3]}`,
   verify:`哪一份原件能對上「${fact}」？先拿那個。`,
   assume:`若只因為你是${job}就相信，會漏掉什麼？`,
   cross:`這段請${other}從${c.other?.[1]||'另一段工作'}再講一次。`,
   finish:`先收到這裡。${name}，底稿上只留哪一句？`,
   continue:scene.question,
   life:`先離開數字。${String(c.d[0]||'').slice(0,26)}，跟這件工作有關嗎？`
  };
  return bank[action]||labels[action];
 }
 function brief(c){
  const scene=scenes[c.id]||scenes[0];
  const fact=marked(c.d[1])||c.r[2];
  return {
   why:`${c.r[0]}負責「${c.r[2]}」。你找他，是要確認：${scene.question}`,
   what:`先問他有沒有經手「${fact}」。他自己的關鍵問題是：${c.d[3]}`,
   how:'下面每一句只問一件事。點一句就送出那一句，其他問題還留著，可以再分別問。'
  };
 }
 const aims={duty:'問他能不能決定',clue:'問他今天做了什麼',records:'問該調哪份原件',contract:'問合約漏了什麼',counter:'問哪裡會寫錯',cross:'問另一個人',life:'問這件工作以外',finish:'整理成會議紀錄',verify:'改問原始檔',assume:'問如果只信職稱',repair:'把問題問回來',accuse:'請他指出矛盾',greet:'從今天的工作開場',continue:'換一個角度'};
 const voices=typeof module!=='undefined'?require('./dialogue-voices.js').voices:root.TPDialogueVoices.voices;
 const voice=c=>voices[c.id][c.k];
 function fresh(){return {node:'opening',seen:[],turn:0,visits:0,history:[],endings:[],trust:0,heard:[],replies:{}}}
 function normalize(x){const s={...fresh(),...(x||{})};for(const k of ['seen','history','endings','heard'])if(!Array.isArray(s[k]))s[k]=[];s.replies??={};return s}
 function opening(c,s){const v=voice(c);return `${c.hour>=20||c.hour<6?'夜班的燈還亮著。':c.hour>=17?'窗外的光已經暗下來。':''}${c.r[0]}${v[0]}\n「${s.visits>1?'你回來了。上次的筆錄我還記得，這回先問你沒釐清的部分吧。':v[1]}」`}
 function options(s){if(s.node==='guarded')return ['repair','records','finish'];if(s.node==='question')return ['verify','assume','records'];if(s.node==='ending')return ['continue','cross'];const a=['duty','clue','records','counter','contract','cross','life'].filter(k=>!s.seen.includes(k));return [...a.slice(0,4),...(s.seen.includes('clue')&&!s.seen.includes('accuse')?['accuse']:[]),...(s.turn>=2?['finish']:[])];}
 function advance(c,input,action,question){const s=normalize(JSON.parse(JSON.stringify(input))),d=c.d,v=voice(c);let text='',ending=null,skip=false;const precise=typeof TPDialogueAudit!=='undefined'&&question?TPDialogueAudit.residentReply(c,question,s.specificCounts||{}):null;
 if(precise&&precise.action==='scope'){text=precise.text;action='scope'}else if(precise){action=({decision:'clue',records:'records',cross:'contract',counter:'counter',method:'special-method',amount:'special-amount',open:'duty'}[precise.kind]||action)}
 if(!labels[action]&&!['scope','special-method','special-amount'].includes(action))action='clarify';const n=s.replies[action]||0;s.replies[action]=n+1;s.turn++;if(!s.seen.includes(action))s.seen.push(action);
 // Old transcripts are retained; facts already spoken in an older script are not replayed.
 for(const i of [1,2,4,5,6])if(s.history.some(h=>h.text.includes(d[i]))&&!s.heard.includes(i))s.heard.push(i);
 const fact=i=>{if(s.heard.includes(i))return null;s.heard.push(i);return d[i]};
 const follow=(i,lead='')=>{const f=fact(i);return f?lead+f:null};
 if(action==='scope'){}
 else switch(action){
 case 'greet':case 'duty':text=follow(4)||follow(1);s.node='work';if(!text)text=n===0?`「我只能講到${c.r[1]}自己經手的部分。要找拍板的人，問題是：${d[3]}」`:null;break;
 case 'clue':text=follow(1)||follow(2);s.node='question';if(text)text+='\n「時間、人和版本，我可以再講細。你要對哪一個？」';break;
 case 'verify':s.trust++;if(!s.seen.includes('records'))s.seen.push('records');text=follow(5,'「好，先從這些找起。\n')||'「清單已經在上面了。先挑一份原始檔，對時間、版本和人，再帶著接不上的地方回來。」';if(text.startsWith('「好'))text+='」';s.node='records';break;
 case 'records':text=follow(5);s.node='records';if(!text&&n===1)text=`「上次的原話在筆錄裡。${c.other[0]}能從${c.other[1]}的角度核對；你要先追文件來源，還是實際怎麼做？」`;break;
 case 'contract':text=follow(6)||follow(4);s.node='contrast';if(!text&&n===0)text=`「工作上我剛才說的先留著。現在請指出合約哪一句和「${marked(d[4])||marked(d[1])||c.r[2]}」不同；只看封面，我沒辦法背書。」`;break;
 case 'counter':text=follow(6);s.node='counter';break;
 case 'assume':s.trust--;text=n===0?'「先別急著信我。流利不代表記得完整，職稱也不會替人作決定。把原始紀錄拿來，我們再對一次。」':null;s.node='question';break;
 case 'accuse':s.trust--;text=n===0?'「哪一句？請把文件放在旁邊，指出時間或版本。我願意更正，但不接受先把整件事叫作虛假。」':null;s.node='guarded';break;
 case 'repair':s.trust++;text=n===0?`「好，回到你要確認的那一點。${d[3]}先問這個，我能說多少就說多少。」`:null;s.node='contrast';break;
 case 'cross':text=n===0?`「去找${c.other[0]}吧，${c.other[1]}看到的是另一段工作。我已經說過的先保留，別替我們把答案合成一份。」`:null;s.node='cross';break;
 case 'life':text=n===0?'「'+v[2]+'」':follow(2);s.node='life';break;
 case 'special-method':text=n===0?`「方法要請會計師連同案卷看。我先把自己可能說得太滿的地方講清楚：${d[6]}」`:null;s.node='counter';break;
 case 'special-amount':text=n===0?`「我手上沒有完整計算，先別填一個數。${d[5]}」`:null;s.node='records';break;
 case 'continue':text=options({...s,node:'work'}).some(k=>!['finish','continue'].includes(k))?'「好，還沒談到的那一段，你先問。」':`「我知道的已經說完了。去找${c.other[0]}，或把具體缺件列下來；在這裡多問幾次，也不會多出一份紀錄。」`;s.node='work';break;
 case 'finish':ending=s.seen.includes('counter')&&s.seen.includes('records')&&(s.seen.includes('verify')||s.seen.includes('contract'))?'balanced':s.trust<0?'guarded':'incomplete';text=ending==='balanced'?`訪談小結｜兩種解釋都留下了\n下一步：${d[5]}`:ending==='guarded'?'訪談暫停。對方要求先指出具體矛盾，再帶文件續談。防備反應不能用來判定說謊。':'會議紀錄先寫下已問到的部分。還沒問到的原件或限制，那些欄先不要當成定案。';s.node='ending';if(!s.endings.includes(ending))s.endings.push(ending);break;
 default:text=n===0?`「我沒抓到你指哪件事。你可以具體問：${d[3]}」`:null;break;
 }
 if(!text||s.history.some(h=>h.text===text)){skip=true;text='這一點已留在筆錄，沒有新增事實。可以換題、找另一位同事，或整理補件。'}
 if(!skip)s.history.push({q:question||labels[action]||'釐清問題',text,action,ending});s.history=s.history.slice(-64);return {state:s,text,ending,skip};}
 function intent(q,s){const x=String(q).trim();if(/不相信|相信你|職稱就|先相信/.test(x))return 'assume';if(/不是.*說謊|不是.*指控|沒有說謊|收回|抱歉|誤會/.test(x))return 'repair';if(/說謊|騙|隱瞞|你在撒謊/.test(x))return 'accuse';if(/結論|結束|收尾|整理訪談/.test(x))return 'finish';if(/反證|推翻|反駁|不利|相反/.test(x))return 'counter';if(/合約|條款|契約/.test(x))return 'contract';if(/找誰|同事|另一位|交叉|核對別人/.test(x))return 'cross';if(/資料|紀錄|記錄|證據|帳|版本|郵件|調閱/.test(x))return s.node==='question'?'verify':'records';if(/權限|誰決定|風險|負責|工作|批准|決策/.test(x))return 'duty';if(/細節|為什麼|為何|剛才|追問|怎麼|如何/.test(x))return 'clue';if(/休息|下班|心情|生活|最近|吃飯|貓|狗/.test(x))return 'life';return 'clarify'}
 const api={scenes,labels,prompts,brief,aims,fresh,normalize,opening,options,advance,intent};if(typeof module!=='undefined')module.exports=api;else root.ResidentDialogue=api;
})(typeof window!=='undefined'?window:globalThis);
