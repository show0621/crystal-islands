(function(root){const L={
 thresholds:{pass:80,distinction:90},
 grade(n){return n>=90?'distinction':n>=80?'pass':'retry'},
 isAnswer(q,value){if(value===undefined||value===null||String(value).trim()==='')return false;const n=Number(String(value).replace(/,/g,''));return Number.isFinite(n)&&Math.abs(n-q.correct)<.001},
 score(questions,answers){const rows=questions.map((q,i)=>({index:i,answer:answers[i]??'',correct:L.isAnswer(q,answers[i]),points:L.isAnswer(q,answers[i])?100/questions.length:0})),score=Math.round(rows.reduce((sum,x)=>sum+x.points,0));return {score,grade:L.grade(score),rows,correct:rows.filter(x=>x.correct).length,total:questions.length}},
 makeAttempt(questions,answers,name,now){const result=L.score(questions,answers);return {...result,answers:{...answers},name:String(name||'島嶼學習者').trim().slice(0,40),submittedAt:now}},
 canCertify(attempt){return !!attempt&&['pass','distinction'].includes(attempt.grade)&&attempt.score>=80&&typeof attempt.submittedAt==='string'},
 row(label,actual,expected,why){return {label,actual:String(actual??'未作答'),expected:String(expected),ok:String(actual)===String(expected),why}},
 numericRow(label,actual,expected,why){const ok=String(actual??'').trim()!==''&&Number.isFinite(Number(actual))&&Math.abs(Number(actual)-expected)<.001;return {label,actual:String(actual??'')||'未作答',expected:String(expected),ok,why}}
};if(typeof module!=='undefined'&&module.exports)module.exports=L;else root.TPLearning=L})(typeof window!=='undefined'?window:globalThis);
