(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.FocusSession=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const { APP_STATE, mouthEl, emojiFace, focusMeta, timerManager }=ctx;

    let focusTimer=null;
    let focusTick=null;
    let focusEndTs=0;

    function speakCue(text){
      try{
        if(!("speechSynthesis" in window))return;
        const u=new SpeechSynthesisUtterance(text);
        u.lang="ko-KR";
        u.rate=.95;
        u.pitch=1.0;
        u.volume=.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }catch(_){}
    }

    function setMotion(near){
      if(!emojiFace||APP_STATE.app.currentGame!=="focus")return;
      emojiFace.classList.remove("focus-near","focus-far");
      emojiFace.classList.add(near?"focus-near":"focus-far");
      if(mouthEl)mouthEl.style.width=near?"32%":"26%";
    }

    function renderMeta(near,remainSec,phaseRemain){
      if(!focusMeta)return;
      const phaseText=near?"가까운 물체 보기":"먼 물체 보기";
      const phase=Math.max(1,Math.ceil((60-remainSec)/10));
      focusMeta.innerHTML=`<span class="focus-phase ${near?"near":"far"}">${phaseText}</span> · 단계 ${phase}/6 · 단계 남음 ${phaseRemain}초 · 전체 남음 ${remainSec}초`;
    }

    function clear(){
      if(timerManager){
        timerManager.clearInterval("focus-step");
        timerManager.clearInterval("focus-tick");
      }else{
        if(focusTimer)clearInterval(focusTimer);
        if(focusTick)clearInterval(focusTick);
      }
      focusTimer=null;
      focusTick=null;
    }

    function start(){
      focusEndTs=Date.now()+60000;
      if(mouthEl)mouthEl.style.bottom="20%";

      let near=true;
      let phaseEndTs=Date.now()+10000;

      clear();
      setMotion(near);
      speakCue("가까운 물체를 10초 동안 바라보세요.");

      const stepFocus=()=>{
        near=!near;
        phaseEndTs=Date.now()+10000;
        setMotion(near);
        speakCue(near?"가까운 물체를 바라보세요.":"먼 물체를 바라보세요.");
      };

      const tickFocus=()=>{
        const now=Date.now();
        const remainSec=Math.max(0,Math.ceil((focusEndTs-now)/1000));
        const phaseRemain=Math.max(0,Math.ceil((phaseEndTs-now)/1000));
        renderMeta(near,remainSec,phaseRemain);

        if(remainSec<=0){
          clear();
          if(emojiFace)emojiFace.classList.remove("focus-near","focus-far");
          if(focusMeta)focusMeta.innerHTML=`<span class="ok">루틴 완료 (60초) · 눈을 한 번 편하게 쉬어주세요</span>`;
        }
      };

      renderMeta(near,60,10);
      focusTimer=timerManager?timerManager.setInterval("focus-step",stepFocus,10000):setInterval(stepFocus,10000);
      focusTick=timerManager?timerManager.setInterval("focus-tick",tickFocus,300):setInterval(tickFocus,300);
    }

    return { start, clear };
  }

  return { create };
});
