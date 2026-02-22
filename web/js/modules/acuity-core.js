(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.AcuityCore=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function angle(dir){
    if(dir==="UP")return 270;
    if(dir==="RIGHT")return 0;
    if(dir==="DOWN")return 90;
    return 180;
  }

  function nextDirection(prev,randFn){
    const dirs=["UP","RIGHT","DOWN","LEFT"];
    const rand=typeof randFn==="function"?randFn:Math.random;
    const options=dirs.filter((d)=>d!==prev);
    return options[Math.floor(rand()*options.length)];
  }

  function sizeByRound(round){
    if(round>=10)return Math.max(8,12-(round-10)*2);
    if(round>=7)return Math.max(10,30-(round-7)*4);
    return Math.max(24,46-round*1.5);
  }

  return{angle,nextDirection,sizeByRound};
});
