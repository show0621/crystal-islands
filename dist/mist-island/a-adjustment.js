/* User-specified teaching model. Percentages are percentage points; amounts are TWD thousands. */
(function(root){
 function round(n,places=0){const scale=10**places;return Math.sign(n)*Math.round(Math.abs(n)*scale+1e-9)/scale}
 function percentile(values,p){if(!values.length)return null;const a=[...values].sort((a,b)=>a-b),i=(a.length-1)*p;return a[Math.floor(i)]+(a[Math.ceil(i)]-a[Math.floor(i)])*(i-Math.floor(i))}
 function fullCostMargin(operatingMargin){if(!Number.isFinite(operatingMargin)||operatingMargin>=100)throw Error('營業淨利率須小於100%');const value=round(operatingMargin,2);return round(value/(100-value)*100,2)}
 function summarize(values){const a=values.map(n=>round(n,2));return a.length?{count:a.length,q25:round(percentile(a,.25),2),median:round(percentile(a,.5),2),q75:round(percentile(a,.75),2)}:null}
 function segment(kind,selected,farReady,party){const res=kind==='return',base=res?90000000:100000000,actual=res?32:26.3,royalty=res?0:600000,indicator=res?'成本及營業費用淨利率':'營業淨利率',testedParty=res?party:'A',stats=summarize(selected.map(c=>res?fullCostMargin(c.margin):c.margin)),result={kind,base,actual,royalty,indicator,testedParty,stats,rawAdjustment:null,adjustment:0};
 if(!farReady)return {...result,status:'pending',reason:'請先完成FAR調查卡，才能進行選樣與調整試算。'};
 if(res&&party==='甲')return {...result,status:'complex',reason:'甲公司功能複雜，較難在市場上尋找具有相同FAR的可比對象。本模型不套用A公司的32%及其可比區間。'};
 if(res&&party!=='A')return {...result,status:'pending',reason:'請先選擇回銷交易的受測個體。'};
 if(!stats)return {...result,status:'pending',reason:'尚未選取可比對象，不能計算常規區間或調整數。'};
 if(actual<stats.q25-1e-9)return {...result,status:'below',reason:'受測個體利潤率低於第25分位；調整不利我國稅負，不予調整。'};
 if(actual<=stats.q75+1e-9)return {...result,status:'inside',reason:'受測個體利潤率落於第25至第75分位常規區間內，不予調整。'};
 const rawAdjustment=round(base*(actual-stats.median)/100-royalty);
 return {...result,rawAdjustment,adjustment:Math.max(0,rawAdjustment),status:rawAdjustment>0?'above':'covered',reason:rawAdjustment>0?'受測個體利潤率高於第75分位，依題目指定公式，以中位數計算甲公司所得調整。':'受測個體利潤率高於第75分位，但扣除已收權利金後差額不為正，不再增加甲公司所得。'};
 }
 function evaluate({selected=[],farReady=false,returnParty=''}={}){const back=segment('return',selected,farReady,returnParty),other=segment('nonreturn',selected,farReady,'A');return {return:back,nonreturn:other,total:back.adjustment+other.adjustment}}
 const api={round,percentile,fullCostMargin,summarize,evaluate};if(typeof module!=='undefined')module.exports=api;else root.TPAAdjustment=api;
})(typeof window!=='undefined'?window:globalThis);
