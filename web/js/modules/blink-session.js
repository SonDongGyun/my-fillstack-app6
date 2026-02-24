(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.BlinkSession=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      APP_STATE,
      startCamera,
      blinkMeta,
      blinkPanel,
      emojiFace,
      blinkResultFlashEl,
      blinkCountLine,
      blinkTimeLine,
      updateBlinkCornerTime,
      blinkCore,
      triggerBlinkCompleteFx,
      timerManager,
    }=ctx;

    async function start(){
      if(!APP_STATE.camera.running){
        blinkMeta.textContent="카메라 시작 중...";
        const ok=await startCamera();
        if(!ok||!APP_STATE.camera.running){
          blinkMeta.textContent="카메라 권한을 허용한 뒤 다시 시도해 주세요";
          return;
        }
      }

      APP_STATE.blink.exerciseLocked=false;
      if(blinkPanel)blinkPanel.classList.remove("set-done-ok","set-done-warn");
      if(emojiFace)emojiFace.classList.remove("session-finish-pop","finish-ok","finish-warn","gaze-step-success");
      if(APP_STATE.blink.resultFlashTimer)clearTimeout(APP_STATE.blink.resultFlashTimer);
      if(blinkResultFlashEl)blinkResultFlashEl.classList.add("hidden");

      APP_STATE.blink.exerciseActive=true;
      APP_STATE.blink.exerciseCount=0;
      APP_STATE.blink.exerciseEndTs=Date.now()+20000;

      if(blinkCountLine)blinkCountLine.textContent="현재 횟수: 0회";
      if(blinkTimeLine)blinkTimeLine.textContent="남은 시간: 20초";
      updateBlinkCornerTime(20);
      blinkMeta.textContent="진행 중";

      if(APP_STATE.blink.exerciseTimer)clearInterval(APP_STATE.blink.exerciseTimer);
      const blinkTick=()=>{
        const sec=typeof blinkCore.remainSeconds==="function"
          ? blinkCore.remainSeconds(APP_STATE.blink.exerciseEndTs,Date.now())
          : Math.max(0,Math.ceil((APP_STATE.blink.exerciseEndTs-Date.now())/1000));

        if(blinkTimeLine)blinkTimeLine.textContent=`남은 시간: ${sec}초`;
        updateBlinkCornerTime(sec);

        if(sec<=0){
          if(APP_STATE.blink.exerciseTimer)clearInterval(APP_STATE.blink.exerciseTimer);
          APP_STATE.blink.exerciseTimer=null;
          APP_STATE.blink.exerciseActive=false;
          APP_STATE.blink.exerciseLocked=true;
          const ok=typeof blinkCore.isGoalMet==="function"
            ? blinkCore.isGoalMet(APP_STATE.blink.exerciseCount,12)
            : APP_STATE.blink.exerciseCount>=12;
          triggerBlinkCompleteFx(ok,APP_STATE.blink.exerciseCount);
        }
      };

      APP_STATE.blink.exerciseTimer=timerManager
        ? timerManager.setInterval("blink-exercise",blinkTick,200)
        : setInterval(blinkTick,200);
    }

    return { start };
  }

  return { create };
});
