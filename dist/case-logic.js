(function(root){
  const logic={
    resolve(state){
      if(state.theory===null||state.theory===undefined)return 'choose';
      if(state.theory==='more'||new Set(state.clues).size<4)return 'incomplete';
      return state.theory===state.universe?'verified':'contradiction';
    },
    tax(amount,rate){
      if(rate===''||!Number.isFinite(Number(rate))||Number(rate)<0||Number(rate)>100||!Number.isFinite(amount)||amount<0)return null;
      return Math.round(amount*Number(rate))/100;
    },
    changeTimeline(state,universe){
      if(!Number.isInteger(universe)||universe<0||universe>2)throw new RangeError('Unknown timeline');
      const next={...state,universe,clues:[],theory:null,resolved:false,endings:[...state.endings]};next.rpg=null;return next;
    }
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=logic;
  else root.TPLogic=logic;
})(typeof window!=='undefined'?window:globalThis);
