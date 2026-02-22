(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GameLogic=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  const DEFAULT_GAZE_CFG={
    direction:{enter:0.1,leave:0.06,margin:0.03,horizontalBias:0.9,verticalSwitchBias:0.9,downSwitchBias:0.85},
    match:{tx:0.06,tyDown:0.08,tyUp:0.08},
  };

  function clamp(v,min,max){return Math.min(max,Math.max(min,v));}

  function formatMMSS(sec){
    const safe=Math.max(0,Math.floor(sec));
    const m=Math.floor(safe/60),s=safe%60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function dirLabel(dir){
    if(dir==="LEFT")return"왼쪽";
    if(dir==="RIGHT")return"오른쪽";
    if(dir==="UP")return"위";
    if(dir==="DOWN")return"아래";
    return"정면";
  }

  function makeGazeSequence(randFn,length,pool){
    const rand=typeof randFn==="function"?randFn:Math.random;
    const size=Number.isFinite(length)?Math.max(1,Math.floor(length)):10;
    const dirs=Array.isArray(pool)&&pool.length>0?pool:["LEFT","RIGHT","UP","DOWN"];
    const seq=[];
    let prev="";
    for(let i=0;i<size;i++){
      const options=dirs.filter((d)=>d!==prev);
      const picked=options[Math.floor(rand()*options.length)];
      seq.push(picked);
      prev=picked;
    }
    return seq;
  }

  function isDirectionMatch(dir,gaze,cfg){
    const c=cfg||DEFAULT_GAZE_CFG;
    const x=gaze.x,y=gaze.y;
    const tx=c.match.tx,tyDown=c.match.tyDown,tyUp=c.match.tyUp;
    if(dir==="LEFT")return x<-tx;
    if(dir==="RIGHT")return x>tx;
    if(dir==="UP")return y<-tyUp;
    if(dir==="DOWN")return y>tyDown;
    return false;
  }

  function nextGazeDirection(gaze,lastDirection,cfg){
    const c=cfg||DEFAULT_GAZE_CFG;
    const x=gaze.x,y=gaze.y;
    const absX=Math.abs(x),absY=Math.abs(y);
    const enter=c.direction.enter,leave=c.direction.leave,margin=c.direction.margin;
    const hBias=c.direction.horizontalBias,vBias=c.direction.verticalSwitchBias,downBias=c.direction.downSwitchBias;

    if(lastDirection==="LEFT"){
      if(x<-(leave-margin))return"왼쪽";
      if(absX<leave&&absY<leave)return"정면";
    }else if(lastDirection==="RIGHT"){
      if(x>(leave-margin))return"오른쪽";
      if(absX<leave&&absY<leave)return"정면";
    }else if(lastDirection==="UP"){
      if(y<-(leave-margin))return"위";
      if(absX<leave&&absY<leave)return"정면";
    }else if(lastDirection==="DOWN"){
      if(y>(leave-margin))return"아래";
      if(absX<leave&&absY<leave)return"정면";
    }

    if(absX<leave&&absY<leave)return"정면";
    if(x<=-enter&&absX>=absY*hBias)return"왼쪽";
    if(x>=enter&&absX>=absY*hBias)return"오른쪽";
    if(y<=-(enter*vBias)&&absY>=absX*vBias)return"위";
    if(y>=(enter*downBias)&&absY>=absX*downBias)return"아래";
    return"정면";
  }

  function reducePushUiState(prev,event){
    const state=Object.assign({active:false,status:"중지됨"},prev||{});
    if(event==="start_pending")return Object.assign(state,{status:"웹푸시 구독/연결 중..."});
    if(event==="start_ok")return Object.assign(state,{active:true,status:"웹푸시 전송 정상"});
    if(event==="start_partial")return Object.assign(state,{active:true,status:"웹푸시 부분성공"});
    if(event&&String(event).startsWith("start_fail:"))return Object.assign(state,{active:false,status:`웹푸시 시작 실패: ${String(event).slice(11)}`});
    if(event==="running")return Object.assign(state,{active:true,status:"웹푸시 동작 중"});
    if(event==="stopped")return Object.assign(state,{active:false,status:"중지됨"});
    return state;
  }

  return{
    DEFAULT_GAZE_CFG,
    clamp,
    formatMMSS,
    dirLabel,
    makeGazeSequence,
    isDirectionMatch,
    nextGazeDirection,
    reducePushUiState,
  };
});
