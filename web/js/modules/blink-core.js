(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.BlinkCore=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function isGoalMet(count,target){return (count|0)>=(target|0);}
  function remainSeconds(endTs,now){return Math.max(0,Math.ceil((endTs-now)/1000));}
  return{isGoalMet,remainSeconds};
});
