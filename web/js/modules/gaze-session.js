(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GazeSession=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(){
    function prepareStart(params){
      const {
        APP_STATE,
        makeGazeSequence,
        loadCalibration,
      }=params;

      APP_STATE.gaze.exerciseActive=true;
      APP_STATE.gaze.sequence=makeGazeSequence();
      APP_STATE.gaze.stepIndex=0;
      APP_STATE.gaze.holdMs=0;
      APP_STATE.gaze.lastTs=performance.now();
      APP_STATE.gaze.lastDirection="";
      APP_STATE.gaze.lastVibeTs=0;
      APP_STATE.gaze.neutralX=0;
      APP_STATE.gaze.neutralY=0;
      APP_STATE.gaze.neutralReady=true;
      APP_STATE.gaze.smoothX=0;
      APP_STATE.gaze.smoothY=0;
      APP_STATE.gaze.emojiPupilX=0;
      APP_STATE.gaze.emojiPupilY=0;
      APP_STATE.gaze.lastAnnouncedTarget="";
      APP_STATE.gaze.stableDirection="Á¤¸é";
      APP_STATE.gaze.lastClassifiedDir="CENTER";
      APP_STATE.gaze.lastScore=0;

      const cachedMap=loadCalibration();
      if(cachedMap){
        APP_STATE.gaze.calibrationMap=cachedMap;
        APP_STATE.gaze.calibrated=true;
        return { cachedApplied:true, firstDirection:APP_STATE.gaze.sequence[0] };
      }

      return { cachedApplied:false, firstDirection:APP_STATE.gaze.sequence[0] };
    }

    return{prepareStart};
  }

  return{create};
});
