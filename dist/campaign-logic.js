(function(root){const logic={
 fresh(){return {current:0,finished:false,records:{},lastMessage:null}},
 record(state,i){return state.records[i]||(state.records[i]={step:0,files:[],solved:[],dialogues:{},answers:{},notes:'',complete:false,sealed:false})},
 tax(base,adjust,rate=.2){return Math.round((Math.max(0,base+adjust)-Math.max(0,base))*rate*100)/100},
 validatePuzzle(rows,answers){return rows.every((r,i)=>answers[i]!==''&&answers[i]!==undefined&&Number(answers[i])===r.correct)},
 validateSequence(expected,answers){return expected.length===answers.length&&expected.every((v,i)=>answers[i]!==''&&answers[i]!==undefined&&Number(answers[i])===v)},
 validateCostBase(selected){return selected.length===2&&selected.includes('engineering')&&selected.includes('integrated')},
 validateAssets(selected){return selected.length===2&&selected.includes('rights')&&selected.includes('knowhow')},
 canRead(state,index){return index<=state.current},
 seal(state,index,total){const r=logic.record(state,index);if(!r.complete||index!==state.current)return false;r.sealed=true;if(index===total-1)state.finished=true;else state.current++;return true}
};if(typeof module!=='undefined'&&module.exports)module.exports=logic;else root.TPCampaign=logic})(typeof window!=='undefined'?window:globalThis);
