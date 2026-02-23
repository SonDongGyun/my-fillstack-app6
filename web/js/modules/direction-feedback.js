(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.DirectionFeedback=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {APP_STATE,dirLabel}=ctx;

    const uiTexts=(typeof window!=="undefined"&&window.UiTexts)?window.UiTexts:{};
    const directionSuffix=uiTexts.directionSuffix||"방향";

    let directionAudioCtx=null;
    let directionTtsVoice=null;

    function ensureDirectionAudio(){
      try{
        if(!directionAudioCtx){
          const AC=window.AudioContext||window.webkitAudioContext;
          if(AC)directionAudioCtx=new AC();
        }
      }catch(_){ }

      try{
        if(!("speechSynthesis" in window))return;
        const pickVoice=()=>{
          const voices=window.speechSynthesis.getVoices()||[];
          if(voices.length===0)return;
          const ko=voices.filter((v)=>/^ko(-|_)?/i.test(v.lang||"")||/korean|한글/i.test(v.name||""));
          const female=ko.find((v)=>/female|woman|여성|seoyeon|yuna|sunhi|sora|ji|min|na-rae|sohee|seyoung/i.test(v.name||""));
          directionTtsVoice=female||ko[0]||voices[0];
        };
        pickVoice();
        window.speechSynthesis.onvoiceschanged=pickVoice;
      }catch(_){ }
    }

    function playDirectionCue(){
      try{
        if(!directionAudioCtx)return;
        if(directionAudioCtx.state==="suspended")directionAudioCtx.resume();
        const now=directionAudioCtx.currentTime;
        const osc=directionAudioCtx.createOscillator();
        const gain=directionAudioCtx.createGain();
        osc.type="sine";
        osc.frequency.setValueAtTime(740,now);
        gain.gain.setValueAtTime(0.0001,now);
        gain.gain.exponentialRampToValueAtTime(0.03,now+0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001,now+0.07);
        osc.connect(gain);
        gain.connect(directionAudioCtx.destination);
        osc.start(now);
        osc.stop(now+0.08);
      }catch(_){ }
    }

    function speakDirectionCue(dir){
      try{
        if(!dir)return;
        const now=Date.now();
        if(now-APP_STATE.app.lastDirectionTtsTs<240)return;
        APP_STATE.app.lastDirectionTtsTs=now;
        if(!("speechSynthesis" in window)){
          playDirectionCue();
          return;
        }
        const label=dirLabel(dir);
        const u=new SpeechSynthesisUtterance(`${label} ${directionSuffix}`);
        u.lang="ko-KR";
        u.rate=.9;
        u.pitch=1.03;
        u.volume=1;
        if(directionTtsVoice)u.voice=directionTtsVoice;
        window.speechSynthesis.cancel();
        try{window.speechSynthesis.resume();}catch(_){ }
        window.speechSynthesis.speak(u);
      }catch(_){
        playDirectionCue();
      }
    }

    function vibrateOnGazeDirectionChange(direction){
      if(!direction||direction===APP_STATE.gaze.lastDirection)return;
      const now=Date.now();
      if(now-APP_STATE.gaze.lastVibeTs<350){
        APP_STATE.gaze.lastDirection=direction;
        return;
      }
      APP_STATE.gaze.lastDirection=direction;
      APP_STATE.gaze.lastVibeTs=now;

      const ua=navigator.userAgent||"";
      const isMobile=/Android|iPhone|iPad|iPod/i.test(ua);
      const isIOS=/iPhone|iPad|iPod/i.test(ua);
      if(isMobile&&navigator.vibrate&&!isIOS){
        navigator.vibrate([8,16,8]);
        return;
      }
      if(isMobile)playDirectionCue();
    }

    return{ensureDirectionAudio,playDirectionCue,speakDirectionCue,vibrateOnGazeDirectionChange};
  }

  return{create};
});
