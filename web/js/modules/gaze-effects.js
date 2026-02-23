(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GazeEffects=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {emojiFace,APP_STATE,timerManager}=ctx;

    function triggerStepSuccessFx(){
      if(!emojiFace)return;
      emojiFace.classList.remove("gaze-step-success");
      void emojiFace.offsetWidth;
      emojiFace.classList.add("gaze-step-success");

      if(APP_STATE.gaze.stepFxTimer)clearTimeout(APP_STATE.gaze.stepFxTimer);
      if(timerManager){
        APP_STATE.gaze.stepFxTimer=timerManager.setTimeout("gaze-step-fx",()=>emojiFace.classList.remove("gaze-step-success"),520);
      }else{
        APP_STATE.gaze.stepFxTimer=setTimeout(()=>emojiFace.classList.remove("gaze-step-success"),520);
      }

      const ua=navigator.userAgent||"";
      const isMobile=/Android|iPhone|iPad|iPod/i.test(ua);
      if(isMobile&&navigator.vibrate)navigator.vibrate(40);
    }

    return{triggerStepSuccessFx};
  }

  return{create};
});
