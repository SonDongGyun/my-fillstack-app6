(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.ExerciseReset=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      clearTimers,
      APP_STATE,
      blinkPanel,
      circlePanel,
      acuityPanel,
      optotypeWrapEl,
      emojiFace,
      blinkResultFlashEl,
      setTotalBlinkDetected,
      updateMetrics,
      resetGazeCalibration,
      blinkCountLine,
      blinkTimeLine,
      updateBlinkCornerTime,
      blinkMeta,
      gazeMeta,
      circleMeta,
      focusMeta,
      ruleMeta,
      acuityMeta,
      circleTrackArea,
      updateCircleTrackUi,
      acuityFxEl,
      acuityCountFxEl,
      statusEl,
    }=ctx;

    function run(){
      clearTimers();
      APP_STATE.blink.exerciseLocked=false;

      if(blinkPanel)blinkPanel.classList.remove("set-done-ok","set-done-warn");
      if(circlePanel)circlePanel.classList.remove("set-done-ok","set-done-warn");
      if(acuityPanel)acuityPanel.classList.remove("set-done-ok","set-done-warn");
      if(optotypeWrapEl)optotypeWrapEl.classList.remove("set-done-ok","set-done-warn");
      if(emojiFace)emojiFace.classList.remove("session-finish-pop","finish-ok","finish-warn","gaze-step-success","focus-near","focus-far");

      if(APP_STATE.blink.resultFlashTimer)clearTimeout(APP_STATE.blink.resultFlashTimer);
      if(blinkResultFlashEl)blinkResultFlashEl.classList.add("hidden");

      setTotalBlinkDetected(0);
      updateMetrics();

      APP_STATE.blink.exerciseCount=0;
      APP_STATE.gaze.sequence=[];
      APP_STATE.gaze.stepIndex=0;
      APP_STATE.gaze.holdMs=0;
      APP_STATE.gaze.lastDirection="";
      APP_STATE.gaze.lastVibeTs=0;
      APP_STATE.app.lastDirectionTtsTs=0;
      APP_STATE.gaze.lastAnnouncedTarget="";

      try{
        if("speechSynthesis" in window)window.speechSynthesis.cancel();
      }catch(_){}

      APP_STATE.gaze.smoothX=0;
      APP_STATE.gaze.smoothY=0;
      APP_STATE.gaze.emojiPupilX=0;
      APP_STATE.gaze.emojiPupilY=0;
      APP_STATE.gaze.stableDirection="정면";
      APP_STATE.gaze.lastClassifiedDir="CENTER";
      APP_STATE.gaze.lastScore=0;
      APP_STATE.gaze.nativeX=0;
      APP_STATE.gaze.nativeY=0;
      APP_STATE.gaze.nativeInit=false;

      resetGazeCalibration();

      APP_STATE.circle.active=false;
      APP_STATE.circle.followMs=0;
      APP_STATE.circle.endShown=false;

      APP_STATE.acuity.active=false;
      APP_STATE.acuity.round=0;
      APP_STATE.acuity.score=0;

      if(blinkCountLine)blinkCountLine.textContent="현재 횟수: 0회";
      if(blinkTimeLine)blinkTimeLine.textContent="남은 시간: 20초";
      updateBlinkCornerTime(20);
      if(blinkMeta)blinkMeta.textContent="준비 전";
      if(gazeMeta)gazeMeta.textContent="준비 전";
      if(circleMeta)circleMeta.textContent="준비 전";
      if(focusMeta)focusMeta.textContent="준비 전";
      if(ruleMeta)ruleMeta.textContent="대기중";
      if(acuityMeta)acuityMeta.textContent="준비 전";

      if(circleTrackArea)updateCircleTrackUi(0.45,0,0,0);

      if(acuityFxEl){
        acuityFxEl.classList.remove("show","ok","warn");
        acuityFxEl.textContent="";
      }

      if(acuityCountFxEl){
        acuityCountFxEl.classList.remove("show");
        acuityCountFxEl.textContent="0 / 12";
      }

      if(statusEl)statusEl.textContent=APP_STATE.camera.running?"인식 중":"대기 중";
    }

    return { run };
  }

  return { create };
});
