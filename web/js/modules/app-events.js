(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.AppEvents=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  /**
   * Bind UI events to application actions.
   * @param {Object} ctx - Dependency bag injected from bootstrap.
   */
  function bindAppEvents(ctx){
    const {
      on,
      enterGame,
      showView,
      clearTimers,
      setPermissionHelp,
      statusEl,
      APP_STATE,
      startCamera,
      resetExerciseState,
      startBlinkExercise,
      startGazeExercise,
      requestGazeRecalibration,
      startCircleExercise,
      startFocusRoutine,
      startAcuityGame,
      answerAcuity,
      applyHeroParallax,
      resetHeroParallax,
      updateScrollProgress,
      startAppBtn,
      backIntroBtn,
      hero,
      backHomeBtn,
      startCameraBtn,
      resetStateBtn,
      blinkStartBtn,
      gazeStartBtn,
      gazeRecalibrateBtn,
      circleStartBtn,
      focusStartBtn,
      acuityStartBtn,
      acuityUpBtn,
      acuityRightBtn,
      acuityDownBtn,
      acuityLeftBtn,
      setCurrentGame,
    }=ctx;

    const uiTexts=(typeof window!=="undefined"&&window.UiTexts)?window.UiTexts:{};
    const statusRecognizing=uiTexts.statusRecognizing||"인식 중";
    const statusIdle=uiTexts.statusIdle||"대기 중";

    document.querySelectorAll(".menu-btn[data-game]").forEach((btn)=>{
      on(btn,"click",()=>enterGame(btn.dataset.game));
    });

    on(startAppBtn,"click",()=>showView("home"));
    if(backIntroBtn)on(backIntroBtn,"click",()=>showView("intro"));

    if(hero){
      on(hero,"mousemove",applyHeroParallax);
      on(hero,"mouseleave",resetHeroParallax);
    }

    on(window,"scroll",()=>{resetHeroParallax();updateScrollProgress();},{passive:true});
    on(window,"resize",()=>{updateScrollProgress();resetHeroParallax();});

    on(backHomeBtn,"click",()=>{
      setCurrentGame(null);
      showView("home");
      clearTimers();
      setPermissionHelp(false);
      statusEl.textContent=APP_STATE.camera.running?statusRecognizing:statusIdle;
    });

    on(startCameraBtn,"click",startCamera);
    on(resetStateBtn,"click",resetExerciseState);
    on(blinkStartBtn,"click",startBlinkExercise);
    on(gazeStartBtn,"click",startGazeExercise);
    if(gazeRecalibrateBtn)on(gazeRecalibrateBtn,"click",requestGazeRecalibration);
    if(circleStartBtn)on(circleStartBtn,"click",startCircleExercise);
    on(focusStartBtn,"click",startFocusRoutine);
    on(acuityStartBtn,"click",startAcuityGame);
    on(acuityUpBtn,"click",()=>answerAcuity("UP"));
    on(acuityRightBtn,"click",()=>answerAcuity("RIGHT"));
    on(acuityDownBtn,"click",()=>answerAcuity("DOWN"));
    on(acuityLeftBtn,"click",()=>answerAcuity("LEFT"));
  }

  return{bindAppEvents};
});
